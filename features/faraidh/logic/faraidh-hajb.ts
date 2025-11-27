
import type { HeirResult } from '../../../types.ts';
import { Heir } from '../../../types.ts';
import { QURAN_REFS, LEGAL_BASIS } from '../constants.ts';

type PresentHeirs = { [key in Heir]: number };
type Results = { [key in Heir]?: Partial<HeirResult> };

export function applyHajbRules(present: PresentHeirs, results: Results, specialCases: { isAkdariyyah: boolean }) {
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

  const descendantExists = sonExists || daughterExists || grandsonExists || granddaughterExists;
  const maleDescendantExists = sonExists || grandsonExists;
  const femaleDescendantExists = daughterExists || granddaughterExists;
  const ascendantMaleExists = fatherExists || grandfatherExists;

  // Level 1 Hajb
  if (sonExists) {
    if (grandsonExists) { 
        present.grandson = 0; 
        results.grandson!.isBlocked = true; 
        results.grandson!.reason = "Terhalang (hajb) oleh Anak Laki-laki."; 
        results.grandson!.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
    }
    if (granddaughterExists) { 
        present.granddaughter = 0; 
        results.granddaughter!.isBlocked = true; 
        results.granddaughter!.reason = "Terhalang (hajb) oleh Anak Laki-laki."; 
        results.granddaughter!.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
    }
  }
  if (fatherExists) {
    if (grandfatherExists) { 
        present.grandfather = 0; 
        results.grandfather!.isBlocked = true; 
        results.grandfather!.reason = "Terhalang (hajb) oleh Ayah."; 
        results.grandfather!.evidence = LEGAL_BASIS.IJMA;
    }
  }
  
  // In Grandfather+Sibling cases, full siblings block paternal ones.
  if (grandfatherExists && (fullBrotherExists || fullSisterExists)) {
      const reason = "Terhalang (hajb) oleh Saudara/i Kandung yang lebih kuat.";
      const evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
      if (paternalBrotherExists) { 
          present.paternalBrother = 0; 
          results.paternalBrother!.isBlocked = true; 
          results.paternalBrother!.reason = reason; 
          results.paternalBrother!.evidence = evidence;
      }
      if (paternalSisterExists) { 
          present.paternalSister = 0; 
          results.paternalSister!.isBlocked = true; 
          results.paternalSister!.reason = reason; 
          results.paternalSister!.evidence = evidence;
      }
  }
  
  // Level 2 Hajb (Siblings blocked by Roots or Branches)
  if (maleDescendantExists || fatherExists) {
    const reason = "Terhalang (hajb) oleh Anak/Cucu Laki-laki atau Ayah.";
    const evidence = QURAN_REFS.AN_NISA_176; // Kalalah definition

    if (fullBrotherExists) { 
        present.fullBrother = 0; 
        results.fullBrother!.isBlocked = true; 
        results.fullBrother!.reason = reason; 
        results.fullBrother!.evidence = evidence;
    }
    if (fullSisterExists && !specialCases.isAkdariyyah) { 
        present.fullSister = 0; 
        results.fullSister!.isBlocked = true; 
        results.fullSister!.reason = reason; 
        results.fullSister!.evidence = evidence;
    }
  }

  if (maleDescendantExists || fatherExists || fullBrotherExists || (fullSisterExists && femaleDescendantExists)) {
    const reason = "Terhalang (hajb) oleh ahli waris yang lebih dekat.";
    let evidence = LEGAL_BASIS.HADITH_NEAREST_MALE; 
    if (maleDescendantExists || fatherExists) {
        evidence = QURAN_REFS.AN_NISA_176;
    }

    if (paternalBrotherExists) { 
        present.paternalBrother = 0; 
        results.paternalBrother!.isBlocked = true; 
        results.paternalBrother!.reason = reason; 
        results.paternalBrother!.evidence = evidence;
    }
    // Note for Paternal Sister: She is blocked by Full Sister IF Full Sister becomes Ashabah ma'al Ghairi (with daughter)
    // OR if there are 2 Full Sisters AND no Paternal Brother (see below)
    if (paternalSisterExists) { 
        present.paternalSister = 0; 
        results.paternalSister!.isBlocked = true; 
        results.paternalSister!.reason = reason; 
        results.paternalSister!.evidence = evidence;
    }
  }

  // BLOCKING BY SIBLINGS
  if (fullBrotherExists) {
    const evidence = LEGAL_BASIS.HADITH_NEAREST_MALE; 
    if (paternalBrotherExists) { 
        present.paternalBrother = 0; 
        results.paternalBrother!.isBlocked = true; 
        results.paternalBrother!.reason = "Terhalang (hajb) oleh Saudara Laki-laki Kandung."; 
        results.paternalBrother!.evidence = evidence;
    }
    if (paternalSisterExists) { 
        present.paternalSister = 0; 
        results.paternalSister!.isBlocked = true; 
        results.paternalSister!.reason = "Terhalang (hajb) oleh Saudara Laki-laki Kandung."; 
        results.paternalSister!.evidence = evidence;
    }
  } else if (present.fullSister >= 2) {
      // Two Full Sisters consume the 2/3 share. Paternal sisters get nothing unless they have a brother.
      if (paternalSisterExists && !paternalBrotherExists) {
          present.paternalSister = 0;
          results.paternalSister!.isBlocked = true;
          results.paternalSister!.reason = "Terhalang karena 2/3 bagian sudah diambil oleh 2 Saudari Kandung (kecuali ada Saudara Seayah).";
          results.paternalSister!.evidence = QURAN_REFS.AN_NISA_176;
      }
  }

  if (descendantExists || ascendantMaleExists) {
    const reason = "Terhalang (hajb) oleh keturunan (far') atau ayah/kakek (ashl laki-laki).";
    const evidence = QURAN_REFS.AN_NISA_12; 

    if (present.maternalBrother > 0) { 
        present.maternalBrother = 0; 
        results.maternalBrother!.isBlocked = true; 
        results.maternalBrother!.reason = reason; 
        results.maternalBrother!.evidence = evidence;
    }
    if (present.maternalSister > 0) { 
        present.maternalSister = 0; 
        results.maternalSister!.isBlocked = true; 
        results.maternalSister!.reason = reason; 
        results.maternalSister!.evidence = evidence;
    }
  }

  // Hajb for Grandmothers
  if (present.mother > 0) {
    if (present.maternalGrandmother > 0) { 
        present.maternalGrandmother = 0; 
        results.maternalGrandmother!.isBlocked = true; 
        results.maternalGrandmother!.reason = "Terhalang (hajb) oleh Ibu."; 
        results.maternalGrandmother!.evidence = LEGAL_BASIS.HADITH_GRANDMOTHER;
    }
    if (present.paternalGrandmother > 0) { 
        present.paternalGrandmother = 0; 
        results.paternalGrandmother!.isBlocked = true; 
        results.paternalGrandmother!.reason = "Terhalang (hajb) oleh Ibu."; 
        results.paternalGrandmother!.evidence = LEGAL_BASIS.HADITH_GRANDMOTHER;
    }
  } else {
    if (fatherExists) {
      if (present.paternalGrandmother > 0) { 
          present.paternalGrandmother = 0; 
          results.paternalGrandmother!.isBlocked = true; 
          results.paternalGrandmother!.reason = "Terhalang (hajb) oleh Ayah."; 
          results.paternalGrandmother!.evidence = LEGAL_BASIS.IJMA;
      }
    } else if (grandfatherExists) {
      if (present.paternalGrandmother > 0) { 
          present.paternalGrandmother = 0; 
          results.paternalGrandmother!.isBlocked = true; 
          results.paternalGrandmother!.reason = "Terhalang (hajb) oleh Kakek (sebagai pengganti Ayah)."; 
          results.paternalGrandmother!.evidence = LEGAL_BASIS.IJMA;
      }
    }
  }
}
