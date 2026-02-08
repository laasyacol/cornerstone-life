 // Sound effects for Smudge using Web Audio API
 
 let audioContext: AudioContext | null = null;
 
 const getAudioContext = () => {
   if (!audioContext) {
     audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
   }
   return audioContext;
 };
 
 // Generate a cute giggle sound
 export function playGiggleSound() {
   try {
     const ctx = getAudioContext();
     const now = ctx.currentTime;
     
     // Create oscillator for a cute chirpy giggle
     const createChirp = (startTime: number, pitch: number) => {
       const osc = ctx.createOscillator();
       const gain = ctx.createGain();
       
       osc.connect(gain);
       gain.connect(ctx.destination);
       
       osc.type = 'sine';
       osc.frequency.setValueAtTime(pitch, startTime);
       osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, startTime + 0.05);
       osc.frequency.exponentialRampToValueAtTime(pitch * 0.8, startTime + 0.1);
       
       gain.gain.setValueAtTime(0, startTime);
       gain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
       gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
       
       osc.start(startTime);
       osc.stop(startTime + 0.15);
     };
     
     // Multiple chirps for giggle effect
     createChirp(now, 800);
     createChirp(now + 0.12, 900);
     createChirp(now + 0.24, 850);
     createChirp(now + 0.36, 950);
     createChirp(now + 0.48, 800);
     createChirp(now + 0.60, 880);
   } catch (e) {
     // Audio not supported, fail silently
     console.log('Audio not available');
   }
 }
 
// Generate a flee/whoosh sound
export function playFleeSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    console.log('Audio not available');
  }
}

// Generate a tiny frightened squeak sound
export function playSqueakSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // High-pitched frightened squeak
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.12);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.start(now);
    osc.stop(now + 0.18);
  } catch (e) {
    console.log('Audio not available');
  }
}