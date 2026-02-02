import { useState } from 'react';
import { Lock } from 'lucide-react';
import playerAvatar from '@/assets/player-avatar.jpg';

interface PasswordScreenProps {
  onUnlock: () => void;
}

const CORRECT_PASSWORD = '11018240';

export function PasswordScreen({ onUnlock }: PasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === CORRECT_PASSWORD) {
      // Store unlock state
      sessionStorage.setItem('corner-unlocked', 'true');
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className={`text-center space-y-6 ${shake ? 'animate-shake' : ''}`}>
        {/* Avatar with lock */}
        <div className="relative mx-auto w-24 h-24">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary shadow-xl">
            <img 
              src={playerAvatar} 
              alt="Locked" 
              className="w-full h-full object-cover object-top opacity-50"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="font-serif text-2xl text-foreground">Enter Password</h1>
          <p className="text-sm text-muted-foreground mt-1">This corner is protected</p>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="••••••••"
            className={`w-64 px-4 py-3 text-center text-lg tracking-widest bg-card border rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-primary transition-all
              ${error ? 'border-destructive' : 'border-border'}`}
            autoFocus
          />
          
          {error && (
            <p className="text-sm text-destructive">Incorrect password</p>
          )}
          
          <button
            type="submit"
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium
              hover:opacity-90 transition-opacity"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
