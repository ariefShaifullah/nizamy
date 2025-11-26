
import type { HeirInputState, CalculationResult, HeirResult, Share, Heir } from '../types.ts';
import { Heir as HeirEnum } from '../types.ts';
import { HEIR_LABELS, QURAN_REFS, LEGAL_BASIS } from '../constants.ts';
import { gcd, lcm } from '../utils.ts';
import { applyHajbRules } from './faraidh-hajb.ts';
import { calculateFurudhShares, addShares } from './faraidh-shares.ts';

type PresentHeirs = { [key in Heir]: number };
type Shares = { [key in Heir]?: Share };
type Results = { [key in Heir]?: Partial<HeirResult> };

// --- HELPER: Resolve Akdariyyah Case ---
const resolveAkdariyyah = (
    shares: Shares, 
    results: Results, 
    notes: string[]
): { finalSiham: Record<string, number>, finalDenominator: number } => {
    notes.push("Kasus Al-Akdariyyah: Perhitungan khusus diterapkan pada Kakek dan Saudari Kandung untuk keadilan.");
    
    const finalSiham: Record<string, number> = {};
    
    // Standard Aul to 27
    finalSiham[HeirEnum.Husband] = 9;
    finalSiham[HeirEnum.Mother] = 6;
    finalSiham[HeirEnum.Grandfather] = 8;
    finalSiham[HeirEnum.FullSister] = 4;
    
    // Display setup
    shares[HeirEnum.Husband] = { numerator: 1, denominator: 2, type: 'furudh' };
    shares[HeirEnum.Mother] = { numerator: 1, denominator: 3, type: 'furudh' };
    shares[HeirEnum.Grandfather] = { numerator: 1, denominator: 6, type: 'furudh' };
    shares[HeirEnum.FullSister] = { numerator: 1, denominator: 2, type: 'furudh' };
    
    results[HeirEnum.Husband]!.reason = "Bagian pokok 1/2. Disesuaikan karena 'Aul menjadi 9/27.";
    results[HeirEnum.Husband]!.evidence = QURAN_REFS.AN_NISA_12;
    
    results[HeirEnum.Mother]!.reason = "Bagian pokok 1/3. Disesuaikan karena 'Aul menjadi 6/27.";
    results[HeirEnum.Mother]!.evidence = QURAN_REFS.AN_NISA_11;
    
    results[HeirEnum.Grandfather]!.reason = "Bagian pokok 1/6. Setelah 'Aul, berkongsi sisa dengan Saudari (2:1) menjadi 8/27.";
    results[HeirEnum.Grandfather]!.evidence = LEGAL_BASIS.MAZHAB_ZAID_AKDARIYYAH;

    results[HeirEnum.FullSister]!.reason = "Bagian pokok 1/2. Setelah 'Aul, berkongsi sisa dengan Kakek (1:2) menjadi 4/27.";
    results[HeirEnum.FullSister]!.evidence = LEGAL_BASIS.MAZHAB_ZAID_AKDARIYYAH;

    return { finalSiham, finalDenominator: 27 };
};

// --- HELPER: Determine Ashabah ---
const determineAshabah = (
    present: PresentHeirs, 
    results: Results,
    flags: { 
        sonExists: boolean, 
        daughterExists: boolean, 
        grandsonExists: boolean, 
        granddaughterExists: boolean,
        fatherExists: boolean,
        grandfatherExists: boolean,
        maleDescendantExists: boolean,
        femaleDescendantExists: boolean,
        fullBrotherExists: boolean,
        fullSisterExists: boolean,
        paternalBrotherExists: boolean,
        paternalSisterExists: boolean,
        isGrandfatherWithSiblings: boolean
    }
): { heir: Heir, ratio: number }[] => {
    const ashabahHeirs: { heir: Heir, ratio: number }[] = [];
    const { 
        sonExists, daughterExists, grandsonExists, granddaughterExists,
        fatherExists, grandfatherExists, maleDescendantExists, femaleDescendantExists,
        fullBrotherExists, fullSisterExists, paternalBrotherExists, paternalSisterExists,
        isGrandfatherWithSiblings
    } = flags;

    if (!isGrandfatherWithSiblings) {
      if (sonExists) {
        ashabahHeirs.push({ heir: HeirEnum.Son, ratio: 2 * present.son });
        if(daughterExists) ashabahHeirs.push({ heir: HeirEnum.Daughter, ratio: 1 * present.daughter });
        if(results.son) {
            results.son.reason = "Ashabah bin Nafsi, atau bil Ghairi bersama Anak Perempuan.";
            results.son.evidence = QURAN_REFS.AN_NISA_11;
        }
        if(results.daughter) {
            results.daughter.reason = "Ashabah bil Ghairi bersama Anak Laki-laki, bagian 1:2.";
            results.daughter.evidence = QURAN_REFS.AN_NISA_11;
        }
      } else if (grandsonExists) {
        ashabahHeirs.push({ heir: HeirEnum.Grandson, ratio: 2 * present.grandson });
        if(granddaughterExists) ashabahHeirs.push({ heir: HeirEnum.Granddaughter, ratio: 1 * present.granddaughter });
        if(results.grandson) {
            results.grandson.reason = "Ashabah bin Nafsi, atau bil Ghairi bersama Cucu Perempuan.";
            results.grandson.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
        }
        if(results.granddaughter) {
            results.granddaughter.reason = "Ashabah bil Ghairi bersama Cucu Laki-laki, bagian 1:2.";
            results.granddaughter.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
        }
      } else if (fatherExists && !maleDescendantExists) {
          ashabahHeirs.push({heir: HeirEnum.Father, ratio: 1});
          results.father!.reason = (femaleDescendantExists ? "Mendapat 1/6 + sisa (Ashabah)" : "Ashabah, mengambil seluruh sisa harta") + " karena tidak ada keturunan laki-laki.";
          results.father!.evidence = QURAN_REFS.AN_NISA_11;
      } else if (grandfatherExists && !maleDescendantExists) {
          ashabahHeirs.push({heir: HeirEnum.Grandfather, ratio: 1});
          results.grandfather!.reason = (femaleDescendantExists ? "Mendapat 1/6 + sisa (Ashabah)" : "Ashabah, mengambil seluruh sisa harta") + " karena tidak ada keturunan laki-laki.";
          results.grandfather!.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
      } else if (fullSisterExists && femaleDescendantExists && !fullBrotherExists) {
          ashabahHeirs.push({ heir: HeirEnum.FullSister, ratio: present.fullSister });
          results.fullSister!.reason = "Ashabah ma'al Ghairi, mengambil sisa harta bersama keturunan perempuan.";
          results.fullSister!.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
      } else if (fullBrotherExists) {
          ashabahHeirs.push({ heir: HeirEnum.FullBrother, ratio: 2 * present.fullBrother });
          if(fullSisterExists) ashabahHeirs.push({ heir: HeirEnum.FullSister, ratio: 1 * present.fullSister });
          if(results.fullBrother) {
              results.fullBrother.reason = "Ashabah, mengambil sisa harta.";
              results.fullBrother.evidence = QURAN_REFS.AN_NISA_176;
          }
          if(results.fullSister) {
              results.fullSister.reason = "Ashabah bil Ghairi bersama Saudara Laki-laki Kandung.";
              results.fullSister.evidence = QURAN_REFS.AN_NISA_176;
          }
      } else if (paternalSisterExists && femaleDescendantExists && !fullSisterExists && !paternalBrotherExists) {
          ashabahHeirs.push({ heir: HeirEnum.PaternalSister, ratio: present.paternalSister });
          results.paternalSister!.reason = "Ashabah ma'al Ghairi, mengambil sisa harta bersama keturunan perempuan.";
          results.paternalSister!.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
      } else if (paternalBrotherExists) {
          ashabahHeirs.push({ heir: HeirEnum.PaternalBrother, ratio: 2 * present.paternalBrother });
          if(paternalSisterExists) ashabahHeirs.push({ heir: HeirEnum.PaternalSister, ratio: 1 * present.paternalSister });
          if(results.paternalBrother) {
              results.paternalBrother.reason = "Ashabah, mengambil sisa harta.";
              results.paternalBrother.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
          }
          if(results.paternalSister) {
              results.paternalSister.reason = "Ashabah bil Ghairi bersama Saudara Laki-laki Seayah.";
              results.paternalSister.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
          }
      } else if (present.maternalBrother === 0 && present.maternalSister === 0 && !sonExists && !daughterExists && !fatherExists && !grandfatherExists && !fullBrotherExists && !fullSisterExists && !paternalBrotherExists && !paternalSisterExists) {
          // Baitul Mal Case implicitly handled by empty return, handled in main logic
      }
    }
    return ashabahHeirs;
};

// --- MAIN CALCULATION FUNCTION ---
export const calculateFaraidh = (heirs: HeirInputState, estate: number): CalculationResult => {
  const present: PresentHeirs = { ...heirs };
  const shares: Shares = {};
  const results: Results = {};
  const notes: string[] = [];

  // --- 0. ZERO HEIRS CHECK ---
  const totalHeirsCount = Object.values(present).reduce((a, b) => a + b, 0);
  if (totalHeirsCount === 0) {
      return {
          estate,
          heirResults: [],
          aslAlMasalah: 0,
          totalSharesNum: 0,
          finalDenominator: 0,
          notes: ["Tidak ada ahli waris yang diketahui. Seluruh harta diserahkan ke Baitul Mal atau digunakan untuk kemaslahatan umum."],
      };
  }

  // Initialize Results
  for (const key of Object.keys(heirs)) {
    const heir = key as Heir;
    if (present[heir] > 0) {
      results[heir] = { name: HEIR_LABELS[heir], count: present[heir], isBlocked: false };
    }
  }

  // Boolean Flags for Logic
  const sonExists = present.son > 0;
  const daughterExists = present.daughter > 0;
  const fatherExists = present.father > 0;
  const grandfatherExists = present.grandfather > 0;
  const grandsonExists = present.grandson > 0;
  const granddaughterExists = present.granddaughter > 0;
  const fullBrotherExists = present.fullBrother > 0;
  const fullSisterExists = present.fullSister > 0;
  const paternalBrotherExists = present.paternalBrother > 0;
  const paternalSisterExists = present.paternalSister > 0;
  const maleDescendantExists = sonExists || grandsonExists;
  const femaleDescendantExists = daughterExists || granddaughterExists;

  // Complex Condition Checks
  const isGrandfatherWithSiblings = grandfatherExists && !fatherExists && !maleDescendantExists && (fullBrotherExists || fullSisterExists || paternalBrotherExists || paternalSisterExists);
  const isAkdariyyah = present.husband === 1 && present.mother === 1 && present.grandfather === 1 && present.fullSister === 1 &&
                       !sonExists && !daughterExists && !grandsonExists && !granddaughterExists && !fatherExists && !fullBrotherExists && totalHeirsCount === 4;
  
  const originalSiblingsCount = heirs.fullBrother + heirs.fullSister + heirs.paternalBrother + heirs.paternalSister + heirs.maternalBrother + heirs.maternalSister;
  
  // KHI Note
  if (sonExists && (grandsonExists || granddaughterExists)) {
     notes.push("INFO KHI: Cucu yang orang tuanya meninggal lebih dulu bisa menjadi 'Ahli Waris Pengganti' (Pasal 185 KHI).");
  }

  // 1. Hajb Rules
  applyHajbRules(present, results, { isAkdariyyah });

  let finalDenominator = 1;
  let aslAlMasalah = 1;
  let totalSharesNum = 0;
  const finalSiham: { [key in Heir]?: number } = {};

  // 2. Calculate Shares & Resolve
  if (isAkdariyyah) {
    const akdariyyahResult = resolveAkdariyyah(shares, results, notes);
    Object.assign(finalSiham, akdariyyahResult.finalSiham);
    finalDenominator = akdariyyahResult.finalDenominator;
    totalSharesNum = 9; 
    aslAlMasalah = 6; 
  } else {
    calculateFurudhShares(present, results, shares, notes, { isGrandfatherWithSiblings }, originalSiblingsCount);
    
    const flags = { sonExists, daughterExists, grandsonExists, granddaughterExists, fatherExists, grandfatherExists, maleDescendantExists, femaleDescendantExists, fullBrotherExists, fullSisterExists, paternalBrotherExists, paternalSisterExists, isGrandfatherWithSiblings };
    const ashabahHeirs = determineAshabah(present, results, flags);
    
    // Handle Grandfather + Siblings (Muqasamah vs 1/3)
    if (isGrandfatherWithSiblings) {
      const furudhTotalWithoutSpouse = Object.keys(shares).filter(h => h !== 'husband' && h !== 'wife').reduce((sh, h) => addShares(sh, shares[h as Heir]!), {numerator:0, denominator:1, type:'furudh'} as Share);
      const remainingShare = {numerator: furudhTotalWithoutSpouse.denominator - furudhTotalWithoutSpouse.numerator, denominator: furudhTotalWithoutSpouse.denominator};
      const competingSiblings = (present.fullBrother > 0 || present.fullSister > 0) ? { b: present.fullBrother, s: present.fullSister } : { b: present.paternalBrother, s: present.paternalSister };
      const totalHeads = 2 + (competingSiblings.b * 2) + competingSiblings.s;
      const muqasamahValue = (remainingShare.numerator / remainingShare.denominator) * (2 / totalHeads);
      
      // Decision: Muqasamah vs 1/3 Sisa vs 1/6 Total
      if (muqasamahValue >= (1/6) && muqasamahValue >= ((remainingShare.numerator/remainingShare.denominator)/3)) {
          ashabahHeirs.push({heir: HeirEnum.Grandfather, ratio: 2});
          if (present.fullBrother > 0 || present.fullSister > 0) {
             if (present.fullBrother > 0) ashabahHeirs.push({heir: HeirEnum.FullBrother, ratio: 2 * present.fullBrother});
             if (present.fullSister > 0) ashabahHeirs.push({heir: HeirEnum.FullSister, ratio: 1 * present.fullSister});
          } else {
             if (present.paternalBrother > 0) ashabahHeirs.push({heir: HeirEnum.PaternalBrother, ratio: 2 * present.paternalBrother});
             if (present.paternalSister > 0) ashabahHeirs.push({heir: HeirEnum.PaternalSister, ratio: 1 * present.paternalSister});
          }
          results.grandfather!.reason = `Muqasamah (Berbagi sisa dengan saudara).`;
          results.grandfather!.evidence = LEGAL_BASIS.IJMA;
      } else {
          shares.grandfather = addShares(shares.grandfather || {numerator:0, denominator:1, type:'furudh'}, {numerator:1, denominator:6, type:'furudh'});
          results.grandfather!.reason = `Bagian terbaik (minimal 1/6).`;
          if (present.fullBrother > 0) ashabahHeirs.push({heir: HeirEnum.FullBrother, ratio: 2 * present.fullBrother});
          else if (present.paternalBrother > 0) ashabahHeirs.push({heir: HeirEnum.PaternalBrother, ratio: 2 * present.paternalBrother});
      }
    }

    // Calculate LCM
    const furudhHeirs = Object.keys(shares).filter(h => shares[h as Heir]?.type === 'furudh') as Heir[];
    const denominators = furudhHeirs.map(h => shares[h]!.denominator);
    aslAlMasalah = denominators.length > 0 ? denominators.reduce((acc, val) => lcm(acc, val), 1) : 1;
    
    const initialSiham: { [key in Heir]?: number } = {};
    let initialSihamTotal = 0;
    furudhHeirs.forEach(h => {
        const siham = shares[h]!.numerator * (aslAlMasalah / shares[h]!.denominator);
        initialSiham[h] = siham;
        initialSihamTotal += siham;
    });

    // Final Distribution Logic
    if (ashabahHeirs.length > 0) {
        const remainingSiham = aslAlMasalah - initialSihamTotal;
        if (remainingSiham > 0) {
            const totalRatio = ashabahHeirs.reduce((sum, h) => sum + h.ratio, 0);
            finalDenominator = aslAlMasalah * totalRatio;
            totalSharesNum = finalDenominator;

            Object.keys(initialSiham).forEach(h => {
                finalSiham[h as Heir] = initialSiham[h as Heir]! * totalRatio;
            });
            
            const ashabahTotalSiham = remainingSiham * totalRatio;
            ashabahHeirs.forEach(h => {
                finalSiham[h.heir] = (finalSiham[h.heir] || 0) + (ashabahTotalSiham * h.ratio / totalRatio);
            });
        } else {
             // Ashabah gets nothing
             ashabahHeirs.forEach(h => {
                if (shares[h.heir]?.type !== 'furudh' && results[h.heir]) {
                    results[h.heir]!.isBlocked = true;
                    results[h.heir]!.reason = "Terhalang karena harta habis oleh ahli waris furudh.";
                }
            });
            // Handle Aul if needed
            if (initialSihamTotal > aslAlMasalah) {
                finalDenominator = initialSihamTotal;
                notes.push(`Kasus 'Aul: Asal masalah ${aslAlMasalah} meningkat menjadi ${finalDenominator}.`);
            } else {
                finalDenominator = aslAlMasalah;
            }
            totalSharesNum = initialSihamTotal;
            Object.assign(finalSiham, initialSiham);
        }
    } else { 
        // No Ashabah - Check for Radd or Aul
        if (initialSihamTotal > aslAlMasalah) { // 'Aul
            finalDenominator = initialSihamTotal;
            totalSharesNum = initialSihamTotal;
            Object.assign(finalSiham, initialSiham);
            notes.push(`Kasus 'Aul: Asal masalah ${aslAlMasalah} meningkat menjadi ${finalDenominator}.`);
        } else if (initialSihamTotal < aslAlMasalah && initialSihamTotal > 0) { // Radd or Sisa
            const spouse = present.husband > 0 ? HeirEnum.Husband : (present.wife > 0 ? HeirEnum.Wife : null);
            
            if (!spouse) {
                 // Classic Radd: No spouse, return to Furudh
                 // Just normalize the shares. New Denom = Total Siham.
                 finalDenominator = initialSihamTotal;
                 notes.push(`Kasus Radd: Sisa harta dikembalikan ke ahli waris furudh secara proporsional.`);
                 Object.assign(finalSiham, initialSiham);
            } else {
                 // Radd with Spouse (Complex)
                 // 1. Give Spouse their full share from Base Denominator (e.g. 1/4 of 4 = 1)
                 // 2. Remaining (3) is distributed to others.
                 // 3. Calculate Raddiyah Masalah for others.
                 // 4. Combine.
                 
                 const spouseShare = shares[spouse]!;
                 // Masalah Zaujiyyah (Spouse Problem)
                 const asalZaujiyyah = spouseShare.denominator;
                 const sihamSpouseZaujiyyah = spouseShare.numerator;
                 const sisaZaujiyyah = asalZaujiyyah - sihamSpouseZaujiyyah;

                 // Masalah Raddiyah (Others)
                 let asalRaddiyah = 0;
                 furudhHeirs.forEach(h => {
                     if (h !== spouse) {
                         asalRaddiyah += shares[h]!.numerator * (aslAlMasalah / shares[h]!.denominator); // Use normalized siham sum as denom
                     }
                 });
                 
                 // Scale factor logic can be complex, simplified approach:
                 // Multiply Zaujiyyah Denom by Raddiyah Denom (Total Siham of others)
                 // To avoid big numbers, check if sisaZaujiyyah is divisible by asalRaddiyah
                 
                 // For simplicity in this app, we treat Raddiyah Denom as the sum of basic parts (e.g. Daughter 1/2 -> 3/6, Mother 1/6 -> 1/6. Sum parts = 4)
                 // Re-calculate Raddiyah parts based on LCM 6.
                 let raddiyahPartsTotal = 0;
                 const raddiyahHeirs = furudhHeirs.filter(h => h !== spouse);
                 
                 // Temporary calculation just for Raddiyah group
                 const raddiyahDenoms = raddiyahHeirs.map(h => shares[h]!.denominator);
                 const raddiyahLCM = raddiyahDenoms.reduce((acc, val) => lcm(acc, val), 1);
                 
                 raddiyahHeirs.forEach(h => {
                     raddiyahPartsTotal += shares[h]!.numerator * (raddiyahLCM / shares[h]!.denominator);
                 });

                 // Calculate Final Multiplier
                 // Final Denom = asalZaujiyyah * raddiyahPartsTotal / gcd(sisaZaujiyyah, raddiyahPartsTotal)
                 // But simple method: Final Denom = asalZaujiyyah * raddiyahPartsTotal
                 // Then check if we can simplify.
                 
                 // Let's use cross-multiplication method
                 finalDenominator = asalZaujiyyah * raddiyahPartsTotal;
                 
                 // Spouse gets: sihamSpouse * raddiyahPartsTotal
                 finalSiham[spouse] = sihamSpouseZaujiyyah * raddiyahPartsTotal;
                 
                 // Others get: their_raddiyah_part * sisaZaujiyyah
                 raddiyahHeirs.forEach(h => {
                     const part = shares[h]!.numerator * (raddiyahLCM / shares[h]!.denominator);
                     finalSiham[h] = part * sisaZaujiyyah;
                 });
                 
                 // Simplify if possible
                 const commonDivisor = Object.values(finalSiham).reduce((acc: number, val) => gcd(acc, val), finalDenominator);
                 if (commonDivisor > 1) {
                     finalDenominator /= commonDivisor;
                     Object.keys(finalSiham).forEach(h => {
                         finalSiham[h as Heir]! /= commonDivisor;
                     });
                 }

                 notes.push("Kasus Radd: Sisa harta dikembalikan kepada ahli waris furudh selain pasangan.");
            }
            totalSharesNum = finalDenominator;
        } else { // Adil (Sum == Asal Masalah)
            finalDenominator = aslAlMasalah;
            totalSharesNum = initialSihamTotal;
            Object.assign(finalSiham, initialSiham);
        }
    }
  }
  
  // 3. Formatting Output
  const isAulCase = notes.some(note => note.includes("'Aul"));
  const isRaddCase = notes.some(note => note.includes("Kasus Radd")); // Specific string match
  const finalResults: HeirResult[] = [];

  for (const key of Object.keys(results)) {
    const heir = key as Heir;
    const res = results[heir]!;
    const siham = finalSiham[heir];
    let finalEvidence = res.evidence || (res.isBlocked ? LEGAL_BASIS.HADITH_NEAREST_MALE : QURAN_REFS.AN_NISA_11);

    if (siham && siham > 0 && finalDenominator > 0 && !res.isBlocked) {
        const finalShare: Share = { numerator: Math.round(siham), denominator: finalDenominator, type: shares[heir]?.type || 'none' };
        let finalReason = res.reason || '';
        
        // Clarify Adjustments for Aul/Radd in the reason
        if (shares[heir]?.type === 'furudh' && (isAulCase || isRaddCase)) {
             if (!finalReason.includes("Disesuaikan")) {
                finalReason = `${finalReason} Disesuaikan karena ${isAulCase ? "'Aul" : "Radd"}.`;
             }
        }

        const percentage = (finalShare.numerator / finalShare.denominator) * 100;
        const value = estate * (finalShare.numerator / finalShare.denominator);
        
        const simpleShare = shares[heir] || {numerator: 0, denominator: 1, type: 'none'};
        finalResults.push({ ...res, reason: finalReason, share: simpleShare, finalShare, percentage, value, isBlocked: false, evidence: finalEvidence } as HeirResult);
    } else if (res.isBlocked) {
        finalResults.push({ ...res, share: {numerator:0,denominator:1,type:'none'}, finalShare: {numerator:0,denominator:1,type:'none'}, percentage: 0, value: 0, evidence: finalEvidence } as HeirResult);
    }
  }

  return {
    estate,
    heirResults: finalResults.sort((a,b) => b.value - a.value),
    aslAlMasalah,
    totalSharesNum,
    finalDenominator,
    notes,
  };
};
