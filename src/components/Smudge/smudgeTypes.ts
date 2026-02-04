// Smudge State Machine Types

export type SmudgeState = 
  | 'IDLE'
  | 'WATCHING'
  | 'HIDING'
  | 'PEEKING'
  | 'BORED'
  | 'ANNOYED'
  | 'SUCCESS';

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
}

export const STATE_TIMINGS = {
  BORED_THRESHOLD: 6000,      // 6s inactivity → BORED
  PEEK_THRESHOLD: 1200,       // 1.2s no typing → can peek
  CURSOR_COOLDOWN: 15000,     // 15s between cursor interactions
  ANNOYED_DURATION: 1500,     // Max 1.5s for ANNOYED state
  CURSOR_IDLE_THRESHOLD: 4000 // 4s cursor idle for interaction
} as const;
