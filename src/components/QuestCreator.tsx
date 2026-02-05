 import { useState } from 'react';
 import { Plus, X } from 'lucide-react';
 import { SmudgeInput } from './SmudgeInput';
 import { QuestCategory, CATEGORY_INFO } from '@/lib/gameData';
 import { saveCornerstoneData, loadCornerstoneData } from '@/lib/storage';
 import { toast } from 'sonner';
 
 interface QuestCreatorProps {
   onQuestCreated?: () => void;
 }
 
 export function QuestCreator({ onQuestCreated }: QuestCreatorProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [name, setName] = useState('');
   const [category, setCategory] = useState<QuestCategory>('study');
   const [points, setPoints] = useState('1000');
   const [deadline, setDeadline] = useState('');
 
   const handleSubmit = () => {
     if (!name.trim()) {
       toast.error('Quest name is required');
       return;
     }
     
     if (!deadline) {
       toast.error('Deadline is required');
       return;
     }
 
     const existing = loadCornerstoneData();
     const newQuest = {
       id: `quest-${Date.now()}`,
       name: name.trim(),
       category,
       points: parseInt(points) || 1000,
       deadline: new Date(deadline),
       status: 'active' as const,
     };
 
     const quests = [...(existing?.quests || []), newQuest];
     saveCornerstoneData({ quests });
     
     toast.success('Quest created!');
     setName('');
     setCategory('study');
     setPoints('1000');
     setDeadline('');
     setIsOpen(false);
     onQuestCreated?.();
   };
 
   if (!isOpen) {
     return (
       <button
         onClick={() => setIsOpen(true)}
         className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
       >
         <Plus className="w-4 h-4" />
         New Quest
       </button>
     );
   }
 
   return (
     <div className="stat-card space-y-4 animate-scale-in">
       <div className="flex items-center justify-between">
         <h3 className="font-serif text-lg text-foreground">Create New Quest</h3>
         <button 
           onClick={() => setIsOpen(false)}
           className="p-1 hover:bg-secondary rounded transition-colors"
         >
           <X className="w-4 h-4 text-muted-foreground" />
         </button>
       </div>
 
       <div className="space-y-4">
         <div>
           <label className="text-sm text-muted-foreground mb-1 block">Quest Name</label>
           <SmudgeInput
             value={name}
             onChange={setName}
             onSubmit={handleSubmit}
             placeholder="What's your quest?"
           />
           <p className="text-xs text-muted-foreground mt-1">Press Enter to create</p>
         </div>
 
         <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="text-sm text-muted-foreground mb-1 block">Category</label>
             <select
               value={category}
               onChange={(e) => setCategory(e.target.value as QuestCategory)}
               className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
             >
               {(Object.entries(CATEGORY_INFO) as [QuestCategory, typeof CATEGORY_INFO[QuestCategory]][]).map(([key, { label, icon }]) => (
                 <option key={key} value={key}>{icon} {label}</option>
               ))}
             </select>
           </div>
 
           <div>
             <label className="text-sm text-muted-foreground mb-1 block">Points</label>
             <input
               type="number"
               value={points}
               onChange={(e) => setPoints(e.target.value)}
               className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
               min="100"
               step="100"
             />
           </div>
         </div>
 
         <div>
           <label className="text-sm text-muted-foreground mb-1 block">Deadline</label>
           <input
             type="date"
             value={deadline}
             onChange={(e) => setDeadline(e.target.value)}
             className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
           />
         </div>
 
         <button
           onClick={handleSubmit}
           className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
         >
           Create Quest
         </button>
       </div>
     </div>
   );
 }