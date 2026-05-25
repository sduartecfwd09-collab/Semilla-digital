export type Landmark = { x: number; y: number; z?: number };

const dist = (a: Landmark, b: Landmark) => Math.hypot(a.x - b.x, a.y - b.y);

export const eyeAspectRatio = (lm: Landmark[], idx: number[]) => {
  const v1 = dist(lm[idx[1]], lm[idx[5]]);
  const v2 = dist(lm[idx[2]], lm[idx[4]]);
  const h = dist(lm[idx[0]], lm[idx[3]]);
  return (v1 + v2) / (2 * h || 1);
};

export const avgEAR = (lm: Landmark[]) => {
  const left = eyeAspectRatio(lm, [33, 160, 158, 133, 153, 144]);
  const right = eyeAspectRatio(lm, [362, 385, 387, 263, 373, 380]);
  return (left + right) / 2;
};

export const headYaw = (lm: Landmark[]) => {
  const nose = lm[1];
  const lc = lm[234];
  const rc = lm[454];
  const mid = (lc.x + rc.x) / 2;
  const fw = dist(lc, rc) || 1;
  return (nose.x - mid) / fw;
};

export const headPitch = (lm: Landmark[]) => {
  const nose = lm[1];
  const chin = lm[152];
  const forehead = lm[10];
  const mid = (forehead.y + chin.y) / 2;
  const h = dist(forehead, chin) || 1;
  return (nose.y - mid) / h;
};

export const smileRatio = (lm: Landmark[]) => {
  const mw = dist(lm[61], lm[291]);
  const fw = dist(lm[234], lm[454]) || 1;
  return mw / fw;
};

export const noseCentered = (lm: Landmark[], margin = 0.18) => {
  const n = lm[1];
  return Math.abs(n.x - 0.5) < margin && Math.abs(n.y - 0.5) < margin;
};

export const motionVariance = (history: { x: number; y: number }[]) => {
  if (history.length < 8) return 0;
  const xs = history.map((p) => p.x);
  const ys = history.map((p) => p.y);
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  return xs.reduce((s, x, i) => s + (x - mx) ** 2 + (ys[i] - my) ** 2, 0) / xs.length;
};

export const sampleBrightness = (video: HTMLVideoElement, lm: Landmark[]) => {
  const c = document.createElement('canvas');
  const s = 64;
  c.width = s;
  c.height = s;
  const ctx = c.getContext('2d');
  if (!ctx || !video.videoWidth) return 128;
  const nx = lm[1].x * video.videoWidth;
  const ny = lm[1].y * video.videoHeight;
  const sz = Math.min(video.videoWidth, video.videoHeight) * 0.25;
  ctx.drawImage(video, nx - sz / 2, ny - sz / 2, sz, sz, 0, 0, s, s);
  const d = ctx.getImageData(0, 0, s, s).data;
  let sum = 0;
  for (let i = 0; i < d.length; i += 4) sum += (d[i] + d[i + 1] + d[i + 2]) / 3;
  return sum / (d.length / 4);
};
