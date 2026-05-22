import { useCallback, useEffect, useRef, useState } from 'react';
import { useFaceLandmarker } from './useFaceLandmarker';
import { buildSteps, CHALLENGE_DONE, CHALLENGE_LABELS, type ChallengeId } from './challenges';
import { checkChallenge, checkFrame, type BlinkState } from './validateChallenge';
import { headYaw, smileRatio, type Landmark } from './faceMetrics';

export type BorderState = 'gray' | 'yellow' | 'green';
type Phase = 'idle' | 'loading' | 'active' | 'verifying' | 'done' | 'error';

const openCamera = () =>
  navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false,
  });

export const useLivenessScanner = (onVerified: (r: { dataUrl: string; file: File }) => void) => {
  const { landmarkerRef, ready, loadError } = useFaceLandmarker();
  const [phase, setPhase] = useState<Phase>('idle');
  const [liveMsg, setLiveMsg] = useState('');
  const [hint, setHint] = useState('');
  const [progress, setProgress] = useState(0);
  const [border, setBorder] = useState<BorderState>('gray');
  const [canScan, setCanScan] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const phaseRef = useRef(phase);
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stepsRef = useRef<ChallengeId[]>([]);
  const stepRef = useRef(0);
  const motionRef = useRef<{ x: number; y: number }[]>([]);
  const blinkRef = useRef<BlinkState>({ closed: false });
  const smileBaseRef = useRef<number | null>(null);
  const lastLmRef = useRef<Landmark[] | null>(null);
  const rafRef = useRef(0);
  const lastRef = useRef(0);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

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
    c.width = c.height = side;
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

  const finishVerification = useCallback(() => {
    phaseRef.current = 'verifying';
    setPhase('verifying');
    setLiveMsg('Verificando identidad…');
    setCanScan(false);
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
    }, 500);
  }, [capture, stop, onVerified]);

  const advanceStep = useCallback(() => {
    const step = stepsRef.current[stepRef.current];
    setLiveMsg(CHALLENGE_DONE[step]);
    blinkRef.current = { closed: false };
    motionRef.current = [];
    stepRef.current += 1;
    setProgress(Math.round((stepRef.current / stepsRef.current.length) * 100));

    if (stepRef.current >= stepsRef.current.length) {
      finishVerification();
      return;
    }
    const next = stepsRef.current[stepRef.current];
    if (next === 'smile' && lastLmRef.current) smileBaseRef.current = smileRatio(lastLmRef.current);
    setLiveMsg(CHALLENGE_LABELS[next]);
    setHint('');
    setCanScan(false);
    setBorder('gray');
  }, [finishVerification]);

  const scanStep = useCallback(() => {
    const lm = lastLmRef.current;
    const v = videoRef.current;
    if (!lm || !v || phaseRef.current !== 'active') {
      setHint('Esperá a que aparezca tu rostro en el óvalo');
      return;
    }
    const frameErr = checkFrame(lm, v);
    if (frameErr) {
      setHint(frameErr);
      return;
    }
    const step = stepsRef.current[stepRef.current];
    const ok = checkChallenge(step, lm, motionRef.current, blinkRef.current, smileBaseRef.current, false);
    if (!ok) {
      setHint(`Seguí la instrucción: ${CHALLENGE_LABELS[step]}`);
      setBorder('yellow');
      return;
    }
    setHint('');
    setBorder('green');
    advanceStep();
  }, [advanceStep]);

  const tick = useCallback(() => {
    const v = videoRef.current, eng = landmarkerRef.current;
    if (!v || !eng || phaseRef.current !== 'active') {
      if (phaseRef.current === 'active') rafRef.current = requestAnimationFrame(tick);
      return;
    }
    if (v.readyState < 2) {
      setLiveMsg('Iniciando cámara…');
      setCanScan(false);
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const now = performance.now();
    if (now - lastRef.current < 90) { rafRef.current = requestAnimationFrame(tick); return; }
    lastRef.current = now;

    let res;
    try { res = eng.detectForVideo(v, now); } catch { rafRef.current = requestAnimationFrame(tick); return; }

    const n = res.faceLandmarks?.length ?? 0;
    if (n !== 1) {
      lastLmRef.current = null;
      setCanScan(false);
      setBorder('gray');
      setHint(n > 1 ? 'Solo un rostro visible' : '');
      if (n === 0) setLiveMsg('Buscando rostro…');
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const lm = res.faceLandmarks[0] as Landmark[];
    lastLmRef.current = lm;
    motionRef.current.push({ x: headYaw(lm), y: lm[1].y });
    if (motionRef.current.length > 28) motionRef.current.shift();

    const step = stepsRef.current[stepRef.current];
    const frameErr = checkFrame(lm, v);
    if (frameErr) {
      setCanScan(false);
      setBorder('yellow');
      setHint(frameErr);
      setLiveMsg(CHALLENGE_LABELS[step] ?? 'Centra tu rostro');
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    setHint('');
    setLiveMsg(CHALLENGE_LABELS[step]);
    const poseOk = checkChallenge(step, lm, motionRef.current, blinkRef.current, smileBaseRef.current, false);
    setCanScan(poseOk);
    setBorder(poseOk ? 'green' : 'yellow');
    rafRef.current = requestAnimationFrame(tick);
  }, [landmarkerRef]);

  useEffect(() => {
    if (phase === 'active' && ready) rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, ready, tick]);

  const start = async () => {
    if (!ready) { setErrorMsg(loadError || 'Cargando modelo facial…'); return false; }
    setErrorMsg(null);
    setHint('');
    stepsRef.current = buildSteps();
    stepRef.current = 0;
    motionRef.current = [];
    blinkRef.current = { closed: false };
    smileBaseRef.current = null;
    lastLmRef.current = null;
    setProgress(0);
    setBorder('gray');
    setCanScan(false);
    stop();
    setPhase('loading');
    phaseRef.current = 'loading';
    try {
      streamRef.current = await openCamera();
      const el = videoRef.current;
      if (el) {
        el.srcObject = streamRef.current;
        await el.play();
      }
      phaseRef.current = 'active';
      setPhase('active');
      setLiveMsg(CHALLENGE_LABELS.detect);
      return true;
    } catch {
      setErrorMsg('Permite el acceso a la cámara en el navegador.');
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
    setCanScan(false);
    phaseRef.current = 'idle';
    setPhase('idle');
    setProgress(0);
    setBorder('gray');
  };

  return { ready, phase, liveMsg, hint, progress, border, canScan, errorMsg, videoRef, captureRef, start, cancel, scanStep };
};
