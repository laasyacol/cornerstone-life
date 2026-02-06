import { useEffect, useState } from 'react';

interface DustPuff {
  id: number;
  x: number;
  delay: number;
  size: number;
}

export function DustPuffs() {
  const [puffs, setPuffs] = useState<DustPuff[]>([]);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    // Generate new puffs every "step" of the tiptoe animation
    const stepInterval = setInterval(() => {
      setCycle(c => c + 1);
      
      // Create 2-3 small puffs per step, alternating left/right foot
      const newPuffs: DustPuff[] = Array.from({ length: 2 + Math.floor(Math.random() * 2) }, (_, i) => ({
        id: Date.now() + i,
        x: (cycle % 2 === 0 ? -8 : 8) + (Math.random() * 10 - 5),
        delay: Math.random() * 0.1,
        size: 4 + Math.random() * 4,
      }));
      
      setPuffs(prev => [...prev.slice(-10), ...newPuffs]); // Keep last 10 puffs max
    }, 200); // Every 200ms = each "step"

    return () => clearInterval(stepInterval);
  }, [cycle]);

  // Clean up old puffs
  useEffect(() => {
    const cleanup = setTimeout(() => {
      setPuffs(prev => prev.slice(-6));
    }, 600);
    return () => clearTimeout(cleanup);
  }, [puffs.length]);

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none">
      {puffs.map((puff) => (
        <div
          key={puff.id}
          className="absolute animate-dust-puff"
          style={{
            left: `${puff.x}px`,
            bottom: '-2px',
            width: `${puff.size}px`,
            height: `${puff.size}px`,
            animationDelay: `${puff.delay}s`,
          }}
        >
          {/* Puff cloud made of multiple circles */}
          <div className="relative w-full h-full">
            <div 
              className="absolute rounded-full bg-muted-foreground/40"
              style={{
                width: '100%',
                height: '100%',
                filter: 'blur(1px)',
              }}
            />
            <div 
              className="absolute rounded-full bg-muted-foreground/30"
              style={{
                width: '70%',
                height: '70%',
                top: '-30%',
                left: '15%',
                filter: 'blur(1px)',
              }}
            />
            <div 
              className="absolute rounded-full bg-muted-foreground/20"
              style={{
                width: '50%',
                height: '50%',
                top: '-20%',
                left: '40%',
                filter: 'blur(0.5px)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
