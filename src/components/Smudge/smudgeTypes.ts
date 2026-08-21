export type SmudgeState =
  | 'IDLE' | 'WATCHING' | 'HIDING' | 'PEEKING'
  | 'FLEEING' | 'GIGGLING' | 'BORED' | 'ANNOYED'
  | 'SUCCESS' | 'DRAGGING_CURSOR';

export interface SmudgePosition { x: number; y: number; }

export const STATE_TIMINGS = {
  FLEE_DURATION: 2800,
  GIGGLE_DURATION: 1200,
  ANNOYED_DURATION: 2000,
  BORED_THRESHOLD: 12000,
  PEEK_THRESHOLD: 2000,
  CURSOR_IDLE_THRESHOLD: 4000,
  CURSOR_COOLDOWN: 15000,
  CORNER_HOP_INTERVAL: 1800,
} as const;

const PAD = 10;
export const CORNER_POSITIONS = [
  { getPos: (w: number, h: number) => ({ x: PAD, y: h - 70 }) },
  { getPos: (w: number, h: number) => ({ x: w - 70, y: h - 70 }) },
  { getPos: (_w: number, h: number) => ({ x: PAD, y: h / 2 - 30 }) },
  { getPos: (w: number, h: number) => ({ x: w - 70, y: h / 2 - 30 }) },
] as const;
