import { useRef } from 'react';
import { SmudgeState, SmudgePosition } from './smudgeTypes';
import { SootParticles } from './SootParticles';
import { DustPuffs } from './DustPuffs';

interface SmudgeBodyProps {
  state: SmudgeState;
  eyeTarget: SmudgePosition;
  position: SmudgePosition;
  isBeingChased?: boolean;
  isLookingBack?: boolean;
}

export function SmudgeBody({ state, eyeTarget, position, isBeingChased = false, isLookingBack = false }: SmudgeBodyProps) {
  const bodyRef = useRef<SVGGElement>(null);
  
  // Calculate eye direction based on cursor
  const getEyeOffset = () => {
    if (!bodyRef.current) return { x: 0, y: 0 };
    
    const rect = bodyRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const dx = eyeTarget.x - centerX;
    const dy = eyeTarget.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return { x: 0, y: 0 };
    
    const maxOffset = 3;
    return {
      x: (dx / distance) * maxOffset,
      y: (dy / distance) * maxOffset
    };
  };

  const eyeOffset = getEyeOffset();
  
  // State-based modifications
  const isHiding = state === 'HIDING';
  const isPeeking = state === 'PEEKING';
  const isAnnoyed = state === 'ANNOYED';
  const isBored = state === 'BORED';
  const isSuccess = state === 'SUCCESS';
  const isGiggling = state === 'GIGGLING';
  const isFleeing = state === 'FLEEING';
  
  // Hair/spike animation based on state
  const getHairStyle = () => {
    if (isBeingChased || isFleeing) return 'chase'; // Extra spikes when fleeing
    switch (state) {
      case 'BORED': return 'droop';
      case 'WATCHING': return 'alert';
      case 'ANNOYED': return 'spike';
      case 'GIGGLING': return 'alert';
      case 'IDLE': return 'relaxed';
      default: return 'relaxed';
    }
  };

  const hairStyle = getHairStyle();

  return (
    <>
    <svg 
      width="60" 
      height="60" 
      viewBox="0 0 60 60" 
      className={`
        transition-transform duration-300
        ${isAnnoyed ? 'animate-smudge-shake' : ''}
        ${isBored ? 'animate-smudge-hop' : ''}
        ${isSuccess ? 'animate-smudge-step-aside' : ''}
        ${isGiggling ? 'animate-smudge-giggle' : ''}
        ${isFleeing ? 'animate-smudge-flee' : ''}
      `}
    >
      <g ref={bodyRef}>
        {/* Soot spikes/hair - irregular, spiky extensions */}
        <g className={`smudge-hair smudge-hair-${hairStyle}`}>
          {/* Top spikes */}
          <line x1="30" y1="12" x2="28" y2="4" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <line x1="35" y1="13" x2="38" y2="5" stroke="hsl(var(--foreground))" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <line x1="24" y1="14" x2="20" y2="7" stroke="hsl(var(--foreground))" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
          
          {/* Extra top spikes when chased */}
          {(isBeingChased || isFleeing) && (
            <>
              <line x1="32" y1="11" x2="34" y2="2" stroke="hsl(var(--foreground))" strokeWidth="1.3" strokeLinecap="round" opacity="0.75" />
              <line x1="27" y1="12" x2="24" y2="3" stroke="hsl(var(--foreground))" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
            </>
          )}
          
          {/* Right spikes */}
          <line x1="48" y1="28" x2="55" y2="26" stroke="hsl(var(--foreground))" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <line x1="47" y1="35" x2="54" y2="38" stroke="hsl(var(--foreground))" strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
          
          {/* Extra right spikes when chased */}
          {(isBeingChased || isFleeing) && (
            <>
              <line x1="49" y1="31" x2="57" y2="30" stroke="hsl(var(--foreground))" strokeWidth="1.2" strokeLinecap="round" opacity="0.65" />
            </>
          )}
          
          {/* Left spikes */}
          <line x1="12" y1="30" x2="5" y2="28" stroke="hsl(var(--foreground))" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          <line x1="14" y1="38" x2="7" y2="42" stroke="hsl(var(--foreground))" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
          
          {/* Extra left spikes when chased */}
          {(isBeingChased || isFleeing) && (
            <>
              <line x1="11" y1="34" x2="3" y2="33" stroke="hsl(var(--foreground))" strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
            </>
          )}
          
          {/* Bottom-ish spikes */}
          <line x1="22" y1="47" x2="18" y2="53" stroke="hsl(var(--foreground))" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          <line x1="40" y1="46" x2="44" y2="52" stroke="hsl(var(--foreground))" strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
        </g>

        {/* Main soot body - irregular, ragged shape */}
        <path 
          d="M30 12 
             C38 11, 46 16, 48 24
             C50 30, 49 38, 46 44
             C42 50, 36 52, 30 51
             C24 52, 18 50, 14 44
             C11 38, 10 30, 12 24
             C14 16, 22 11, 30 12"
          fill="hsl(var(--foreground))"
          opacity="0.85"
          className="transition-all duration-300"
        />
        
        {/* Inner texture - makes it look more soot-like */}
        <path 
          d="M28 18 C34 17, 40 22, 42 28 C44 34, 42 40, 38 44 C32 48, 26 48, 22 44 C18 40, 16 34, 18 28 C20 22, 24 18, 28 18"
          fill="hsl(var(--foreground))"
          opacity="0.95"
        />

        {/* Angry forehead symbol - anime style cross veins */}
        {isAnnoyed && (
          <g className="animate-pulse">
            <path 
              d="M38 16 Q42 18, 44 14 M40 14 Q42 18, 46 16"
              stroke="hsl(var(--destructive))"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />
          </g>
        )}

        {/* Line arms - simple soot extensions */}
        <g className="smudge-arms">
          {/* Left arm */}
          <path 
            d={isHiding 
              ? "M14 32 Q8 28, 20 24" // covering eyes
              : isBored 
                ? "M14 32 Q6 38, 8 45" // hanging loose
                : isGiggling
                  ? "M14 32 Q4 28, 6 35" // flailing happily
                  : "M14 32 Q8 34, 6 38" // relaxed
            }
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
            className="transition-all duration-500"
          />
          
          {/* Right arm */}
          <path 
            d={isHiding 
              ? "M46 32 Q52 28, 40 24" // covering eyes
              : isBored 
                ? "M46 32 Q54 38, 52 45" // hanging loose
                : isGiggling
                  ? "M46 32 Q56 28, 54 35" // flailing happily
                  : "M46 32 Q52 34, 54 38" // relaxed
            }
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
            className="transition-all duration-500"
          />
        </g>

        {/* Laughing tears when giggling */}
        {isGiggling && (
          <g className="smudge-tears">
            {/* Left tear */}
            <ellipse 
              cx="18" 
              cy="36" 
              rx="3" 
              ry="4"
              fill="hsl(var(--primary))"
              className="animate-smudge-tear-left"
              style={{
                filter: 'drop-shadow(0 0 4px hsl(var(--primary))) drop-shadow(0 0 8px hsl(var(--primary) / 0.6))',
              }}
            >
              <animate attributeName="opacity" values="0.9;0.6;0.9" dur="0.3s" repeatCount="indefinite" />
            </ellipse>
            {/* Right tear */}
            <ellipse 
              cx="42" 
              cy="36" 
              rx="3" 
              ry="4"
              fill="hsl(var(--primary))"
              className="animate-smudge-tear-right"
              style={{
                filter: 'drop-shadow(0 0 4px hsl(var(--primary))) drop-shadow(0 0 8px hsl(var(--primary) / 0.6))',
              }}
            >
              <animate attributeName="opacity" values="0.9;0.6;0.9" dur="0.3s" repeatCount="indefinite" />
            </ellipse>
            {/* Extra sparkle tears */}
            <circle cx="16" cy="40" r="2" fill="hsl(var(--primary))" opacity="0.5" className="animate-smudge-tear-left" />
            <circle cx="44" cy="40" r="2" fill="hsl(var(--primary))" opacity="0.5" className="animate-smudge-tear-right" />
          </g>
        )}

        {/* Eyes - floating within the mass */}
        {!isHiding && (
          <g className={`smudge-eyes transition-all duration-200 ${isLookingBack ? 'animate-smudge-look-back' : ''}`}>
            {/* Left eye - when looking back, eyes shift to show nervous glance */}
            <ellipse 
              cx={isLookingBack ? 20 : 24 + eyeOffset.x * 0.5} 
              cy={isLookingBack ? 28 : 30 + eyeOffset.y * 0.5} 
              rx={isPeeking ? 2 : isGiggling ? 2 : isAnnoyed ? 3 : isLookingBack ? 5 : 4} 
              ry={isPeeking ? 3 : isGiggling ? 1 : isAnnoyed ? 2 : isLookingBack ? 6 : 5}
              fill="hsl(var(--background))"
              opacity={isPeeking ? 0.5 : 1}
            />
            {/* Left pupil - tiny and looking back when fleeing */}
            {!isGiggling && (
              <circle 
                cx={isLookingBack ? 17 : 24 + eyeOffset.x} 
                cy={isLookingBack ? 28 : isAnnoyed ? 31 + eyeOffset.y : 30 + eyeOffset.y} 
                r={isPeeking ? 1 : isAnnoyed ? 1.5 : isLookingBack ? 1.5 : 2}
                fill="hsl(var(--foreground))"
                opacity={isPeeking ? 0.5 : 1}
              />
            )}
            
            {/* Nervous sweat drop when looking back */}
            {isLookingBack && (
              <ellipse
                cx="14"
                cy="24"
                rx="2"
                ry="3"
                fill="hsl(var(--primary))"
                opacity="0.6"
                className="animate-sweat-drop"
              />
            )}
            
            {/* Angry eyebrow for left eye */}
            {isAnnoyed && (
              <line 
                x1="20" y1="24" 
                x2="28" y2="26"
                stroke="hsl(var(--foreground))"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.9"
              />
            )}
            
            {/* Worried eyebrow when looking back */}
            {isLookingBack && (
              <path
                d="M16 22 Q20 19, 24 22"
                stroke="hsl(var(--foreground))"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.8"
              />
            )}
            
            {/* Right eye - hidden when peeking (one eye peek), wide and scared when looking back */}
            {!isPeeking && (
              <>
                <ellipse 
                  cx={isLookingBack ? 34 : 36 + eyeOffset.x * 0.5} 
                  cy={isLookingBack ? 28 : 30 + eyeOffset.y * 0.5} 
                  rx={isGiggling ? 2 : isAnnoyed ? 3 : isLookingBack ? 5 : 4}
                  ry={isGiggling ? 1 : isAnnoyed ? 2 : isLookingBack ? 6 : 5}
                  fill="hsl(var(--background))"
                />
                {!isGiggling && (
                  <circle 
                    cx={isLookingBack ? 31 : 36 + eyeOffset.x} 
                    cy={isLookingBack ? 28 : isAnnoyed ? 31 + eyeOffset.y : 30 + eyeOffset.y} 
                    r={isAnnoyed ? 1.5 : isLookingBack ? 1.5 : 2}
                    fill="hsl(var(--foreground))"
                  />
                )}
                
                {/* Angry eyebrow for right eye */}
                {isAnnoyed && (
                  <line 
                    x1="32" y1="26" 
                    x2="40" y2="24"
                    stroke="hsl(var(--foreground))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                )}
                
                {/* Worried eyebrow when looking back */}
                {isLookingBack && (
                  <path
                    d="M30 22 Q34 19, 38 22"
                    stroke="hsl(var(--foreground))"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.8"
                  />
                )}
              </>
            )}
          </g>
        )}
      </g>
    </svg>
    
    {/* Soot particles when fleeing */}
    {isFleeing && <SootParticles />}
    
    {/* Dust puffs at feet when fleeing */}
    {isFleeing && <DustPuffs />}
  </>
  );
}
