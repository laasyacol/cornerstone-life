import { LayoutDashboard, Scroll, BookOpen, Calendar, BarChart3, Settings } from 'lucide-react';

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
  return (
    <nav className="w-64 h-screen bg-sidebar border-r border-sidebar-border p-4 flex flex-col sticky top-0">
      {/* Logo */}
      <div className="mb-8 px-4">
        <h1 className="font-serif text-3xl text-foreground tracking-tight">CORNER</h1>
        <p className="text-xs text-muted-foreground mt-1">A single-player life game</p>
      </div>

      {/* Nav Items */}
      <div className="space-y-1 flex-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`nav-item w-full ${currentView === id ? 'active' : ''}`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">
          Game Start: Jan 1, 2026
        </p>
      </div>
    </nav>
  );
}
