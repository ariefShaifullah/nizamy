import type {
  HafalanItem,
  HafalanState,
  GamificationState,
  HafalanProfile,
  HafalanSkillLevel,
  UserSummary,
} from "../types.ts";
import { BADGES, SURAH_DATA } from "../constants.ts";

// Constants for SRS Intervals (Days)
export const SRS_INTERVALS = [0, 1, 3, 7, 14, 30];

const STORAGE_KEY_USERS = "nizamy_hafalan_users";
const STORAGE_PREFIX_DATA = "nizamy_hafalan_data_";
const OLD_STORAGE_KEY = "hafalanState"; // For migration

// --- UTILS ---

export const getLocalYYYYMMDD = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// --- STORAGE & USER MANAGEMENT ---

const generateId = () => Math.random().toString(36).substr(2, 9);
const getRandomColor = () => {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const getAllUsers = (): UserSummary[] => {
  try {
    const usersJson = localStorage.getItem(STORAGE_KEY_USERS);
    let users: UserSummary[] = usersJson ? JSON.parse(usersJson) : [];

    // MIGRATION: Check if old single-user data exists and not yet migrated
    const oldData = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldData && users.length === 0) {
      const parsedOld: HafalanState = JSON.parse(oldData);
      if (parsedOld.profile) {
        const newId = generateId();
        const newUser: UserSummary = {
          id: newId,
          name: parsedOld.profile.name,
          level: parsedOld.gamification.level,
          lastLogin:
            parsedOld.gamification.lastLoginDate || new Date().toISOString(),
          avatarColor: getRandomColor(),
        };

        // Update profile with new ID
        parsedOld.profile.userId = newId;

        // Save to new structure
        users.push(newUser);
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
        localStorage.setItem(
          STORAGE_PREFIX_DATA + newId,
          JSON.stringify(parsedOld)
        );

        // Remove old key to finish migration
        localStorage.removeItem(OLD_STORAGE_KEY);
      }
    }
    return users;
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};

export const saveUserData = (state: HafalanState) => {
  if (!state.profile?.userId) return;

  // 1. Save Data
  localStorage.setItem(
    STORAGE_PREFIX_DATA + state.profile.userId,
    JSON.stringify(state)
  );

  // 2. Update User Summary (Level, Last Login)
  const users = getAllUsers();
  const userIndex = users.findIndex((u) => u.id === state.profile?.userId);
  if (userIndex >= 0) {
    users[userIndex].level = state.gamification.level;
    users[userIndex].lastLogin = new Date().toISOString();
    // Update name if changed
    if (users[userIndex].name !== state.profile.name) {
      users[userIndex].name = state.profile.name;
    }
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }
};

export const loadUserData = (userId: string): HafalanState | null => {
  const data = localStorage.getItem(STORAGE_PREFIX_DATA + userId);
  return data ? JSON.parse(data) : null;
};

export const createNewUser = (
  name: string,
  level: HafalanSkillLevel,
  target: number
): HafalanState => {
  const newId = generateId();
  const profile: HafalanProfile = {
    userId: newId,
    name: name,
    skillLevel: level,
    targetJuz: target,
    linesPerDay: level === "beginner" ? 3 : level === "intermediate" ? 10 : 20,
  };

  const initialState: HafalanState = {
    profile,
    items: [],
    gamification: {
      xp: 0,
      level: 1,
      currentStreak: 1,
      lastLoginDate: new Date().toISOString(),
      badges: [],
      weeklyChallengeProgress: 0,
      weeklyChallengeTarget: 50,
    },
  };

  // Add to User Index
  const users = getAllUsers();
  const summary: UserSummary = {
    id: newId,
    name: name,
    level: 1,
    lastLogin: new Date().toISOString(),
    avatarColor: getRandomColor(),
  };
  users.push(summary);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

  // Save Initial Data
  localStorage.setItem(
    STORAGE_PREFIX_DATA + newId,
    JSON.stringify(initialState)
  );

  return initialState;
};

export const updateUserProfile = (
  userId: string,
  updates: { name: string; skillLevel: HafalanSkillLevel; targetJuz: number }
): HafalanState | null => {
  const state = loadUserData(userId);
  if (!state || !state.profile) return null;

  state.profile.name = updates.name;
  state.profile.skillLevel = updates.skillLevel;
  state.profile.targetJuz = updates.targetJuz;

  // Update lines per day based on new level
  state.profile.linesPerDay =
    updates.skillLevel === "beginner"
      ? 3
      : updates.skillLevel === "intermediate"
      ? 10
      : 20;

  saveUserData(state);
  return state;
};

export const deleteUser = (userId: string) => {
  // 1. Remove from Index
  const users = getAllUsers().filter((u) => u.id !== userId);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

  // 2. Remove Data
  localStorage.removeItem(STORAGE_PREFIX_DATA + userId);
};

// --- CORE LOGIC ---

export const getNextReviewDate = (stage: number): string => {
  const daysToAdd = SRS_INTERVALS[stage] || 1;
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return getLocalYYYYMMDD(date);
};

export const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 100) + 1;
};

export const getMotivationalQuote = (): string => {
  const quotes = [
    "Sedikit tapi rutin lebih dicintai Allah. Jalanmu sudah benar.",
    "Satu ayat yang kau jaga lebih berharga dari dunia dan seisinya.",
    "Lelahmu dalam menghafal akan menjadi cahaya di alam kubur.",
    "Teruslah mengulang, karena Al-Quran mudah lepas dari ingatan.",
    "Allah tidak melihat seberapa cepat kau hafal, tapi seberapa setia kau menjaga.",
    "Jangan menyerah saat susah, itu tanda otakmu sedang berkembang.",
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export const checkStreak = (
  currentState: GamificationState
): GamificationState => {
  const now = new Date();
  const today = getLocalYYYYMMDD(now);

  // Check last login date (stored as ISO string) by converting to local date string
  const lastLoginDateObj = new Date(currentState.lastLoginDate);
  const lastLogin = getLocalYYYYMMDD(lastLoginDateObj);

  if (today === lastLogin) return currentState; // Already logged in today

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = getLocalYYYYMMDD(yesterdayDate);

  let newStreak = currentState.currentStreak;

  if (lastLogin === yesterday) {
    newStreak += 1;
  } else {
    newStreak = 1; // Reset streak if missed a day
  }

  return {
    ...currentState,
    currentStreak: newStreak,
    lastLoginDate: now.toISOString(), // Update to full ISO for login tracking
  };
};

export const processItemReview = (
  item: HafalanItem,
  result: "success" | "fail"
): { updatedItem: HafalanItem; xpGained: number } => {
  let updatedItem = { ...item };
  let xpGained = 0;

  const today = getLocalYYYYMMDD();
  updatedItem.lastReviewedDate = today;

  if (result === "success") {
    const newStage = Math.min(updatedItem.stage + 1, 5);
    updatedItem.stage = newStage;
    updatedItem.nextReviewDate = getNextReviewDate(newStage);

    if (item.stage === 0) xpGained = 10;
    else xpGained = 5;
  } else {
    updatedItem.stage = 1;
    updatedItem.errorCount += 1;
    updatedItem.nextReviewDate = getNextReviewDate(1);
    xpGained = 1;
  }

  return { updatedItem, xpGained };
};

export const checkBadges = (state: HafalanState): string[] => {
  const newBadges: string[] = [];
  const existing = state.gamification.badges;

  if (!existing.includes("first_step") && state.items.length > 0) {
    newBadges.push("first_step");
  }
  if (!existing.includes("streak_7") && state.gamification.currentStreak >= 7) {
    newBadges.push("streak_7");
  }
  if (!existing.includes("level_5") && state.gamification.level >= 5) {
    newBadges.push("level_5");
  }

  return newBadges;
};

export const createNewItem = (
  surahName: string,
  surahNo: number,
  start: number,
  end: number
): HafalanItem => {
  const today = getLocalYYYYMMDD();
  return {
    id: `${Date.now()}`,
    surahName,
    surahNo,
    startAyah: start,
    endAyah: end,
    stage: 0,
    nextReviewDate: today, // Start immediately (Day 0)
    createdAt: today,
    errorCount: 0,
    easeFactor: 2.5,
  };
};

export const getMaxAyatByLevel = (level: HafalanSkillLevel): number => {
  switch (level) {
    case "beginner":
      return 5;
    case "intermediate":
      return 10;
    case "advanced":
      return 20;
    default:
      return 5;
  }
};

// Calculate how many verses have been added TODAY
export const getDailyVerseCount = (items: HafalanItem[]): number => {
  const today = getLocalYYYYMMDD();
  return items
    .filter((i) => i.createdAt === today) // Only count items created today (Local Time)
    .reduce((total, i) => total + (i.endAyah - i.startAyah + 1), 0);
};

export const getAvailableSurahs = (targetJuz: number) => {
  if (targetJuz === 30) {
    return SURAH_DATA.filter((s) => s.number >= 78);
  }
  return SURAH_DATA;
};

export const getLastMemorizedAyah = (
  items: HafalanItem[],
  surahNo: number
): number => {
  const surahItems = items.filter((i) => i.surahNo === surahNo);
  if (surahItems.length === 0) return 0;
  return Math.max(...surahItems.map((i) => i.endAyah));
};

export const validateNewItem = (
  currentItems: HafalanItem[],
  surahNo: number,
  start: number,
  end: number,
  maxAyahCount: number,
  skillLevel: HafalanSkillLevel
): { valid: boolean; message?: string } => {
  if (start < 1 || end > maxAyahCount || start > end) {
    return {
      valid: false,
      message: `Nomor ayat tidak valid. Surat ini memiliki ${maxAyahCount} ayat.`,
    };
  }

  // Calculate verses being added now
  const newVerseCount = end - start + 1;

  // Calculate daily limit usage
  const dailyLimit = getMaxAyatByLevel(skillLevel);
  const versesAddedToday = getDailyVerseCount(currentItems);
  const remainingQuota = Math.max(0, dailyLimit - versesAddedToday);

  if (newVerseCount > remainingQuota) {
    return {
      valid: false,
      message: `Kuota harian habis. Anda sudah menambah ${versesAddedToday}/${dailyLimit} ayat hari ini. Level ${skillLevel} hanya mengizinkan maksimal ${dailyLimit} ayat per hari.`,
    };
  }

  const isStrictOverlap = currentItems.some(
    (item) =>
      item.surahNo === surahNo &&
      Math.max(start, item.startAyah) <= Math.min(end, item.endAyah)
  );

  if (isStrictOverlap) {
    return {
      valid: false,
      message: "Ayat ini sudah ada dalam daftar hafalan Anda.",
    };
  }

  return { valid: true };
};

export const fetchQuranVerses = async (
  surahNo: number,
  start: number,
  end: number
): Promise<{ text: string; number: number }[]> => {
  try {
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNo}/editions/quran-uthmani`
    );
    const data = await response.json();

    if (data.code === 200 && data.data && data.data[0] && data.data[0].ayahs) {
      const allAyahs = data.data[0].ayahs;
      const filtered = allAyahs.filter(
        (a: any) => a.numberInSurah >= start && a.numberInSurah <= end
      );
      return filtered.map((a: any) => ({
        text: a.text,
        number: a.numberInSurah,
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch Quran verses", error);
    return [];
  }
};
