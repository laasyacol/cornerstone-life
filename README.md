# Cornerstone Life

CORNER

A single-player life game with points, penalties, streaks, levels, and visual state

1. Player, Level, Time

Player: You (sole character)

DOB: 16 September 2005

Game Start: 1 January 2026

Level System (Hard Rule)

Level = Age

Level-up occurs only on 16 September

Level has no perks except status and historical tracking
(time itself is the reward)

2. Core Currency
Annual Base Points

Every year grants 365,000 Base Points

This is the maximum earnable value of that year

Legacy Points (Carry-Over Mechanic)

Unused or bonus points roll over into the next year

Stored as Legacy Points

Legacy Points:

Cannot be spent

Cannot be lost

Exist only as a lifetime score

Represent good behaviour across years

This is a meta-score, like total XP in RPGs.

3. Task = Quest System

Every task is a quest.

Quest Properties

Mandatory:

Quest name

Category

Point value

Deadline

Status

Optional:

Reason (only if late)

Categories = Quest Types

Examples:

Survival

Study / Work

Writing / Poetry

Skill / Learning

Maintenance

Emotional Labor

Rest (counts only if declared)

4. Point Resolution Rules (Game Logic)
✔ On-Time Completion

+100% of quest points

Counts toward:

Annual score

Potential Legacy Points

⏱ Late Completion — Valid Reason

Reason must be logged

+100% of quest points

No penalty

This is a forgiveness mechanic, not a loophole.

❌ Late / Missed — No Valid Reason (Punishment Mechanic)

Quest grants 0 points

Additionally:

50% of the quest’s point value is deducted from the annual total

This is a negative-XP mechanic.

Example:

Quest worth 4,000 points

Missed without reason

Outcome:

+0 earned

−2,000 points from total

Neglect actively damages your score.

5. Daily Mood → Weather System (Visual Stat)

This is a daily stat, not flavor.

Mood States

Calm → Blue/green gradient

Neutral → Gray/beige

Heavy → Yellow → orange → red gradient

Calendar Map

Full-year grid

One tile per day

Tile color = mood

This functions like:

A heatmap

A seasonal emotional graph

A feedback system (you see patterns, not numbers)

No points are awarded for mood.
Mood affects interpretation, not score.

6. Poetry Corner (Creative Mode)
Mechanics

Writing poems is a quest type

Poems are stored in a two-column archive

Chronological order

Auto-Index System

An index at the top:

Auto-generated from poem.js

Updates whenever a poem is added

Index entries:

Title

Date

Anchor link

This removes friction — creativity stays playable.

7. Streaks & Soft Mechanics (Optional but Recommended)

You may add:

Daily Log Streak (mood logged consecutively)

Completion Streak (quests finished on time)

Poetry Streak

Streaks do not give points.
They are status indicators, like badges.

8. Win / Loss Conditions

There is:

No final win

No game over

But there is:

A visible annual score

A lifetime Legacy score

A permanent record of penalties

This makes Corner a long-form game.

9. Why This Is a Game (Explicitly)

Corner has:

Fixed rules

Scarce currency

Penalties

Progression (levels + legacy points)

Visual stats

Long-term consequences

That is the definition of a game.

use the color palatte from my lego picture  [ also the character of this game ]

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/edf4075a-6c87-4885-8343-491ea77871d6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
