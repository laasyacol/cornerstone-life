import { Flame, CheckCheck, Feather } from 'lucide-react';

interface StreakDisplayProps {
  streaks: {
    dailyLog: number;
    completion: number;
    poetry: number;
  };
}

export function StreakDisplay({ streaks }: StreakDisplayProps) {
  const streakItems = [
    {
      key: 'dailyLog',
      label: 'Daily Log',
      value: streaks.dailyLog,
      icon: Flame,
      color: 'text-mood-heavy-medium',
      bgColor: 'bg-mood-heavy-medium/10',
    },
    {
      key: 'completion',
      label: 'Completion',
      value: streaks.completion,
      icon: CheckCheck,
      color: 'text-quest-skill',
      bgColor: 'bg-quest-skill/10',
    },
    {
      key: 'poetry',
      label: 'Poetry',
      value: streaks.poetry,
      icon: Feather,
      color: 'text-quest-writing',
      bgColor: 'bg-quest-writing/10',
    },
  ];

  return (
    <div className="stat-card">
      <h3 className="font-serif text-lg text-foreground mb-4">Streaks</h3>
      <div className="grid grid-cols-3 gap-3">
        {streakItems.map(({ key, label, value, icon: Icon, color, bgColor }) => (
          <div
            key={key}
            className={`${bgColor} rounded-lg p-3 text-center transition-all hover:scale-105`}
          >
            <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
            <p className={`font-serif text-2xl ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-3">
        Streaks are status indicators, not point multipliers
      </p>
    </div>
  );
}
