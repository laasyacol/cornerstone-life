import { Poem } from '@/lib/gameData';
import { Feather, Calendar, Pencil, Check, X, Trash2, Search, ArrowUpDown, BookOpen, ArrowUp, Eye, Maximize2, Minus, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { formatPoemContent } from '@/lib/formatPoem';
import { PoemCreator } from './PoemCreator';
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { loadCornerstoneData, saveCornerstoneData } from '@/lib/storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ─────────────────────────────────────────────────────────────────────────────
// Search-highlight helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wrap matches in <mark className="search-match" />. Each match gets a stable
 * data-match-id used by the parent for prev/next navigation & active styling.
 */
function highlight(text: string, query: string, idPrefix: string): React.ReactNode {
  if (!query) return text;
  const q = query.toLowerCase();
  const lower = text.toLowerCase();
  const out: React.ReactNode[] = [];
  let i = 0;
  let n = 0;
  while (i < text.length) {
    const hit = lower.indexOf(q, i);
    if (hit === -1) {
      out.push(text.slice(i));
      break;
    }
    if (hit > i) out.push(text.slice(i, hit));
    out.push(
      <mark
        key={`${idPrefix}-${n}`}
        data-match-id={`${idPrefix}-${n}`}
        className="search-match bg-accent/40 text-foreground rounded-sm px-0.5"
      >
        {text.slice(hit, hit + q.length)}
      </mark>
    );
    i = hit + q.length;
    n++;
  }
  return <>{out}</>;
}

function countMatches(text: string, query: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const lower = text.toLowerCase();
  let c = 0, i = 0;
  while ((i = lower.indexOf(q, i)) !== -1) { c++; i += q.length; }
  return c;
}

/** Render poem content preserving line breaks and italics, with optional highlight. */
function renderPoemBody(content: string, query: string, idPrefix: string): React.ReactNode {
  if (!query) return formatPoemContent(content);
  // Highlight overrides italic formatting while searching for clarity.
  return content.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {highlight(line, query, `${idPrefix}-l${i}`)}
      {'\n'}
    </React.Fragment>
  ));
}

interface PoetryCornerProps {
  poems: Poem[];
  onRefresh?: () => void;
}

interface PoemCardProps {
  poem: Poem;
  index: number;
  onUpdate?: () => void;
  query?: string;
  onOpenViewer?: (poem: Poem) => void;
}

function PoemCard({ poem, index, onUpdate, query = '', onOpenViewer }: PoemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(poem.title);
  const [editContent, setEditContent] = useState(poem.content);
  const [editStatus, setEditStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showEditPreview, setShowEditPreview] = useState(true);
  const editDebounce = useRef<number | null>(null);

  const wordCount = poem.content.trim().split(/\s+/).filter(Boolean).length;
  const lineCount = poem.content.split('\n').filter(l => l.trim()).length;
  const readMinutes = Math.max(1, Math.round(wordCount / 180));

  const persistEdit = useCallback((title: string, content: string) => {
    const data = loadCornerstoneData();
    if (!data?.poems) return;
    const updatedPoems = data.poems.map(p =>
      p.id === poem.id ? { ...p, title, content } : p
    );
    saveCornerstoneData({ poems: updatedPoems });
  }, [poem.id]);

  // Autosave edits debounced
  useEffect(() => {
    if (!isEditing) return;
    if (editTitle === poem.title && editContent === poem.content) return;
    setEditStatus('saving');
    if (editDebounce.current) window.clearTimeout(editDebounce.current);
    editDebounce.current = window.setTimeout(() => {
      persistEdit(editTitle, editContent);
      setEditStatus('saved');
      onUpdate?.();
    }, 700);
    return () => {
      if (editDebounce.current) window.clearTimeout(editDebounce.current);
    };
  }, [editTitle, editContent, isEditing, persistEdit, onUpdate, poem.title, poem.content]);

  const finishEdit = () => {
    if (editDebounce.current) window.clearTimeout(editDebounce.current);
    persistEdit(editTitle, editContent);
    setIsEditing(false);
    setEditStatus('idle');
    onUpdate?.();
  };

  const cancelEdit = () => {
    setEditTitle(poem.title);
    setEditContent(poem.content);
    setIsEditing(false);
    setEditStatus('idle');
  };

  const deletePoem = () => {
    if (!confirm('Delete this poem?')) return;
    
    const data = loadCornerstoneData();
    if (!data?.poems) return;

    const updatedPoems = data.poems.filter(p => p.id !== poem.id);
    saveCornerstoneData({ poems: updatedPoems });
    onUpdate?.();
  };

  const idPrefix = `poem-${poem.id}`;

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
            <h3 className="font-serif text-xl text-foreground">
              {highlight(poem.title, query, `${idPrefix}-title`)}
            </h3>
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
        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <>
              <span className="text-[10px] text-muted-foreground mr-1">
                {editStatus === 'saving' && 'Saving…'}
                {editStatus === 'saved' && (
                  <span className="text-quest-skill">Saved ✓</span>
                )}
              </span>
              <button
                onClick={() => setShowEditPreview(p => !p)}
                className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground transition-colors"
                title={showEditPreview ? 'Hide preview' : 'Show preview'}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={finishEdit}
                className="p-1.5 rounded-md hover:bg-quest-skill/20 text-quest-skill transition-colors"
                title="Done"
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
              {onOpenViewer && (
                <button
                  onClick={() => onOpenViewer(poem)}
                  className="p-1.5 rounded-md hover:bg-accent/20 text-accent transition-colors"
                  title="Read in viewer mode"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}
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
        <div className={`grid gap-3 ${showEditPreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-background border border-border rounded px-3 py-2 font-serif text-foreground leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary min-h-[220px]"
            rows={10}
          />
          {showEditPreview && (
            <div className="border border-dashed border-border rounded-lg p-4 bg-card/60 min-h-[220px]">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Live preview</p>
              <div className="font-serif text-foreground leading-relaxed whitespace-pre-wrap poem-body">
                {editContent
                  ? formatPoemContent(editContent)
                  : <span className="text-muted-foreground italic">Empty…</span>}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="font-serif text-foreground leading-relaxed whitespace-pre-wrap poem-body">
          {renderPoemBody(poem.content, query, `${idPrefix}-body`)}
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
  const [viewerPoem, setViewerPoem] = useState<Poem | null>(null);
  const [viewerFontSize, setViewerFontSize] = useState(20); // px
  const [matchIndex, setMatchIndex] = useState(0);
  const [matchCount, setMatchCount] = useState(0);

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

  // Recount matches after render whenever query/filter changes
  useEffect(() => {
    if (!query.trim()) {
      setMatchCount(0);
      setMatchIndex(0);
      return;
    }
    // Defer to allow DOM update
    const id = window.setTimeout(() => {
      const nodes = document.querySelectorAll<HTMLElement>('mark.search-match');
      setMatchCount(nodes.length);
      setMatchIndex(nodes.length ? 0 : 0);
    }, 0);
    return () => window.clearTimeout(id);
  }, [query, filtered]);

  // Highlight active match & scroll to it
  useEffect(() => {
    if (!query.trim() || matchCount === 0) return;
    const nodes = document.querySelectorAll<HTMLElement>('mark.search-match');
    nodes.forEach((n, i) => {
      if (i === matchIndex) {
        n.classList.add('search-match-active');
        n.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        n.classList.remove('search-match-active');
      }
    });
  }, [matchIndex, matchCount, query]);

  const gotoMatch = (delta: number) => {
    if (matchCount === 0) return;
    setMatchIndex(i => (i + delta + matchCount) % matchCount);
  };

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
              onChange={e => { setQuery(e.target.value); setMatchIndex(0); }}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); gotoMatch(e.shiftKey ? -1 : 1); }
              }}
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

          {/* Prev / next match navigation */}
          {query.trim() && (
            <div className="flex items-center gap-1 bg-card border border-border rounded-lg px-1 py-1">
              <button
                onClick={() => gotoMatch(-1)}
                disabled={matchCount === 0}
                className="p-1 rounded hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed text-foreground"
                title="Previous match (Shift+Enter)"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => gotoMatch(1)}
                disabled={matchCount === 0}
                className="p-1 rounded hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed text-foreground"
                title="Next match (Enter)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted-foreground tabular-nums px-2">
                {matchCount === 0 ? '0 / 0' : `${matchIndex + 1} / ${matchCount}`}
              </span>
            </div>
          )}

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
            <PoemCard
              key={poem.id}
              poem={poem}
              index={index}
              onUpdate={onRefresh}
              query={query.trim()}
              onOpenViewer={(p) => setViewerPoem(p)}
            />
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

      {/* Viewer mode dialog */}
      <Dialog open={!!viewerPoem} onOpenChange={(o) => { if (!o) setViewerPoem(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {viewerPoem && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="font-serif text-3xl text-foreground">
                      {viewerPoem.title}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {viewerPoem.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 mr-6">
                    <button
                      onClick={() => setViewerFontSize(s => Math.max(14, s - 2))}
                      className="p-1.5 rounded hover:bg-background text-foreground"
                      title="Smaller"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-muted-foreground tabular-nums w-10 text-center">
                      {viewerFontSize}px
                    </span>
                    <button
                      onClick={() => setViewerFontSize(s => Math.min(40, s + 2))}
                      className="p-1.5 rounded hover:bg-background text-foreground"
                      title="Larger"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </DialogHeader>
              <div
                className="overflow-y-auto pr-2 py-4 font-serif text-foreground leading-relaxed whitespace-pre-wrap poem-body"
                style={{ fontSize: `${viewerFontSize}px`, lineHeight: 1.7 }}
              >
                {formatPoemContent(viewerPoem.content)}
              </div>
              <div className="pt-3 border-t border-border text-center" aria-hidden>
                <span className="text-accent/50 tracking-[0.5em] text-sm select-none">❦ ❦ ❦</span>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
