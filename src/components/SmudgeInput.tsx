 import { useState, useRef, useEffect } from 'react';
 import { SmudgePosition } from './Smudge/smudgeTypes';
 
 interface SmudgeInputProps {
   value: string;
   onChange: (value: string) => void;
   onSubmit: () => void;
   placeholder?: string;
   multiline?: boolean;
   className?: string;
 }
 
 // Smudge eraser that follows the typing cursor
 function SmudgeEraser({ position, isActive }: { position: SmudgePosition; isActive: boolean }) {
   if (!isActive) return null;
   
   return (
     <div 
       className="pointer-events-none fixed z-50 transition-all duration-75"
       style={{
         left: position.x - 15,
         top: position.y - 20,
       }}
     >
       <svg width="30" height="30" viewBox="0 0 30 30">
         {/* Mini Smudge erasing */}
         <g className="animate-smudge-wiggle">
           {/* Soot body */}
           <ellipse cx="15" cy="18" rx="10" ry="8" fill="hsl(var(--foreground))" opacity="0.85" />
           {/* Spikes */}
           <line x1="15" y1="10" x2="14" y2="5" stroke="hsl(var(--foreground))" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
           <line x1="18" y1="11" x2="21" y2="6" stroke="hsl(var(--foreground))" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
           <line x1="12" y1="11" x2="9" y2="6" stroke="hsl(var(--foreground))" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
           {/* Eyes - focused/determined */}
           <ellipse cx="12" cy="17" rx="2" ry="2.5" fill="hsl(var(--background))" />
           <ellipse cx="18" cy="17" rx="2" ry="2.5" fill="hsl(var(--background))" />
           <circle cx="12" cy="17" r="1" fill="hsl(var(--foreground))" />
           <circle cx="18" cy="17" r="1" fill="hsl(var(--foreground))" />
           {/* Erasing arm */}
           <path 
             d="M22 20 Q28 22, 26 26" 
             stroke="hsl(var(--foreground))" 
             strokeWidth="1.5" 
             strokeLinecap="round" 
             fill="none"
             opacity="0.8"
           />
           {/* Dust particles from erasing */}
           <circle cx="28" cy="26" r="1.5" fill="hsl(var(--muted-foreground))" opacity="0.4" className="animate-pulse" />
           <circle cx="26" cy="28" r="1" fill="hsl(var(--muted-foreground))" opacity="0.3" className="animate-pulse" />
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
   const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
   const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
 
   // Update eraser position based on cursor/caret
   const updateEraserPosition = () => {
     if (!inputRef.current) return;
     
     const rect = inputRef.current.getBoundingClientRect();
     const textLength = value.length;
     
     // Approximate cursor position (rough estimation)
     const charWidth = 8; // Average char width in pixels
     const cursorX = rect.left + Math.min(textLength * charWidth + 12, rect.width - 20);
     const cursorY = rect.top + rect.height / 2;
     
     setEraserPosition({ x: cursorX, y: cursorY });
   };
 
   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
     onChange(e.target.value);
     setIsTyping(true);
     updateEraserPosition();
     
     // Clear existing timeout
     if (typingTimeoutRef.current) {
       clearTimeout(typingTimeoutRef.current);
     }
     
     // Stop typing animation after delay
     typingTimeoutRef.current = setTimeout(() => {
       setIsTyping(false);
     }, 150);
   };
 
   const handleKeyDown = (e: React.KeyboardEvent) => {
     if (e.key === 'Enter' && !e.shiftKey) {
       e.preventDefault();
       setIsTyping(false);
       
       // Dispatch custom event for Smudge to flee
       window.dispatchEvent(new CustomEvent('smudge-flee-trigger'));
       
       onSubmit();
     }
   };
 
   useEffect(() => {
     updateEraserPosition();
   }, [value]);
 
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
       
       {/* Smudge eraser following the typing */}
       <SmudgeEraser position={eraserPosition} isActive={isTyping} />
     </div>
   );
 }