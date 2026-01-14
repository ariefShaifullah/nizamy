
export type AmalCategory = 'wajib' | 'sunnah' | 'social';

export interface AmalTask {
    id: string;
    label: string;
    category: AmalCategory;
    icon: string; // Emoji char
    points: number; // Bobot nilai
}

export interface DailyAmalLog {
    date: string; // YYYY-MM-DD
    completedTasks: string[]; // Array of Task IDs
    totalScore: number; // 0-100 normalized
}
