import { MoodState, QuestCategory } from './gameData';

// Generate 12 months of sample data for yearly view
export interface MonthlyStats {
  month: string;
  monthIndex: number;
  questsCompleted: number;
  questsFailed: number;
  pointsEarned: number;
  pointsPenalized: number;
  poemsWritten: number;
  moodDistribution: Record<MoodState, number>;
  dominantMood: MoodState;
}

export interface YearlyOverview {
  year: number;
  totalPointsEarned: number;
  totalPenalties: number;
  netPoints: number;
  legacyPointsAdded: number;
  totalQuestsCompleted: number;
  totalQuestsFailed: number;
  completionRate: number;
  totalPoems: number;
  longestStreak: number;
  monthlyStats: MonthlyStats[];
  categoryBreakdown: Record<QuestCategory, { completed: number; failed: number; points: number }>;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getDominantMood(distribution: Record<MoodState, number>): MoodState {
  let max = 0;
  let dominant: MoodState = 'neutral';
  for (const [mood, count] of Object.entries(distribution)) {
    if (count > max) {
      max = count;
      dominant = mood as MoodState;
    }
  }
  return dominant;
}

export function generateYearlyData(year: number): YearlyOverview {
  const monthlyStats: MonthlyStats[] = MONTHS.map((month, index) => {
    // Simulate varying activity levels throughout year
    const activityMultiplier = 1 + Math.sin((index - 2) * 0.5) * 0.3;
    const baseQuests = Math.floor(15 * activityMultiplier);
    const completed = Math.floor(baseQuests * (0.7 + Math.random() * 0.25));
    const failed = Math.floor((baseQuests - completed) * Math.random());
    
    const basePoints = completed * (800 + Math.floor(Math.random() * 400));
    const penalties = failed * (400 + Math.floor(Math.random() * 200));
    
    // Mood distribution with seasonal patterns
    const moodDistribution: Record<MoodState, number> = {
      'calm': Math.floor(8 + Math.random() * 10 + (index >= 4 && index <= 8 ? 5 : 0)),
      'neutral': Math.floor(6 + Math.random() * 8),
      'heavy-light': Math.floor(3 + Math.random() * 5),
      'heavy-medium': Math.floor(2 + Math.random() * 4 + (index === 0 || index === 11 ? 3 : 0)),
      'heavy-intense': Math.floor(1 + Math.random() * 2),
    };

    const poems = Math.floor(1 + Math.random() * 4);

    return {
      month,
      monthIndex: index,
      questsCompleted: completed,
      questsFailed: failed,
      pointsEarned: basePoints,
      pointsPenalized: penalties,
      poemsWritten: poems,
      moodDistribution,
      dominantMood: getDominantMood(moodDistribution),
    };
  });

  const totalPointsEarned = monthlyStats.reduce((sum, m) => sum + m.pointsEarned, 0);
  const totalPenalties = monthlyStats.reduce((sum, m) => sum + m.pointsPenalized, 0);
  const totalQuestsCompleted = monthlyStats.reduce((sum, m) => sum + m.questsCompleted, 0);
  const totalQuestsFailed = monthlyStats.reduce((sum, m) => sum + m.questsFailed, 0);
  const totalPoems = monthlyStats.reduce((sum, m) => sum + m.poemsWritten, 0);

  const categoryBreakdown: Record<QuestCategory, { completed: number; failed: number; points: number }> = {
    survival: { completed: Math.floor(totalQuestsCompleted * 0.2), failed: Math.floor(totalQuestsFailed * 0.1), points: Math.floor(totalPointsEarned * 0.18) },
    study: { completed: Math.floor(totalQuestsCompleted * 0.25), failed: Math.floor(totalQuestsFailed * 0.3), points: Math.floor(totalPointsEarned * 0.28) },
    writing: { completed: Math.floor(totalQuestsCompleted * 0.12), failed: Math.floor(totalQuestsFailed * 0.15), points: Math.floor(totalPointsEarned * 0.14) },
    skill: { completed: Math.floor(totalQuestsCompleted * 0.15), failed: Math.floor(totalQuestsFailed * 0.2), points: Math.floor(totalPointsEarned * 0.16) },
    maintenance: { completed: Math.floor(totalQuestsCompleted * 0.13), failed: Math.floor(totalQuestsFailed * 0.15), points: Math.floor(totalPointsEarned * 0.12) },
    emotional: { completed: Math.floor(totalQuestsCompleted * 0.08), failed: Math.floor(totalQuestsFailed * 0.05), points: Math.floor(totalPointsEarned * 0.07) },
    rest: { completed: Math.floor(totalQuestsCompleted * 0.07), failed: Math.floor(totalQuestsFailed * 0.05), points: Math.floor(totalPointsEarned * 0.05) },
  };

  return {
    year,
    totalPointsEarned,
    totalPenalties,
    netPoints: totalPointsEarned - totalPenalties,
    legacyPointsAdded: Math.max(0, totalPointsEarned - totalPenalties - 200000), // Surplus becomes legacy
    totalQuestsCompleted,
    totalQuestsFailed,
    completionRate: Math.round((totalQuestsCompleted / (totalQuestsCompleted + totalQuestsFailed)) * 100),
    totalPoems,
    longestStreak: Math.floor(15 + Math.random() * 30),
    monthlyStats,
    categoryBreakdown,
  };
}
