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
  deceasedGender?: 'male' | 'female'; // Optional for backward compatibility
}
