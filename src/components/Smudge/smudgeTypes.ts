// Smudge State Machine Types

export type SmudgeState = 
  | 'IDLE'
  | 'WATCHING'
  | 'HIDING'
  | 'PEEKING'
  | 'BORED'
  | 'ANNOYED'
  | 'SUCCESS'
  | 'GIGGLING'
  | 'FLEEING'
  | 'DRAGGING_CURSOR';

export interface SmudgePosition {
  x: number;
  y: number;
}

export interface SmudgeContext {
  state: SmudgeState;
  cursorPosition: SmudgePosition;
  lastInteractionTime: number;
  lastTypingTime: number;
  isPasswordFocused: boolean;
  passwordResult: 'none' | 'success' | 'failure';
  isBeingChased: boolean;
  cornerIndex: number;
}

export const STATE_TIMINGS = {
  BORED_THRESHOLD: 6000,       // 6s inactivity → BORED
  PEEK_THRESHOLD: 1200,        // 1.2s no typing → can peek
  CURSOR_COOLDOWN: 15000,      // 15s between cursor interactions
  ANNOYED_DURATION: 1500,      // Max 1.5s for ANNOYED state
  CURSOR_IDLE_THRESHOLD: 4000, // 4s cursor idle for interaction
  GIGGLE_DURATION: 2000,       // 2s giggle animation
  FLEE_DURATION: 1500,         // 1.5s flee animation
  CORNER_HOP_INTERVAL: 3000,   // 3s between corner hops when bored
} as const;

// Corner positions for hopping
export const CORNER_POSITIONS = [
  { corner: 'bottom-right', getPos: (w: number, h: number) => ({ x: w - 80, y: h - 80 }) },
  { corner: 'bottom-left', getPos: (w: number, h: number) => ({ x: 20, y: h - 80 }) },
  { corner: 'top-left', getPos: (w: number, h: number) => ({ x: 20, y: 80 }) },
  { corner: 'top-right', getPos: (w: number, h: number) => ({ x: w - 80, y: 80 }) },
] as const;
