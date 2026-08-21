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
  // Fresh start — Sep 16, 2026. Log your daily weather here.
];
