// ═══════════════════════════════════════════════════════════════════════════
// LAASYA'S CORNER - Quest Tracker
// ═══════════════════════════════════════════════════════════════════════════
// 
// Categories: survival | study | writing | skill | maintenance | emotional | rest
// Status: active | completed | late-valid | failed
//
// For completed quests, add: completedAt: "YYYY-MM-DD"
// For late-valid quests, add: reason: "why it was late"
// ═══════════════════════════════════════════════════════════════════════════

import type { QuestCategory, QuestStatus } from '@/lib/gameData';

export interface RawQuest {
  name: string;
  category: QuestCategory;
  points: number;
  deadline: string; // "YYYY-MM-DD"
  status: QuestStatus;
  completedAt?: string; // "YYYY-MM-DD"
  reason?: string;
}

export const MY_QUESTS: RawQuest[] = [
  // Fresh start — Sep 16, 2026. Add your own quests here.
];
