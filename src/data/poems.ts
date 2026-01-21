// ═══════════════════════════════════════════════════════════════════════════
// LAASYA'S CORNER - Poetry Collection
// ═══════════════════════════════════════════════════════════════════════════
//
// Your personal poetry archive. Each poem you write becomes part of your
// creative legacy in Corner.
// ═══════════════════════════════════════════════════════════════════════════

export interface RawPoem {
  title: string;
  date: string; // "YYYY-MM-DD"
  content: string;
}

export const MY_POEMS: RawPoem[] = [
  {
    title: "First Dawn",
    date: "2026-01-01",
    content: `The game begins at midnight's turn,
A fresh year spreads like morning light.
Each point a promise yet to earn,
Each quest a battle, small or bright.

I stand at twenty, level new,
With 365,000 stars to claim.
The calendar awaits its hue—
Corner: I've given life a name.`,
  },
  {
    title: "Penalty of Neglect",
    date: "2026-01-10",
    content: `What costs us more than failure's sting
Is not the zero that we earn—
It's half again of everything,
The lesson that we failed to learn.

Neglect compounds like interest paid
To debts we never meant to take.
Each task undone, each promise frayed,
Deducts from all we try to make.`,
  },
  {
    title: "Weather Within",
    date: "2026-01-15",
    content: `Some days are calm like morning seas,
A gentle blue that asks for nothing.
Some days bring weight upon my knees,
A heaviness that needs unpacking.

I log the weather, not the worth—
No points attached to how I feel.
Just honest marks upon the earth,
A pattern only time reveals.`,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// QUICK-ADD TEMPLATE (copy, paste, modify)
// ═══════════════════════════════════════════════════════════════════════════
//
// {
//   title: "Your Poem Title",
//   date: "2026-01-22",
//   content: `Your poem content here...
// 
// Multiple lines work great.
// Use backticks for multi-line strings.`,
// },
