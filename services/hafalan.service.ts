
import type {
  HafalanItem,
  HafalanState,
  GamificationState,
  HafalanProfile,
  HafalanSkillLevel,
  UserSummary,
} from "../types.ts";
import { BADGES, SURAH_DATA, HEAVY_VERSES, SRS_INTERVALS } from "../constants.ts";

const STORAGE_KEY_USERS = "nizamy_hafalan_users";
const STORAGE_PREFIX_DATA = "nizamy_hafalan_data_";
const OLD_STORAGE_KEY = "hafalanState"; // For migration
const API_TIMEOUT_MS = 10000; // 10 seconds timeout

// --- TYPE DEFINITIONS FOR API ---
interface QuranApiResponse {
  code: number;
  status: string;
  data: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
    ayahs: {
      number: number;
      text: string;
      numberInSurah: number;
      juz: number;
      manzil: number;
      page: number;
      ruku: number;
      hizbQuarter: number;
      sajda: boolean;
    }[];
  }[];
}

// Simple in-memory cache for Quran verses
const versesCache: Record<string, { text: string; number: number }[]> = {};

// --- HELPER: FETCH WITH TIMEOUT ---
const fetchWithTimeout = async (resource: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
};

export const getVerseWeight = (surah: number, ayah: number): number => {
  return HEAVY_VERSES[`${surah}:${ayah}`] || 1;
};

// Helper to calculate total weight of an item (sum of all verses in the range)
export const getItemWeight = (
  surahNo: number,
  start: number,
  end: number
): number => {
  let totalWeight = 0;
  for (let i = start; i <= end; i++) {
    totalWeight += getVerseWeight(surahNo, i);
  }
  return totalWeight;
};

// --- UTILS ---

export const getLocalYYYYMMDD = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getStartOfWeek = (d: Date = new Date()) => {
  const date = new Date(d);
  const day = date.getDay(); // 0 (Sun) to 6 (Sat)
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
  const monday = new Date(date.setDate(diff));
  return getLocalYYYYMMDD(monday);
};

// --- AUDIO UTILS ---
export const getAyahAudioUrl = (
  qoriId: string,
  surah: number,
  ayah: number
): string => {
  const surahPad = String(surah).padStart(3, "0");
  const ayahPad = String(ayah).padStart(3, "0");
  return `https://everyayah.com/data/${qoriId}/${surahPad}${ayahPad}.mp3`;
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
      weeklyChallengeTarget: 250,
      weekStartDate: getStartOfWeek(),
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
    "Sedikit tapi rutin itu lebih dicintai Allah. Jalan kamu udah bener kok.",
    "Satu ayat yang kamu jaga itu lebih mahal dari dunia seisinya.",
    "Lelah kamu pas ngafal bakal jadi cahaya nanti.",
    "Terus ulang aja, Al-Quran emang cepet lepas kalau gak dijaga.",
    "Allah gak liat seberapa cepet kamu hafal, tapi seberapa setia kamu ngejaganya.",
    "Jangan nyerah pas susah, itu tandanya otak kamu lagi berkembang.",
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};

export const checkGamificationSync = (
  currentState: GamificationState
): GamificationState => {
  const now = new Date();
  const today = getLocalYYYYMMDD(now);

  // 1. Check Streak (Login Date)
  const lastLoginDateObj = new Date(currentState.lastLoginDate);
  const lastLogin = getLocalYYYYMMDD(lastLoginDateObj);

  let newStreak = currentState.currentStreak;

  if (today !== lastLogin) {
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = getLocalYYYYMMDD(yesterdayDate);

    if (lastLogin === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1; // Reset streak if missed a day
    }
  }

  // 2. Check Weekly Reset
  const currentWeekStart = getStartOfWeek(now);
  let weeklyProgress = currentState.weeklyChallengeProgress;
  let weekStart = currentState.weekStartDate;

  // If stored week start doesn't match current week start (or is undefined), reset.
  if (weekStart !== currentWeekStart) {
    weeklyProgress = 0;
    weekStart = currentWeekStart;
  }

  // Ensure target is consistent
  const safeTarget =
    currentState.weeklyChallengeTarget < 200
      ? 250
      : currentState.weeklyChallengeTarget;

  return {
    ...currentState,
    currentStreak: newStreak,
    lastLoginDate: now.toISOString(),
    weeklyChallengeProgress: weeklyProgress,
    weekStartDate: weekStart,
    weeklyChallengeTarget: safeTarget,
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

  // Calculate Weight Multiplier
  // e.g. Standard item = 1. Al-Baqarah 282 = 15.
  const weight = getItemWeight(item.surahNo, item.startAyah, item.endAyah);

  if (result === "success") {
    const newStage = Math.min(updatedItem.stage + 1, 5);
    updatedItem.stage = newStage;
    updatedItem.nextReviewDate = getNextReviewDate(newStage);

    if (item.stage === 0) {
      // New Item: 10 XP * Weight
      xpGained = 10 * weight;
    } else {
      // Review Success: 5 XP * Weight
      xpGained = 5 * weight;
    }
  } else {
    updatedItem.stage = 1;
    updatedItem.errorCount += 1;
    updatedItem.nextReviewDate = getNextReviewDate(1);
    // Review Fail: 1 XP * Weight (Effort still counts, especially for long verses)
    xpGained = 1 * weight;
  }

  return { updatedItem, xpGained };
};

// --- ADVANCED BADGE LOGIC ---

// Helper to check if user has at least started ALL surahs in a range
const hasStartedAllSurahsInRange = (
  items: HafalanItem[],
  startSurah: number,
  endSurah: number
): boolean => {
  const distinctSurahs = new Set(items.map((i) => i.surahNo));
  for (let i = startSurah; i <= endSurah; i++) {
    if (!distinctSurahs.has(i)) return false;
  }
  return true;
};

// Helper to check if user has started ANY verse from a specific Surah
const hasStartedSurah = (items: HafalanItem[], surahNo: number): boolean => {
  return items.some((i) => i.surahNo === surahNo);
};

// Helper to check if user reviewed a specific Surah TODAY
const reviewedSurahToday = (items: HafalanItem[], surahNo: number): boolean => {
  const today = getLocalYYYYMMDD();
  return items.some(
    (i) => i.surahNo === surahNo && i.lastReviewedDate === today
  );
};

export const checkBadges = (state: HafalanState): string[] => {
  const newBadges: string[] = [];
  const existing = state.gamification.badges;
  const items = state.items;
  const now = new Date();
  const currentHour = now.getHours(); // 0-23
  const currentDay = now.getDay(); // 0=Sun, 5=Fri

  // Helper to safely add badge
  const award = (id: string) => {
    if (!existing.includes(id)) newBadges.push(id);
  };

  // 1. BASIC
  if (items.length > 0) award("first_step");
  if (state.gamification.currentStreak >= 7) award("streak_7");
  if (state.gamification.currentStreak >= 30) award("streak_30");

  // 2. LEVELING
  if (state.gamification.level >= 10) award("level_10");

  // 3. MASTERY (MUTQIN) - Items at Stage 5
  const mutqinCount = items.filter((i) => i.stage >= 5).length;
  if (mutqinCount >= 10) award("mutqin_10");
  if (mutqinCount >= 50) award("mutqin_50");

  // 4. JUZ MILESTONES (Approximation: Has started all surahs in Juz)
  // Juz 30: Surah 78-114
  if (hasStartedAllSurahsInRange(items, 78, 114)) award("juz_30_master");

  // Juz 1: Surah 1-2 (Al-Fatihah & Al-Baqarah)
  if (hasStartedAllSurahsInRange(items, 1, 2)) award("juz_1_pioneer");

  // Half Quran (Approx 15 Juz)
  // Rough calc: Quran has 114 Surahs. 15 Juz approx 57 Surahs (very rough but works for gamification)
  const distinctSurahCount = new Set(items.map((i) => i.surahNo)).size;
  if (distinctSurahCount >= 57) award("half_quran");

  // Khatam (30 Juz)
  if (distinctSurahCount === 114) award("khatam_hafiz");

  // 5. POPULAR SURAHS
  if (hasStartedSurah(items, 67)) award("mulk_master"); // Al-Mulk
  if (hasStartedSurah(items, 56)) award("waqiah_provider"); // Al-Waqiah
  if (hasStartedSurah(items, 55)) award("rahman_lover"); // Ar-Rahman

  // 6. CONTEXTUAL (TIME/DAY)
  // Kahf on Friday (Surah 18, Day 5)
  // Check if user has REVIEWED Al-Kahf today AND today is Friday
  if (currentDay === 5 && reviewedSurahToday(items, 18)) {
    award("kahf_friday");
  }

  // Fajr: 04:00 - 06:00
  if (currentHour >= 4 && currentHour < 6) award("fajr_warrior");

  // Night Owl (Tahajjud): 00:00 - 03:00
  if (currentHour >= 0 && currentHour < 3) award("night_owl");

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

// Calculate how many "points" of load have been added TODAY
// Normal verse = 1 point. Heavy verse (e.g. 2:282) = 15 points.
export const getDailyLoad = (items: HafalanItem[]): number => {
  const today = getLocalYYYYMMDD();
  return items
    .filter((i) => i.createdAt === today) // Only count items created today (Local Time)
    .reduce((total, item) => {
      return total + getItemWeight(item.surahNo, item.startAyah, item.endAyah);
    }, 0);
};

export const getAvailableSurahs = (targetJuz: number) => {
  // Filter Strictly based on Juz Target
  if (targetJuz === 30) {
    // Juz 30: An-Naba (78) to An-Nas (114)
    return SURAH_DATA.filter((s) => s.number >= 78 && s.number <= 114);
  }
  if (targetJuz === 29) {
    // Juz 29: Al-Mulk (67) to Al-Mursalat (77)
    return SURAH_DATA.filter((s) => s.number >= 67 && s.number <= 77);
  }
  // IF target is 1 (Urut dari Depan), we return ALL SURAHS.
  // This ensures that after finishing Al-Baqarah (2), user can seamlessly access Ali Imran (3), etc.
  // The distinction is purely visual/mental model in the selection UI.
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

export type ValidationResult =
  | { status: "error"; message: string }
  | { status: "warning"; message: string }
  | { status: "success" };

export const validateNewItem = (
  currentItems: HafalanItem[],
  surahNo: number,
  start: number,
  end: number,
  maxAyahCount: number,
  skillLevel: HafalanSkillLevel
): ValidationResult => {
  if (start < 1 || end > maxAyahCount || start > end || isNaN(start) || isNaN(end)) {
    return {
      status: "error",
      message: `Nomor ayat nggak pas. Surat ini cuma punya ${maxAyahCount} ayat.`,
    };
  }

  // Strict Overlap Check (BLOCKING)
  const isStrictOverlap = currentItems.some(
    (item) =>
      item.surahNo === surahNo &&
      Math.max(start, item.startAyah) <= Math.min(end, item.endAyah)
  );

  if (isStrictOverlap) {
    return {
      status: "error",
      message: "Ayat ini udah masuk daftar hafalan kamu.",
    };
  }

  // Calculate LOAD (Weighted Score) for the new selection
  const newLoad = getItemWeight(surahNo, start, end);
  const hasHeavyVerse = newLoad > end - start + 1; // If load > count, it contains heavy verses

  // Calculate Remaining Quota based on LOAD
  const dailyLimit = getMaxAyatByLevel(skillLevel);
  const currentDailyLoad = getDailyLoad(currentItems);
  const remainingQuota = Math.max(0, dailyLimit - currentDailyLoad);

  // Translate Level to UI Label
  const levelLabel =
    skillLevel === "beginner"
      ? "Santai"
      : skillLevel === "intermediate"
      ? "Sedang"
      : "Fokus";

  if (newLoad > remainingQuota) {
    let msg = "";

    if (hasHeavyVerse) {
      // Special message for heavy verses like 2:282
      msg = `Kamu milih ayat yang panjang banget. Beban ini setara ${newLoad} poin. Lewat dari sisa kuota kamu (${remainingQuota}).`;
    } else {
      // Standard message
      msg =
        remainingQuota <= 0
          ? `Kuota harian (${dailyLimit} poin) udah habis.`
          : `Lewat dari sisa kuota kamu (${remainingQuota} ayat).`;
    }

    return {
      status: "warning",
      message: `${msg} Kapasitas sekarang: Mode ${levelLabel}. Yakin mau lanjut?`,
    };
  }

  return { status: "success" };
};

export const fetchQuranVerses = async (
  surahNo: number,
  start: number,
  end: number
): Promise<{ text: string; number: number }[]> => {
  try {
    // 1. CHECK CACHE FIRST
    const cacheKey = `${surahNo}:${start}-${end}`;
    if (versesCache[cacheKey]) {
      return versesCache[cacheKey];
    }

    // 2. FETCH IF NOT CACHED WITH TIMEOUT
    // Optimization: Use offset and limit to fetch only required verses
    const offset = start - 1; // API is 0-based index
    const limit = end - start + 1;

    const response = await fetchWithTimeout(
      `https://api.alquran.cloud/v1/surah/${surahNo}/editions/quran-uthmani?offset=${offset}&limit=${limit}`
    );
    const data: QuranApiResponse = await response.json();

    if (data.code === 200 && data.data && data.data[0] && data.data[0].ayahs) {
      // Data structure from offset/limit endpoint is still data[0].ayahs
      const ayahs = data.data[0].ayahs;

      const result = ayahs.map((a) => {
        let text = a.text;
        // Fix: Remove Bismillah from Ayah 1 for all Surahs except Al-Fatihah (Surah 1)
        // An-Naml (27) Ayah 30 also has Bismillah but should be KEPT.
        if (surahNo !== 1 && a.numberInSurah === 1) {
          // Use regex to remove Bismillah from the start of the string only
          // Matches "Bismillahi... Ar-Rahim" followed by optional spaces
          text = text.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, "");
        }
        return { text: text, number: a.numberInSurah };
      });

      // 3. SAVE TO CACHE
      versesCache[cacheKey] = result;
      return result;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch Quran verses", error);
    throw error; // Re-throw to let caller handle it
  }
};
