
import type { ZakatState, ZakatSettings, ZakatBreakdownItem, ZakatResult } from '../../../types.ts';

// Constants based on Fiqh
const NISAB_GOLD_GRAMS = 85;
const NISAB_SILVER_GRAMS = 595;
const AGRI_RATE_NATURAL = 0.10;
const AGRI_RATE_ARTIFICIAL = 0.05;
const MAL_RATE = 0.025;
const RIKAZ_RATE = 0.20; 

/**
 * Calculates Zakat Fitrah
 */
const calculateFitrah = (state: ZakatState, settings: ZakatSettings): ZakatBreakdownItem => {
  const totalKg = state.fitrahPeople * settings.riceKgPerPerson;
  const totalMoney = totalKg * settings.ricePrice;
  const isRice = state.fitrahMethod === 'rice';
  
  return {
    id: 'fitrah',
    label: 'Zakat Fitrah',
    inputValue: state.fitrahPeople, 
    nisabThreshold: 0, 
    isNisabReached: state.fitrahPeople > 0,
    rate: 0, 
    zakatAmount: totalMoney, 
    formattedValue: isRice ? `${totalKg} Kg Beras` : undefined,
    note: isRice 
      ? `${state.fitrahPeople} orang x ${settings.riceKgPerPerson} Kg`
      : `${state.fitrahPeople} orang x ${settings.riceKgPerPerson}kg x ${new Intl.NumberFormat('id-ID').format(settings.ricePrice)}/kg`
  };
};

/**
 * Calculates Zakat Maal
 */
const calculateMaal = (state: ZakatState, settings: ZakatSettings): ZakatBreakdownItem => {
  const totalAssets = state.cash + state.savings + state.investments + state.otherAssets;
  const netAssets = Math.max(0, totalAssets - state.debts);
  const nisabValue = NISAB_GOLD_GRAMS * settings.goldPrice;
  const isReached = netAssets >= nisabValue;
  
  return {
    id: 'maal',
    label: 'Zakat Maal (Harta Simpanan)',
    inputValue: netAssets,
    nisabThreshold: nisabValue,
    isNisabReached: isReached,
    rate: MAL_RATE,
    zakatAmount: isReached ? netAssets * MAL_RATE : 0,
    note: `Total Harta Bersih: ${new Intl.NumberFormat('id-ID').format(netAssets)}. Nisab (85g Emas): ${new Intl.NumberFormat('id-ID').format(nisabValue)}.`
  };
};

/**
 * Calculates Zakat Rikaz
 */
const calculateRikaz = (state: ZakatState): ZakatBreakdownItem => {
  const value = state.rikazValue;
  const isReached = value > 0;

  return {
    id: 'rikaz',
    label: 'Zakat Rikaz (Barang Temuan/Hadiah)',
    inputValue: value,
    nisabThreshold: 0,
    isNisabReached: isReached,
    rate: RIKAZ_RATE,
    zakatAmount: isReached ? value * RIKAZ_RATE : 0,
    note: `Tarif 20% (1/5) untuk barang temuan atau hadiah tak terduga.`
  };
};

/**
 * Calculates Zakat Gold & Silver
 */
const calculateGoldSilver = (state: ZakatState, settings: ZakatSettings): ZakatBreakdownItem[] => {
  const results: ZakatBreakdownItem[] = [];

  const isGoldReached = state.goldWeight >= NISAB_GOLD_GRAMS;
  if (state.goldWeight > 0) {
      results.push({
        id: 'gold',
        label: 'Zakat Emas',
        inputValue: state.goldWeight * settings.goldPrice,
        nisabThreshold: NISAB_GOLD_GRAMS * settings.goldPrice,
        isNisabReached: isGoldReached,
        rate: MAL_RATE,
        zakatAmount: isGoldReached ? (state.goldWeight * settings.goldPrice) * MAL_RATE : 0,
        note: `Berat: ${state.goldWeight}g. Nisab: ${NISAB_GOLD_GRAMS}g.`
      });
  }

  const isSilverReached = state.silverWeight >= NISAB_SILVER_GRAMS;
  if (state.silverWeight > 0) {
      results.push({
        id: 'silver',
        label: 'Zakat Perak',
        inputValue: state.silverWeight * settings.silverPrice,
        nisabThreshold: NISAB_SILVER_GRAMS * settings.silverPrice,
        isNisabReached: isSilverReached,
        rate: MAL_RATE,
        zakatAmount: isSilverReached ? (state.silverWeight * settings.silverPrice) * MAL_RATE : 0,
        note: `Berat: ${state.silverWeight}g. Nisab: ${NISAB_SILVER_GRAMS}g.`
      });
  }

  return results;
};

/**
 * Calculates Zakat Perniagaan
 */
const calculateBusiness = (state: ZakatState, settings: ZakatSettings): ZakatBreakdownItem => {
  const netBusinessValue = Math.max(0, (state.bizAssets + state.bizInventory) - state.bizLiabilities);
  const nisabValue = NISAB_GOLD_GRAMS * settings.goldPrice;
  const isReached = netBusinessValue >= nisabValue;

  return {
    id: 'business',
    label: 'Zakat Perniagaan',
    inputValue: netBusinessValue,
    nisabThreshold: nisabValue,
    isNisabReached: isReached,
    rate: MAL_RATE,
    zakatAmount: isReached ? netBusinessValue * MAL_RATE : 0,
    note: `Aset Lancar Bersih: ${new Intl.NumberFormat('id-ID').format(netBusinessValue)}.`
  };
};

/**
 * Calculates Zakat Pertanian
 */
const calculateAgriculture = (state: ZakatState, settings: ZakatSettings): ZakatBreakdownItem => {
  const nisabValue = 524 * settings.ricePrice; 
  const rate = state.agriMethod === 'natural' ? AGRI_RATE_NATURAL : AGRI_RATE_ARTIFICIAL;
  const isReached = state.agriHarvest >= nisabValue;

  return {
    id: 'agriculture',
    label: 'Zakat Pertanian',
    inputValue: state.agriHarvest,
    nisabThreshold: nisabValue,
    isNisabReached: isReached,
    rate: rate,
    zakatAmount: isReached ? state.agriHarvest * rate : 0,
    note: `Metode: ${state.agriMethod === 'natural' ? 'Alami/Hujan (10%)' : 'Irigasi/Biaya (5%)'}. Nisab setara 524kg beras.`
  };
};

/**
 * Calculates Zakat Livestock (Updated for Classic Mode)
 */
const calculateLivestock = (state: ZakatState, settings: ZakatSettings): ZakatBreakdownItem => {
  if (state.livestockType === 'commercial') {
      // OLD LOGIC: Value based
      const nisabValue = NISAB_GOLD_GRAMS * settings.goldPrice;
      const isReached = state.livestockValue >= nisabValue;
      
      return {
        id: 'livestock',
        label: 'Zakat Peternakan (Dagang)',
        inputValue: state.livestockValue,
        nisabThreshold: nisabValue,
        isNisabReached: isReached,
        rate: MAL_RATE,
        zakatAmount: isReached ? state.livestockValue * MAL_RATE : 0,
        note: `Dihitung sebagai Aset Dagang (Qiyas Tijarah) 2.5%.`
      };
  } else {
      // NEW LOGIC: Classic Fiqh (Saimah)
      const sheep = state.sheepCount;
      const cow = state.cowCount;
      const animalsDue: string[] = [];
      let isReached = false;

      // 1. Kambing (Nisab 40)
      if (sheep >= 40) {
          isReached = true;
          let sheepDue = 0;
          if (sheep >= 40 && sheep <= 120) sheepDue = 1;
          else if (sheep >= 121 && sheep <= 200) sheepDue = 2;
          else if (sheep >= 201 && sheep <= 300) sheepDue = 3;
          else if (sheep > 300) sheepDue = Math.floor(sheep / 100);
          animalsDue.push(`${sheepDue} ekor Kambing`);
      }

      // 2. Sapi (Nisab 30)
      if (cow >= 30) {
          isReached = true;
          // Simplified logic for MVP (Standard Tabii/Musinnah logic is complex for combinations)
          // We will use basic guidance text
          if (cow >= 30 && cow <= 39) animalsDue.push("1 ekor Tabi' (Sapi Jantan 1th)");
          else if (cow >= 40 && cow <= 59) animalsDue.push("1 ekor Musinnah (Sapi Betina 2th)");
          else if (cow >= 60 && cow <= 69) animalsDue.push("2 ekor Tabi'");
          else if (cow >= 70) animalsDue.push("1 Musinnah + 1 Tabi' (atau kelipatannya sesuai fiqh)"); 
      }

      const formatted = animalsDue.length > 0 ? animalsDue.join(" + ") : undefined;

      return {
          id: 'livestock',
          label: 'Zakat Peternakan (Klasik)',
          inputValue: sheep + cow, // Just for non-zero check
          nisabThreshold: 0, // Complex threshold
          isNisabReached: isReached,
          rate: 0,
          zakatAmount: 0, // Paid in animals, not money calculation here
          formattedValue: formatted,
          note: `Metode Klasik (Saimah). Total: ${sheep} Kambing, ${cow} Sapi.`
      };
  }
};

export const calculateTotalZakat = (state: ZakatState, settings: ZakatSettings): ZakatResult => {
  const allItems: ZakatBreakdownItem[] = [
    calculateFitrah(state, settings),
    calculateMaal(state, settings),
    calculateRikaz(state),
    ...calculateGoldSilver(state, settings),
    calculateBusiness(state, settings),
    calculateAgriculture(state, settings),
    calculateLivestock(state, settings)
  ];

  // Filter Items to show
  const items = allItems.filter(item => {
      if (item.id === 'fitrah') return state.fitrahPeople > 0;
      return item.inputValue > 0;
  });

  let totalMoney = 0;
  const extraItems: string[] = [];

  items.forEach(item => {
      // Separate non-money payments
      if (item.id === 'fitrah' && state.fitrahMethod === 'rice' && item.formattedValue) {
          extraItems.push(item.formattedValue);
      } else if (item.id === 'livestock' && state.livestockType === 'classic' && item.formattedValue) {
          extraItems.push(item.formattedValue);
      } else {
          totalMoney += item.zakatAmount;
      }
  });

  // Construct Formatted Total String
  const moneyString = new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
  }).format(totalMoney);

  let formattedTotal = moneyString;
  if (extraItems.length > 0) {
      formattedTotal = `${totalMoney > 0 ? moneyString + ' + ' : ''}${extraItems.join(' + ')}`;
  } else if (totalMoney === 0 && extraItems.length === 0) {
      formattedTotal = "Rp 0";
  }

  return {
    totalZakat: totalMoney, 
    formattedTotal,
    items,
    timestamp: new Date().toISOString()
  };
};
