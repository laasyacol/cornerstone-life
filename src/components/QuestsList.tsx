import { Quest, CATEGORY_INFO, QuestCategory } from '@/lib/gameData';
import { QuestCard } from './QuestCard';
import { useState } from 'react';
import { QuestCreator } from './QuestCreator';

interface QuestsListProps {
  quests: Quest[];
  onRefresh?: () => void;
}

export function QuestsList({ quests, onRefresh }: QuestsListProps) {
  const [filter, setFilter] = useState<QuestCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');

  const filteredQuests = quests.filter(quest => {
    const categoryMatch = filter === 'all' || quest.category === filter;
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'completed' ? (quest.status === 'completed' || quest.status === 'late-valid') : quest.status === statusFilter);
    return categoryMatch && statusMatch;
  });

  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed' || q.status === 'late-valid');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Quest Log</h2>
          <p className="text-sm text-muted-foreground">
            {activeQuests.length} active • {completedQuests.length} completed
          </p>
        </div>
        <QuestCreator onQuestCreated={onRefresh} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`quest-badge transition-all ${
            statusFilter === 'all' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`quest-badge transition-all ${
            statusFilter === 'active' 
              ? 'bg-accent text-accent-foreground' 
              : 'bg-secondary text-secondary-foreground hover:bg-accent/10'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`quest-badge transition-all ${
            statusFilter === 'completed' 
              ? 'bg-quest-skill text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground hover:bg-quest-skill/10'
          }`}
        >
          Completed
        </button>
        
        <div className="w-px bg-border mx-2" />
        
        <button
          onClick={() => setFilter('all')}
          className={`quest-badge transition-all ${
            filter === 'all' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
          }`}
        >
          All Types
        </button>
        {(Object.entries(CATEGORY_INFO) as [QuestCategory, typeof CATEGORY_INFO[QuestCategory]][]).map(([key, { label, icon }]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`quest-badge transition-all ${
              filter === key 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Quest Cards */}
      <div className="space-y-3">
        {filteredQuests.length > 0 ? (
          filteredQuests.map((quest, index) => (
            <div 
              key={quest.id} 
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <QuestCard quest={quest} onUpdate={onRefresh} />
            </div>
          ))
        ) : (
          <div className="stat-card text-center py-12">
            <p className="text-muted-foreground">No quests match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
