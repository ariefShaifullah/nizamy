export type HafalanSkillLevel = "beginner" | "intermediate" | "advanced";

export interface UserSummary {
  id: string;
  name: string;
  level: number;
  lastLogin: string;
  avatarColor: string;
}

export interface HafalanProfile {
  userId: string;
  name: string;
  skillLevel: HafalanSkillLevel;
  targetJuz: number; // e.g., 30 (Juz 30) or 1 (Juz 1)
  linesPerDay: number; // Capacity
}

export interface HafalanItem {
  id: string;
  surahNo: number;
  surahName: string;
  startAyah: number;
  endAyah: number;
  stage: number; // 0 = New, 1 = 1d, 2 = 3d, 3 = 7d, 4 = 14d, 5 = 30d (Mutqin)
  nextReviewDate: string; // ISO Date YYYY-MM-DD
  lastReviewedDate?: string;
  createdAt: string; // ISO Date YYYY-MM-DD for daily quota tracking
  easeFactor: number; // Simplified multiplier
  errorCount: number;
}

export interface GamificationState {
  xp: number;
  level: number;
  currentStreak: number;
  lastLoginDate: string;
  weekStartDate?: string; // ISO Date YYYY-MM-DD of the current week's Monday
  badges: string[]; // IDs of earned badges
  weeklyChallengeProgress: number; // Current Weekly XP Accumulation
  weeklyChallengeTarget: number;
}

export interface HafalanState {
  profile: HafalanProfile | null;
  items: HafalanItem[];
  gamification: GamificationState;
}
