import { LayoutDashboard, Scroll, BookOpen, Calendar, BarChart3, Settings } from 'lucide-react';
import { PLAYER, calculateLevel } from '@/lib/gameData';

type NavView = 'dashboard' | 'quests' | 'poetry' | 'calendar' | 'yearly' | 'settings';

interface NavigationProps {
  currentView: NavView;
  onViewChange: (view: NavView) => void;
}

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'quests' as const, label: 'Quests', icon: Scroll },
  { id: 'poetry' as const, label: 'Poetry', icon: BookOpen },
  { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
  { id: 'yearly' as const, label: 'Year Stats', icon: BarChart3 },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const level = calculateLevel();
  return (
    <nav className="w-64 h-screen bg-sidebar border-r border-sidebar-border p-4 flex flex-col sticky top-0">
      {/* Logo */}
      <div className="mb-8 px-4">
        <div className="flex items-baseline gap-2">
          <h1 className="font-serif text-3xl text-foreground tracking-tight">CORNER</h1>
          <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-medium">Lv.{level}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">A single-player life game</p>
        <p className="text-[11px] text-muted-foreground/70 mt-2 font-mono">{today}</p>
      </div>

      {/* Nav Items */}
      <div className="space-y-1 flex-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`nav-item w-full relative group ${currentView === id ? 'active' : ''}`}
          >
            <span
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r transition-all duration-300 ${
                currentView === id
                  ? 'h-6 bg-accent shadow-[0_0_8px_hsl(var(--accent)/0.6)]'
                  : 'h-0 bg-transparent group-hover:h-3 group-hover:bg-muted-foreground/40'
              }`}
            />
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-sidebar-border space-y-1">
        <p className="text-xs text-muted-foreground text-center">
          Playing as <span className="text-foreground font-medium">{PLAYER.name.split(' ')[0]}</span>
        </p>
        <p className="text-[10px] text-muted-foreground/60 text-center">
          Game Start · Jan 1, 2026
        </p>
      </div>
    </nav>
  );
}
