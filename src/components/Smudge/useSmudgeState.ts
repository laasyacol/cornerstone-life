import { useState, useEffect, useCallback, useRef } from 'react';
import { SmudgeState, SmudgePosition, STATE_TIMINGS } from './smudgeTypes';

interface UseSmudgeStateProps {
  isPasswordFocused: boolean;
  passwordResult: 'none' | 'success' | 'failure';
}

export function useSmudgeState({ isPasswordFocused, passwordResult }: UseSmudgeStateProps) {
  const [state, setState] = useState<SmudgeState>('IDLE');
  const [cursorPosition, setCursorPosition] = useState<SmudgePosition>({ x: 0, y: 0 });
  const [eyeTarget, setEyeTarget] = useState<SmudgePosition>({ x: 0, y: 0 });
  
  const lastInteractionTime = useRef(Date.now());
  const lastTypingTime = useRef(Date.now());
  const stateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing timeout
  const clearStateTimeout = useCallback(() => {
    if (stateTimeoutRef.current) {
      clearTimeout(stateTimeoutRef.current);
      stateTimeoutRef.current = null;
    }
  }, []);

  // Handle cursor movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      lastInteractionTime.current = Date.now();
      
      // Calculate eye target (normalized direction)
      setEyeTarget({ x: e.clientX, y: e.clientY });
      
      // If not in a restricted state, transition to WATCHING
      if (state === 'IDLE' || state === 'BORED') {
        setState('WATCHING');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [state]);

  // Handle typing detection
  useEffect(() => {
    const handleKeyDown = () => {
      lastTypingTime.current = Date.now();
      lastInteractionTime.current = Date.now();
      
      if (isPasswordFocused && state !== 'HIDING') {
        setState('HIDING');
        clearStateTimeout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPasswordFocused, state, clearStateTimeout]);

  // Handle password focus state
  useEffect(() => {
    if (isPasswordFocused) {
      setState('HIDING');
      clearStateTimeout();
    } else if (state === 'HIDING' || state === 'PEEKING') {
      setState('IDLE');
    }
  }, [isPasswordFocused, state, clearStateTimeout]);

  // Handle password result
  useEffect(() => {
    if (passwordResult === 'success') {
      setState('SUCCESS');
      clearStateTimeout();
      stateTimeoutRef.current = setTimeout(() => {
        setState('IDLE');
      }, 1000);
    } else if (passwordResult === 'failure') {
      setState('ANNOYED');
      clearStateTimeout();
      stateTimeoutRef.current = setTimeout(() => {
        setState(isPasswordFocused ? 'HIDING' : 'IDLE');
      }, STATE_TIMINGS.ANNOYED_DURATION);
    }
  }, [passwordResult, isPasswordFocused, clearStateTimeout]);

  // Handle peeking logic
  useEffect(() => {
    if (state === 'HIDING' && isPasswordFocused) {
      const checkPeek = setInterval(() => {
        const timeSinceTyping = Date.now() - lastTypingTime.current;
        if (timeSinceTyping >= STATE_TIMINGS.PEEK_THRESHOLD) {
          setState('PEEKING');
        }
      }, 200);
      
      return () => clearInterval(checkPeek);
    }
  }, [state, isPasswordFocused]);

  // Handle boredom
  useEffect(() => {
    if (state === 'IDLE' || state === 'WATCHING') {
      const checkBoredom = setInterval(() => {
        const timeSinceInteraction = Date.now() - lastInteractionTime.current;
        if (timeSinceInteraction >= STATE_TIMINGS.BORED_THRESHOLD) {
          setState('BORED');
        }
      }, 1000);
      
      return () => clearInterval(checkBoredom);
    }
  }, [state]);

  // Transition from BORED back to IDLE after animation
  useEffect(() => {
    if (state === 'BORED') {
      clearStateTimeout();
      stateTimeoutRef.current = setTimeout(() => {
        setState('IDLE');
      }, 3000);
    }
    
    return () => clearStateTimeout();
  }, [state, clearStateTimeout]);

  return {
    state,
    cursorPosition,
    eyeTarget
  };
}
