import { useState, useEffect, useRef } from 'react';
import { useSmudge, playSqueakSound } from './useSmudge';
import { SmudgeState, SmudgePosition } from './smudgeTypes';

interface BodyProps {
  state: SmudgeState; eyeTarget: SmudgePosition; position: SmudgePosition;
  isBeingChased: boolean; isLookingBack: boolean;
}
function SmudgeBody({ state, eyeTarget, isBeingChased, isLookingBack }: BodyProps) {
  const bodyRef = useRef<SVGGElement>(null);
  const getEyeOffset = () => {
    if (!bodyRef.current) return { x: 0, y: 0 };
    const rect = bodyRef.current.getBoundingClientRect();
    const dx = eyeTarget.x - (rect.left + rect.width / 2);
    const dy = eyeTarget.y - (rect.top + rect.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: (dx / dist) * 3, y: (dy / dist) * 3 };
  };
  const eye = getEyeOffset();
  const isHiding = state === 'HIDING', isPeeking = state === 'PEEKING', isAnnoyed = state === 'ANNOYED';
  const isBored = state === 'BORED', isSuccess = state === 'SUCCESS', isGiggling = state === 'GIGGLING';
  const isFleeing = state === 'FLEEING', isChased = isBeingChased || isFleeing;
  const leftArm = isHiding ? 'M14 32 Q8 28,20 24' : isBored ? 'M14 32 Q6 38,8 45' : isGiggling ? 'M14 32 Q4 28,6 35' : 'M14 32 Q8 34,6 38';
  const rightArm = isHiding ? 'M46 32 Q52 28,40 24' : isBored ? 'M46 32 Q54 38,52 45' : isGiggling ? 'M46 32 Q56 28,54 35' : 'M46 32 Q52 34,54 38';
  return (
    <svg width="60" height="60" viewBox="0 0 60 60"
      className={['transition-transform duration-300', isAnnoyed ? 'animate-smudge-shake' : '', isBored ? 'animate-smudge-hop' : '', isSuccess ? 'animate-smudge-step-aside' : '', isGiggling ? 'animate-smudge-giggle' : '', isFleeing ? 'animate-smudge-flee' : ''].join(' ')}>
      <g ref={bodyRef}>
        <g>
          <line x1="30" y1="12" x2="28" y2="4" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <line x1="35" y1="13" x2="38" y2="5" stroke="hsl(var(--foreground))" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <line x1="24" y1="14" x2="20" y2="7" stroke="hsl(var(--foreground))" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
          {isChased && <><line x1="32" y1="11" x2="34" y2="2" stroke="hsl(var(--foreground))" strokeWidth="1.3" strokeLinecap="round" opacity="0.75" /><line x1="27" y1="12" x2="24" y2="3" stroke="hsl(var(--foreground))" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" /></>}
          <line x1="48" y1="28" x2="55" y2="26" stroke="hsl(var(--foreground))" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <line x1="47" y1="35" x2="54" y2="38" stroke="hsl(var(--foreground))" strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
          {isChased && <line x1="49" y1="31" x2="57" y2="30" stroke="hsl(var(--foreground))" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />}
          <line x1="12" y1="30" x2="5" y2="28" stroke="hsl(var(--foreground))" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          <line x1="14" y1="38" x2="7" y2="42" stroke="hsl(var(--foreground))" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
          {isChased && <line x1="11" y1="34" x2="3" y2="33" stroke="hsl(var(--foreground))" strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />}
          <line x1="22" y1="47" x2="18" y2="53" stroke="hsl(var(--foreground))" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          <line x1="40" y1="46" x2="44" y2="52" stroke="hsl(var(--foreground))" strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
        </g>
        <path d="M30 12 C38 11,46 16,48 24 C50 30,49 38,46 44 C42 50,36 52,30 51 C24 52,18 50,14 44 C11 38,10 30,12 24 C14 16,22 11,30 12" fill="hsl(var(--foreground))" opacity="0.85" className="transition-all duration-300" />
        <path d="M28 18 C34 17,40 22,42 28 C44 34,42 40,38 44 C32 48,26 48,22 44 C18 40,16 34,18 28 C20 22,24 18,28 18" fill="hsl(var(--foreground))" opacity="0.95" />
        {isAnnoyed && <g className="animate-pulse"><path d="M38 16 Q42 18,44 14 M40 14 Q42 18,46 16" stroke="hsl(var(--destructive))" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9" /></g>}
        <path d={leftArm} stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" className="transition-all duration-500" />
        <path d={rightArm} stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" className="transition-all duration-500" />
        {isGiggling && <g>
          <ellipse cx="18" cy="36" rx="3" ry="4" fill="hsl(var(--primary))" className="animate-smudge-tear-left" style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary)))' }}>
            <animate attributeName="opacity" values="0.9;0.6;0.9" dur="0.3s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="42" cy="36" rx="3" ry="4" fill="hsl(var(--primary))" className="animate-smudge-tear-right" style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary)))' }}>
            <animate attributeName="opacity" values="0.9;0.6;0.9" dur="0.3s" repeatCount="indefinite" />
          </ellipse>
          <circle cx="16" cy="40" r="2" fill="hsl(var(--primary))" opacity="0.5" className="animate-smudge-tear-left" />
          <circle cx="44" cy="40" r="2" fill="hsl(var(--primary))" opacity="0.5" className="animate-smudge-tear-right" />
        </g>}
        {!isHiding && <g className={`smudge-eyes transition-all duration-200 ${isLookingBack ? 'animate-smudge-look-back' : ''}`}>
          <ellipse cx={isLookingBack ? 20 : 24 + eye.x * 0.5} cy={isLookingBack ? 28 : 30 + eye.y * 0.5} rx={isPeeking ? 2 : isGiggling ? 2 : isAnnoyed ? 3 : isLookingBack ? 5 : 4} ry={isPeeking ? 3 : isGiggling ? 1 : isAnnoyed ? 2 : isLookingBack ? 6 : 5} fill="hsl(var(--background))" opacity={isPeeking ? 0.5 : 1} />
          {!isGiggling && <circle cx={isLookingBack ? 17 : 24 + eye.x} cy={isLookingBack ? 28 : isAnnoyed ? 31 + eye.y : 30 + eye.y} r={isPeeking ? 1 : isAnnoyed ? 1.5 : isLookingBack ? 1.5 : 2} fill="hsl(var(--foreground))" opacity={isPeeking ? 0.5 : 1} />}
          {isLookingBack && <><ellipse cx="14" cy="24" rx="2" ry="3" fill="hsl(var(--primary))" opacity="0.6" className="animate-sweat-drop" /><path d="M16 22 Q20 19,24 22" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" /></>}
          {isAnnoyed && <line x1="20" y1="24" x2="28" y2="26" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" opacity="0.9" />}
          {!isPeeking && <>
            <ellipse cx={isLookingBack ? 34 : 36 + eye.x * 0.5} cy={isLookingBack ? 28 : 30 + eye.y * 0.5} rx={isGiggling ? 2 : isAnnoyed ? 3 : isLookingBack ? 5 : 4} ry={isGiggling ? 1 : isAnnoyed ? 2 : isLookingBack ? 6 : 5} fill="hsl(var(--background))" />
            {!isGiggling && <circle cx={isLookingBack ? 31 : 36 + eye.x} cy={isLookingBack ? 28 : isAnnoyed ? 31 + eye.y : 30 + eye.y} r={isAnnoyed ? 1.5 : isLookingBack ? 1.5 : 2} fill="hsl(var(--foreground))" />}
            {isLookingBack && <path d="M30 22 Q34 19,38 22" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />}
            {isAnnoyed && <line x1="32" y1="26" x2="40" y2="24" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" opacity="0.9" />}
          </>}
        </g>}
      </g>
    </svg>
  );
}

interface SmudgeProps {
  isPasswordFocused?: boolean;
  passwordResult?: 'none' | 'success' | 'failure';
}

export function Smudge({ isPasswordFocused = false, passwordResult = 'none' }: SmudgeProps) {
  const [mounted, setMounted] = useState(false);
  const [isLookingBack, setIsLookingBack] = useState(false);
  const lookBackRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const squeakCountRef = useRef(0);
  const { state, position, eyeTarget, isBeingChased, isDraggingCursor } = useSmudge({ isPasswordFocused, passwordResult });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (state !== 'FLEEING') {
      setIsLookingBack(false);
      if (lookBackRef.current) { clearInterval(lookBackRef.current); lookBackRef.current = null; }
      squeakCountRef.current = 0;
      return;
    }
    squeakCountRef.current = 0;
    const t = setTimeout(() => {
      setIsLookingBack(true);
      if (squeakCountRef.current < 1) { playSqueakSound(); squeakCountRef.current++; }
      lookBackRef.current = setInterval(() => {
        setIsLookingBack(prev => {
          const next = !prev;
          if (next && squeakCountRef.current < 3) { playSqueakSound(); squeakCountRef.current++; }
          return next;
        });
      }, 700);
    }, 500);
    return () => { clearTimeout(t); if (lookBackRef.current) { clearInterval(lookBackRef.current); lookBackRef.current = null; } setIsLookingBack(false); };
  }, [state]);

  if (!mounted) return null;

  const transition = state === 'FLEEING'
    ? 'left 2.8s cubic-bezier(0.25,0.1,0.25,1),top 2.8s cubic-bezier(0.25,0.1,0.25,1)'
    : (state === 'BORED' || state === 'GIGGLING')
      ? 'left 0.6s cubic-bezier(0.34,1.56,0.64,1),top 0.6s cubic-bezier(0.34,1.56,0.64,1)'
      : 'left 0.3s ease-out,top 0.3s ease-out';

  return (
    <div className={`fixed z-40 select-none ${isDraggingCursor ? 'pointer-events-auto cursor-grab' : 'pointer-events-none'}`}
      style={{ left: position.x, top: position.y, transition }}>
      <div className={[state === 'IDLE' ? 'animate-smudge-breathe' : '', state === 'BORED' ? 'animate-smudge-fidget' : '', state === 'GIGGLING' ? 'animate-smudge-wiggle' : ''].join(' ')}>
        <SmudgeBody state={state} eyeTarget={eyeTarget} position={position} isBeingChased={isBeingChased} isLookingBack={isLookingBack} />
      </div>
    </div>
  );
}

export default Smudge;
