import type { ChallengeId } from './challenges';
import type { Landmark } from './faceMetrics';
import { avgEAR, headPitch, headYaw, noseCentered, sampleBrightness, smileRatio, motionVariance } from './faceMetrics';

const dist = (a: Landmark, b: Landmark) => Math.hypot(a.x - b.x, a.y - b.y);
export const screenYaw = (lm: Landmark[]) => -headYaw(lm);

export const checkFrame = (lm: Landmark[], video: HTMLVideoElement): string | null => {
  if (!noseCentered(lm, 0.35)) return 'Centra tu rostro en el óvalo';
  const fw = dist(lm[234], lm[454]);
  if (fw < 0.12) return 'Acércate un poco';
  if (fw > 0.7) return 'Aléjate un poco';
  const b = sampleBrightness(video, lm);
  if (b < 25) return 'Mejorá la iluminación';
  if (b > 245) return 'Demasiada luz';
  return null;
};

export type BlinkState = { closed: boolean };

export const checkBlink = (lm: Landmark[], st: BlinkState): boolean => {
  const ear = avgEAR(lm);
  if (ear < 0.2) { st.closed = true; return false; }
  return st.closed && ear > 0.26;
};

export const checkChallenge = (
  id: ChallengeId,
  lm: Landmark[],
  motionHist: { x: number; y: number }[],
  blinkSt: BlinkState,
  smileBase: number | null,
  strict = true
): boolean => {
  const yaw = screenYaw(lm);
  const pitch = headPitch(lm);

  if (id === 'detect') return Math.abs(yaw) < 0.22 && Math.abs(pitch) < 0.22;

  if (id === 'turn_left') return yaw < -0.07;
  if (id === 'turn_right') return yaw > 0.07;
  if (id === 'look_up') return pitch < -0.08;
  if (id === 'blink') return strict ? checkBlink(lm, blinkSt) : true;

  if (id === 'smile') {
    const r = smileRatio(lm);
    const base = smileBase ?? r;
    return r > base + 0.04 || r > 0.38;
  }

  if (strict && motionHist.length >= 10 && motionVariance(motionHist) < 0.0000008) return false;
  return false;
};

export const hasLiveMotion = (hist: { x: number; y: number }[]) => hist.length >= 4;
