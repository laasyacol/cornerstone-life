import { generateYearlyData, YearlyOverview } from '@/lib/yearlyData';
import { CATEGORY_INFO, QuestCategory } from '@/lib/gameData';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Trophy, TrendingUp, TrendingDown, Zap, Feather, Flame, Target, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface YearlyStatsProps {
  year?: number;
}

const MOOD_COLORS = {
  'calm': 'hsl(195, 53%, 55%)',
  'neutral': 'hsl(35, 15%, 70%)',
  'heavy-light': 'hsl(43, 80%, 60%)',
  'heavy-medium': 'hsl(25, 85%, 55%)',
  'heavy-intense': 'hsl(5, 75%, 50%)',
};

const CATEGORY_COLORS: Record<QuestCategory, string> = {
  survival: 'hsl(352, 52%, 32%)',
  study: 'hsl(220, 60%, 50%)',
  writing: 'hsl(280, 50%, 50%)',
  skill: 'hsl(160, 50%, 40%)',
  maintenance: 'hsl(35, 60%, 50%)',
  emotional: 'hsl(330, 50%, 55%)',
  rest: 'hsl(195, 40%, 55%)',
};

export function YearlyStats({ year = 2026 }: YearlyStatsProps) {
  const [tick, setTick] = useState(0);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [spinning, setSpinning] = useState(false);

  const data = useMemo(() => generateYearlyData(year), [year, tick]);

  const refresh = () => {
    setSpinning(true);
    setTick(t => t + 1);
    setLastSync(new Date());
    setTimeout(() => setSpinning(false), 600);
  };

  // Live updates: re-render when cornerstone data changes anywhere in app
  useEffect(() => {
    const onUpdate = () => {
      setTick(t => t + 1);
      setLastSync(new Date());
    };
    window.addEventListener('cornerstone-updated', onUpdate);
    window.addEventListener('storage', onUpdate);
    // Also refresh when tab regains focus
    window.addEventListener('focus', onUpdate);
    return () => {
      window.removeEventListener('cornerstone-updated', onUpdate);
      window.removeEventListener('storage', onUpdate);
      window.removeEventListener('focus', onUpdate);
    };
  }, []);

  // Prepare chart data
  const pointsChartData = data.monthlyStats.map(m => ({
    name: m.month,
    earned: m.pointsEarned,
    penalties: -m.pointsPenalized,
    net: m.pointsEarned - m.pointsPenalized,
  }));

  const questChartData = data.monthlyStats.map(m => ({
    name: m.month,
    completed: m.questsCompleted,
    failed: m.questsFailed,
  }));

  const moodChartData = data.monthlyStats.map(m => ({
    name: m.month,
    ...m.moodDistribution,
  }));

  const poetryChartData = data.monthlyStats.map(m => ({
    name: m.month,
    poems: m.poemsWritten,
  }));

  const categoryPieData = Object.entries(data.categoryBreakdown).map(([key, value]) => ({
    name: CATEGORY_INFO[key as QuestCategory].label,
    value: value.completed,
    color: CATEGORY_COLORS[key as QuestCategory],
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl text-foreground">{year} Year in Review</h2>
          <p className="text-muted-foreground mt-1">
            Complete statistical overview of your journey
            <span className="ml-2 text-xs opacity-70">
              · Synced {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-primary/10 text-foreground rounded-lg text-sm transition-colors border border-border"
            title="Refresh stats"
          >
            <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg">
            <Trophy className="w-5 h-5 text-accent" />
            <span className="font-serif text-xl text-accent">Level 20 → 21</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Total Earned"
          value={data.totalPointsEarned.toLocaleString()}
          color="text-quest-skill"
          bgColor="bg-quest-skill/10"
        />
        <StatCard
          icon={TrendingDown}
          label="Total Penalties"
          value={`-${data.totalPenalties.toLocaleString()}`}
          color="text-destructive"
          bgColor="bg-destructive/10"
        />
        <StatCard
          icon={Zap}
          label="Legacy Points Added"
          value={data.legacyPointsAdded.toLocaleString()}
          color="text-accent"
          bgColor="bg-accent/10"
          highlight
        />
        <StatCard
          icon={Target}
          label="Completion Rate"
          value={`${data.completionRate}%`}
          color={data.completionRate >= 80 ? 'text-quest-skill' : 'text-accent'}
          bgColor={data.completionRate >= 80 ? 'bg-quest-skill/10' : 'bg-accent/10'}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Quests Completed</p>
            <p className="font-serif text-2xl text-foreground">{data.totalQuestsCompleted}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-quest-writing/10 flex items-center justify-center">
            <Feather className="w-6 h-6 text-quest-writing" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Poems Written</p>
            <p className="font-serif text-2xl text-foreground">{data.totalPoems}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-mood-heavy-medium/10 flex items-center justify-center">
            <Flame className="w-6 h-6 text-mood-heavy-medium" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Longest Streak</p>
            <p className="font-serif text-2xl text-foreground">{data.longestStreak} days</p>
          </div>
        </div>
      </div>

      {/* Points Over Time */}
      <div className="stat-card">
        <h3 className="font-serif text-xl text-foreground mb-4">Points Flow</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pointsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="earned" 
                stackId="1"
                stroke="hsl(160, 50%, 40%)" 
                fill="hsl(160, 50%, 40%)" 
                fillOpacity={0.6}
                name="Earned"
              />
              <Area 
                type="monotone" 
                dataKey="penalties" 
                stackId="2"
                stroke="hsl(0, 72%, 51%)" 
                fill="hsl(0, 72%, 51%)" 
                fillOpacity={0.4}
                name="Penalties"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quest Completion & Category Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="font-serif text-xl text-foreground mb-4">Quest Completion by Month</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={questChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="completed" fill="hsl(352, 52%, 32%)" name="Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" fill="hsl(var(--muted))" name="Failed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stat-card">
          <h3 className="font-serif text-xl text-foreground mb-4">Quest Categories</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mood Patterns */}
      <div className="stat-card">
        <h3 className="font-serif text-xl text-foreground mb-4">Mood Weather Patterns</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={moodChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Area type="monotone" dataKey="calm" stackId="1" stroke={MOOD_COLORS.calm} fill={MOOD_COLORS.calm} fillOpacity={0.8} name="Calm" />
              <Area type="monotone" dataKey="neutral" stackId="1" stroke={MOOD_COLORS.neutral} fill={MOOD_COLORS.neutral} fillOpacity={0.8} name="Neutral" />
              <Area type="monotone" dataKey="heavy-light" stackId="1" stroke={MOOD_COLORS['heavy-light']} fill={MOOD_COLORS['heavy-light']} fillOpacity={0.8} name="Light Heavy" />
              <Area type="monotone" dataKey="heavy-medium" stackId="1" stroke={MOOD_COLORS['heavy-medium']} fill={MOOD_COLORS['heavy-medium']} fillOpacity={0.8} name="Medium Heavy" />
              <Area type="monotone" dataKey="heavy-intense" stackId="1" stroke={MOOD_COLORS['heavy-intense']} fill={MOOD_COLORS['heavy-intense']} fillOpacity={0.8} name="Intense Heavy" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
          {Object.entries(MOOD_COLORS).map(([mood, color]) => (
            <div key={mood} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground capitalize">{mood.replace('-', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Poetry by Month */}
      <div className="stat-card">
        <h3 className="font-serif text-xl text-foreground mb-4">Poetry Output</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={poetryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="poems" fill="hsl(280, 50%, 50%)" name="Poems Written" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Year Summary */}
      <div className="stat-card burgundy-gradient text-primary-foreground">
        <h3 className="font-serif text-2xl mb-4">Year Summary</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-primary-foreground/70 text-sm">Net Points</p>
            <p className="font-serif text-3xl">{data.netPoints.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-primary-foreground/70 text-sm">To Legacy</p>
            <p className="font-serif text-3xl">+{data.legacyPointsAdded.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-primary-foreground/70 text-sm">Success Rate</p>
            <p className="font-serif text-3xl">{data.completionRate}%</p>
          </div>
          <div>
            <p className="text-primary-foreground/70 text-sm">Creative Output</p>
            <p className="font-serif text-3xl">{data.totalPoems} poems</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for stat cards
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  bgColor,
  highlight = false 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  color: string; 
  bgColor: string;
  highlight?: boolean;
}) {
  return (
    <div className={`stat-card ${highlight ? 'ring-2 ring-accent/30' : ''}`}>
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
  );
}
