 import { useState } from 'react';
 import { Plus, X, Cloud } from 'lucide-react';
 import { MoodState, MOOD_INFO } from '@/lib/gameData';
 import { saveCornerstoneData, loadCornerstoneData } from '@/lib/storage';
 import { toast } from 'sonner';
 
 interface MoodEntryProps {
   onMoodLogged?: () => void;
 }
 
 const moodColors: Record<MoodState, string> = {
   'calm': 'bg-mood-calm hover:bg-mood-calm/80',
   'neutral': 'bg-mood-neutral hover:bg-mood-neutral/80',
   'heavy-light': 'bg-mood-heavy-light hover:bg-mood-heavy-light/80',
   'heavy-medium': 'bg-mood-heavy-medium hover:bg-mood-heavy-medium/80',
   'heavy-intense': 'bg-mood-heavy-intense hover:bg-mood-heavy-intense/80',
 };
 
 export function MoodEntry({ onMoodLogged }: MoodEntryProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [selectedMood, setSelectedMood] = useState<MoodState | null>(null);
   const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
 
   const handleSubmit = () => {
     if (!selectedMood) {
       toast.error('Please select a mood');
       return;
     }
 
     const existing = loadCornerstoneData();
     const newMood = {
       date,
       mood: selectedMood,
     };
 
     // Replace or add mood for the date
     const moods = existing?.moods || [];
     const existingIndex = moods.findIndex(m => m.date === date);
     if (existingIndex >= 0) {
       moods[existingIndex] = newMood;
     } else {
       moods.push(newMood);
     }
     
     saveCornerstoneData({ moods });
     
     // Trigger Smudge flee
     window.dispatchEvent(new CustomEvent('smudge-flee-trigger'));
     
     toast.success('Mood logged!');
     setSelectedMood(null);
     setIsOpen(false);
     onMoodLogged?.();
   };
 
   if (!isOpen) {
     return (
       <button
         onClick={() => setIsOpen(true)}
         className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
       >
         <Cloud className="w-4 h-4" />
         Log Mood
       </button>
     );
   }
 
   return (
     <div className="stat-card space-y-4 animate-scale-in">
       <div className="flex items-center justify-between">
         <h3 className="font-serif text-lg text-foreground">Log Your Weather</h3>
         <button 
           onClick={() => setIsOpen(false)}
           className="p-1 hover:bg-secondary rounded transition-colors"
         >
           <X className="w-4 h-4 text-muted-foreground" />
         </button>
       </div>
 
       <div className="space-y-4">
         <div>
           <label className="text-sm text-muted-foreground mb-1 block">Date</label>
           <input
             type="date"
             value={date}
             onChange={(e) => setDate(e.target.value)}
             className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
           />
         </div>
 
         <div>
           <label className="text-sm text-muted-foreground mb-2 block">How are you feeling?</label>
           <div className="grid grid-cols-5 gap-2">
             {(Object.entries(MOOD_INFO) as [MoodState, typeof MOOD_INFO[MoodState]][]).map(([mood, info]) => (
               <button
                 key={mood}
                 onClick={() => setSelectedMood(mood)}
                 className={`
                   aspect-square rounded-lg transition-all flex flex-col items-center justify-center p-2
                   ${moodColors[mood]}
                   ${selectedMood === mood ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'}
                 `}
               >
                 <span className="text-[10px] text-center font-medium text-foreground/80">{info.label}</span>
               </button>
             ))}
           </div>
         </div>
 
         <button
           onClick={handleSubmit}
           disabled={!selectedMood}
           className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
         >
           Log Mood
         </button>
       </div>
     </div>
   );
 }