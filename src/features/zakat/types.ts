
export type ZakatType = 'fitrah' | 'maal' | 'goldSilver' | 'business' | 'agriculture' | 'livestock';

export interface ZakatTab {
  id: string;
  label: string;
  icon: string;
}

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
  fitrahMethod: 'rice' | 'money';

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
  agriMethod: 'natural' | 'artificial'; // 10% vs 5%

  // Livestock
  livestockType: 'commercial' | 'classic'; // New Field
  livestockValue: number; // Commercial Mode
  sheepCount: number; // Classic Mode
  cowCount: number; // Classic Mode
}

export interface ZakatBreakdownItem {
  id: string;
  label: string;
  inputValue: number;
  nisabThreshold: number;
  isNisabReached: boolean;
  rate: number;
  zakatAmount: number; // In Money
  zakatRice?: number; // In Kg (For Fitrah)
  zakatAnimal?: string; // String description (For Livestock Classic)
  formattedValue?: string; // Optional override for display
  note?: string;
}

export interface ZakatResult {
  totalMoney: number;
  totalRice: number;
  totalAnimals: string[];
  formattedTotal: string; // Deprecated but kept for backward compat in history
  items: ZakatBreakdownItem[];
  timestamp: string;
}

export interface ZakatHistoryEntry {
  id: string;
  timestamp: string;
  state: ZakatState;
  result: ZakatResult;
}
