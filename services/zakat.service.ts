import type {
  ZakatState,
  ZakatSettings,
  ZakatBreakdownItem,
  ZakatResult,
} from "../types.ts";

// Constants based on Fiqh
const NISAB_GOLD_GRAMS = 85;
const NISAB_SILVER_GRAMS = 595;
// Agricultural Nisab approx 653kg of grain (5 wasaq)
// We will assume user inputs Value for simplicity or handle conversion in UI
const AGRI_RATE_NATURAL = 0.1;
const AGRI_RATE_ARTIFICIAL = 0.05;
const MAL_RATE = 0.025;

/**
 * Calculates Zakat Fitrah
 */
const calculateFitrah = (
  state: ZakatState,
  settings: ZakatSettings
): ZakatBreakdownItem => {
  const totalKg = state.fitrahPeople * settings.riceKgPerPerson;
  const totalMoney = totalKg * settings.ricePrice;

  return {
    id: "fitrah",
    label: "Zakat Fitrah",
    inputValue: state.fitrahPeople, // display as people count
    nisabThreshold: 0, // Mandatory for all capable
    isNisabReached: state.fitrahPeople > 0,
    rate: 0, // Fixed amount per person
    zakatAmount: totalMoney, // We calculate value in currency standard
    note: `${state.fitrahPeople} orang x ${
      settings.riceKgPerPerson
    }kg x ${new Intl.NumberFormat("id-ID").format(settings.ricePrice)}/kg`,
  };
};

/**
 * Calculates Zakat Maal (Savings, Cash, Investments)
 */
const calculateMaal = (
  state: ZakatState,
  settings: ZakatSettings
): ZakatBreakdownItem => {
  const totalAssets =
    state.cash + state.savings + state.investments + state.otherAssets;
  const netAssets = Math.max(0, totalAssets - state.debts);
  const nisabValue = NISAB_GOLD_GRAMS * settings.goldPrice;

  const isReached = netAssets >= nisabValue;

  return {
    id: "maal",
    label: "Zakat Maal (Harta Simpanan)",
    inputValue: netAssets,
    nisabThreshold: nisabValue,
    isNisabReached: isReached,
    rate: MAL_RATE,
    zakatAmount: isReached ? netAssets * MAL_RATE : 0,
    note: `Total Harta Bersih: ${new Intl.NumberFormat("id-ID").format(
      netAssets
    )}. Nisab (85g Emas): ${new Intl.NumberFormat("id-ID").format(
      nisabValue
    )}.`,
  };
};

/**
 * Calculates Zakat Gold & Silver
 */
const calculateGoldSilver = (
  state: ZakatState,
  settings: ZakatSettings
): ZakatBreakdownItem[] => {
  const results: ZakatBreakdownItem[] = [];

  // Gold
  const isGoldReached = state.goldWeight >= NISAB_GOLD_GRAMS;
  if (state.goldWeight > 0) {
    results.push({
      id: "gold",
      label: "Zakat Emas",
      inputValue: state.goldWeight * settings.goldPrice,
      nisabThreshold: NISAB_GOLD_GRAMS * settings.goldPrice,
      isNisabReached: isGoldReached,
      rate: MAL_RATE,
      zakatAmount: isGoldReached
        ? state.goldWeight * settings.goldPrice * MAL_RATE
        : 0,
      note: `Berat: ${state.goldWeight}g. Nisab: ${NISAB_GOLD_GRAMS}g.`,
    });
  }

  // Silver
  const isSilverReached = state.silverWeight >= NISAB_SILVER_GRAMS;
  if (state.silverWeight > 0) {
    results.push({
      id: "silver",
      label: "Zakat Perak",
      inputValue: state.silverWeight * settings.silverPrice,
      nisabThreshold: NISAB_SILVER_GRAMS * settings.silverPrice,
      isNisabReached: isSilverReached,
      rate: MAL_RATE,
      zakatAmount: isSilverReached
        ? state.silverWeight * settings.silverPrice * MAL_RATE
        : 0,
      note: `Berat: ${state.silverWeight}g. Nisab: ${NISAB_SILVER_GRAMS}g.`,
    });
  }

  return results;
};

/**
 * Calculates Zakat Perniagaan (Business)
 */
const calculateBusiness = (
  state: ZakatState,
  settings: ZakatSettings
): ZakatBreakdownItem => {
  const netBusinessValue = Math.max(
    0,
    state.bizAssets + state.bizInventory - state.bizLiabilities
  );
  const nisabValue = NISAB_GOLD_GRAMS * settings.goldPrice;
  const isReached = netBusinessValue >= nisabValue;

  return {
    id: "business",
    label: "Zakat Perniagaan",
    inputValue: netBusinessValue,
    nisabThreshold: nisabValue,
    isNisabReached: isReached,
    rate: MAL_RATE,
    zakatAmount: isReached ? netBusinessValue * MAL_RATE : 0,
    note: `Aset Lancar Bersih: ${new Intl.NumberFormat("id-ID").format(
      netBusinessValue
    )}.`,
  };
};

/**
 * Calculates Zakat Pertanian (Agriculture)
 * Input assumed to be Total Value in IDR for simplicity in this version,
 * or user calculates value manually.
 * Nisab: 5 Wasaq (~653kg gabah).
 * We'll check Nisab based on Value equivalent of 653kg Rice (approx).
 */
const calculateAgriculture = (
  state: ZakatState,
  settings: ZakatSettings
): ZakatBreakdownItem => {
  // Approx 653kg rice value equivalent
  const nisabValue = 653 * settings.ricePrice;
  const rate =
    state.agriMethod === "natural" ? AGRI_RATE_NATURAL : AGRI_RATE_ARTIFICIAL;
  const isReached = state.agriHarvest >= nisabValue;

  return {
    id: "agriculture",
    label: "Zakat Pertanian",
    inputValue: state.agriHarvest,
    nisabThreshold: nisabValue,
    isNisabReached: isReached,
    rate: rate,
    zakatAmount: isReached ? state.agriHarvest * rate : 0,
    note: `Metode: ${
      state.agriMethod === "natural"
        ? "Alami/Hujan (10%)"
        : "Irigasi/Biaya (5%)"
    }. Nisab setara 653kg beras.`,
  };
};

/**
 * Hitung zakat ternak (Simplified)
 */
const calculateLivestock = (
  state: ZakatState,
  settings: ZakatSettings
): ZakatBreakdownItem => {
  const nisabValue = NISAB_GOLD_GRAMS * settings.goldPrice; // Analogy to trading goods if commercial
  const isReached = state.livestockValue >= nisabValue;

  return {
    id: "livestock",
    label: "Zakat Peternakan (Mode Dagang/Nilai)",
    inputValue: state.livestockValue,
    nisabThreshold: nisabValue,
    isNisabReached: isReached,
    rate: MAL_RATE,
    zakatAmount: isReached ? state.livestockValue * MAL_RATE : 0,
    note: `Dihitung berdasarkan nilai jual (Qiyas Zakat Perniagaan). Untuk perhitungan per ekor (konvensional), silakan konsultasi ahli fiqh.`,
  };
};

export const calculateTotalZakat = (
  state: ZakatState,
  settings: ZakatSettings
): ZakatResult => {
  const allItems: ZakatBreakdownItem[] = [
    calculateFitrah(state, settings),
    calculateMaal(state, settings),
    ...calculateGoldSilver(state, settings),
    calculateBusiness(state, settings),
    calculateAgriculture(state, settings),
    calculateLivestock(state, settings),
  ];

  // Filter Logic:
  // 1. Fitrah only shows if people > 0 (inputValue holds people count for fitrah)
  // 2. Other types only show if inputValue (assets/weight/harvest) > 0
  // This ensures receipts don't show empty categories, but DOES show categories
  // where user input data even if Nisab wasn't reached (amount 0).
  const items = allItems.filter((item) => item.inputValue > 0);

  const totalZakat = items.reduce((sum, item) => sum + item.zakatAmount, 0);

  return {
    totalZakat,
    items,
    timestamp: new Date().toISOString(),
  };
};
