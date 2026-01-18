import { useState } from 'react';
import { generateSampleData } from '@/lib/gameData';
import { Navigation } from '@/components/Navigation';
import { PlayerCard } from '@/components/PlayerCard';
import { DashboardStats } from '@/components/DashboardStats';
import { QuestCard } from '@/components/QuestCard';
import { MoodCalendar } from '@/components/MoodCalendar';
import { PoetryCorner } from '@/components/PoetryCorner';
import { StreakDisplay } from '@/components/StreakDisplay';
import { QuestsList } from '@/components/QuestsList';
import { Scroll, ChevronRight } from 'lucide-react';

type NavView = 'dashboard' | 'quests' | 'poetry' | 'calendar';

const Index = () => {
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const gameState = generateSampleData();

  const activeQuests = gameState.quests.filter(q => q.status === 'active').slice(0, 3);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <Navigation currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {currentView === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* Player Card & Streaks */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <PlayerCard 
                    annualPoints={gameState.annualPoints} 
                    legacyPoints={gameState.legacyPoints} 
                  />
                </div>
                <div>
                  <StreakDisplay streaks={gameState.streaks} />
                </div>
              </div>

              {/* Stats Grid */}
              <DashboardStats 
                quests={gameState.quests} 
                annualPoints={gameState.annualPoints} 
              />

              {/* Two Column Layout */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Active Quests */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scroll className="w-5 h-5 text-primary" />
                      <h2 className="font-serif text-xl text-foreground">Active Quests</h2>
                    </div>
                    <button 
                      onClick={() => setCurrentView('quests')}
                      className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                    >
                      View all <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {activeQuests.map((quest, index) => (
                      <div 
                        key={quest.id}
                        className="animate-slide-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <QuestCard quest={quest} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mood Calendar */}
                <div>
                  <MoodCalendar 
                    moods={gameState.moods} 
                    year={2026} 
                    month={0} 
                  />
                </div>
              </div>

              {/* Game Rules Summary */}
              <div className="stat-card">
                <h3 className="font-serif text-lg text-foreground mb-4">How CORNER Works</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="font-medium text-foreground mb-1">📊 Annual Points</p>
                    <p className="text-muted-foreground">365,000 base points per year — the maximum earnable value</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="font-medium text-foreground mb-1">✓ On-Time</p>
                    <p className="text-muted-foreground">Complete quests on time → +100% points</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="font-medium text-foreground mb-1">⚠️ Late Valid</p>
                    <p className="text-muted-foreground">Late with reason → +100% points, no penalty</p>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <p className="font-medium text-foreground mb-1">✗ Neglect</p>
                    <p className="text-muted-foreground">Missed without reason → 0 points + 50% deducted</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'quests' && (
            <div className="animate-fade-in">
              <QuestsList quests={gameState.quests} />
            </div>
          )}

          {currentView === 'poetry' && (
            <div className="animate-fade-in">
              <PoetryCorner poems={gameState.poems} />
            </div>
          )}

          {currentView === 'calendar' && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h2 className="font-serif text-2xl text-foreground">Mood Calendar</h2>
                <p className="text-sm text-muted-foreground">Visual representation of your emotional weather throughout the year</p>
              </div>
              <MoodCalendar moods={gameState.moods} year={2026} month={0} />
              <div className="stat-card">
                <h3 className="font-serif text-lg text-foreground mb-3">About the Weather System</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Each day you log your emotional state as weather. This creates a visual heatmap of your year — 
                  patterns emerge, not numbers. The mood calendar is a feedback system: you see trends, not scores.
                  <strong className="text-foreground"> No points are awarded for mood. Mood affects interpretation, not score.</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
