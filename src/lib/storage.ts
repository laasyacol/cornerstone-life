// Local storage manager for CORNER data
// Stores all game data in a file named "cornerstone"

const STORAGE_KEY = 'cornerstone';

export interface CornerstoneData {
  quests: import('@/lib/gameData').Quest[];
  moods: import('@/lib/gameData').DayMood[];
  poems: import('@/lib/gameData').Poem[];
  annualPoints: number;
  legacyPoints: number;
  streaks: {
    dailyLog: number;
    completion: number;
    poetry: number;
  };
  lastUpdated: string;
}

/**
 * Save game data to local storage (cornerstone file)
 */
export function saveCornerstoneData(data: Partial<CornerstoneData>): void {
  try {
    const existing = loadCornerstoneData();
    const updated: CornerstoneData = {
      ...existing,
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    console.log('Cornerstone data saved:', updated.lastUpdated);
    // Broadcast for live UI subscribers (YearlyStats, etc.)
    try {
      window.dispatchEvent(new CustomEvent('cornerstone-updated', { detail: { at: updated.lastUpdated } }));
    } catch {}
  } catch (error) {
    console.error('Failed to save cornerstone data:', error);
  }
}

/**
 * Load game data from local storage (cornerstone file)
 */
export function loadCornerstoneData(): CornerstoneData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored) as CornerstoneData;
    
    // Parse date strings back to Date objects for quests
    if (data.quests) {
      data.quests = data.quests.map(q => ({
        ...q,
        deadline: new Date(q.deadline),
        completedAt: q.completedAt ? new Date(q.completedAt) : undefined,
      }));
    }
    
    // Parse date strings back to Date objects for poems
    if (data.poems) {
      data.poems = data.poems.map(p => ({
        ...p,
        date: new Date(p.date),
      }));
    }
    
    return data;
  } catch (error) {
    console.error('Failed to load cornerstone data:', error);
    return null;
  }
}

/**
 * Check if cornerstone data exists
 */
export function hasCornerstoneData(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Clear all cornerstone data
 */
export function clearCornerstoneData(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('Cornerstone data cleared');
}

/**
 * Export cornerstone data as downloadable JSON file
 */
export function exportCornerstoneData(): void {
  const data = loadCornerstoneData();
  if (!data) {
    console.warn('No cornerstone data to export');
    return;
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cornerstone.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import cornerstone data from a JSON file
 */
export function importCornerstoneData(file: File): Promise<CornerstoneData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as CornerstoneData;
        saveCornerstoneData(data);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid cornerstone file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
