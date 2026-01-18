import { Quest, QuestCategory, CATEGORY_INFO, resolveQuest } from '@/lib/gameData';
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

interface QuestCardProps {
  quest: Quest;
  onComplete?: (questId: string, withReason?: string) => void;
}

const statusConfig = {
  active: { icon: Clock, className: 'text-accent', label: 'Active' },
  completed: { icon: CheckCircle2, className: 'text-quest-skill', label: 'Completed' },
  'late-valid': { icon: AlertCircle, className: 'text-mood-heavy-light', label: 'Late (Valid)' },
  failed: { icon: XCircle, className: 'text-destructive', label: 'Failed' },
};

const categoryColors: Record<QuestCategory, string> = {
  survival: 'bg-quest-survival/15 text-quest-survival',
  study: 'bg-quest-study/15 text-quest-study',
  writing: 'bg-quest-writing/15 text-quest-writing',
  skill: 'bg-quest-skill/15 text-quest-skill',
  maintenance: 'bg-quest-maintenance/15 text-quest-maintenance',
  emotional: 'bg-quest-emotional/15 text-quest-emotional',
  rest: 'bg-quest-rest/15 text-quest-rest',
};

export function QuestCard({ quest }: QuestCardProps) {
  const { earned, penalty } = resolveQuest(quest);
  const StatusIcon = statusConfig[quest.status].icon;
  const categoryInfo = CATEGORY_INFO[quest.category];
  const daysLeft = Math.ceil((quest.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between gap-3">
        {/* Quest Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`quest-badge ${categoryColors[quest.category]}`}>
              {categoryInfo.icon} {categoryInfo.label}
            </span>
            {quest.status === 'active' && daysLeft <= 2 && daysLeft > 0 && (
              <span className="quest-badge bg-mood-heavy-light/20 text-mood-heavy-medium">
                {daysLeft}d left
              </span>
            )}
          </div>
          
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
            {quest.name}
          </h3>
          
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <StatusIcon className={`w-4 h-4 ${statusConfig[quest.status].className}`} />
              {statusConfig[quest.status].label}
            </span>
            <span>•</span>
            <span>{quest.deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>

          {quest.reason && (
            <p className="mt-2 text-xs text-muted-foreground italic">
              Reason: {quest.reason}
            </p>
          )}
        </div>

        {/* Points */}
        <div className="text-right">
          <p className="font-serif text-xl text-foreground">
            {quest.status === 'active' ? (
              <span className="text-accent">+{quest.points.toLocaleString()}</span>
            ) : earned > 0 ? (
              <span className="text-quest-skill">+{earned.toLocaleString()}</span>
            ) : (
              <span className="text-destructive">−{penalty.toLocaleString()}</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">points</p>
        </div>
      </div>
    </div>
  );
}
