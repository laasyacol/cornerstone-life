// CORNER Game Data & Logic

export const PLAYER = {
  name: "Corner",
  dob: new Date(2005, 8, 16), // September 16, 2005
  gameStart: new Date(2026, 0, 1), // January 1, 2026
};

export const ANNUAL_BASE_POINTS = 365000;

export type MoodState = 'calm' | 'neutral' | 'heavy-light' | 'heavy-medium' | 'heavy-intense';

export type QuestCategory = 
  | 'survival' 
  | 'study' 
  | 'writing' 
  | 'skill' 
  | 'maintenance' 
  | 'emotional' 
  | 'rest';

export type QuestStatus = 'active' | 'completed' | 'late-valid' | 'failed';

export interface Quest {
  id: string;
  name: string;
  category: QuestCategory;
  points: number;
  deadline: Date;
  status: QuestStatus;
  reason?: string;
  completedAt?: Date;
}

export interface Poem {
  id: string;
  title: string;
  content: string;
  date: Date;
}

export interface DayMood {
  date: string; // YYYY-MM-DD
  mood: MoodState;
}

export interface GameState {
  currentYear: number;
  annualPoints: number;
  legacyPoints: number;
  quests: Quest[];
  moods: DayMood[];
  poems: Poem[];
  streaks: {
    dailyLog: number;
    completion: number;
    poetry: number;
  };
}

// Calculate current level (age)
export function calculateLevel(): number {
  const today = new Date();
  const birthYear = PLAYER.dob.getFullYear();
  const currentYear = today.getFullYear();
  let age = currentYear - birthYear;
  
  const birthdayThisYear = new Date(currentYear, PLAYER.dob.getMonth(), PLAYER.dob.getDate());
  if (today < birthdayThisYear) {
    age--;
  }
  
  return age;
}

// Days until next level-up
export function daysUntilLevelUp(): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  let nextBirthday = new Date(currentYear, 8, 16); // September 16
  
  if (today >= nextBirthday) {
    nextBirthday = new Date(currentYear + 1, 8, 16);
  }
  
  const diffTime = nextBirthday.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Calculate quest resolution
export function resolveQuest(quest: Quest): { earned: number; penalty: number } {
  if (quest.status === 'completed') {
    return { earned: quest.points, penalty: 0 };
  }
  
  if (quest.status === 'late-valid') {
    return { earned: quest.points, penalty: 0 };
  }
  
  if (quest.status === 'failed') {
    return { earned: 0, penalty: Math.floor(quest.points * 0.5) };
  }
  
  return { earned: 0, penalty: 0 };
}

// Category display info
export const CATEGORY_INFO: Record<QuestCategory, { label: string; icon: string }> = {
  survival: { label: 'Survival', icon: '🛡️' },
  study: { label: 'Study / Work', icon: '📚' },
  writing: { label: 'Writing / Poetry', icon: '✍️' },
  skill: { label: 'Skill / Learning', icon: '🎯' },
  maintenance: { label: 'Maintenance', icon: '🔧' },
  emotional: { label: 'Emotional Labor', icon: '💝' },
  rest: { label: 'Rest', icon: '🌙' },
};

// Mood display info
export const MOOD_INFO: Record<MoodState, { label: string; description: string }> = {
  'calm': { label: 'Calm', description: 'Blue/green gradient - peaceful state' },
  'neutral': { label: 'Neutral', description: 'Gray/beige - balanced state' },
  'heavy-light': { label: 'Light Heavy', description: 'Yellow - slight tension' },
  'heavy-medium': { label: 'Medium Heavy', description: 'Orange - notable weight' },
  'heavy-intense': { label: 'Intense Heavy', description: 'Red - significant burden' },
};

// Generate sample data for demo
export function generateSampleData(): GameState {
  const quests: Quest[] = [
    {
      id: '1',
      name: 'Morning meditation practice',
      category: 'rest',
      points: 500,
      deadline: new Date(2026, 0, 18),
      status: 'active',
    },
    {
      id: '2',
      name: 'Complete chapter 5 review',
      category: 'study',
      points: 2000,
      deadline: new Date(2026, 0, 20),
      status: 'active',
    },
    {
      id: '3',
      name: 'Write weekly reflection poem',
      category: 'writing',
      points: 1500,
      deadline: new Date(2026, 0, 19),
      status: 'active',
    },
    {
      id: '4',
      name: 'Grocery shopping',
      category: 'survival',
      points: 800,
      deadline: new Date(2026, 0, 17),
      status: 'completed',
      completedAt: new Date(2026, 0, 17),
    },
    {
      id: '5',
      name: 'Practice guitar scales',
      category: 'skill',
      points: 1000,
      deadline: new Date(2026, 0, 16),
      status: 'late-valid',
      reason: 'Emergency appointment',
      completedAt: new Date(2026, 0, 17),
    },
  ];

  const poems: Poem[] = [
    {
      id: '1',
      title: 'First Dawn',
      content: `The game begins at midnight's turn,
A fresh year spreads like morning light.
Each point a promise yet to earn,
Each quest a battle, small or bright.

I stand at twenty, level new,
With 365,000 stars to claim.
The calendar awaits its hue—
Corner: I've given life a name.`,
      date: new Date(2026, 0, 1),
    },
    {
      id: '2',
      title: 'Penalty of Neglect',
      content: `What costs us more than failure's sting
Is not the zero that we earn—
It's half again of everything,
The lesson that we failed to learn.

Neglect compounds like interest paid
To debts we never meant to take.
Each task undone, each promise frayed,
Deducts from all we try to make.`,
      date: new Date(2026, 0, 10),
    },
  ];

  // Generate some moods for January
  const moods: DayMood[] = [];
  const moodOptions: MoodState[] = ['calm', 'neutral', 'heavy-light', 'heavy-medium', 'calm', 'neutral'];
  
  for (let day = 1; day <= 18; day++) {
    moods.push({
      date: `2026-01-${day.toString().padStart(2, '0')}`,
      mood: moodOptions[Math.floor(Math.random() * moodOptions.length)],
    });
  }

  return {
    currentYear: 2026,
    annualPoints: 12800,
    legacyPoints: 0,
    quests,
    moods,
    poems,
    streaks: {
      dailyLog: 18,
      completion: 5,
      poetry: 2,
    },
  };
}
