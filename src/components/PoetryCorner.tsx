import { Poem } from '@/lib/gameData';
import { Feather, Calendar } from 'lucide-react';

interface PoetryCornerProps {
  poems: Poem[];
}

export function PoetryCorner({ poems }: PoetryCornerProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg burgundy-gradient flex items-center justify-center">
            <Feather className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-foreground">Poetry Corner</h2>
            <p className="text-sm text-muted-foreground">{poems.length} poems in archive</p>
          </div>
        </div>
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

      {/* Poems Grid - Two Columns */}
      <div className="grid md:grid-cols-2 gap-6">
        {poems.map((poem) => (
          <article
            key={poem.id}
            id={`poem-${poem.id}`}
            className="poetry-card"
          >
            <header className="mb-4 pb-3 border-b border-border">
              <h3 className="font-serif text-xl text-foreground">{poem.title}</h3>
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
            </header>
            
            <div className="font-serif text-foreground leading-relaxed whitespace-pre-line">
              {poem.content}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
