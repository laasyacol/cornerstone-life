import { useState, useEffect, useMemo } from 'react';
import { Lightbulb, Plus, Trash2, X } from 'lucide-react';

export type IdeaCategory = 'App' | 'Web' | 'Project' | 'Gift' | 'Other';

export interface Idea {
  id: string;
  title: string;
  body: string;
  category: IdeaCategory;
  createdAt: string;
}

const IDEAS_KEY = 'cornerstone-ideas';
const CATEGORIES: IdeaCategory[] = ['App', 'Web', 'Project', 'Gift', 'Other'];

const categoryStyles: Record<IdeaCategory, string> = {
  App: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Web: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  Project: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Gift: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  Other: 'bg-muted text-muted-foreground border-border',
};

function loadIdeas(): Idea[] {
  try {
    const raw = localStorage.getItem(IDEAS_KEY);
    return raw ? (JSON.parse(raw) as Idea[]) : [];
  } catch {
    return [];
  }
}

function saveIdeas(ideas: Idea[]) {
  localStorage.setItem(IDEAS_KEY, JSON.stringify(ideas));
}

export function IdeasView() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filter, setFilter] = useState<'All' | IdeaCategory>('All');
  const [isCreating, setIsCreating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<IdeaCategory>('App');

  useEffect(() => { setIdeas(loadIdeas()); }, []);

  const filtered = useMemo(
    () => ideas
      .filter(i => filter === 'All' || i.category === filter)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [ideas, filter]
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: ideas.length };
    CATEGORIES.forEach(c => { map[c] = ideas.filter(i => i.category === c).length; });
    return map;
  }, [ideas]);

  const handleSave = () => {
    if (!title.trim() && !body.trim()) return;
    const next: Idea[] = [
      {
        id: crypto.randomUUID(),
        title: title.trim() || 'Untitled idea',
        body: body.trim(),
        category,
        createdAt: new Date().toISOString(),
      },
      ...ideas,
    ];
    setIdeas(next);
    saveIdeas(next);
    setTitle(''); setBody(''); setCategory('App'); setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    const next = ideas.filter(i => i.id !== id);
    setIdeas(next);
    saveIdeas(next);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-accent" />
            <h2 className="font-serif text-2xl text-foreground">Ideas</h2>
          </div>
          <p className="text-sm text-muted-foreground">a dumping ground for everything</p>
        </div>
        <button
          onClick={() => setIsCreating(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isCreating ? 'Cancel' : 'Add Idea'}
        </button>
      </div>

      {/* Inline form */}
      {isCreating && (
        <div className="stat-card space-y-3 animate-slide-up">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Idea title"
            className="w-full bg-transparent border-b border-border pb-2 text-lg font-serif text-foreground outline-none focus:border-accent transition-colors"
          />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write it all out…"
            rows={5}
            className="w-full bg-secondary/40 rounded-lg p-3 text-sm text-foreground outline-none border border-border focus:border-accent transition-colors resize-y"
          />
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1 rounded-full text-xs border transition-all ${
                    category === c ? categoryStyles[c] : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Save Idea
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['All', ...CATEGORIES] as const).map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
              filter === c
                ? 'bg-secondary text-foreground border-accent/50'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {c} <span className="opacity-60">{counts[c] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="stat-card text-center py-12">
          <Lightbulb className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No ideas here yet. Dump the first one.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(idea => (
            <div key={idea.id} className="stat-card group relative">
              <button
                onClick={() => handleDelete(idea.id)}
                aria-label="Delete idea"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] border ${categoryStyles[idea.category]}`}>
                  {idea.category}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(idea.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h3 className="font-serif text-lg text-foreground mb-1 pr-6">{idea.title}</h3>
              <p
                onClick={() => setExpanded(expanded === idea.id ? null : idea.id)}
                className={`text-sm text-muted-foreground whitespace-pre-wrap cursor-pointer ${
                  expanded === idea.id ? '' : 'line-clamp-3'
                }`}
              >
                {idea.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default IdeasView;
