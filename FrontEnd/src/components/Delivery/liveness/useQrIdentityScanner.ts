import { useCallback, useEffect, useRef, useState } from 'react';
import { useFaceLandmarker } from './useFaceLandmarker';
import { validateFrame, checkBlink, STABLE_MS, type BorderState } from './frameValidation';
import type { Landmark } from './faceMetrics';

type Phase = 'idle' | 'loading' | 'scanning' | 'stable' | 'blink' | 'verifying' | 'done' | 'error';

export const useQrIdentityScanner = (onVerified: (r: { dataUrl: string; file: File }) => void) => {
  const { landmarkerRef, ready, loadError } = useFaceLandmarker();
  const [phase, setPhase] = useState<Phase>('idle');
  const [hint, setHint] = useState('');
  const [border, setBorder] = useState<BorderState>('gray');
  const [ringProgress, setRingProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const phaseRef = useRef(phase);
  const stableAt = useRef<number | null>(null);
  const motionRef = useRef<{ x: number; y: number }[]>([]);
  const blinkOpen = useRef(true);
  const rafRef = useRef(0);
  const lastDetect = useRef(0);

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
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 480;
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, c.width, c.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dataUrl = c.toDataURL('image/jpeg', 0.9);
    const bstr = atob(dataUrl.split(',')[1]);
    const u8 = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
    return { dataUrl, file: new File([u8], 'selfie_verificacion.jpg', { type: 'image/jpeg' }) };
  }, []);

  const resetStable = () => {
    stableAt.current = null;
    setRingProgress(0);
  };

  const tick = useCallback(() => {
    const v = videoRef.current, eng = landmarkerRef.current;
    const ph = phaseRef.current;
    if (!v || !eng || v.readyState < 2 || ph === 'verifying' || ph === 'done') {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const now = performance.now();
    if (now - lastDetect.current < 80) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    lastDetect.current = now;

    const res = eng.detectForVideo(v, now);
    const n = res.faceLandmarks?.length ?? 0;

    if (n !== 1) {
      resetStable();
      setBorder('gray');
      setHint(n > 1 ? 'Solo un rostro' : '');
      if (ph === 'stable' || ph === 'blink') {
        phaseRef.current = 'scanning';
        setPhase('scanning');
      }
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const lm = res.faceLandmarks[0] as Landmark[];

    if (ph === 'blink') {
      const b = checkBlink(lm, blinkOpen.current);
      blinkOpen.current = b.open;
      setBorder('green');
      setHint('');
      if (b.done) {
        phaseRef.current = 'verifying';
        setPhase('verifying');
        const cap = capture();
        stop();
        if (cap) {
          onVerified(cap);
          setPhase('done');
          setRingProgress(100);
          setBorder('green');
        } else {
          setErrorMsg('Error al capturar');
          setPhase('error');
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const still = ph === 'stable';
    const { ok, hint: h } = validateFrame(lm, v, motionRef.current, still);

    if (!ok) {
      resetStable();
      setBorder('yellow');
      setHint(h);
      if (ph === 'stable') {
        phaseRef.current = 'scanning';
        setPhase('scanning');
      }
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    setHint('');
    setBorder('green');

    if (ph === 'scanning') {
      motionRef.current = [];
      stableAt.current = now;
      phaseRef.current = 'stable';
      setPhase('stable');
    }

    const elapsed = now - (stableAt.current ?? now);
    setRingProgress(Math.min(100, (elapsed / STABLE_MS) * 100));

    if (elapsed >= STABLE_MS) {
      resetStable();
      blinkOpen.current = true;
      phaseRef.current = 'blink';
      setPhase('blink');
      setRingProgress(0);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [landmarkerRef, capture, stop, onVerified]);

  useEffect(() => {
    if (['scanning', 'stable', 'blink'].includes(phase) && ready) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, ready, tick]);

  const start = async () => {
    if (!ready) { setErrorMsg(loadError || 'Cargando…'); return false; }
    setErrorMsg(null);
    setHint('');
    resetStable();
    motionRef.current = [];
    stop();
    setBorder('gray');
    setPhase('loading');
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = media;
      if (videoRef.current) {
        videoRef.current.srcObject = media;
        await videoRef.current.play();
      }
      phaseRef.current = 'scanning';
      setPhase('scanning');
      return true;
    } catch {
      setErrorMsg('No se pudo acceder a la cámara.');
      setPhase('error');
      return false;
    }
  };

  const cancel = () => {
    stop();
    resetStable();
    phaseRef.current = 'idle';
    setPhase('idle');
    setBorder('gray');
    setHint('');
  };

  return { ready, loadError, phase, hint, border, ringProgress, errorMsg, videoRef, captureRef, start, cancel };
};
