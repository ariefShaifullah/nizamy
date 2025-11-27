
import type { HeirInputState, CalculationResult, HeirResult, Share, Heir } from '../../../types.ts';
import { Heir as HeirEnum } from '../../../types.ts';
import { HEIR_LABELS, QURAN_REFS, LEGAL_BASIS } from '../constants.ts';
import { gcd, lcm } from '../../../utils.ts';
import { applyHajbRules } from './faraidh-hajb.ts';
import { calculateFurudhShares } from './faraidh-shares.ts';
import { resolveAkdariyyah } from './faraidh-akdariyyah.ts';
import { determineAshabah } from './faraidh-ashabah.ts';
import { resolveGrandfatherWithSiblings } from './faraidh-grandfather.ts';

type PresentHeirs = { [key in Heir]: number };
type Shares = { [key in Heir]?: Share };
type Results = { [key in Heir]?: Partial<HeirResult> };

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
    
    const flags = { 
        sonExists, daughterExists, grandsonExists, granddaughterExists, 
        fatherExists, grandfatherExists, maleDescendantExists, femaleDescendantExists, 
        fullBrotherExists, fullSisterExists, paternalBrotherExists, paternalSisterExists, 
        isGrandfatherWithSiblings,
        maternalBrother: present.maternalBrother,
        maternalSister: present.maternalSister
    };
    
    const ashabahHeirs = determineAshabah(present, results, flags);
    
    if (isGrandfatherWithSiblings) {
        resolveGrandfatherWithSiblings(present, shares, results, ashabahHeirs);
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
                 finalDenominator = initialSihamTotal;
                 notes.push(`Kasus Radd: Sisa harta dikembalikan ke ahli waris furudh secara proporsional.`);
                 Object.assign(finalSiham, initialSiham);
            } else {
                 // Radd with Spouse
                 const raddiyahHeirs = furudhHeirs.filter(h => h !== spouse);
                 
                 if (raddiyahHeirs.length === 0) {
                     // SPECIAL CASE: Only Spouse exists.
                     finalDenominator = aslAlMasalah;
                     totalSharesNum = initialSihamTotal;
                     Object.assign(finalSiham, initialSiham);
                     notes.push("Sisa harta setelah bagian Suami/Istri diserahkan ke Baitul Mal (menurut Jumhur Ulama).");
                 } else {
                     const spouseShare = shares[spouse]!;
                     const asalZaujiyyah = spouseShare.denominator;
                     const sihamSpouseZaujiyyah = spouseShare.numerator;
                     const sisaZaujiyyah = asalZaujiyyah - sihamSpouseZaujiyyah;

                     let raddiyahPartsTotal = 0;
                     const raddiyahDenoms = raddiyahHeirs.map(h => shares[h]!.denominator);
                     const raddiyahLCM = raddiyahDenoms.reduce((acc, val) => lcm(acc, val), 1);
                     
                     raddiyahHeirs.forEach(h => {
                         raddiyahPartsTotal += shares[h]!.numerator * (raddiyahLCM / shares[h]!.denominator);
                     });

                     finalDenominator = asalZaujiyyah * raddiyahPartsTotal;
                     
                     finalSiham[spouse] = sihamSpouseZaujiyyah * raddiyahPartsTotal;
                     
                     raddiyahHeirs.forEach(h => {
                         const part = shares[h]!.numerator * (raddiyahLCM / shares[h]!.denominator);
                         finalSiham[h] = part * sisaZaujiyyah;
                     });
                     
                     // Simplify
                     const commonDivisor = Object.values(finalSiham).reduce((acc: number, val) => gcd(acc, val), finalDenominator);
                     if (commonDivisor > 1) {
                         finalDenominator /= commonDivisor;
                         Object.keys(finalSiham).forEach(h => {
                             finalSiham[h as Heir]! /= commonDivisor;
                         });
                     }

                     notes.push("Kasus Radd: Sisa harta dikembalikan kepada ahli waris furudh selain pasangan.");
                     totalSharesNum = finalDenominator;
                 }
            }
        } else { // Adil
            finalDenominator = aslAlMasalah;
            totalSharesNum = initialSihamTotal;
            Object.assign(finalSiham, initialSiham);
        }
    }
  }
  
  // 3. Formatting Output
  const isAulCase = notes.some(note => note.includes("'Aul"));
  const isRaddCase = notes.some(note => note.includes("Kasus Radd"));
  const finalResults: HeirResult[] = [];

  for (const key of Object.keys(results)) {
    const heir = key as Heir;
    const res = results[heir]!;
    const siham = finalSiham[heir];
    let finalEvidence = res.evidence || (res.isBlocked ? LEGAL_BASIS.HADITH_NEAREST_MALE : QURAN_REFS.AN_NISA_11);

    if (siham && siham > 0 && finalDenominator > 0 && !res.isBlocked) {
        const finalShare: Share = { numerator: Math.round(siham), denominator: finalDenominator, type: shares[heir]?.type || 'none' };
        let finalReason = res.reason || '';
        
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
