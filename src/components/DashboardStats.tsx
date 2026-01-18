import { ANNUAL_BASE_POINTS, Quest, resolveQuest } from '@/lib/gameData';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

interface DashboardStatsProps {
  quests: Quest[];
  annualPoints: number;
}

export function DashboardStats({ quests, annualPoints }: DashboardStatsProps) {
  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed' || q.status === 'late-valid');
  const failedQuests = quests.filter(q => q.status === 'failed');
  
  const totalEarned = completedQuests.reduce((sum, q) => sum + resolveQuest(q).earned, 0);
  const totalPenalty = failedQuests.reduce((sum, q) => sum + resolveQuest(q).penalty, 0);
  
  const potentialPoints = activeQuests.reduce((sum, q) => sum + q.points, 0);
  const completionRate = quests.length > 0 
    ? Math.round((completedQuests.length / (completedQuests.length + failedQuests.length || 1)) * 100)
    : 100;

  const stats = [
    {
      label: 'Total Earned',
      value: totalEarned.toLocaleString(),
      icon: TrendingUp,
      color: 'text-quest-skill',
      bgColor: 'bg-quest-skill/10',
    },
    {
      label: 'Total Penalty',
      value: totalPenalty > 0 ? `-${totalPenalty.toLocaleString()}` : '0',
      icon: TrendingDown,
      color: totalPenalty > 0 ? 'text-destructive' : 'text-muted-foreground',
      bgColor: totalPenalty > 0 ? 'bg-destructive/10' : 'bg-muted',
    },
    {
      label: 'Potential Points',
      value: potentialPoints.toLocaleString(),
      icon: Target,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      icon: Zap,
      color: completionRate >= 80 ? 'text-quest-skill' : completionRate >= 50 ? 'text-accent' : 'text-destructive',
      bgColor: completionRate >= 80 ? 'bg-quest-skill/10' : completionRate >= 50 ? 'bg-accent/10' : 'bg-destructive/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color, bgColor }) => (
        <div key={label} className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
              <p className={`font-serif text-2xl ${color}`}>{value}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
