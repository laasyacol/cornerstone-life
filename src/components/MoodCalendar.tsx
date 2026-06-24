import { DayMood, MoodState, MOOD_INFO } from '@/lib/gameData';
import { useState } from 'react';

interface MoodCalendarProps {
  moods: DayMood[];
  year: number;
  month: number;
}

const moodColors: Record<MoodState, string> = {
  'calm': 'bg-mood-calm',
  'neutral': 'bg-mood-neutral',
  'heavy-light': 'bg-mood-heavy-light',
  'heavy-medium': 'bg-mood-heavy-medium',
  'heavy-intense': 'bg-mood-heavy-intense',
};

export function MoodCalendar({ moods, year, month }: MoodCalendarProps) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long' });
  
  const getMoodForDay = (day: number): MoodState | null => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const found = moods.find(m => m.date === dateStr);
    return found?.mood || null;
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-xl text-foreground">{monthName} {year}</h3>
        <span className="text-sm text-muted-foreground">Weather System</span>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-xs text-muted-foreground font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map(i => (
          <div key={`empty-${i}`} className="w-full aspect-square" />
        ))}
        
        {days.map(day => {
          const mood = getMoodForDay(day);
          const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const isToday = new Date().toISOString().split('T')[0] === dateStr;
          
          return (
            <div
              key={day}
              className="relative flex items-center justify-center"
              onMouseEnter={() => setHoveredDay(dateStr)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <div
                className={`
                  mood-tile w-full aspect-square rounded
                  ${mood ? moodColors[mood] : 'bg-muted/50'}
                  ${isToday ? 'ring-2 ring-accent ring-offset-1 ring-offset-card shadow-[0_0_10px_hsl(var(--accent)/0.5)]' : ''}
                `}
              />
              
              {/* Tooltip */}
              {hoveredDay === dateStr && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 animate-fade-in">
                  <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-border">
                    <p className="font-medium">
                      {mood ? MOOD_INFO[mood].label : 'No entry'}
                      {isToday && <span className="ml-1 text-accent">· Today</span>}
                    </p>
                    <p className="text-muted-foreground">{monthName} {day}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
        {(Object.entries(MOOD_INFO) as [MoodState, typeof MOOD_INFO[MoodState]][]).map(([mood, info]) => (
          <div key={mood} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className={`w-3 h-3 rounded ${moodColors[mood]}`} />
            <span>{info.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
