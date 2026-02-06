import { Poem } from '@/lib/gameData';
import { Feather, Calendar, Pencil, Check, X, Trash2 } from 'lucide-react';
import { formatPoemContent } from '@/lib/formatPoem';
import { PoemCreator } from './PoemCreator';
import { useState } from 'react';
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
        <div className="font-serif text-foreground leading-relaxed whitespace-pre-wrap">
          {formatPoemContent(poem.content)}
        </div>
      )}
    </article>
  );
}

export function PoetryCorner({ poems, onRefresh }: PoetryCornerProps) {
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
            <p className="text-sm text-muted-foreground">{poems.length} poems in archive</p>
          </div>
        </div>
        <PoemCreator onPoemCreated={onRefresh} />
      </div>

      {/* Auto-generated Index */}
      <div className="stat-card">
        <h3 className="font-serif text-lg text-foreground mb-3">Index</h3>
        <div className="space-y-2">
          {poems.map((poem, index) => (
            <a
              key={poem.id}
              href={`#poem-${poem.id}`}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary transition-colors group"
            >
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                {index + 1}. {poem.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {poem.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Poems - Single Column with Edit */}
      <div className="space-y-6">
        {poems.map((poem, index) => (
          <PoemCard key={poem.id} poem={poem} index={index} onUpdate={onRefresh} />
        ))}
      </div>
    </div>
  );
}
