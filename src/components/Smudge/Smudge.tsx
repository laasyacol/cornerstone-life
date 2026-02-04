import { useState, useEffect } from 'react';
import { SmudgeBody } from './SmudgeBody';
import { useSmudgeState } from './useSmudgeState';
import { SmudgePosition } from './smudgeTypes';

interface SmudgeProps {
  isPasswordFocused?: boolean;
  passwordResult?: 'none' | 'success' | 'failure';
}

export function Smudge({ 
  isPasswordFocused = false, 
  passwordResult = 'none' 
}: SmudgeProps) {
  // Position in bottom-right corner by default
  const [position, setPosition] = useState<SmudgePosition>({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  const { state, cursorPosition, eyeTarget } = useSmudgeState({
    isPasswordFocused,
    passwordResult
  });

  useEffect(() => {
    // Initial position - bottom right corner
    setPosition({
      x: window.innerWidth - 80,
      y: window.innerHeight - 80
    });
    setMounted(true);

    const handleResize = () => {
      setPosition({
        x: window.innerWidth - 80,
        y: window.innerHeight - 80
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) return null;

  return (
    <div 
      className="fixed z-40 pointer-events-none select-none"
      style={{
        left: position.x,
        top: position.y,
        transition: 'left 0.3s ease-out, top 0.3s ease-out'
      }}
    >
      {/* Subtle breathing animation container */}
      <div className={`
        ${state === 'IDLE' ? 'animate-smudge-breathe' : ''}
        ${state === 'BORED' ? 'animate-smudge-fidget' : ''}
      `}>
        <SmudgeBody 
          state={state} 
          eyeTarget={eyeTarget}
          position={position}
        />
      </div>
      
      {/* Debug state indicator - remove in production */}
      {/* <div className="text-xs text-muted-foreground mt-1 text-center opacity-50">
        {state}
      </div> */}
    </div>
  );
}

export default Smudge;
