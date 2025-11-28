// ... (imports remain same)

export type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';

// FIX: Export HedeTab type
export type HedeTab = 'diagnosa' | 'tathhir' | 'history' | 'kamus';

export type HedeCategory = 'job' | 'business' | 'finance' | 'digital' | 'payment' | 'emergency';

export type ViolationType = 'riba' | 'gharar' | 'maysir' | 'zulm' | 'none';

export interface CategoryScore {
  category: HedeCategory;
  score: number; // 0-100 (100 = Risk Free)
  riskLevel: RiskLevel;
}

export interface QuestionOption {
  value: string;
  label: string;
  riskWeight: number; // 0 (Halal) to 100 (Haram Mutlaq)
  violationType?: ViolationType; // NEW: Specific violation category
  tadarrujFlag?: boolean; // If true, indicates willingness to change
  hardshipWeight?: number; // For emergency section: 0 (Easy) to 100 (Impossible)
}

export interface QuestionDependency {
  id: string; // The ID of the parent question
  type: 'include' | 'exclude'; // Show if parent answer matches (include) or doesn't match (exclude)
  values: string[]; // Values to check against
}

export interface Question {
  id: string;
  category: HedeCategory;
  text: string;
  options: QuestionOption[];
  dependency?: QuestionDependency; // Added dependency logic
}

export interface RiskFactor {
  id: string;
  category: HedeCategory;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  violationType: ViolationType; // NEW
  fiqhRule: string;
}

export interface ActionStep {
  phase: 'short_term' | 'mid_term' | 'long_term';
  action: string;
  impact: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cta?: string; // Route path e.g., '/zakat'
  ctaLabel?: string; // Button text e.g., "Hitung Zakat"
}

export interface HedeResult {
  totalScore: number;
  riskLevel: RiskLevel;
  categoryScores: CategoryScore[];
  risks: RiskFactor[];
  roadmap: ActionStep[];
  fiqhContext: {
    hardshipLevel: 'low' | 'moderate' | 'extreme';
    approach: 'immediate_exit' | 'gradual_exit' | 'maintenance';
    explanation: string;
  };
  timestamp: string;
}

export interface FiqhTerm {
  term: string;
  definition: string;
  category: ViolationType | 'general';
}

export interface HedeHistoryEntry {
  id: string;
  timestamp: string; // ISO String
  totalScore: number;
  riskLevel: RiskLevel;
  result: HedeResult; // Full result snapshot
}