import { useState, useEffect } from 'react';
import { SmudgeBody } from './SmudgeBody';
import { useSmudgeState } from './useSmudgeState';

interface SmudgeProps {
  isPasswordFocused?: boolean;
  passwordResult?: 'none' | 'success' | 'failure';
}

export function Smudge({ 
  isPasswordFocused = false, 
  passwordResult = 'none' 
}: SmudgeProps) {
  const [mounted, setMounted] = useState(false);

  const { state, cursorPosition, eyeTarget, position, isBeingChased, isDraggingCursor } = useSmudgeState({
    isPasswordFocused,
    passwordResult
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
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
        />
      </div>
    </div>
  );
}

export default Smudge;
