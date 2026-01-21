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
  // ─────────────────────────────────────────────────────────────────────────
  // ACTIVE QUESTS
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: "Morning meditation practice",
    category: "rest",
    points: 500,
    deadline: "2026-01-22",
    status: "active",
  },
  {
    name: "Complete chapter 5 review",
    category: "study",
    points: 2000,
    deadline: "2026-01-24",
    status: "active",
  },
  {
    name: "Write weekly reflection poem",
    category: "writing",
    points: 1500,
    deadline: "2026-01-23",
    status: "active",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // COMPLETED QUESTS
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: "Grocery shopping",
    category: "survival",
    points: 800,
    deadline: "2026-01-17",
    status: "completed",
    completedAt: "2026-01-17",
  },
  {
    name: "Practice guitar scales",
    category: "skill",
    points: 1000,
    deadline: "2026-01-16",
    status: "late-valid",
    reason: "Emergency appointment",
    completedAt: "2026-01-17",
  },
  {
    name: "Call mom",
    category: "emotional",
    points: 600,
    deadline: "2026-01-15",
    status: "completed",
    completedAt: "2026-01-15",
  },
  {
    name: "Clean room",
    category: "maintenance",
    points: 700,
    deadline: "2026-01-14",
    status: "completed",
    completedAt: "2026-01-14",
  },
  {
    name: "Submit assignment",
    category: "study",
    points: 2500,
    deadline: "2026-01-13",
    status: "completed",
    completedAt: "2026-01-13",
  },
  {
    name: "Morning walk",
    category: "rest",
    points: 400,
    deadline: "2026-01-12",
    status: "completed",
    completedAt: "2026-01-12",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// QUICK-ADD TEMPLATES (copy, paste, modify)
// ═══════════════════════════════════════════════════════════════════════════
//
// Active quest:
// { name: "", category: "study", points: 1000, deadline: "2026-01-25", status: "active" },
//
// Completed quest:
// { name: "", category: "study", points: 1000, deadline: "2026-01-25", status: "completed", completedAt: "2026-01-25" },
//
// Late but valid:
// { name: "", category: "study", points: 1000, deadline: "2026-01-25", status: "late-valid", reason: "reason here", completedAt: "2026-01-26" },
//
// Failed quest:
// { name: "", category: "study", points: 1000, deadline: "2026-01-25", status: "failed" },
