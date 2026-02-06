import { useState, useRef, useEffect, useCallback } from 'react';
import { SmudgePosition } from './Smudge/smudgeTypes';

interface SmudgeInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}

// Soot smudge marks left behind on text
function SootSmudges({ smudges }: { smudges: Array<{ id: number; x: number; y: number; opacity: number }> }) {
  return (
    <>
      {smudges.map((smudge) => (
        <div
          key={smudge.id}
          className="pointer-events-none absolute z-10 animate-soot-smudge"
          style={{
            left: smudge.x - 8,
            top: smudge.y - 4,
            opacity: smudge.opacity,
          }}
        >
          {/* Smudge mark */}
          <svg width="16" height="8" viewBox="0 0 16 8">
            <ellipse 
              cx="8" cy="4" rx="7" ry="3" 
              fill="hsl(var(--foreground))" 
              opacity="0.15"
              style={{ filter: 'blur(1px)' }}
            />
            <ellipse 
              cx="6" cy="4" rx="4" ry="2" 
              fill="hsl(var(--foreground))" 
              opacity="0.1"
              style={{ filter: 'blur(0.5px)' }}
            />
          </svg>
        </div>
      ))}
    </>
  );
}

// Sneaky Smudge eraser that follows the typing cursor
function SmudgeEraser({ position, isActive }: { position: SmudgePosition; isActive: boolean }) {
  if (!isActive) return null;
  
  return (
    <div 
      className="pointer-events-none fixed z-50 transition-all duration-100 ease-out"
      style={{
        left: position.x - 15,
        top: position.y - 22,
        transform: 'translateZ(0)', // Force GPU acceleration
      }}
    >
      <svg width="30" height="30" viewBox="0 0 30 30">
        {/* Mini Smudge erasing with SNEAKY expression */}
        <g className="animate-smudge-wiggle">
          {/* Soot body - slightly tilted for sneaky pose */}
          <ellipse 
            cx="15" cy="18" rx="10" ry="8" 
            fill="hsl(var(--foreground))" 
            opacity="0.85"
            transform="rotate(-5, 15, 18)"
          />
          
          {/* Spikes - more alert/mischievous */}
          <line x1="15" y1="10" x2="14" y2="4" stroke="hsl(var(--foreground))" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <line x1="18" y1="11" x2="22" y2="5" stroke="hsl(var(--foreground))" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
          <line x1="12" y1="11" x2="8" y2="5" stroke="hsl(var(--foreground))" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
          <line x1="20" y1="13" x2="24" y2="9" stroke="hsl(var(--foreground))" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
          
          {/* SNEAKY eyes - one squinting, one wide with mischievous brow */}
          {/* Left eye - squinting/sly */}
          <ellipse cx="11" cy="17" rx="2.5" ry="1.2" fill="hsl(var(--background))" />
          <ellipse cx="11" cy="17" rx="1.2" ry="0.8" fill="hsl(var(--foreground))" />
          {/* Sneaky eyebrow - raised */}
          <path 
            d="M8 14 Q11 12, 14 14" 
            stroke="hsl(var(--foreground))" 
            strokeWidth="1" 
            strokeLinecap="round" 
            fill="none"
            opacity="0.8"
          />
          
          {/* Right eye - slightly wider, looking at text */}
          <ellipse cx="18" cy="16" rx="2.5" ry="2" fill="hsl(var(--background))" />
          <circle cx="19" cy="16" r="1" fill="hsl(var(--foreground))" />
          {/* Mischievous eyebrow */}
          <path 
            d="M15 13 Q18 12, 21 14" 
            stroke="hsl(var(--foreground))" 
            strokeWidth="1" 
            strokeLinecap="round" 
            fill="none"
            opacity="0.8"
          />
          
          {/* Sneaky little smirk */}
          <path 
            d="M13 21 Q15 23, 18 21" 
            stroke="hsl(var(--background))" 
            strokeWidth="1" 
            strokeLinecap="round" 
            fill="none"
            opacity="0.6"
          />
          
          {/* Erasing arm - reaching toward text */}
          <path 
            d="M22 19 Q26 20, 27 24" 
            stroke="hsl(var(--foreground))" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            fill="none"
            opacity="0.8"
          />
          
          {/* Eraser "hand" */}
          <circle cx="27" cy="24" r="2" fill="hsl(var(--foreground))" opacity="0.7" />
          
          {/* Dust particles from erasing */}
          <circle cx="29" cy="25" r="1.5" fill="hsl(var(--muted-foreground))" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.2;0.5" dur="0.3s" repeatCount="indefinite" />
          </circle>
          <circle cx="27" cy="27" r="1" fill="hsl(var(--muted-foreground))" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="0.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="25" cy="26" r="0.8" fill="hsl(var(--muted-foreground))" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.1;0.3" dur="0.35s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  );
}

export function SmudgeInput({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "Type here...",
  multiline = false,
  className = ""
}: SmudgeInputProps) {
  const [isTyping, setIsTyping] = useState(false);
  const [eraserPosition, setEraserPosition] = useState<SmudgePosition>({ x: 0, y: 0 });
  const [sootSmudges, setSootSmudges] = useState<Array<{ id: number; x: number; y: number; opacity: number }>>([]);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<SmudgePosition>({ x: 0, y: 0 });
  const smudgeIdRef = useRef(0);

  // Throttled position update to prevent glitching
  const updateEraserPosition = useCallback(() => {
    if (!inputRef.current) return;
    
    const rect = inputRef.current.getBoundingClientRect();
    const textLength = value.length;
    
    // Better cursor position estimation
    const computedStyle = window.getComputedStyle(inputRef.current);
    const fontSize = parseFloat(computedStyle.fontSize) || 16;
    const charWidth = fontSize * 0.55; // More accurate char width based on font size
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 16;
    
    const cursorX = rect.left + Math.min(textLength * charWidth + paddingLeft, rect.width - 30);
    const cursorY = rect.top + rect.height / 2;
    
    // Smooth transition - don't jump too far
    const dx = cursorX - lastPositionRef.current.x;
    const dy = cursorY - lastPositionRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Only update if moved reasonably or first time
    if (distance < 200 || lastPositionRef.current.x === 0) {
      const newPos = { x: cursorX, y: cursorY };
      setEraserPosition(newPos);
      lastPositionRef.current = newPos;
      
      // Add soot smudge at current position (with some randomization)
      if (textLength > 0 && distance > 5) {
        const newSmudge = {
          id: smudgeIdRef.current++,
          x: cursorX - charWidth + Math.random() * 4 - 2,
          y: cursorY + Math.random() * 4 - 2,
          opacity: 0.3 + Math.random() * 0.2,
        };
        setSootSmudges(prev => [...prev.slice(-8), newSmudge]); // Keep last 8 smudges
      }
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsTyping(true);
    
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      updateEraserPosition();
    });
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing animation after delay
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 300); // Increased to 300ms for less flickering
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsTyping(false);
      
      // Clear smudges on submit
      setSootSmudges([]);
      
      // Dispatch custom event for Smudge to flee
      window.dispatchEvent(new CustomEvent('smudge-flee-trigger'));
      
      onSubmit();
    }
  };

  // Clean up old smudges periodically
  useEffect(() => {
    if (sootSmudges.length > 0) {
      const cleanup = setTimeout(() => {
        setSootSmudges(prev => prev.slice(1));
      }, 2000);
      return () => clearTimeout(cleanup);
    }
  }, [sootSmudges.length]);

  useEffect(() => {
    // Only update position when value changes and we're typing
    if (isTyping) {
      requestAnimationFrame(() => {
        updateEraserPosition();
      });
    }
  }, [value, isTyping, updateEraserPosition]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const commonProps = {
    ref: inputRef as any,
    value,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    placeholder,
    className: `w-full bg-background border border-border rounded-lg px-4 py-3 
      text-foreground placeholder:text-muted-foreground 
      focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
      transition-all ${className}`,
  };

  return (
    <div className="relative">
      {multiline ? (
        <textarea {...commonProps} rows={4} />
      ) : (
        <input type="text" {...commonProps} />
      )}
      
      {/* Soot smudges left behind */}
      <SootSmudges smudges={sootSmudges} />
      
      {/* Sneaky Smudge eraser following the typing */}
      <SmudgeEraser position={eraserPosition} isActive={isTyping} />
    </div>
  );
}
