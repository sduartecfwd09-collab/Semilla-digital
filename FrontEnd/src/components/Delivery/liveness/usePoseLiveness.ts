import { useCallback, useEffect, useRef, useState } from 'react';
import { useFaceLandmarker } from './useFaceLandmarker';
import { buildSteps, CHALLENGE_DONE, CHALLENGE_LABELS, type ChallengeId } from './challenges';
import { checkChallenge, checkFrame, hasLiveMotion, type BlinkState } from './validateChallenge';
import { headYaw, smileRatio, type Landmark } from './faceMetrics';

export type BorderState = 'gray' | 'yellow' | 'green';
type Phase = 'idle' | 'loading' | 'active' | 'verifying' | 'done' | 'error';

const HOLD = 4;

const openCamera = async (): Promise<MediaStream> => {
  const opts: MediaTrackConstraints[] = [
    { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
    { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
    { facingMode: 'user' },
  ];
  let last: unknown;
  for (const video of opts) {
    try {
      return await navigator.mediaDevices.getUserMedia({ video, audio: false });
    } catch (e) {
      last = e;
    }
  }
  throw last;
};

export const usePoseLiveness = (onVerified: (r: { dataUrl: string; file: File }) => void) => {
  const { landmarkerRef, ready, loadError } = useFaceLandmarker();
  const [phase, setPhase] = useState<Phase>('idle');
  const [liveMsg, setLiveMsg] = useState('');
  const [hint, setHint] = useState('');
  const [progress, setProgress] = useState(0);
  const [border, setBorder] = useState<BorderState>('gray');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const phaseRef = useRef<Phase>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stepsRef = useRef<ChallengeId[]>([]);
  const stepRef = useRef(0);
  const holdRef = useRef(0);
  const motionRef = useRef<{ x: number; y: number }[]>([]);
  const blinkRef = useRef<BlinkState>({ closed: false });
  const smileBaseRef = useRef<number | null>(null);
  const rafRef = useRef(0);
  const lastRef = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const capture = useCallback(() => {
    const v = videoRef.current, c = captureRef.current;
    if (!v || !c) return null;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    const side = Math.min(v.videoWidth || 640, v.videoHeight || 640);
    c.width = side;
    c.height = side;
    const sx = ((v.videoWidth || side) - side) / 2;
    const sy = ((v.videoHeight || side) - side) / 2;
    ctx.translate(side, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, sx, sy, side, side, 0, 0, side, side);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dataUrl = c.toDataURL('image/jpeg', 0.9);
    const bstr = atob(dataUrl.split(',')[1]);
    const u8 = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
    return { dataUrl, file: new File([u8], 'selfie_verificacion.jpg', { type: 'image/jpeg' }) };
  }, []);

  const tick = useCallback(() => {
    const v = videoRef.current;
    const eng = landmarkerRef.current;
    const ph = phaseRef.current;

    if (!v || !eng || ph !== 'active') {
      if (ph === 'active') rafRef.current = requestAnimationFrame(tick);
      return;
    }

    if (v.readyState < 2) {
      setLiveMsg('Iniciando cámara…');
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const now = performance.now();
    if (now - lastRef.current < 90) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    lastRef.current = now;

    let res;
    try {
      res = eng.detectForVideo(v, now);
    } catch {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const n = res.faceLandmarks?.length ?? 0;
    if (n !== 1) {
      holdRef.current = 0;
      setBorder('gray');
      setHint(n > 1 ? 'Solo un rostro visible' : '');
      setLiveMsg(n === 0 ? 'Buscando rostro…' : '');
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const lm = res.faceLandmarks[0] as Landmark[];
    motionRef.current.push({ x: headYaw(lm), y: lm[1].y });
    if (motionRef.current.length > 24) motionRef.current.shift();

    const frameErr = checkFrame(lm, v);
    if (frameErr) {
      holdRef.current = 0;
      setBorder('yellow');
      setHint(frameErr);
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const step = stepsRef.current[stepRef.current];
    if (!step) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const motionSteps: ChallengeId[] = ['turn_left', 'turn_right', 'look_up'];
    if (motionSteps.includes(step) && !hasLiveMotion(motionRef.current)) {
      holdRef.current = 0;
      setBorder('yellow');
      setHint('Mueve la cabeza siguiendo la instrucción');
      setLiveMsg(CHALLENGE_LABELS[step]);
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    setHint('');
    setLiveMsg(CHALLENGE_LABELS[step]);
    const ok = checkChallenge(step, lm, motionRef.current, blinkRef.current, smileBaseRef.current);

    if (!ok) {
      holdRef.current = 0;
      setBorder('yellow');
      if (step === 'blink') blinkRef.current = { closed: false };
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    setBorder('green');
    holdRef.current += 1;
    if (holdRef.current < HOLD) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    holdRef.current = 0;
    blinkRef.current = { closed: false };
    setLiveMsg(CHALLENGE_DONE[step]);
    stepRef.current += 1;
    setProgress(Math.round((stepRef.current / stepsRef.current.length) * 100));

    if (stepRef.current >= stepsRef.current.length) {
      phaseRef.current = 'verifying';
      setPhase('verifying');
      setLiveMsg('Verificando identidad…');
      setBorder('green');
      setTimeout(() => {
        const cap = capture();
        stop();
        if (cap) {
          onVerified(cap);
          phaseRef.current = 'done';
          setPhase('done');
          setLiveMsg('Identidad verificada');
          setProgress(100);
        } else {
          setErrorMsg('Error al capturar');
          phaseRef.current = 'error';
          setPhase('error');
        }
      }, 600);
      return;
    }

    const next = stepsRef.current[stepRef.current];
    if (next === 'smile') smileBaseRef.current = smileRatio(lm);
    rafRef.current = requestAnimationFrame(tick);
  }, [landmarkerRef, capture, stop, onVerified]);

  useEffect(() => {
    if (phase === 'active' && ready) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, ready, tick]);

  const start = async () => {
    if (!ready) {
      setErrorMsg(loadError || 'Cargando motor facial…');
      return false;
    }
    setErrorMsg(null);
    setHint('');
    setLiveMsg('');
    stepsRef.current = buildSteps();
    stepRef.current = 0;
    holdRef.current = 0;
    motionRef.current = [];
    blinkRef.current = { closed: false };
    smileBaseRef.current = null;
    setProgress(0);
    setBorder('gray');
    stop();
    phaseRef.current = 'loading';
    setPhase('loading');
    try {
      const media = await openCamera();
      streamRef.current = media;
      const el = videoRef.current;
      if (el) {
        el.srcObject = media;
        await el.play();
        await new Promise<void>((resolve) => {
          if (el.videoWidth > 0) { resolve(); return; }
          el.onloadedmetadata = () => resolve();
        });
      }
      phaseRef.current = 'active';
      setPhase('active');
      setLiveMsg('Buscando rostro…');
      return true;
    } catch {
      setErrorMsg('No se pudo acceder a la cámara. Permite el acceso en el navegador.');
      phaseRef.current = 'error';
      setPhase('error');
      return false;
    }
  };

  const cancel = () => {
    stop();
    stepRef.current = 0;
    setHint('');
    setLiveMsg('');
    phaseRef.current = 'idle';
    setPhase('idle');
    setProgress(0);
    setBorder('gray');
  };

  return { ready, loadError, phase, liveMsg, hint, progress, border, errorMsg, videoRef, captureRef, start, cancel };
};
