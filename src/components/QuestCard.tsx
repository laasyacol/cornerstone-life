import { Quest, QuestCategory, CATEGORY_INFO, resolveQuest } from '@/lib/gameData';
import { CheckCircle2, Clock, AlertCircle, XCircle, RotateCcw, Check, Pencil, X } from 'lucide-react';
import { useState } from 'react';
import { loadCornerstoneData, saveCornerstoneData } from '@/lib/storage';

interface QuestCardProps {
  quest: Quest;
  onUpdate?: () => void;
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

export function QuestCard({ quest, onUpdate }: QuestCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(quest.name);
  const [editPoints, setEditPoints] = useState(quest.points);

  const { earned, penalty } = resolveQuest(quest);
  const StatusIcon = statusConfig[quest.status].icon;
  const categoryInfo = CATEGORY_INFO[quest.category];
  const daysLeft = Math.ceil((quest.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const toggleStatus = () => {
    const data = loadCornerstoneData();
    if (!data?.quests) return;

    const updatedQuests = data.quests.map(q => {
      if (q.id === quest.id) {
        if (q.status === 'active') {
          return { ...q, status: 'completed' as const, completedAt: new Date() };
        } else if (q.status === 'completed' || q.status === 'late-valid') {
          return { ...q, status: 'active' as const, completedAt: undefined };
        }
      }
      return q;
    });

    saveCornerstoneData({ quests: updatedQuests });
    onUpdate?.();
  };

  const saveEdit = () => {
    const data = loadCornerstoneData();
    if (!data?.quests) return;

    const updatedQuests = data.quests.map(q => {
      if (q.id === quest.id) {
        return { ...q, name: editName, points: editPoints };
      }
      return q;
    });

    saveCornerstoneData({ quests: updatedQuests });
    setIsEditing(false);
    onUpdate?.();
  };

  const cancelEdit = () => {
    setEditName(quest.name);
    setEditPoints(quest.points);
    setIsEditing(false);
  };

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
          
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              <input
                type="number"
                value={editPoints}
                onChange={(e) => setEditPoints(Number(e.target.value))}
                className="w-20 bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                min={0}
              />
            </div>
          ) : (
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
              {quest.name}
            </h3>
          )}
          
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

        {/* Actions & Points */}
        <div className="flex flex-col items-end gap-2">
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
                {quest.status !== 'failed' && (
                  <button
                    onClick={toggleStatus}
                    className={`p-1.5 rounded-md transition-colors ${
                      quest.status === 'active' 
                        ? 'hover:bg-quest-skill/20 text-quest-skill' 
                        : 'hover:bg-accent/20 text-accent'
                    }`}
                    title={quest.status === 'active' ? 'Mark Complete' : 'Mark Active'}
                  >
                    {quest.status === 'active' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-md hover:bg-primary/20 text-primary transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
