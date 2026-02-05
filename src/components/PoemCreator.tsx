 import { useState } from 'react';
 import { Plus, X, Feather } from 'lucide-react';
 import { SmudgeInput } from './SmudgeInput';
 import { saveCornerstoneData, loadCornerstoneData } from '@/lib/storage';
 import { toast } from 'sonner';
 
 interface PoemCreatorProps {
   onPoemCreated?: () => void;
 }
 
 export function PoemCreator({ onPoemCreated }: PoemCreatorProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [title, setTitle] = useState('');
   const [content, setContent] = useState('');
 
   const handleSubmit = () => {
     if (!title.trim()) {
       toast.error('Poem title is required');
       return;
     }
     
     if (!content.trim()) {
       toast.error('Poem content is required');
       return;
     }
 
     const existing = loadCornerstoneData();
     const newPoem = {
       id: `poem-${Date.now()}`,
       title: title.trim(),
       content: content.trim(),
       date: new Date(),
     };
 
     const poems = [...(existing?.poems || []), newPoem];
     saveCornerstoneData({ poems });
     
     toast.success('Poem saved to your collection!');
     setTitle('');
     setContent('');
     setIsOpen(false);
     onPoemCreated?.();
   };
 
   if (!isOpen) {
     return (
       <button
         onClick={() => setIsOpen(true)}
         className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
       >
         <Feather className="w-4 h-4" />
         Write Poem
       </button>
     );
   }
 
   return (
     <div className="stat-card space-y-4 animate-scale-in">
       <div className="flex items-center justify-between">
         <h3 className="font-serif text-lg text-foreground">Write a New Poem</h3>
         <button 
           onClick={() => setIsOpen(false)}
           className="p-1 hover:bg-secondary rounded transition-colors"
         >
           <X className="w-4 h-4 text-muted-foreground" />
         </button>
       </div>
 
       <div className="space-y-4">
         <div>
           <label className="text-sm text-muted-foreground mb-1 block">Title</label>
           <SmudgeInput
             value={title}
             onChange={setTitle}
             onSubmit={() => {}}
             placeholder="Give your poem a name..."
           />
         </div>
 
         <div>
           <label className="text-sm text-muted-foreground mb-1 block">Content</label>
           <SmudgeInput
             value={content}
             onChange={setContent}
             onSubmit={handleSubmit}
             placeholder="Let your words flow..."
             multiline
             className="min-h-[200px] font-serif"
           />
           <p className="text-xs text-muted-foreground mt-1">Press Enter to save (Shift+Enter for new line)</p>
         </div>
 
         <button
           onClick={handleSubmit}
           className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
         >
           Save Poem
         </button>
       </div>
     </div>
   );
 }