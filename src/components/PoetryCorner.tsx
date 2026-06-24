import { Poem } from '@/lib/gameData';
import { Feather, Calendar, Pencil, Check, X, Trash2, Search, ArrowUpDown, BookOpen, ArrowUp } from 'lucide-react';
import { formatPoemContent } from '@/lib/formatPoem';
import { PoemCreator } from './PoemCreator';
import { useState, useMemo, useEffect } from 'react';
import { loadCornerstoneData, saveCornerstoneData } from '@/lib/storage';

interface PoetryCornerProps {
  poems: Poem[];
  onRefresh?: () => void;
}

interface PoemCardProps {
  poem: Poem;
  index: number;
  onUpdate?: () => void;
}

function PoemCard({ poem, index, onUpdate }: PoemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(poem.title);
  const [editContent, setEditContent] = useState(poem.content);
  const wordCount = poem.content.trim().split(/\s+/).filter(Boolean).length;
  const lineCount = poem.content.split('\n').filter(l => l.trim()).length;
  const readMinutes = Math.max(1, Math.round(wordCount / 180));

  const saveEdit = () => {
    const data = loadCornerstoneData();
    if (!data?.poems) return;

    const updatedPoems = data.poems.map(p => {
      if (p.id === poem.id) {
        return { ...p, title: editTitle, content: editContent };
      }
      return p;
    });

    saveCornerstoneData({ poems: updatedPoems });
    setIsEditing(false);
    onUpdate?.();
  };

  const cancelEdit = () => {
    setEditTitle(poem.title);
    setEditContent(poem.content);
    setIsEditing(false);
  };

  const deletePoem = () => {
    if (!confirm('Delete this poem?')) return;
    
    const data = loadCornerstoneData();
    if (!data?.poems) return;

    const updatedPoems = data.poems.filter(p => p.id !== poem.id);
    saveCornerstoneData({ poems: updatedPoems });
    onUpdate?.();
  };

  return (
    <article
      id={`poem-${poem.id}`}
      className="poetry-card group"
    >
      <header className="mb-4 pb-3 border-b border-border flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-serif text-xs uppercase tracking-[0.25em] text-accent/80 mb-1">
            № {String(index + 1).padStart(2, '0')}
          </p>
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-background border border-border rounded px-2 py-1 font-serif text-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          ) : (
            <h3 className="font-serif text-xl text-foreground">{poem.title}</h3>
          )}
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <time dateTime={poem.date.toISOString()}>
              {poem.date.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </time>
            <span className="mx-1 opacity-60">·</span>
            <span className="text-xs">{lineCount} lines · {wordCount} words</span>
            <span className="mx-1 opacity-60">·</span>
            <span className="text-xs flex items-center gap-1"><BookOpen className="w-3 h-3" /> {readMinutes} min</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <>
              <button
                onClick={saveEdit}
                className="p-1.5 rounded-md hover:bg-quest-skill/20 text-quest-skill transition-colors"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={cancelEdit}
                className="p-1.5 rounded-md hover:bg-destructive/20 text-destructive transition-colors"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-md hover:bg-primary/20 text-primary transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={deletePoem}
                className="p-1.5 rounded-md hover:bg-destructive/20 text-destructive transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </header>
      
      {isEditing ? (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full bg-background border border-border rounded px-3 py-2 font-serif text-foreground leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary min-h-[200px]"
          rows={10}
        />
      ) : (
        <div className="font-serif text-foreground leading-relaxed whitespace-pre-wrap poem-body">
          {formatPoemContent(poem.content)}
        </div>
      )}

      <div className="mt-6 flex justify-center" aria-hidden="true">
        <span className="text-accent/50 tracking-[0.5em] text-sm select-none">❦ ❦ ❦</span>
      </div>
    </article>
  );
}

export function PoetryCorner({ poems, onRefresh }: PoetryCornerProps) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const totalWords = poems.reduce(
    (sum, p) => sum + p.content.trim().split(/\s+/).filter(Boolean).length,
    0
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? poems.filter(
          p =>
            p.title.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q)
        )
      : [...poems];

    if (sortBy === 'newest') {
      base.sort((a, b) => b.date.getTime() - a.date.getTime());
    } else if (sortBy === 'oldest') {
      base.sort((a, b) => a.date.getTime() - b.date.getTime());
    } else {
      base.sort((a, b) => a.title.localeCompare(b.title));
    }
    return base;
  }, [poems, query, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg burgundy-gradient flex items-center justify-center">
            <Feather className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-foreground">Poetry Corner</h2>
            <p className="text-sm text-muted-foreground">
              {poems.length} {poems.length === 1 ? 'poem' : 'poems'} · {totalWords.toLocaleString()} words archived
            </p>
          </div>
        </div>
        <PoemCreator onPoemCreated={onRefresh} />
      </div>

      {/* Search & Sort toolbar */}
      {poems.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title or line…"
              className="w-full pl-9 pr-9 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-secondary text-muted-foreground"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            {(['newest', 'oldest', 'title'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setSortBy(opt)}
                className={`px-2.5 py-1 rounded-md text-xs capitalize transition-colors ${
                  sortBy === opt
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
                }`}
              >
                {opt === 'title' ? 'A–Z' : opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Auto-generated Index */}
      {filtered.length > 0 && (
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif text-lg text-foreground">Index</h3>
            <span className="text-xs text-muted-foreground">
              {filtered.length} of {poems.length}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-1">
            {filtered.map((poem, index) => (
              <a
                key={poem.id}
                href={`#poem-${poem.id}`}
                className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg hover:bg-secondary transition-colors group"
              >
                <span className="text-sm text-foreground group-hover:text-primary transition-colors truncate flex items-baseline gap-2">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="truncate">{poem.title}</span>
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {poem.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Poems - Single Column with Edit */}
      <div className="space-y-6">
        {filtered.length > 0 ? (
          filtered.map((poem, index) => (
            <PoemCard key={poem.id} poem={poem} index={index} onUpdate={onRefresh} />
          ))
        ) : (
          <div className="stat-card text-center py-16 border-dashed">
            <Feather className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-serif text-lg text-foreground mb-1">
              {query ? 'No poems match that search' : 'The archive is empty'}
            </p>
            <p className="text-sm text-muted-foreground">
              {query ? 'Try a different word, or clear the search.' : 'Begin with a single line.'}
            </p>
          </div>
        )}
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-30 w-11 h-11 rounded-full burgundy-gradient text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 transition-transform animate-fade-in"
          aria-label="Back to top"
          title="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
