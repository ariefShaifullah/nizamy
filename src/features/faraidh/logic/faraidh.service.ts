
import type { HeirInputState, CalculationResult, HeirResult, Share, Heir } from '../../../types.ts';
import { Heir as HeirEnum } from '../../../types.ts';
import { HEIR_LABELS, QURAN_REFS, LEGAL_BASIS } from '../constants.ts';
import { gcd, lcm } from '../../../utils.ts';
import { applyHajbRules } from './faraidh-hajb.ts';
import { calculateFurudhShares } from './faraidh-shares.ts';
import { resolveAkdariyyah } from './faraidh-akdariyyah.ts';
import { determineAshabah } from './faraidh-ashabah.ts';
import { resolveGrandfatherWithSiblings } from './faraidh-grandfather.ts';
import { resolveMusytarakah } from './faraidh-musytarakah.ts';
import { computeHeirFlags } from './faraidh-flags.ts';
import { distributeArham } from './faraidh-arham.ts';

type PresentHeirs = { [key in Heir]: number };
type Shares = { [key in Heir]?: Share };
type Results = { [key in Heir]?: Partial<HeirResult> };

// --- MAIN CALCULATION FUNCTION ---
export const calculateFaraidh = (
 heirs: HeirInputState,
 estate: number,
 deceasedGender?: 'male' | 'female',
 wasiat: number = 0,
 utang: number = 0,
): CalculationResult => {
 const present: PresentHeirs = { ...heirs };
 const shares: Shares = {};
 const results: Results = {};
 const notes: string[] = [];

 // --- 0-pre. WASIAT & UTANG DEDUCTION ---
 // KHI: Prioritas — (1) biaya jenazah, (2) utang, (3) wasiat.
 // Wasiat max 1/3 of estate AFTER utang deduction (Pasal 195 KHI).
 const estateAfterUtang = Math.max(0, estate - utang);
 const wasiatCap = Math.floor(estateAfterUtang / 3);
 const effectiveWasiat = Math.min(wasiat, wasiatCap);
 const netEstate = Math.max(0, estateAfterUtang - effectiveWasiat);

 if (utang > 0) {
 notes.push(`Pelunasan utang: Rp ${utang.toLocaleString('id-ID')} dikurangkan dari harta bruto.`);
 }
 if (effectiveWasiat > 0) {
 if (wasiat > wasiatCap) {
 notes.push(`Wasiat disesuaikan: Rp ${wasiat.toLocaleString('id-ID')} melebihi batas 1/3 dari sisa setelah utang (Rp ${wasiatCap.toLocaleString('id-ID')}). Wasiat efektif = Rp ${effectiveWasiat.toLocaleString('id-ID')}.`);
 } else {
 notes.push(`Wasiat: Rp ${effectiveWasiat.toLocaleString('id-ID')} dikurangkan dari sisa setelah utang.`);
 }
 }
 if (netEstate === 0 && (utang > 0 || effectiveWasiat > 0)) {
 return {
 estate,
 netEstate,
 wasiat: effectiveWasiat,
 utang,
 heirResults: [],
 aslAlMasalah: 0,
 totalSharesNum: 0,
 finalDenominator: 0,
 notes: [...notes, "Harta bersih setelah wasiat & utang = Rp 0. Tidak ada harta untuk dibagikan."],
 };
 }

 // --- 0a. SPOUSE EXCLUSIVITY GUARD ---
 // Islamically, a deceased can only have Husband OR Wife, never both.
 // If both are present (e.g. via URL params), auto-resolve based on deceasedGender.
 if (present.husband > 0 && present.wife > 0) {
  if (deceasedGender === 'female') {
  // Deceased is female → she has a Husband; Wife is impossible
  present.wife = 0;
  notes.push("Koreksi otomatis: Suami dan Istri tidak mungkin ada bersamaan. Karena almarhumah perempuan, Suami dipertahankan dan Istri dihapus.");
  } else if (deceasedGender === 'male') {
  // Deceased is male → he has Wives; Husband is impossible
  present.husband = 0;
  notes.push("Koreksi otomatis: Suami dan Istri tidak mungkin ada bersamaan. Karena almarhum laki-laki, Istri dipertahankan dan Suami dihapus.");
  } else {
  // No gender info — default: keep wife (assume male deceased), remove husband
  present.husband = 0;
  notes.push("Koreksi otomatis: Suami dan Istri tidak mungkin ada bersamaan. Jenis kelamin almarhum tidak disebutkan — Istri dipertahankan secara default.");
  }
 }

  // --- 0. ZERO HEIRS CHECK ---
  const totalHeirsCount = Object.values(present).reduce((a, b) => a + b, 0);
  if (totalHeirsCount === 0) {
      return {
      estate,
      netEstate: estate,
      wasiat: 0,
      utang: 0,
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

  // Boolean Flags for Logic (centralized in faraidh-flags.ts)
  const flags = computeHeirFlags(present);
  const {
    sonExists, daughterExists, fatherExists, grandfatherExists,
    grandsonExists, granddaughterExists, fullBrotherExists, fullSisterExists,
    paternalBrotherExists, paternalSisterExists,
    maleDescendantExists, femaleDescendantExists,
    isGrandfatherWithSiblings, isAkdariyyah,
  } = flags;
  const descendantExists = flags.descendantExists;
  
  const originalSiblingsCount = heirs.fullBrother + heirs.fullSister + heirs.paternalBrother + heirs.paternalSister + heirs.maternalBrother + heirs.maternalSister;
  
  // KHI Note
  if (sonExists && (grandsonExists || granddaughterExists)) {
     notes.push("INFO KHI: Cucu yang orang tuanya meninggal lebih dulu bisa menjadi 'Ahli Waris Pengganti' (Pasal 185 KHI).");
  }

  // 1. Hajb Rules (pure — returns new objects, does not mutate inputs)
  const hajbResult = applyHajbRules(present, results, { isAkdariyyah });
  // Reassign to post-hajb state (present is declared with const, so we use Object.assign)
  Object.assign(present, hajbResult.present);
  Object.assign(results, hajbResult.results);

  let finalDenominator = 1;
  let aslAlMasalah = 1;
  let totalSharesNum = 0;
  const finalSiham: { [key in Heir]?: number } = {};
  const combinedHeirs = new Set<Heir>(); // Hoisted: heirs with both Furudh + Ashabah shares

  // 2. Calculate Shares & Resolve
  if (isAkdariyyah) {
    const akdariyyahResult = resolveAkdariyyah(shares, results, notes);
    Object.assign(finalSiham, akdariyyahResult.finalSiham);
    finalDenominator = akdariyyahResult.finalDenominator;
    totalSharesNum = 9; 
    aslAlMasalah = 6;
  } else {
    calculateFurudhShares(present, results, shares, notes, { isGrandfatherWithSiblings }, originalSiblingsCount);
    
    const ashabahFlags = { 
    ...flags,
    maternalBrother: present.maternalBrother,
    maternalSister: present.maternalSister
    };
    
    const ashabahHeirs = determineAshabah(present, results, ashabahFlags, shares);
 
    if (isGrandfatherWithSiblings) {
    resolveGrandfatherWithSiblings(present, shares, results, ashabahHeirs);
    }

    // Al-Musytarakah check: if Full Siblings + Maternal Siblings coexist with no residue
    const isMusytarakah = (present.fullBrother > 0 || present.fullSister > 0) &&
    (present.maternalBrother > 0 || present.maternalSister > 0) &&
    !fatherExists && !maleDescendantExists;
 
    if (isMusytarakah) {
    const musytarakahApplied = resolveMusytarakah(present, shares, results, notes);
    if (musytarakahApplied) {
    // Musytarakah applies — Full siblings share in maternal 1/3
    // Remove full siblings from ashabahHeirs (they get Musytarakah shares, not Ashabah)
    for (let i = ashabahHeirs.length - 1; i >= 0; i--) {
    if (ashabahHeirs[i].heir === HeirEnum.FullBrother || ashabahHeirs[i].heir === HeirEnum.FullSister) {
    ashabahHeirs.splice(i, 1);
    }
    }
    }
    }

    // Calculate LCM (include musytarakah shares alongside furudh)
    const furudhHeirs = Object.keys(shares).filter(h => {
    const t = shares[h as Heir]?.type;
    return t === 'furudh' || t === 'musytarakah';
    }) as Heir[];
    const denominators = furudhHeirs.map(h => shares[h]!.denominator);
    aslAlMasalah = denominators.length > 0 ? denominators.reduce((acc, val) => lcm(acc, val), 1) : 1;
    
    const initialSiham: { [key in Heir]?: number } = {};
    let initialSihamTotal = 0;
    furudhHeirs.forEach(h => {
    const siham = shares[h]!.numerator * (aslAlMasalah / shares[h]!.denominator);
    initialSiham[h] = siham;
    initialSihamTotal += siham;
    });

    // --- Detect heirs with combined Furudh+Ashabah share (e.g. Father: 1/6 + sisa) ---
    ashabahHeirs.forEach(a => {
    if (shares[a.heir]?.type === 'furudh') {
    combinedHeirs.add(a.heir);
    shares[a.heir]!.type = 'combined';
    }
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
             // Don't block combined heirs — their Furudh portion is still valid even if Ashabah gets nothing
             if (shares[h.heir]?.type !== 'furudh' && shares[h.heir]?.type !== 'combined' && results[h.heir]) {
             results[h.heir]!.isBlocked = true;
             results[h.heir]!.reason = "Terhalang karena harta habis oleh ahli waris furudh.";
             }
             });
             // For combined heirs with no sisa, revert type to 'furudh' since they only get their Furudh share
             combinedHeirs.forEach(heir => {
             if (shares[heir]?.type === 'combined') {
             shares[heir]!.type = 'furudh';
             if (results[heir]) {
             results[heir]!.reason = `Mendapat 1/6 Furudh saja (tidak ada sisa untuk Ashabah).`;
             }
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
        } // end else (isAkdariyyah)

        // Simplify siham/finalDenominator (runs once for ALL branches)
        const simplifySiham = (siham: { [key in Heir]?: number }, denom: number): { siham: { [key in Heir]?: number }; denominator: number } => {
        const vals = Object.values(siham).filter((v): v is number => v !== undefined && v !== 0);
   if (vals.length === 0 || denom === 0) return { siham, denominator: denom };
   const commonDivisor = vals.reduce((acc, val) => gcd(acc, val), denom);
   if (commonDivisor > 1) {
     const simplified = { ...siham };
     for (const key of Object.keys(simplified) as Heir[]) {
       if (simplified[key] !== undefined) simplified[key] = simplified[key]! / commonDivisor;
     }
     return { siham: simplified, denominator: denom / commonDivisor };
   }
   return { siham, denominator: denom };
 };
 const simplified = simplifySiham(finalSiham, finalDenominator);
 Object.assign(finalSiham, simplified.siham);
 finalDenominator = simplified.denominator;

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
    let furudhShare: Share | undefined = undefined;
 
    if (shares[heir]?.type === 'combined' && combinedHeirs.has(heir)) {
    // Store the original Furudh portion so UI can show "1/6 + sisa"
    furudhShare = { ...shares[heir]!, type: 'furudh' };
    if (!finalReason.includes('1/6 + sisa') && !finalReason.includes('Furudh + Ashabah')) {
    finalReason = `1/6 Furudh + sisa Ashabah. ${finalReason}`;
    }
    } else if (shares[heir]?.type === 'furudh' && (isAulCase || isRaddCase)) {
    if (!finalReason.includes("Disesuaikan")) {
    finalReason = `${finalReason} Disesuaikan karena ${isAulCase ? "'Aul" : "Radd"}.`;
    }
    }

    const percentage = (finalShare.numerator / finalShare.denominator) * 100;
    const value = netEstate * (finalShare.numerator / finalShare.denominator);
 
    const simpleShare = shares[heir] || {numerator: 0, denominator: 1, type: 'none'};
    finalResults.push({ ...res, reason: finalReason, furudhShare, share: simpleShare, finalShare, percentage, value, isBlocked: false, evidence: finalEvidence } as HeirResult);
    } else if (res.isBlocked) {
    finalResults.push({ ...res, share: {numerator:0,denominator:1,type:'none'}, finalShare: {numerator:0,denominator:1,type:'none'}, percentage: 0, value: 0, evidence: finalEvidence } as HeirResult);
    }
    }

    // ============================================
    // DZAWIL ARHAM DISTRIBUTION
    // Arham inherit the remainder after spouse's furudh
    // when no ashhab al-furudh (except spouse) and no ashabah exist.
    // KHI Pasal 174-193.
    //
    // BUG FIX: We no longer rely solely on isArhamOnlyScenario (structural flag)
    // because it misses sisters who inherit as furudh (Kalalah case).
    // Instead we also verify that no non-spouse heir received a share
    // in the furudh/ashabah distribution above.
    // ============================================
    const hasNonSpouseShares = finalResults.some(r =>
      !r.isBlocked && r.value > 0 &&
      r.name !== HEIR_LABELS[HeirEnum.Husband] &&
      r.name !== HEIR_LABELS[HeirEnum.Wife]
    );
    const shouldDistributeArham = flags.arhamExists && flags.isArhamOnlyScenario && !hasNonSpouseShares;

    if (shouldDistributeArham) {
     let spouseShareValue = 0;
     const arhamSpouse = present.husband > 0 ? HeirEnum.Husband : (present.wife > 0 ? HeirEnum.Wife : null);
     if (arhamSpouse && shares[arhamSpouse]) {
     spouseShareValue = Math.floor(netEstate * (shares[arhamSpouse]!.numerator / shares[arhamSpouse]!.denominator));
     }

     const arhamResult = distributeArham(present, flags, netEstate, spouseShareValue);

     arhamResult.notes.forEach(n => notes.push(n));

    for (const arhamHeir of arhamResult.heirResults) {
    if (arhamHeir.isBlocked) {
    finalResults.push({
    name: arhamHeir.name!,
    isBlocked: true,
    reason: arhamHeir.reason || "Terhalang oleh ahli waris yang lebih dekat.",
    evidence: arhamHeir.evidence || LEGAL_BASIS.HADITH_NEAREST_MALE,
    share: { numerator: 0, denominator: 1, type: 'arham' },
    finalShare: { numerator: 0, denominator: 1, type: 'arham' },
    value: 0,
    percentage: 0,
    count: arhamHeir.count,
    } as HeirResult);
    } else if (!arhamHeir.isBlocked) {
    finalResults.push({
    name: arhamHeir.name!,
    isBlocked: false,
    reason: arhamHeir.reason || "Dzawil Arham",
    evidence: arhamHeir.evidence || "KHI Pasal 174-193",
    share: arhamHeir.share ?? { numerator: 0, denominator: 1, type: 'arham' },
    finalShare: arhamHeir.finalShare ?? { numerator: 0, denominator: 1, type: 'arham' },
    value: arhamHeir.value ?? 0,
    percentage: arhamHeir.percentage ?? 0,
    count: arhamHeir.count,
    } as HeirResult);
    }
    }
    }

    return {
  estate,
  netEstate,
  wasiat: effectiveWasiat,
  utang,
  heirResults: finalResults.sort((a,b) => b.value - a.value),
  aslAlMasalah,
  totalSharesNum,
  finalDenominator,
  notes,
  };
};
