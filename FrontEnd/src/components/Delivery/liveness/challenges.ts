export type ChallengeId = 'detect' | 'blink' | 'turn_left' | 'turn_right' | 'look_up' | 'smile';

const POOL: ChallengeId[] = ['blink', 'turn_left', 'turn_right', 'look_up', 'smile'];

const shuffle = <T,>(a: T[]) => {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
};

/** detect + 3 retos aleatorios */
export const buildSteps = (): ChallengeId[] => ['detect', ...shuffle(POOL).slice(0, 3)];

export const CHALLENGE_LABELS: Record<ChallengeId, string> = {
  detect: 'Centra tu rostro en el óvalo',
  blink: 'Parpadea',
  turn_left: 'Gira la cabeza a la izquierda',
  turn_right: 'Gira la cabeza a la derecha',
  look_up: 'Mira hacia arriba',
  smile: 'Sonríe',
};

export const CHALLENGE_DONE: Record<ChallengeId, string> = {
  detect: 'Rostro detectado',
  blink: 'Parpadeo confirmado',
  turn_left: 'Movimiento confirmado',
  turn_right: 'Movimiento confirmado',
  look_up: 'Movimiento confirmado',
  smile: 'Expresión confirmada',
};

export const MOTION_STEPS: ChallengeId[] = ['turn_left', 'turn_right', 'look_up'];
