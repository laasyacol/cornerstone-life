 import { useEffect, useState } from 'react';
 
 interface Particle {
   id: number;
   x: number;
   y: number;
   size: number;
   opacity: number;
   delay: number;
 }
 
 export function SootParticles() {
   const [particles, setParticles] = useState<Particle[]>([]);
 
   useEffect(() => {
     // Generate random particles
     const newParticles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
       id: i,
       x: Math.random() * 40 - 20,
       y: Math.random() * 20,
       size: Math.random() * 6 + 2,
       opacity: Math.random() * 0.5 + 0.3,
       delay: Math.random() * 0.3,
     }));
     setParticles(newParticles);
   }, []);
 
   return (
     <div className="absolute inset-0 pointer-events-none overflow-visible">
       {particles.map((particle) => (
         <div
           key={particle.id}
           className="absolute rounded-full bg-foreground animate-soot-particle"
           style={{
             left: `${30 + particle.x}px`,
             top: `${30 + particle.y}px`,
             width: `${particle.size}px`,
             height: `${particle.size}px`,
             opacity: particle.opacity,
             animationDelay: `${particle.delay}s`,
           }}
         />
       ))}
     </div>
   );
 }