
import type { HeirResult } from '../../../types.ts';
import { Heir } from '../../../types.ts';
import { QURAN_REFS, LEGAL_BASIS } from '../constants.ts';
import { computeHeirFlags, type HeirFlags } from './faraidh-flags.ts';

type PresentHeirs = { [key in Heir]: number };
type Results = { [key in Heir]?: Partial<HeirResult> };

export interface HajbResult {
  present: PresentHeirs;
  results: Results;
}

/**
 * Pure function: applies hajb (blocking) rules to determine which heirs
 * are blocked by closer relatives. Returns NEW cloned objects — does not
 * mutate the inputs.
 *
 * Uses centralized HeirFlags from faraidh-flags.ts.
 */
export function applyHajbRules(
  presentInput: PresentHeirs,
  resultsInput: Results,
  specialCases: { isAkdariyyah: boolean }
): HajbResult {
  // Deep clone inputs — never mutate
  const present = { ...presentInput };
  const results: Results = {};
  for (const key of Object.keys(resultsInput) as Heir[]) {
    results[key] = { ...resultsInput[key]! };
  }

  // Use centralized flags
  const flags = computeHeirFlags(presentInput);

  // Helper: block an heir
  const block = (heir: Heir, reason: string, evidence: string) => {
    present[heir] = 0;
    if (results[heir]) {
      results[heir]!.isBlocked = true;
      results[heir]!.reason = reason;
      results[heir]!.evidence = evidence;
    }
  };

  // Level 1 Hajb: Son blocks grandchildren
  if (flags.sonExists) {
    if (flags.grandsonExists) block(Heir.Grandson, "Terhalang (hajb) oleh Anak Laki-laki.", LEGAL_BASIS.HADITH_NEAREST_MALE);
    if (flags.granddaughterExists) block(Heir.Granddaughter, "Terhalang (hajb) oleh Anak Laki-laki.", LEGAL_BASIS.HADITH_NEAREST_MALE);
  }

  // Father blocks Grandfather
  if (flags.fatherExists && flags.grandfatherExists) {
    block(Heir.Grandfather, "Terhalang (hajb) oleh Ayah.", LEGAL_BASIS.IJMA);
  }

  // In Grandfather+Full Sibling cases, full siblings block paternal ones
  if (flags.grandfatherExists && (flags.fullBrotherExists || flags.fullSisterExists)) {
    const reason = "Terhalang (hajb) oleh Saudara Kandung (laki-laki/perempuan), KHI Pasal 175.";
    const evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
    if (flags.paternalBrotherExists) block(Heir.PaternalBrother, reason, evidence);
    if (flags.paternalSisterExists) block(Heir.PaternalSister, reason, evidence);
  }

  // Level 2 Hajb: Siblings blocked by Roots or Branches
  if (flags.maleDescendantExists || flags.fatherExists) {
    const reason = "Terhalang (hajb) oleh Anak/Cucu Laki-laki atau Ayah.";
    const evidence = QURAN_REFS.AN_NISA_176;

    if (flags.fullBrotherExists) block(Heir.FullBrother, reason, evidence);
    if (flags.fullSisterExists && !specialCases.isAkdariyyah) block(Heir.FullSister, reason, evidence);
  }

  if (flags.maleDescendantExists || flags.fatherExists || flags.fullBrotherExists || (flags.fullSisterExists && flags.femaleDescendantExists)) {
    const reason = "Terhalang (hajb) oleh Anak/Cucu Laki-laki, Ayah, atau Saudara Kandung (An-Nisa 176).";
    let evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
    if (flags.maleDescendantExists || flags.fatherExists) {
      evidence = QURAN_REFS.AN_NISA_176;
    }

    if (flags.paternalBrotherExists) block(Heir.PaternalBrother, reason, evidence);
    if (flags.paternalSisterExists) block(Heir.PaternalSister, reason, evidence);
  }

  // BLOCKING BY SIBLINGS
  if (flags.fullBrotherExists) {
    const evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
    if (flags.paternalBrotherExists) block(Heir.PaternalBrother, "Terhalang (hajb) oleh Saudara Laki-laki Kandung.", evidence);
    if (flags.paternalSisterExists) block(Heir.PaternalSister, "Terhalang (hajb) oleh Saudara Laki-laki Kandung.", evidence);
  } else if (presentInput.fullSister >= 2) {
    // Two Full Sisters consume the 2/3 share. Paternal sisters get nothing unless they have a brother.
    if (flags.paternalSisterExists && !flags.paternalBrotherExists) {
      block(Heir.PaternalSister, "Terhalang (hajb) oleh 2 Saudari Kandung yang mengambil 2/3 bagian, kecuali ada Saudara Seayah (An-Nisa 176).", QURAN_REFS.AN_NISA_176);
    }
  }

  // Maternal siblings blocked by descendants or male ascendants
  if (flags.descendantExists || flags.ascendantMaleExists) {
    const reason = "Terhalang (hajb) oleh keturunan (far') atau ayah/kakek (ashl laki-laki).";
    const evidence = QURAN_REFS.AN_NISA_12;

    if (presentInput.maternalBrother > 0) block(Heir.MaternalBrother, reason, evidence);
    if (presentInput.maternalSister > 0) block(Heir.MaternalSister, reason, evidence);
  }

  // Hajb for Grandmothers
  if (presentInput.mother > 0) {
  if (presentInput.maternalGrandmother > 0) block(Heir.MaternalGrandmother, "Terhalang (hajb) oleh Ibu.", LEGAL_BASIS.HADITH_GRANDMOTHER);
  if (presentInput.paternalGrandmother > 0) block(Heir.PaternalGrandmother, "Terhalang (hajb) oleh Ibu.", LEGAL_BASIS.HADITH_GRANDMOTHER);
  } else {
  if (flags.fatherExists) {
  if (presentInput.paternalGrandmother > 0) block(Heir.PaternalGrandmother, "Terhalang (hajb) oleh Ayah.", LEGAL_BASIS.IJMA);
  } else if (flags.grandfatherExists) {
  if (presentInput.paternalGrandmother > 0) block(Heir.PaternalGrandmother, "Terhalang (hajb) oleh Kakek (sebagai pengganti Ayah).", LEGAL_BASIS.IJMA);
  }
  }

  // ============================================
  // HAJB FOR DZAWIL ARHAM (Kerabat Jauh)
  // Per KHI Pasal 174-193, arham are blocked by
  // all ashhab al-furudh and ashabah.
  // ============================================

  const arhamBlockedByRootOrBranch = "Terhalang (hajb) oleh ahli waris ashl (ayah/kakek) atau far' (anak/cucu) yang lebih dekat, KHI Pasal 174.";
  const arhamBlockedBySibling = "Terhalang (hajb) oleh saudara (kandung/seayah) yang lebih dekat, KHI Pasal 174.";
  const arhamBlockedByCloserArham = "Terhalang (hajb) oleh kerabat jauh (dzawil arham) yang lebih dekat, KHI Pasal 174.";

  // --- Tier 1: Daughter's children (cucu dari anak perempuan) ---
  // Blocked by: son, grandson, daughter, granddaughter (any closer descendant)
  if (flags.descendantExists) {
  if (flags.daughterSonExists) block(Heir.DaughterSon, arhamBlockedByRootOrBranch, LEGAL_BASIS.HADITH_NEAREST_MALE);
  if (flags.daughterDaughterExists) block(Heir.DaughterDaughter, arhamBlockedByRootOrBranch, LEGAL_BASIS.HADITH_NEAREST_MALE);
  }
  // Also blocked by: father, grandfather (male ascendants)
  if (flags.ascendantMaleExists) {
  if (present[Heir.DaughterSon] > 0) block(Heir.DaughterSon, arhamBlockedByRootOrBranch, LEGAL_BASIS.HADITH_NEAREST_MALE);
  if (present[Heir.DaughterDaughter] > 0) block(Heir.DaughterDaughter, arhamBlockedByRootOrBranch, LEGAL_BASIS.HADITH_NEAREST_MALE);
  }

  // --- Tier 2: Children of siblings — DZAWIL ARHAM only (female line) ---
  // Blocked by: any descendant, father, grandfather, full brother, full sister (as ashabah), paternal brother
  // NOTE: FullBrotherSon and PaternalBrotherSon are ASHABAH (KHI Pasal 175), handled separately below.
  if (flags.descendantExists || flags.ascendantMaleExists ||
  flags.fullBrotherExists || flags.paternalBrotherExists) {
  if (flags.fullSisterSonExists) block(Heir.FullSisterSon, arhamBlockedBySibling, LEGAL_BASIS.HADITH_NEAREST_MALE);
  if (flags.fullBrotherDaughterExists) block(Heir.FullBrotherDaughter, arhamBlockedBySibling, LEGAL_BASIS.HADITH_NEAREST_MALE);
  if (flags.paternalBrotherDaughterExists) block(Heir.PaternalBrotherDaughter, arhamBlockedBySibling, LEGAL_BASIS.HADITH_NEAREST_MALE);
  }
  // Full sister as ashabah also blocks sibling's female children
  if (flags.fullSisterExists && (flags.femaleDescendantExists || flags.ascendantMaleExists)) {
  if (present[Heir.FullSisterSon] > 0) block(Heir.FullSisterSon, arhamBlockedBySibling, LEGAL_BASIS.HADITH_NEAREST_MALE);
  if (present[Heir.FullBrotherDaughter] > 0) block(Heir.FullBrotherDaughter, arhamBlockedBySibling, LEGAL_BASIS.HADITH_NEAREST_MALE);
  if (present[Heir.PaternalBrotherDaughter] > 0) block(Heir.PaternalBrotherDaughter, arhamBlockedBySibling, LEGAL_BASIS.HADITH_NEAREST_MALE);
  }
  // Extended ashabah (FullBrotherSon, PaternalBrotherSon) also block arham in tier 2
  if (flags.fullBrotherSonExists || flags.paternalBrotherSonExists) {
  if (present[Heir.FullSisterSon] > 0) block(Heir.FullSisterSon, arhamBlockedBySibling, LEGAL_BASIS.HADITH_NEAREST_MALE);
  if (present[Heir.FullBrotherDaughter] > 0) block(Heir.FullBrotherDaughter, arhamBlockedBySibling, LEGAL_BASIS.HADITH_NEAREST_MALE);
  if (present[Heir.PaternalBrotherDaughter] > 0) block(Heir.PaternalBrotherDaughter, arhamBlockedBySibling, LEGAL_BASIS.HADITH_NEAREST_MALE);
  }

  // --- Tier 3 (arham): Aunts (bibi) and maternal uncle ---
  // NOTE: PaternalUncleFull/PaternalUnclePaternal are ASHABAH (KHI Pasal 175), handled separately below.
  const arhamBlockedByFatherOrBrother = "Terhalang (hajb) oleh Ayah atau Saudara Laki-laki (kandung/seayah), KHI Pasal 174.";
  const arhamBlockedByUncle = "Terhalang (hajb) oleh Paman (ashabah) yang lebih dekat, KHI Pasal 175.";

  // PaternalAunt: blocked by father, full brother, paternal brother
  if (flags.fatherExists || flags.fullBrotherExists || flags.paternalBrotherExists) {
  if (flags.paternalAuntExists) block(Heir.PaternalAunt, arhamBlockedByFatherOrBrother, LEGAL_BASIS.HADITH_NEAREST_MALE);
  if (flags.paternalAuntPaternalExists) block(Heir.PaternalAuntPaternal, arhamBlockedByFatherOrBrother, LEGAL_BASIS.HADITH_NEAREST_MALE);
  }
  // PaternalAuntPaternal: also blocked by paternal aunt herself (closer)
  if (present[Heir.PaternalAunt] > 0 && flags.paternalAuntPaternalExists) {
  block(Heir.PaternalAuntPaternal, "Terhalang (hajb) oleh Bibi Kandung (kerabat jauh yang lebih dekat), KHI Pasal 174.", LEGAL_BASIS.HADITH_NEAREST_MALE);
  }
  // Also blocked by descendants and grandfather
  if (flags.descendantExists || flags.grandfatherExists) {
  if (present[Heir.PaternalAunt] > 0) block(Heir.PaternalAunt, arhamBlockedByRootOrBranch, LEGAL_BASIS.HADITH_NEAREST_MALE);
  if (present[Heir.PaternalAuntPaternal] > 0) block(Heir.PaternalAuntPaternal, arhamBlockedByRootOrBranch, LEGAL_BASIS.HADITH_NEAREST_MALE);
  }
  // Paternal uncles (ashabah) also block arham aunts
  if (flags.paternalUncleFullExists || flags.paternalUnclePaternalExists) {
  if (present[Heir.PaternalAunt] > 0) block(Heir.PaternalAunt, arhamBlockedByUncle, LEGAL_BASIS.HADITH_NEAREST_MALE);
  if (present[Heir.PaternalAuntPaternal] > 0) block(Heir.PaternalAuntPaternal, arhamBlockedByUncle, LEGAL_BASIS.HADITH_NEAREST_MALE);
  }
  // Full sister and paternal sister (ashabah bil ghairi / furudh) block arham aunts
  // KHI Pasal 175: siblings are closer in nasab than paternal aunts
  const arhamBlockedBySister = "Terhalang (hajb) oleh Saudara Perempuan (ashabah/furudh) yang lebih dekat, KHI Pasal 175.";
  if (flags.fullSisterExists || flags.paternalSisterExists) {
  if (present[Heir.PaternalAunt] > 0) block(Heir.PaternalAunt, arhamBlockedBySister, LEGAL_BASIS.HADITH_NEAREST_MALE);
  if (present[Heir.PaternalAuntPaternal] > 0) block(Heir.PaternalAuntPaternal, arhamBlockedBySister, LEGAL_BASIS.HADITH_NEAREST_MALE);
  }
  // MaternalAunt: blocked by mother
  if (presentInput.mother > 0 && flags.maternalAuntExists) {
  block(Heir.MaternalAunt, "Terhalang (hajb) oleh Ibu.", LEGAL_BASIS.HADITH_NEAREST_MALE);
  }
  // MaternalUncle: blocked by mother, maternal aunt
  if (presentInput.mother > 0 && flags.maternalUncleExists) {
  block(Heir.MaternalUncle, "Terhalang (hajb) oleh Ibu.", LEGAL_BASIS.HADITH_NEAREST_MALE);
  }
  if (present[Heir.MaternalAunt] > 0 && flags.maternalUncleExists) {
  block(Heir.MaternalUncle, arhamBlockedByCloserArham, LEGAL_BASIS.HADITH_NEAREST_MALE);
  }
  // Also blocked by any descendant or male ascendant
  if (flags.descendantExists || flags.ascendantMaleExists) {
  if (present[Heir.MaternalAunt] > 0) block(Heir.MaternalAunt, arhamBlockedByRootOrBranch, LEGAL_BASIS.HADITH_NEAREST_MALE);
  if (present[Heir.MaternalUncle] > 0) block(Heir.MaternalUncle, arhamBlockedByRootOrBranch, LEGAL_BASIS.HADITH_NEAREST_MALE);
  }
  // Sibling ashabah blocks maternal aunt/uncle
   if (flags.fullBrotherExists || flags.paternalBrotherExists) {
     if (present[Heir.MaternalAunt] > 0) block(Heir.MaternalAunt, arhamBlockedBySibling, LEGAL_BASIS.HADITH_NEAREST_MALE);
     if (present[Heir.MaternalUncle] > 0) block(Heir.MaternalUncle, arhamBlockedBySibling, LEGAL_BASIS.HADITH_NEAREST_MALE);
   }

   // ============================================
   // HAJB FOR EXTENDED ASHABAH (KHI Pasal 175 points 6-11)
   // These are male relatives through male lines.
   // They inherit by ta'sib AFTER closer ashabah are absent.
   // Blocking follows the KHI Pasal 175 order:
   //   6. FullBrotherSon — blocked by: son, grandson, father, grandfather, fullBrother, paternalBrother
   //   7. PaternalBrotherSon — blocked by: all above + fullBrotherSon
   //   8. PaternalUncleFull — blocked by: all above + paternalBrotherSon
   //   9. PaternalUnclePaternal — blocked by: all above + paternalUncleFull
   //  10. PaternalUnclesSonFull — blocked by: all above + paternalUnclePaternal
   //  11. PaternalUnclesSonPaternal — blocked by: all above + paternalUnclesSonFull
   // ============================================
   const ashabahBlockedByCloser = "Terhalang (hajb) oleh ahli waris ashabah yang lebih dekat, KHI Pasal 175.";

   // Per KHI Pasal 175, extended ashabah follow a strict priority chain.
   // ANY sibling (full or paternal, male or female) blocks ALL extended ashabah,
   // because sisters who inherit as furudh (Kalalah) or ashabah ma'al ghairi
   // are still closer relatives than nephews/uncles/cousins.
   // Similarly, 2+ full sisters (who consume 2/3 furudh) block extended ashabah.
   const anySiblingBlocksExtended = flags.fullBrotherExists || flags.paternalBrotherExists ||
   flags.fullSisterExists || flags.paternalSisterExists;

   // FullBrotherSon: blocked by descendants, father, grandfather, any sibling
   if (flags.maleDescendantExists || flags.fatherExists || flags.grandfatherExists ||
   anySiblingBlocksExtended) {
   if (flags.fullBrotherSonExists) block(Heir.FullBrotherSon, ashabahBlockedByCloser, "KHI Pasal 175");
   }

   // PaternalBrotherSon: blocked by all above + FullBrotherSon
   if (flags.maleDescendantExists || flags.fatherExists || flags.grandfatherExists ||
   anySiblingBlocksExtended || flags.fullBrotherSonExists) {
   if (flags.paternalBrotherSonExists) block(Heir.PaternalBrotherSon, ashabahBlockedByCloser, "KHI Pasal 175");
   }

   // PaternalUncleFull: blocked by all above + PaternalBrotherSon
   if (flags.maleDescendantExists || flags.fatherExists || flags.grandfatherExists ||
   anySiblingBlocksExtended ||
   flags.fullBrotherSonExists || flags.paternalBrotherSonExists) {
   if (flags.paternalUncleFullExists) block(Heir.PaternalUncleFull, ashabahBlockedByCloser, "KHI Pasal 175");
   }

   // PaternalUnclePaternal: blocked by all above + PaternalUncleFull
   if (flags.maleDescendantExists || flags.fatherExists || flags.grandfatherExists ||
   anySiblingBlocksExtended ||
   flags.fullBrotherSonExists || flags.paternalBrotherSonExists ||
   flags.paternalUncleFullExists) {
   if (flags.paternalUnclePaternalExists) block(Heir.PaternalUnclePaternal, ashabahBlockedByCloser, "KHI Pasal 175");
   }

   // PaternalUnclesSonFull: blocked by all above + PaternalUnclePaternal
   if (flags.maleDescendantExists || flags.fatherExists || flags.grandfatherExists ||
   anySiblingBlocksExtended ||
   flags.fullBrotherSonExists || flags.paternalBrotherSonExists ||
   flags.paternalUncleFullExists || flags.paternalUnclePaternalExists) {
   if (flags.paternalUnclesSonFullExists) block(Heir.PaternalUnclesSonFull, ashabahBlockedByCloser, "KHI Pasal 175");
   }

   // PaternalUnclesSonPaternal: blocked by all above + PaternalUnclesSonFull
   if (flags.maleDescendantExists || flags.fatherExists || flags.grandfatherExists ||
   anySiblingBlocksExtended ||
   flags.fullBrotherSonExists || flags.paternalBrotherSonExists ||
   flags.paternalUncleFullExists || flags.paternalUnclePaternalExists ||
   flags.paternalUnclesSonFullExists) {
   if (flags.paternalUnclesSonPaternalExists) block(Heir.PaternalUnclesSonPaternal, ashabahBlockedByCloser, "KHI Pasal 175");
   }

   // --- Tier 4 (arham): Female cousins only (sepupu perempuan) ---
   // Male cousins (PaternalUnclesSonFull/PaternalUnclesSonPaternal) are ASHABAH (KHI Pasal 175).
   // Blocked by: all Tier 3 blockers + paternal uncles (ashabah) + male cousins (ashabah)
   const tier3ArhamExists = flags.paternalAuntExists || flags.paternalAuntPaternalExists;
   const tier3AshabahExists = flags.paternalUncleFullExists || flags.paternalUnclePaternalExists;
   if (flags.fatherExists || flags.ascendantMaleExists || flags.descendantExists ||
   flags.fullBrotherExists || flags.paternalBrotherExists ||
   tier3AshabahExists || tier3ArhamExists ||
   flags.paternalUnclesSonFullExists || flags.paternalUnclesSonPaternalExists) {
   if (flags.paternalUnclesDaughterFullExists) block(Heir.PaternalUnclesDaughterFull, arhamBlockedByRootOrBranch, LEGAL_BASIS.HADITH_NEAREST_MALE);
   if (flags.paternalUnclesDaughterPaternalExists) block(Heir.PaternalUnclesDaughterPaternal, arhamBlockedByRootOrBranch, LEGAL_BASIS.HADITH_NEAREST_MALE);
   }
   // PaternalUnclesDaughterPaternal blocked by their Full counterpart (closer)
   if (present[Heir.PaternalUnclesDaughterFull] > 0 && flags.paternalUnclesDaughterPaternalExists) {
   block(Heir.PaternalUnclesDaughterPaternal, arhamBlockedByCloserArham, LEGAL_BASIS.HADITH_NEAREST_MALE);
   }
   // Paternal aunt blocks female cousin (she's closer in nasab)
   if (flags.paternalAuntExists) {
   if (present[Heir.PaternalUnclesDaughterFull] > 0) block(Heir.PaternalUnclesDaughterFull, arhamBlockedByCloserArham, LEGAL_BASIS.HADITH_NEAREST_MALE);
   if (present[Heir.PaternalUnclesDaughterPaternal] > 0) block(Heir.PaternalUnclesDaughterPaternal, arhamBlockedByCloserArham, LEGAL_BASIS.HADITH_NEAREST_MALE);
   }

   return { present, results };
  }
