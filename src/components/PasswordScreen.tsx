import { useState, useEffect } from 'react';
import { Lock, Lightbulb } from 'lucide-react';
import { verifyPassword } from '@/lib/passwordUtils';
import playerAvatar from '@/assets/player-avatar.jpg';
import { Smudge } from '@/components/Smudge';

interface PasswordScreenProps {
  onUnlock: () => void;
}

export function PasswordScreen({ onUnlock }: PasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [passwordResult, setPasswordResult] = useState<'none' | 'success' | 'failure'>('none');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Reset password result after animation
  useEffect(() => {
    if (passwordResult !== 'none') {
      const timer = setTimeout(() => setPasswordResult('none'), 1500);
      return () => clearTimeout(timer);
    }
  }, [passwordResult]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsVerifying(true);
    const isValid = await verifyPassword(password);
    setIsVerifying(false);
    
    if (isValid) {
      setPasswordResult('success');
      // Store unlock state
      sessionStorage.setItem('corner-unlocked', 'true');
      // Small delay to show success state
      setTimeout(() => onUnlock(), 300);
    } else {
      setPasswordResult('failure');
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPassword('');
      setFailedAttempts((prev) => {
        const next = prev + 1;
        if (next >= 3) setShowHint(true);
        return next;
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden">
      {/* Soft ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.08),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_hsl(var(--primary)/0.05),_transparent_70%)]" />

      <div className={`relative text-center space-y-6 px-8 py-10 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm shadow-2xl ${shake ? 'animate-shake' : ''}`}>
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
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="password"
            className={`w-64 px-4 py-3 text-center text-lg tracking-widest bg-card border rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-primary transition-all
              ${error ? 'border-destructive' : 'border-border'}`}
            autoFocus
            disabled={isVerifying}
          />
          
          {error && (
            <p className="text-sm text-destructive">
              Incorrect password
              {failedAttempts > 0 && failedAttempts < 3 && (
                <span className="text-muted-foreground"> · hint in {3 - failedAttempts} {3 - failedAttempts === 1 ? 'try' : 'tries'}</span>
              )}
            </p>
          )}

          {showHint && (
            <div className="flex items-start gap-2 px-4 py-3 bg-primary/10 border border-primary/30 rounded-lg text-left animate-fade-in">
              <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-primary">Hint</p>
                <p className="text-sm text-foreground">ur name 240</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium
              hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isVerifying ? 'Verifying...' : 'Unlock'}
          </button>
        </form>

        {/* Attempt indicator dots */}
        <div className="flex items-center justify-center gap-1.5 pt-1" aria-label="Failed attempts">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < failedAttempts
                  ? 'w-6 bg-destructive/70'
                  : 'w-3 bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Smudge companion */}
      <Smudge 
        isPasswordFocused={isFocused} 
        passwordResult={passwordResult}
      />
    </div>
  );
}
