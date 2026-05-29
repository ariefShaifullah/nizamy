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
 // --- Ashabah (extended per KHI Pasal 175) ---
 FullBrotherSon = "fullBrotherSon", // Anak laki-laki saudara kandung (Pasal 175 point 6)
 PaternalBrotherSon = "paternalBrotherSon", // Anak laki-laki saudara seayah (Pasal 175 point 7)
 PaternalUncleFull = "paternalUncleFull", // Paman kandung (Pasal 175 point 8)
 PaternalUnclePaternal = "paternalUnclePaternal", // Paman seayah (Pasal 175 point 9)
 PaternalUnclesSonFull = "paternalUnclesSonFull", // Anak laki-laki paman kandung (Pasal 175 point 10)
 PaternalUnclesSonPaternal = "paternalUnclesSonPaternal", // Anak laki-laki paman seayah (Pasal 175 point 11)
 // --- Dzawil Arham (Kerabat Jauh per KHI Pasal 176) ---
 DaughterSon = "daughterSon", // Cucu laki-laki dari anak perempuan (male via female line)
 DaughterDaughter = "daughterDaughter", // Cucu perempuan dari anak perempuan
 FullBrotherDaughter = "fullBrotherDaughter", // Anak perempuan dari saudara kandung (female via male line)
 FullSisterSon = "fullSisterSon", // Anak dari saudari kandung (male via female line)
 PaternalBrotherDaughter = "paternalBrotherDaughter", // Anak perempuan dari saudara seayah (female via male line)
 PaternalAunt = "paternalAunt", // Bibi kandung (saudara perempuan kandung ayah)
 PaternalAuntPaternal = "paternalAuntPaternal", // Bibi seayah (saudara perempuan seayah ayah)
 MaternalAunt = "maternalAunt", // Bibi seibu (saudara perempuan ibu)
 MaternalUncle = "maternalUncle", // Paman seibu (saudara laki-laki ibu)
 PaternalUnclesDaughterFull = "paternalUnclesDaughterFull", // Sepupu perempuan kandung (anak paman kandung)
 PaternalUnclesDaughterPaternal = "paternalUnclesDaughterPaternal", // Sepupu perempuan seayah (anak paman seayah)
}

export type HeirKey = keyof typeof Heir;

export type HeirInputState = {
  [key in Heir]: number;
};

export interface Share {
 numerator: number;
 denominator: number;
 type: "furudh" | "ashabah" | "combined" | "musytarakah" | "arham" | "none";
}

export interface HeirResult {
 name: string;
 count: number;
 share: Share;
 finalShare: Share;
 furudhShare?: Share; // For 'combined' type: the original Furudh portion before Ashabah sisa
 percentage: number;
 value: number;
 reason: string;
 evidence: string;
 isBlocked: boolean;
}

export interface CalculationResult {
 estate: number; // Gross estate
 netEstate: number; // After wasiat + utang deductions
 wasiat: number; // Bequest amount (capped at 1/3)
 utang: number; // Debt amount
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
 wasiat?: number; // Optional for backward compatibility
 utang?: number; // Optional for backward compatibility
}
