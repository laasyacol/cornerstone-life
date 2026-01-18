import { calculateLevel, daysUntilLevelUp, PLAYER } from '@/lib/gameData';
import playerAvatar from '@/assets/player-avatar.jpg';

interface PlayerCardProps {
  annualPoints: number;
  legacyPoints: number;
}

export function PlayerCard({ annualPoints, legacyPoints }: PlayerCardProps) {
  const level = calculateLevel();
  const daysToLevel = daysUntilLevelUp();
  const maxPoints = 365000;
  const progressPercent = (annualPoints / maxPoints) * 100;

  return (
    <div className="stat-card relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full" />
      
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-accent shadow-lg animate-pulse-gold">
            <img 
              src={playerAvatar} 
              alt="Player Avatar" 
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
            Lv.{level}
          </div>
        </div>

        {/* Player Info */}
        <div className="flex-1">
          <h2 className="font-serif text-2xl text-foreground mb-1">{PLAYER.name}</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Level {level} • {daysToLevel} days until level-up
          </p>

          {/* Points Display */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Annual Points</p>
              <p className="font-serif text-2xl text-foreground">
                {annualPoints.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Legacy Points</p>
              <p className="font-serif text-2xl text-accent">
                {legacyPoints.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Annual Progress</span>
          <span>{progressPercent.toFixed(1)}% of {maxPoints.toLocaleString()}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full burgundy-gradient transition-all duration-500 ease-out rounded-full"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
