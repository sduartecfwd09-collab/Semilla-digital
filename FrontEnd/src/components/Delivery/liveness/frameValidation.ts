import type { Landmark } from './faceMetrics';
import { avgEAR, headPitch, headYaw, motionVariance, sampleBrightness } from './faceMetrics';

export type BorderState = 'gray' | 'yellow' | 'green';
export const STABLE_MS = 2500;

const inOval = (x: number, y: number) => {
  const dx = (x - 0.5) / 0.22;
  const dy = (y - 0.52) / 0.3;
  return dx * dx + dy * dy <= 1;
};

const faceBox = (lm: Landmark[]) => {
  let minX = 1, maxX = 0;
  for (const p of [lm[10], lm[152], lm[234], lm[454], lm[1]]) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
  }
  return maxX - minX;
};

export const validateFrame = (
  lm: Landmark[],
  video: HTMLVideoElement,
  motionHist: { x: number; y: number }[],
  still: boolean
): { ok: boolean; hint: string } => {
  if (![lm[10], lm[152], lm[234], lm[454]].every((p) => inOval(p.x, p.y))) {
    return { ok: false, hint: '' };
  }
  const fw = faceBox(lm);
  if (fw < 0.2) return { ok: false, hint: 'Acércate un poco' };
  if (fw > 0.55) return { ok: false, hint: 'Aléjate un poco' };
  if (Math.abs(headYaw(lm)) > 0.14 || Math.abs(headPitch(lm)) > 0.14) {
    return { ok: false, hint: '' };
  }
  const b = sampleBrightness(video, lm);
  if (b < 50) return { ok: false, hint: 'Mejorá la iluminación' };
  if (b > 220) return { ok: false, hint: '' };

  if (still) {
    motionHist.push({ x: lm[1].x, y: lm[1].y });
    if (motionHist.length > 18) motionHist.shift();
    if (motionHist.length >= 10 && motionVariance(motionHist) > 0.00004) {
      return { ok: false, hint: 'Mantente quieto' };
    }
  }
  return { ok: true, hint: '' };
};

export const checkBlink = (lm: Landmark[], wasOpen: boolean) => {
  const ear = avgEAR(lm);
  if (ear < 0.2) return { done: false, open: false };
  if (!wasOpen && ear > 0.26) return { done: true, open: false };
  return { done: false, open: ear > 0.22 };
};
