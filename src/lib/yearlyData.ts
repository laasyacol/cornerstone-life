// ═══════════════════════════════════════════════════════════════════════════
// LAASYA'S CORNER - Yearly Stats Calculator
// ═══════════════════════════════════════════════════════════════════════════
//
// This module calculates yearly statistics from the actual quest, mood, and
// poem data loaded from the data files.
// ═══════════════════════════════════════════════════════════════════════════

import { MoodState, QuestCategory, resolveQuest, type Quest, type DayMood, type Poem } from './gameData';
import { loadGameData } from './dataLoader';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

function getMonthFromDate(date: Date): number {
  return date.getMonth();
}

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function generateYearlyData(year: number): YearlyOverview {
  const gameState = loadGameData();
  const { quests, moods, poems } = gameState;

  // Filter data by year
  const yearQuests = quests.filter(q => q.deadline.getFullYear() === year);
  const yearMoods = moods.filter(m => parseDate(m.date).getFullYear() === year);
  const yearPoems = poems.filter(p => p.date.getFullYear() === year);

  // Initialize monthly stats
  const monthlyStats: MonthlyStats[] = MONTHS.map((month, index) => ({
    month,
    monthIndex: index,
    questsCompleted: 0,
    questsFailed: 0,
    pointsEarned: 0,
    pointsPenalized: 0,
    poemsWritten: 0,
    moodDistribution: {
      'calm': 0,
      'neutral': 0,
      'heavy-light': 0,
      'heavy-medium': 0,
      'heavy-intense': 0,
    },
    dominantMood: 'neutral' as MoodState,
  }));

  // Initialize category breakdown
  const categoryBreakdown: Record<QuestCategory, { completed: number; failed: number; points: number }> = {
    survival: { completed: 0, failed: 0, points: 0 },
    study: { completed: 0, failed: 0, points: 0 },
    writing: { completed: 0, failed: 0, points: 0 },
    skill: { completed: 0, failed: 0, points: 0 },
    maintenance: { completed: 0, failed: 0, points: 0 },
    emotional: { completed: 0, failed: 0, points: 0 },
    rest: { completed: 0, failed: 0, points: 0 },
  };

  // Process quests
  let totalPointsEarned = 0;
  let totalPenalties = 0;
  let totalQuestsCompleted = 0;
  let totalQuestsFailed = 0;

  for (const quest of yearQuests) {
    const monthIndex = getMonthFromDate(quest.deadline);
    const result = resolveQuest(quest);
    const isCompleted = quest.status === 'completed' || quest.status === 'late-valid';
    const isFailed = quest.status === 'failed';

    if (isCompleted) {
      monthlyStats[monthIndex].questsCompleted++;
      monthlyStats[monthIndex].pointsEarned += result.earned;
      totalQuestsCompleted++;
      categoryBreakdown[quest.category].completed++;
      categoryBreakdown[quest.category].points += result.earned;
    }

    if (isFailed) {
      monthlyStats[monthIndex].questsFailed++;
      monthlyStats[monthIndex].pointsPenalized += result.penalty;
      totalQuestsFailed++;
      categoryBreakdown[quest.category].failed++;
    }

    totalPointsEarned += result.earned;
    totalPenalties += result.penalty;
  }

  // Process moods
  for (const mood of yearMoods) {
    const monthIndex = parseDate(mood.date).getMonth();
    monthlyStats[monthIndex].moodDistribution[mood.mood]++;
  }

  // Calculate dominant mood for each month
  for (const stats of monthlyStats) {
    stats.dominantMood = getDominantMood(stats.moodDistribution);
  }

  // Process poems
  for (const poem of yearPoems) {
    const monthIndex = getMonthFromDate(poem.date);
    monthlyStats[monthIndex].poemsWritten++;
  }

  // Calculate totals
  const totalPoems = yearPoems.length;
  const netPoints = totalPointsEarned - totalPenalties;
  const completionRate = totalQuestsCompleted + totalQuestsFailed > 0
    ? Math.round((totalQuestsCompleted / (totalQuestsCompleted + totalQuestsFailed)) * 100)
    : 0;

  // Calculate longest streak from current streaks (simplified)
  const longestStreak = Math.max(
    gameState.streaks.dailyLog,
    gameState.streaks.completion,
    gameState.streaks.poetry
  );

  // Legacy points = any surplus over base annual points goal
  const legacyPointsAdded = Math.max(0, netPoints);

  return {
    year,
    totalPointsEarned,
    totalPenalties,
    netPoints,
    legacyPointsAdded,
    totalQuestsCompleted,
    totalQuestsFailed,
    completionRate,
    totalPoems,
    longestStreak,
    monthlyStats,
    categoryBreakdown,
  };
}
