import { useEffect } from 'react';
import { motion } from 'framer-motion';

function DotMatrix({ size = 36, speed = 1 }: { size?: number; speed?: number }) {
  const n = 3;
  const gap = size * 0.14;
  const cells = Array.from({ length: n * n }, (_, idx) => idx);
  return (
    <span className="grid" style={{ gap, gridTemplateColumns: `repeat(${n}, ${size}px)` }}>
      {cells.map((idx) => {
        const x = idx % n;
        const y = Math.floor(idx / n);
        const delay = ((x + y) / (2 * (n - 1))) * speed;
        return (
          <motion.span
            key={idx}
            className="text-primary"
            style={{
              width: size, height: size,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: size * 0.72,
            }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1, 0.7] }}
            transition={{ duration: speed, ease: 'easeInOut', repeat: Infinity, delay }}
          >
            ♡
          </motion.span>
        );
      })}
    </span>
  );
}

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <DotMatrix size={36} speed={1} />
    </motion.div>
  );
}

export default LoadingScreen;
