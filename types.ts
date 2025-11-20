export enum Heir {
  Husband = "husband",
  Wife = "wife",
  Son = "son",
  Daughter = "daughter",
  Father = "father",
  Mother = "mother",
  Grandfather = "grandfather", // Paternal
  PaternalGrandmother = "paternalGrandmother",
  MaternalGrandmother = "maternalGrandmother",
  Grandson = "grandson", // Son's son
  Granddaughter = "granddaughter", // Son's daughter
  FullBrother = "fullBrother",
  FullSister = "fullSister",
  PaternalBrother = "paternalBrother",
  PaternalSister = "paternalSister",
  MaternalBrother = "maternalBrother",
  MaternalSister = "maternalSister",
}

export type HeirKey = keyof typeof Heir;

export type HeirInputState = {
  [key in Heir]: number;
};

export interface Share {
  numerator: number;
  denominator: number;
  type: "furudh" | "ashabah" | "none";
}

export interface HeirResult {
  name: string;
  count: number;
  share: Share;
  finalShare: Share;
  percentage: number;
  value: number;
  reason: string;
  evidence: string;
  isBlocked: boolean;
}

export interface CalculationResult {
  estate: number;
  heirResults: HeirResult[];
  aslAlMasalah: number;
  totalSharesNum: number;
  finalDenominator: number;
  notes: string[];
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  estate: number;
  heirs: HeirInputState;
  result: CalculationResult;
}

// --- ZAKAT TYPES ---

export type ZakatType =
  | "fitrah"
  | "maal"
  | "goldSilver"
  | "business"
  | "agriculture"
  | "livestock";

export interface ZakatSettings {
  goldPrice: number; // Per gram
  silverPrice: number; // Per gram
  ricePrice: number; // Per kg
  riceKgPerPerson: number; // default 2.5
  currency: string;
}

export interface ZakatState {
  // Fitrah
  fitrahPeople: number;
  fitrahMethod: "rice" | "money";

  // Maal (Wealth)
  cash: number;
  savings: number;
  investments: number; // Deposito, stocks, etc.
  otherAssets: number; // Rent, etc.
  debts: number; // Hutang jatuh tempo

  // Rikaz (Temuan/Hadiah)
  rikazValue: number;

  // Gold/Silver
  goldWeight: number;
  silverWeight: number;

  // Business
  bizAssets: number;
  bizInventory: number;
  bizLiabilities: number;

  // Agriculture
  agriHarvest: number; // In currency or kg depending on calc
  agriMethod: "natural" | "artificial"; // 10% vs 5%

  // Livestock (Simplified)
  livestockValue: number; // Value in money if using simple mode
}

export interface ZakatBreakdownItem {
  id: string;
  label: string;
  inputValue: number;
  nisabThreshold: number;
  isNisabReached: boolean;
  rate: number;
  zakatAmount: number;
  formattedValue?: string; // Optional override for display (e.g., "10 Kg Beras")
  note?: string;
}

export interface ZakatResult {
  totalZakat: number; // Numeric representation (useful for generic logic)
  formattedTotal: string; // Display string (e.g. "Rp 1.000.000 + 10 Kg Beras")
  items: ZakatBreakdownItem[];
  timestamp: string;
}

export interface ZakatHistoryEntry {
  id: string;
  timestamp: string;
  state: ZakatState;
  result: ZakatResult;
}

// --- HAFALAN (SRS) TYPES ---

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
  badges: string[]; // IDs of earned badges
  weeklyChallengeProgress: number; // 0 to 100
  weeklyChallengeTarget: number;
}

export interface HafalanState {
  profile: HafalanProfile | null;
  items: HafalanItem[];
  gamification: GamificationState;
}
