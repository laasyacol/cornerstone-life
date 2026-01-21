// ═══════════════════════════════════════════════════════════════════════════
// LAASYA'S CORNER - Data Loader
// ═══════════════════════════════════════════════════════════════════════════
//
// This module loads data from your personal data files and transforms it
// into the GameState format. It also auto-calculates streaks and points.
// ═══════════════════════════════════════════════════════════════════════════

import { MY_QUESTS, type RawQuest } from '@/data/quests';
import { MY_MOODS, type RawMood } from '@/data/moods';
import { MY_POEMS, type RawPoem } from '@/data/poems';
import type { Quest, DayMood, Poem, GameState } from '@/lib/gameData';
import { resolveQuest } from '@/lib/gameData';

// ─────────────────────────────────────────────────────────────────────────────
// Date Helpers
// ─────────────────────────────────────────────────────────────────────────────

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getToday(): string {
  return formatDate(new Date());
}

function getPreviousDay(dateStr: string): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

// ─────────────────────────────────────────────────────────────────────────────
// Data Transformers
// ─────────────────────────────────────────────────────────────────────────────

function transformQuests(rawQuests: RawQuest[]): Quest[] {
  return rawQuests.map((raw, index) => ({
    id: `quest-${index + 1}-${raw.name.slice(0, 10).replace(/\s/g, '-').toLowerCase()}`,
    name: raw.name,
    category: raw.category,
    points: raw.points,
    deadline: parseDate(raw.deadline),
    status: raw.status,
    reason: raw.reason,
    completedAt: raw.completedAt ? parseDate(raw.completedAt) : undefined,
  }));
}

function transformMoods(rawMoods: RawMood[]): DayMood[] {
  return rawMoods.map(raw => ({
    date: raw.date,
    mood: raw.mood,
  }));
}

function transformPoems(rawPoems: RawPoem[]): Poem[] {
  return rawPoems.map((raw, index) => ({
    id: `poem-${index + 1}-${raw.title.slice(0, 10).replace(/\s/g, '-').toLowerCase()}`,
    title: raw.title,
    content: raw.content,
    date: parseDate(raw.date),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Points Calculator
// ─────────────────────────────────────────────────────────────────────────────

function calculatePoints(quests: Quest[]): { annualPoints: number; totalPenalty: number } {
  let annualPoints = 0;
  let totalPenalty = 0;

  for (const quest of quests) {
    const result = resolveQuest(quest);
    annualPoints += result.earned;
    totalPenalty += result.penalty;
  }

  // Net points = earned - penalties
  return { 
    annualPoints: annualPoints - totalPenalty, 
    totalPenalty 
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Streak Calculators
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate daily log streak - consecutive days with mood entries ending today
 */
function calculateDailyLogStreak(moods: DayMood[]): number {
  if (moods.length === 0) return 0;

  const moodDates = new Set(moods.map(m => m.date));
  let streak = 0;
  let currentDate = getToday();

  // Check if today has an entry, if not start from yesterday
  if (!moodDates.has(currentDate)) {
    currentDate = getPreviousDay(currentDate);
  }

  // Count consecutive days backwards
  while (moodDates.has(currentDate)) {
    streak++;
    currentDate = getPreviousDay(currentDate);
  }

  return streak;
}

/**
 * Calculate completion streak - consecutive days with at least one completed quest
 */
function calculateCompletionStreak(quests: Quest[]): number {
  const completedQuests = quests.filter(
    q => q.status === 'completed' || q.status === 'late-valid'
  );

  if (completedQuests.length === 0) return 0;

  // Get unique completion dates
  const completionDates = new Set(
    completedQuests
      .filter(q => q.completedAt)
      .map(q => formatDate(q.completedAt!))
  );

  let streak = 0;
  let currentDate = getToday();

  // Check if today has a completion, if not start from yesterday
  if (!completionDates.has(currentDate)) {
    currentDate = getPreviousDay(currentDate);
  }

  // Count consecutive days backwards
  while (completionDates.has(currentDate)) {
    streak++;
    currentDate = getPreviousDay(currentDate);
  }

  return streak;
}

/**
 * Calculate poetry streak - consecutive weeks with at least one poem
 */
function calculatePoetryStreak(poems: Poem[]): number {
  if (poems.length === 0) return 0;

  // Group poems by week
  const poemWeeks = new Set(
    poems.map(p => {
      const year = p.date.getFullYear();
      const week = getWeekNumber(p.date);
      return `${year}-W${week}`;
    })
  );

  // Get current week
  const today = new Date();
  let currentYear = today.getFullYear();
  let currentWeek = getWeekNumber(today);
  let streak = 0;

  // Count consecutive weeks backwards
  while (poemWeeks.has(`${currentYear}-W${currentWeek}`)) {
    streak++;
    currentWeek--;
    if (currentWeek < 1) {
      currentYear--;
      currentWeek = 52; // Approximate
    }
  }

  return streak;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Loader Function
// ─────────────────────────────────────────────────────────────────────────────

export function loadGameData(): GameState {
  // Transform raw data
  const quests = transformQuests(MY_QUESTS);
  const moods = transformMoods(MY_MOODS);
  const poems = transformPoems(MY_POEMS);

  // Calculate points
  const { annualPoints } = calculatePoints(quests);

  // Calculate streaks
  const streaks = {
    dailyLog: calculateDailyLogStreak(moods),
    completion: calculateCompletionStreak(quests),
    poetry: calculatePoetryStreak(poems),
  };

  // Get current year
  const currentYear = new Date().getFullYear();

  return {
    currentYear,
    annualPoints,
    legacyPoints: 0, // Will be calculated at year end
    quests,
    moods,
    poems,
    streaks,
  };
}
