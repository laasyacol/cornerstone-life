import { PLAYER } from '@/lib/gameData';
import playerAvatar from '@/assets/player-avatar.jpg';

export function WelcomeScreen() {
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background animate-fade-in">
      <div className="text-center space-y-6">
        {/* Avatar */}
        <div className="relative mx-auto w-32 h-32">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-accent shadow-xl gold-glow">
            <img 
              src={playerAvatar} 
              alt="Player Avatar" 
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* Greeting */}
        <div className="space-y-2">
          <h1 className="font-serif text-4xl text-foreground">
            Hello, {PLAYER.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            {dayName}
          </p>
          <p className="text-xl text-foreground font-serif">
            {formattedDate}
          </p>
        </div>

        {/* Subtle loading indicator */}
        <div className="flex justify-center gap-1 pt-4">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
