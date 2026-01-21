// ═══════════════════════════════════════════════════════════════════════════
// LAASYA'S CORNER - Mood Weather Log
// ═══════════════════════════════════════════════════════════════════════════
//
// Log your daily emotional weather here.
// Options: calm | neutral | heavy-light | heavy-medium | heavy-intense
//
// calm         → 🌊 Blue/green - peaceful state
// neutral      → ⚖️ Gray/beige - balanced state  
// heavy-light  → 🌤️ Yellow - slight tension
// heavy-medium → 🌥️ Orange - notable weight
// heavy-intense→ 🌧️ Red - significant burden
// ═══════════════════════════════════════════════════════════════════════════

import type { MoodState } from '@/lib/gameData';

export interface RawMood {
  date: string; // "YYYY-MM-DD"
  mood: MoodState;
}

export const MY_MOODS: RawMood[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // JANUARY 2026
  // ─────────────────────────────────────────────────────────────────────────
  { date: "2026-01-01", mood: "calm" },
  { date: "2026-01-02", mood: "calm" },
  { date: "2026-01-03", mood: "neutral" },
  { date: "2026-01-04", mood: "neutral" },
  { date: "2026-01-05", mood: "heavy-light" },
  { date: "2026-01-06", mood: "calm" },
  { date: "2026-01-07", mood: "neutral" },
  { date: "2026-01-08", mood: "calm" },
  { date: "2026-01-09", mood: "heavy-light" },
  { date: "2026-01-10", mood: "heavy-medium" },
  { date: "2026-01-11", mood: "neutral" },
  { date: "2026-01-12", mood: "calm" },
  { date: "2026-01-13", mood: "calm" },
  { date: "2026-01-14", mood: "neutral" },
  { date: "2026-01-15", mood: "calm" },
  { date: "2026-01-16", mood: "heavy-light" },
  { date: "2026-01-17", mood: "neutral" },
  { date: "2026-01-18", mood: "calm" },
  { date: "2026-01-19", mood: "neutral" },
  { date: "2026-01-20", mood: "calm" },
  { date: "2026-01-21", mood: "calm" },
];

// ═══════════════════════════════════════════════════════════════════════════
// QUICK-ADD TEMPLATE (copy, paste, modify)
// ═══════════════════════════════════════════════════════════════════════════
//
// { date: "2026-01-22", mood: "calm" },
//
// Remember: No points for mood - it's a feedback system, not a score!
