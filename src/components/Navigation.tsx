import { LayoutDashboard, Scroll, BookOpen, Calendar, Settings } from 'lucide-react';

type NavView = 'dashboard' | 'quests' | 'poetry' | 'calendar';

interface NavigationProps {
  currentView: NavView;
  onViewChange: (view: NavView) => void;
}

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'quests' as const, label: 'Quests', icon: Scroll },
  { id: 'poetry' as const, label: 'Poetry', icon: BookOpen },
  { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
];

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  return (
    <nav className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border p-4 flex flex-col">
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
        <button className="nav-item w-full opacity-60 hover:opacity-100">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Game Start: Jan 1, 2026
        </p>
      </div>
    </nav>
  );
}
