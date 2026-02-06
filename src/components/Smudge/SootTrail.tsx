import { useState, useEffect } from 'react';
import { SmudgePosition } from './smudgeTypes';

interface SootTrailMark {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

interface SootTrailProps {
  startPos: SmudgePosition;
  endPos: SmudgePosition;
  isActive: boolean;
}

export function SootTrail({ startPos, endPos, isActive }: SootTrailProps) {
  const [marks, setMarks] = useState<SootTrailMark[]>([]);

  useEffect(() => {
    if (!isActive) {
      // Fade out existing marks
      const fadeOut = setTimeout(() => setMarks([]), 2000);
      return () => clearTimeout(fadeOut);
    }

    // Generate trail marks along the path
    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 50) return; // Don't create trail for small movements

    const numMarks = Math.min(Math.floor(distance / 40), 15); // One mark every ~40px, max 15
    const newMarks: SootTrailMark[] = [];

    for (let i = 0; i < numMarks; i++) {
      const t = (i + 1) / (numMarks + 1); // Interpolation factor
      newMarks.push({
        id: Date.now() + i,
        x: startPos.x + dx * t + (Math.random() * 20 - 10),
        y: startPos.y + dy * t + (Math.random() * 20 - 10),
        size: 8 + Math.random() * 12,
        opacity: 0.3 + Math.random() * 0.3,
      });
    }

    setMarks(newMarks);
  }, [startPos, endPos, isActive]);

  if (marks.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {marks.map((mark, index) => (
        <div
          key={mark.id}
          className="absolute animate-soot-trail"
          style={{
            left: mark.x,
            top: mark.y,
            animationDelay: `${index * 0.08}s`,
          }}
        >
          {/* Soot splatter mark */}
          <svg 
            width={mark.size * 2} 
            height={mark.size * 2} 
            viewBox="0 0 24 24"
            style={{ opacity: mark.opacity }}
          >
            {/* Main splatter */}
            <ellipse 
              cx="12" cy="12" 
              rx={10 + Math.random() * 2} 
              ry={8 + Math.random() * 2} 
              fill="hsl(var(--foreground))"
              opacity="0.4"
              transform={`rotate(${Math.random() * 360}, 12, 12)`}
              style={{ filter: 'blur(1px)' }}
            />
            {/* Secondary splatter */}
            <ellipse 
              cx={14 + Math.random() * 4} 
              cy={10 + Math.random() * 4} 
              rx={4 + Math.random() * 2} 
              ry={3 + Math.random() * 2} 
              fill="hsl(var(--foreground))"
              opacity="0.3"
              style={{ filter: 'blur(0.5px)' }}
            />
            {/* Tiny droplets */}
            <circle cx={6 + Math.random() * 4} cy={8 + Math.random() * 4} r="1.5" fill="hsl(var(--foreground))" opacity="0.35" />
            <circle cx={16 + Math.random() * 4} cy={16 + Math.random() * 4} r="1" fill="hsl(var(--foreground))" opacity="0.3" />
            <circle cx={4 + Math.random() * 4} cy={14 + Math.random() * 4} r="1.2" fill="hsl(var(--foreground))" opacity="0.25" />
          </svg>
        </div>
      ))}
    </div>
  );
}
