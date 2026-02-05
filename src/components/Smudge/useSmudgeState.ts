import { useState, useEffect, useCallback, useRef } from 'react';
import { SmudgeState, SmudgePosition, STATE_TIMINGS, CORNER_POSITIONS } from './smudgeTypes';
import { playGiggleSound, playFleeSound } from './useSmudgeSounds';

interface UseSmudgeStateProps {
  isPasswordFocused: boolean;
  passwordResult: 'none' | 'success' | 'failure';
}

export function useSmudgeState({ isPasswordFocused, passwordResult }: UseSmudgeStateProps) {
  const [state, setState] = useState<SmudgeState>('IDLE');
  const [cursorPosition, setCursorPosition] = useState<SmudgePosition>({ x: 0, y: 0 });
  const [eyeTarget, setEyeTarget] = useState<SmudgePosition>({ x: 0, y: 0 });
  const [position, setPosition] = useState<SmudgePosition>({ x: 0, y: 0 });
  const [cornerIndex, setCornerIndex] = useState(0);
  const [isBeingChased, setIsBeingChased] = useState(false);
  const [isDraggingCursor, setIsDraggingCursor] = useState(false);
  
  const lastInteractionTime = useRef(Date.now());
  const lastTypingTime = useRef(Date.now());
  const lastCursorMoveTime = useRef(Date.now());
  const lastCursorDragTime = useRef(0);
  const stateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cornerHopRef = useRef<NodeJS.Timeout | null>(null);
  const smudgePositionRef = useRef<SmudgePosition>({ x: 0, y: 0 });
  const isTypingRef = useRef(false);

  // Initialize position
  useEffect(() => {
    const initialPos = CORNER_POSITIONS[0].getPos(window.innerWidth, window.innerHeight);
    setPosition(initialPos);
    smudgePositionRef.current = initialPos;
  }, []);

  // Clear any existing timeout
  const clearStateTimeout = useCallback(() => {
    if (stateTimeoutRef.current) {
      clearTimeout(stateTimeoutRef.current);
      stateTimeoutRef.current = null;
    }
  }, []);

  // Get distance from cursor to Smudge
  const getDistanceToSmudge = useCallback((cursorX: number, cursorY: number) => {
    const dx = cursorX - smudgePositionRef.current.x - 30;
    const dy = cursorY - smudgePositionRef.current.y - 30;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Handle cursor movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      setCursorPosition({ x: e.clientX, y: e.clientY });
      lastInteractionTime.current = now;
      lastCursorMoveTime.current = now;
      
      setEyeTarget({ x: e.clientX, y: e.clientY });
      
      const distance = getDistanceToSmudge(e.clientX, e.clientY);
      
      // Check if cursor is chasing Smudge (within 100px)
      if (distance < 100 && state !== 'HIDING' && state !== 'GIGGLING') {
        setIsBeingChased(true);
        if (state !== 'FLEEING') {
          setState('FLEEING');
          playFleeSound();
          clearStateTimeout();
          // Flee to a different corner
          const newCornerIndex = (cornerIndex + 2) % 4;
          setCornerIndex(newCornerIndex);
          const newPos = CORNER_POSITIONS[newCornerIndex].getPos(window.innerWidth, window.innerHeight);
          setPosition(newPos);
          smudgePositionRef.current = newPos;
          
          stateTimeoutRef.current = setTimeout(() => {
            setIsBeingChased(false);
            setState('IDLE');
          }, STATE_TIMINGS.FLEE_DURATION);
        }
      } else {
        setIsBeingChased(false);
      }
      
      // Cancel cursor dragging if user moves forcefully
      if (isDraggingCursor) {
        setIsDraggingCursor(false);
        setState('IDLE');
      }
      
      // If not in a restricted state and not typing, transition to WATCHING
      if ((state === 'IDLE' || state === 'BORED') && !isTypingRef.current) {
        setState('WATCHING');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [state, cornerIndex, isDraggingCursor, getDistanceToSmudge, clearStateTimeout]);

  // Handle click on Smudge
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const distance = getDistanceToSmudge(e.clientX, e.clientY);
      
      // If click is on Smudge (within 40px of center)
      if (distance < 50 && state !== 'HIDING' && state !== 'GIGGLING') {
        setState('GIGGLING');
        playGiggleSound();
        clearStateTimeout();
        
        // Flee to a random different corner after giggling
        stateTimeoutRef.current = setTimeout(() => {
          const newCornerIndex = (cornerIndex + 1 + Math.floor(Math.random() * 2)) % 4;
          setCornerIndex(newCornerIndex);
          const newPos = CORNER_POSITIONS[newCornerIndex].getPos(window.innerWidth, window.innerHeight);
          setPosition(newPos);
          smudgePositionRef.current = newPos;
          setState('IDLE');
        }, STATE_TIMINGS.GIGGLE_DURATION);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [state, cornerIndex, getDistanceToSmudge, clearStateTimeout]);

  // Handle typing detection
  useEffect(() => {
    const handleKeyDown = () => {
      lastTypingTime.current = Date.now();
      lastInteractionTime.current = Date.now();
      isTypingRef.current = true;
      
      // Cancel cursor dragging on typing
      if (isDraggingCursor) {
        setIsDraggingCursor(false);
      }
      
      if (isPasswordFocused && state !== 'HIDING') {
        setState('HIDING');
        clearStateTimeout();
      }
    };

    const handleKeyUp = () => {
      // Small delay before marking typing as finished
      setTimeout(() => {
        isTypingRef.current = false;
      }, 200);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPasswordFocused, state, isDraggingCursor, clearStateTimeout]);

  // Listen for custom flee trigger (from Enter key in SmudgeInput)
  useEffect(() => {
    const handleFleeTrigger = () => {
      if (state !== 'HIDING' && state !== 'GIGGLING') {
        setState('FLEEING');
        playFleeSound();
        clearStateTimeout();
        
        // Move to a new corner
        const newCornerIndex = (cornerIndex + 1 + Math.floor(Math.random() * 2)) % 4;
        setCornerIndex(newCornerIndex);
        const newPos = CORNER_POSITIONS[newCornerIndex].getPos(window.innerWidth, window.innerHeight);
        setPosition(newPos);
        smudgePositionRef.current = newPos;
        
        stateTimeoutRef.current = setTimeout(() => {
          setState('IDLE');
        }, STATE_TIMINGS.FLEE_DURATION);
      }
    };

    window.addEventListener('smudge-flee-trigger', handleFleeTrigger);
    return () => window.removeEventListener('smudge-flee-trigger', handleFleeTrigger);
  }, [state, cornerIndex, clearStateTimeout]);

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

  // Handle cursor idle → drag cursor (Section 5 rules)
  useEffect(() => {
    if (state === 'IDLE' || state === 'WATCHING') {
      const checkCursorIdle = setInterval(() => {
        const now = Date.now();
        const timeSinceCursorMove = now - lastCursorMoveTime.current;
        const timeSinceLastDrag = now - lastCursorDragTime.current;
        
        // Only drag if cursor idle for 4s and cooldown passed (15s)
        if (timeSinceCursorMove >= STATE_TIMINGS.CURSOR_IDLE_THRESHOLD && 
            timeSinceLastDrag >= STATE_TIMINGS.CURSOR_COOLDOWN &&
            !isPasswordFocused) {
          setIsDraggingCursor(true);
          setState('DRAGGING_CURSOR');
          lastCursorDragTime.current = now;
          
          // End drag after a short time
          setTimeout(() => {
            setIsDraggingCursor(false);
            setState('IDLE');
          }, 2000);
        }
      }, 1000);
      
      return () => clearInterval(checkCursorIdle);
    }
  }, [state, isPasswordFocused]);

  // Handle boredom with corner hopping
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

  // Corner hopping when BORED
  useEffect(() => {
    if (state === 'BORED') {
      // Hop to a new corner
      const hopToNewCorner = () => {
        const newCornerIndex = (cornerIndex + 1) % 4;
        setCornerIndex(newCornerIndex);
        const newPos = CORNER_POSITIONS[newCornerIndex].getPos(window.innerWidth, window.innerHeight);
        setPosition(newPos);
        smudgePositionRef.current = newPos;
      };

      hopToNewCorner();
      
      cornerHopRef.current = setInterval(hopToNewCorner, STATE_TIMINGS.CORNER_HOP_INTERVAL);
      
      // Return to idle after a few hops
      clearStateTimeout();
      stateTimeoutRef.current = setTimeout(() => {
        if (cornerHopRef.current) {
          clearInterval(cornerHopRef.current);
          cornerHopRef.current = null;
        }
        setState('IDLE');
      }, STATE_TIMINGS.CORNER_HOP_INTERVAL * 3);
      
      return () => {
        if (cornerHopRef.current) {
          clearInterval(cornerHopRef.current);
          cornerHopRef.current = null;
        }
      };
    }
  }, [state, cornerIndex, clearStateTimeout]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const newPos = CORNER_POSITIONS[cornerIndex].getPos(window.innerWidth, window.innerHeight);
      setPosition(newPos);
      smudgePositionRef.current = newPos;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [cornerIndex]);

  return {
    state,
    cursorPosition,
    eyeTarget,
    position,
    isBeingChased,
    isDraggingCursor
  };
}
