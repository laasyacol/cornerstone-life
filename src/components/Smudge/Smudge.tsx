import { useState, useEffect, useRef } from 'react';
import { SmudgeBody } from './SmudgeBody';
import { useSmudgeState } from './useSmudgeState';
import { SootTrail } from './SootTrail';

interface SmudgeProps {
  isPasswordFocused?: boolean;
  passwordResult?: 'none' | 'success' | 'failure';
}

export function Smudge({ 
  isPasswordFocused = false, 
  passwordResult = 'none' 
}: SmudgeProps) {
  const [mounted, setMounted] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });
  const [isLookingBack, setIsLookingBack] = useState(false);
  const lookBackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { state, cursorPosition, eyeTarget, position, isBeingChased, isDraggingCursor } = useSmudgeState({
    isPasswordFocused,
    passwordResult
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track position changes for soot trail
  useEffect(() => {
    if (state === 'FLEEING' && (prevPosition.x !== position.x || prevPosition.y !== position.y)) {
      // Small delay to capture the start position
      const timer = setTimeout(() => {
        setPrevPosition({ x: position.x, y: position.y });
      }, 100);
      return () => clearTimeout(timer);
    } else if (state !== 'FLEEING') {
      setPrevPosition(position);
    }
  }, [position, state, prevPosition]);

  // Nervous look-back animation when fleeing
  useEffect(() => {
    if (state === 'FLEEING') {
      // Start looking back after a brief delay
      const startDelay = setTimeout(() => {
        setIsLookingBack(true);
        
        // Toggle look-back nervously
        lookBackIntervalRef.current = setInterval(() => {
          setIsLookingBack(prev => !prev);
        }, 400); // Quick nervous glances
      }, 300);

      return () => {
        clearTimeout(startDelay);
        if (lookBackIntervalRef.current) {
          clearInterval(lookBackIntervalRef.current);
        }
        setIsLookingBack(false);
      };
    } else {
      setIsLookingBack(false);
      if (lookBackIntervalRef.current) {
        clearInterval(lookBackIntervalRef.current);
      }
    }
  }, [state]);

  if (!mounted) return null;

  return (
    <>
      {/* Soot trail when fleeing */}
      <SootTrail 
        startPos={prevPosition} 
        endPos={position} 
        isActive={state === 'FLEEING'} 
      />
      
      <div 
        className={`
          fixed z-40 select-none
          ${isDraggingCursor ? 'pointer-events-auto cursor-grab' : 'pointer-events-none'}
        `}
        style={{
          left: position.x,
          top: position.y,
          transition: state === 'FLEEING'
            ? 'left 1.8s cubic-bezier(0.25, 0.1, 0.25, 1), top 1.8s cubic-bezier(0.25, 0.1, 0.25, 1)'
            : state === 'BORED' || state === 'GIGGLING' 
            ? 'left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' 
            : 'left 0.3s ease-out, top 0.3s ease-out'
        }}
      >
        {/* Subtle breathing animation container */}
        <div className={`
          ${state === 'IDLE' ? 'animate-smudge-breathe' : ''}
          ${state === 'BORED' ? 'animate-smudge-fidget' : ''}
          ${state === 'GIGGLING' ? 'animate-smudge-wiggle' : ''}
        `}>
          <SmudgeBody 
            state={state} 
            eyeTarget={eyeTarget}
            position={position}
            isBeingChased={isBeingChased}
            isLookingBack={isLookingBack}
          />
        </div>
      </div>
    </>
  );
}

export default Smudge;
