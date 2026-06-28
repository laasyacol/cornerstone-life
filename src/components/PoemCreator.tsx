import { useEffect, useRef, useState } from 'react';
import { X, Feather, Eye, EyeOff, Check } from 'lucide-react';
import { SmudgeInput } from './SmudgeInput';
import { saveCornerstoneData, loadCornerstoneData } from '@/lib/storage';
import { formatPoemContent } from '@/lib/formatPoem';
import { toast } from 'sonner';

const DRAFT_KEY = 'corner-poem-draft';

interface Draft {
  title: string;
  content: string;
  savedAt: string;
}
 
 interface PoemCreatorProps {
   onPoemCreated?: () => void;
 }
 
 export function PoemCreator({ onPoemCreated }: PoemCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);

  // Restore draft on open
  useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as Draft;
        if (d.title || d.content) {
          setTitle(d.title || '');
          setContent(d.content || '');
          setDraftSavedAt(d.savedAt);
          setDraftStatus('saved');
        }
      }
    } catch {}
  }, [isOpen]);

  // Autosave debounce
  useEffect(() => {
    if (!isOpen) return;
    if (!title && !content) return;
    setDraftStatus('saving');
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const now = new Date().toISOString();
      const d: Draft = { title, content, savedAt: now };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
        setDraftSavedAt(now);
        setDraftStatus('saved');
      } catch {}
    }, 600);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [title, content, isOpen]);

  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setDraftSavedAt(null);
    setDraftStatus('idle');
  };
 
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
    clearDraft();
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
        {draftSavedAt && (
          <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-accent/30 text-accent-foreground">
            draft
          </span>
        )}
      </button>
     );
   }
 
   return (
     <div className="stat-card space-y-4 animate-scale-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-serif text-lg text-foreground">Write a New Poem</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            {draftStatus === 'saving' && <>Saving draft…</>}
            {draftStatus === 'saved' && draftSavedAt && (
              <>
                <Check className="w-3 h-3 text-quest-skill" />
                Draft saved {new Date(draftSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </>
            )}
          </span>
          <button
            onClick={() => setShowPreview(p => !p)}
            className="p-1.5 hover:bg-secondary rounded transition-colors text-muted-foreground"
            title={showPreview ? 'Hide preview' : 'Show preview'}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
 
      <div className={`grid gap-4 ${showPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
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
              className="min-h-[240px] font-serif"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Press Enter to save (Shift+Enter for new line) · Wrap text in *asterisks* for italics
            </p>
          </div>
        </div>

        {showPreview && (
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground block">Live preview</label>
            <div className="border border-dashed border-border rounded-lg p-5 bg-card/60 min-h-[280px]">
              {title || content ? (
                <>
                  <h4 className="font-serif text-2xl text-foreground mb-2">
                    {title || <span className="opacity-40">Untitled</span>}
                  </h4>
                  <div className="font-serif text-foreground leading-relaxed whitespace-pre-wrap">
                    {content ? formatPoemContent(content) : (
                      <span className="text-muted-foreground italic">Your verses will appear here…</span>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic text-center pt-12">
                  Start typing — your draft autosaves and previews live.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Save Poem
        </button>
        {draftSavedAt && (
          <button
            onClick={() => { setTitle(''); setContent(''); clearDraft(); }}
            className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-sm"
            title="Discard draft"
          >
            Discard draft
          </button>
        )}
      </div>
     </div>
   );
 }