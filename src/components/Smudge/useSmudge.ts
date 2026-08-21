import { useState, useEffect, useCallback, useRef } from 'react';
import { SmudgeState, SmudgePosition, STATE_TIMINGS, CORNER_POSITIONS } from './smudgeTypes';

let _audioCtx: AudioContext | null = null;
function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return _audioCtx;
}
function playTone(freq: number, endFreq: number, dur: number, vol = 0.05) {
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.start(t); osc.stop(t + dur + 0.05);
  } catch { /* audio unavailable */ }
}
export function playGiggleSound() {
  const pitches = [800, 900, 850, 950, 800, 880];
  pitches.forEach((p, i) => setTimeout(() => playTone(p, p * 1.5, 0.1, 0.08), i * 120));
}
export function playFleeSound() { playTone(400, 100, 0.3, 0.05); }
export function playSqueakSound() { playTone(1200, 800, 0.12, 0.04); }

interface UseSmudgeProps {
  isPasswordFocused: boolean;
  passwordResult: 'none' | 'success' | 'failure';
}

export function useSmudge({ isPasswordFocused, passwordResult }: UseSmudgeProps) {
  const [state, setState] = useState<SmudgeState>('IDLE');
  const [position, setPosition] = useState<SmudgePosition>({ x: 0, y: 0 });
  const [eyeTarget, setEyeTarget] = useState<SmudgePosition>({ x: 0, y: 0 });
  const [isBeingChased, setIsBeingChased] = useState(false);
  const [isDraggingCursor, setIsDraggingCursor] = useState(false);

  const stateRef = useRef<SmudgeState>('IDLE');
  const positionRef = useRef<SmudgePosition>({ x: 0, y: 0 });
  const cornerIndexRef = useRef(0);
  const isPasswordFocusedRef = useRef(isPasswordFocused);
  const isTypingRef = useRef(false);
  const lastInteractionRef = useRef(Date.now());
  const lastTypingRef = useRef(Date.now());
  const lastCursorMoveRef = useRef(Date.now());
  const lastCursorDragRef = useRef(0);
  const isBeingChasedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const stateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cornerHopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fleeGuardRef = useRef(false);

  useEffect(() => { isPasswordFocusedRef.current = isPasswordFocused; }, [isPasswordFocused]);

  const clearTimer = useCallback(() => {
    if (stateTimerRef.current) { clearTimeout(stateTimerRef.current); stateTimerRef.current = null; }
  }, []);
  const clearHopInterval = useCallback(() => {
    if (cornerHopRef.current) { clearInterval(cornerHopRef.current); cornerHopRef.current = null; }
  }, []);
  const setStateSync = useCallback((s: SmudgeState) => { stateRef.current = s; setState(s); }, []);
  const moveToCorner = useCallback((idx: number) => {
    const pos = CORNER_POSITIONS[idx].getPos(window.innerWidth, window.innerHeight);
    positionRef.current = pos; cornerIndexRef.current = idx; setPosition(pos);
  }, []);

  useEffect(() => { moveToCorner(0); }, [moveToCorner]);

  useEffect(() => {
    let lastMove = 0;
    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMove < 60) return;
      lastMove = now;
      lastInteractionRef.current = now;
      lastCursorMoveRef.current = now;
      setEyeTarget({ x: e.clientX, y: e.clientY });

      const s = stateRef.current;
      if (['HIDING','PEEKING','GIGGLING','FLEEING','SUCCESS','ANNOYED'].includes(s)) return;
      if (isTypingRef.current) return;

      const dx = e.clientX - positionRef.current.x - 30;
      const dy = e.clientY - positionRef.current.y - 30;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 100 && !fleeGuardRef.current) {
        fleeGuardRef.current = true;
        isBeingChasedRef.current = true;
        setIsBeingChased(true);
        setStateSync('FLEEING');
        playFleeSound();
        clearTimer(); clearHopInterval();
        moveToCorner((cornerIndexRef.current + 2) % 4);
        stateTimerRef.current = setTimeout(() => {
          fleeGuardRef.current = false;
          isBeingChasedRef.current = false;
          setIsBeingChased(false);
          setStateSync('IDLE');
        }, STATE_TIMINGS.FLEE_DURATION);
        return;
      }
      if (dist >= 150) {
        fleeGuardRef.current = false;
        if (isBeingChasedRef.current) { isBeingChasedRef.current = false; setIsBeingChased(false); }
      }
      if (isDraggingRef.current) { isDraggingRef.current = false; setIsDraggingCursor(false); setStateSync('IDLE'); }
      if (s === 'IDLE' || s === 'BORED') setStateSync('WATCHING');
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [setStateSync, clearTimer, clearHopInterval, moveToCorner]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const dx = e.clientX - positionRef.current.x - 30;
      const dy = e.clientY - positionRef.current.y - 30;
      const s = stateRef.current;
      if (Math.sqrt(dx*dx+dy*dy) < 50 && s !== 'HIDING' && s !== 'GIGGLING') {
        clearTimer(); clearHopInterval(); setStateSync('GIGGLING'); playGiggleSound();
        stateTimerRef.current = setTimeout(() => {
          moveToCorner((cornerIndexRef.current + 1 + Math.floor(Math.random()*2)) % 4);
          setStateSync('IDLE');
        }, STATE_TIMINGS.GIGGLE_DURATION);
      }
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [setStateSync, clearTimer, clearHopInterval, moveToCorner]);

  useEffect(() => {
    let keyUpTimer: ReturnType<typeof setTimeout> | null = null;
    const onKeyDown = () => {
      lastTypingRef.current = Date.now(); lastInteractionRef.current = Date.now();
      isTypingRef.current = true;
      if (keyUpTimer) { clearTimeout(keyUpTimer); keyUpTimer = null; }
      if (isPasswordFocusedRef.current && stateRef.current !== 'HIDING') {
        clearTimer(); clearHopInterval(); setStateSync('HIDING');
      }
    };
    const onKeyUp = () => {
      if (keyUpTimer) clearTimeout(keyUpTimer);
      keyUpTimer = setTimeout(() => { isTypingRef.current = false; }, 300);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (keyUpTimer) clearTimeout(keyUpTimer);
    };
  }, [setStateSync, clearTimer, clearHopInterval]);

  useEffect(() => {
    const onFlee = () => {
      if (['HIDING','GIGGLING'].includes(stateRef.current) || fleeGuardRef.current) return;
      fleeGuardRef.current = true;
      clearTimer(); clearHopInterval(); setStateSync('FLEEING'); playFleeSound();
      moveToCorner((cornerIndexRef.current + 1 + Math.floor(Math.random()*2)) % 4);
      stateTimerRef.current = setTimeout(() => { fleeGuardRef.current = false; setStateSync('IDLE'); }, STATE_TIMINGS.FLEE_DURATION);
    };
    window.addEventListener('smudge-flee-trigger', onFlee);
    return () => window.removeEventListener('smudge-flee-trigger', onFlee);
  }, [setStateSync, clearTimer, clearHopInterval, moveToCorner]);

  useEffect(() => {
    if (isPasswordFocused) {
      if (stateRef.current !== 'HIDING') { clearTimer(); clearHopInterval(); setStateSync('HIDING'); }
    } else {
      if (stateRef.current === 'HIDING' || stateRef.current === 'PEEKING') setStateSync('IDLE');
    }
  }, [isPasswordFocused, setStateSync, clearTimer, clearHopInterval]);

  useEffect(() => {
    if (passwordResult === 'success') {
      clearTimer(); setStateSync('SUCCESS');
      stateTimerRef.current = setTimeout(() => setStateSync('IDLE'), 1000);
    } else if (passwordResult === 'failure') {
      clearTimer(); setStateSync('ANNOYED');
      stateTimerRef.current = setTimeout(
        () => setStateSync(isPasswordFocusedRef.current ? 'HIDING' : 'IDLE'),
        STATE_TIMINGS.ANNOYED_DURATION
      );
    }
  }, [passwordResult, setStateSync, clearTimer]);

  useEffect(() => {
    if (stateRef.current !== 'HIDING' || !isPasswordFocused) return;
    const id = setInterval(() => {
      if (Date.now() - lastTypingRef.current >= STATE_TIMINGS.PEEK_THRESHOLD) setStateSync('PEEKING');
    }, 250);
    return () => clearInterval(id);
  }, [state, isPasswordFocused, setStateSync]);

  useEffect(() => {
    if (state !== 'IDLE' && state !== 'WATCHING') return;
    const id = setInterval(() => {
      const s = stateRef.current;
      if (s !== 'IDLE' && s !== 'WATCHING') return;
      if (Date.now() - lastInteractionRef.current >= STATE_TIMINGS.BORED_THRESHOLD) setStateSync('BORED');
    }, 1500);
    return () => clearInterval(id);
  }, [state, setStateSync]);

  useEffect(() => {
    if (state !== 'BORED') return;
    clearHopInterval();
    const hop = () => moveToCorner((cornerIndexRef.current + 1) % 4);
    hop();
    cornerHopRef.current = setInterval(hop, STATE_TIMINGS.CORNER_HOP_INTERVAL);
    clearTimer();
    stateTimerRef.current = setTimeout(() => { clearHopInterval(); setStateSync('IDLE'); }, STATE_TIMINGS.CORNER_HOP_INTERVAL * 3);
    return clearHopInterval;
  }, [state, moveToCorner, setStateSync, clearTimer, clearHopInterval]);

  useEffect(() => {
    if (state !== 'IDLE' && state !== 'WATCHING') return;
    const id = setInterval(() => {
      const s = stateRef.current;
      if (s !== 'IDLE' && s !== 'WATCHING') return;
      if (isPasswordFocusedRef.current) return;
      const now = Date.now();
      if (now - lastCursorMoveRef.current >= STATE_TIMINGS.CURSOR_IDLE_THRESHOLD &&
          now - lastCursorDragRef.current >= STATE_TIMINGS.CURSOR_COOLDOWN) {
        lastCursorDragRef.current = now;
        isDraggingRef.current = true;
        setIsDraggingCursor(true);
        setStateSync('DRAGGING_CURSOR');
        setTimeout(() => { isDraggingRef.current = false; setIsDraggingCursor(false); setStateSync('IDLE'); }, 2000);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [state, setStateSync]);

  useEffect(() => {
    const onResize = () => moveToCorner(cornerIndexRef.current);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [moveToCorner]);

  return { state, position, eyeTarget, isBeingChased, isDraggingCursor };
}
