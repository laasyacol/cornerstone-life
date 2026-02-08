import { useState, useEffect, useRef } from 'react';
import { SmudgeBody } from './SmudgeBody';
import { useSmudgeState } from './useSmudgeState';
import { SootTrail } from './SootTrail';
import { playSqueakSound } from './useSmudgeSounds';

interface SmudgeProps {
  isPasswordFocused?: boolean;
  passwordResult?: 'none' | 'success' | 'failure';
}

// Frightened particle burst component
function FrightenedBurst({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;
  
  return (
    <div className="absolute -top-2 -right-2 pointer-events-none">
      {/* Tiny frightened particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-frightened-particle"
          style={{
            left: 30 + Math.cos((i / 6) * Math.PI * 2) * 8,
            top: 30 + Math.sin((i / 6) * Math.PI * 2) * 8,
            animationDelay: `${i * 0.05}s`,
          }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8">
            <circle 
              cx="4" cy="4" r="3" 
              fill="hsl(var(--primary))" 
              opacity="0.7"
            />
          </svg>
        </div>
      ))}
      {/* Exclamation marks */}
      <svg 
        width="16" height="16" 
        viewBox="0 0 16 16" 
        className="absolute -top-4 right-0 animate-bounce"
        style={{ animationDuration: '0.3s' }}
      >
        <text 
          x="8" y="12" 
          textAnchor="middle" 
          fill="hsl(var(--primary))" 
          fontSize="12" 
          fontWeight="bold"
          opacity="0.8"
        >!</text>
      </svg>
    </div>
  );
}

export function Smudge({ 
  isPasswordFocused = false, 
  passwordResult = 'none' 
}: SmudgeProps) {
  const [mounted, setMounted] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });
  const [isLookingBack, setIsLookingBack] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const lookBackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const squeakCountRef = useRef(0);

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

  // Nervous look-back animation when fleeing with squeaks
  useEffect(() => {
    if (state === 'FLEEING') {
      squeakCountRef.current = 0;
      
      // Start looking back after a brief delay
      const startDelay = setTimeout(() => {
        setIsLookingBack(true);
        setShowBurst(true);
        
        // Play squeak on first look back
        playSqueakSound();
        squeakCountRef.current++;
        
        // Hide burst after animation
        setTimeout(() => setShowBurst(false), 300);
        
        // Toggle look-back nervously with occasional squeaks
        lookBackIntervalRef.current = setInterval(() => {
          setIsLookingBack(prev => {
            const newVal = !prev;
            // Play squeak occasionally when looking back (not every time)
            if (newVal && squeakCountRef.current < 3) {
              playSqueakSound();
              squeakCountRef.current++;
              setShowBurst(true);
              setTimeout(() => setShowBurst(false), 300);
            }
            return newVal;
          });
        }, 600); // Slower glances (was 400)
      }, 500); // Longer delay before first look back

      return () => {
        clearTimeout(startDelay);
        if (lookBackIntervalRef.current) {
          clearInterval(lookBackIntervalRef.current);
        }
        setIsLookingBack(false);
        setShowBurst(false);
      };
    } else {
      setIsLookingBack(false);
      setShowBurst(false);
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
            ? 'left 2.8s cubic-bezier(0.25, 0.1, 0.25, 1), top 2.8s cubic-bezier(0.25, 0.1, 0.25, 1)' // Slower flee (was 1.8s)
            : state === 'BORED' || state === 'GIGGLING' 
            ? 'left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' 
            : 'left 0.3s ease-out, top 0.3s ease-out'
        }}
      >
        {/* Frightened burst when looking back */}
        <FrightenedBurst isActive={showBurst} />
        
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
