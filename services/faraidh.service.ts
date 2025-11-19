import type { HeirInputState, CalculationResult, HeirResult, Share } from '../types.ts';
import { Heir } from '../types.ts';
import { HEIR_LABELS, QURAN_REFS, LEGAL_BASIS } from '../constants.ts';
import { gcd, lcm } from "../utils.ts";

type PresentHeirs = { [key in Heir]: number };
type Shares = { [key in Heir]?: Share };
type Results = { [key in Heir]?: Partial<HeirResult> };

// --- UTILITY FUNCTIONS ---

const addShares = (s1: Share, s2: Share): Share => {
  if (s1.numerator === 0) return s2;
  if (s2.numerator === 0) return s1;
  const denominator = lcm(s1.denominator, s2.denominator);
  const numerator = (s1.numerator * (denominator / s1.denominator)) + (s2.numerator * (denominator / s2.denominator));
  return { numerator, denominator, type: 'furudh' };
};

// --- CORE LOGIC FUNCTIONS ---

function applyHajbRules(present: PresentHeirs, results: Results, specialCases: { isAkdariyyah: boolean }) {
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

  const descendantExists =
    sonExists || daughterExists || grandsonExists || granddaughterExists;
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

  if (
    maleDescendantExists ||
    fatherExists ||
    fullBrotherExists ||
    (fullSisterExists && femaleDescendantExists)
  ) {
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
    if (paternalSisterExists) {
      present.paternalSister = 0;
      results.paternalSister!.isBlocked = true;
      results.paternalSister!.reason = reason;
      results.paternalSister!.evidence = evidence;
    }
  }

  if (fullBrotherExists) {
    const evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
    if (paternalBrotherExists) {
      present.paternalBrother = 0;
      results.paternalBrother!.isBlocked = true;
      results.paternalBrother!.reason =
        "Terhalang (hajb) oleh Saudara Laki-laki Kandung.";
      results.paternalBrother!.evidence = evidence;
    }
    if (paternalSisterExists) {
      present.paternalSister = 0;
      results.paternalSister!.isBlocked = true;
      results.paternalSister!.reason =
        "Terhalang (hajb) oleh Saudara Laki-laki Kandung.";
      results.paternalSister!.evidence = evidence;
    }
  }

  if (descendantExists || ascendantMaleExists) {
    const reason =
      "Terhalang (hajb) oleh keturunan (far') atau ayah/kakek (ashl laki-laki).";
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
        results.paternalGrandmother!.reason =
          "Terhalang (hajb) oleh Kakek (sebagai pengganti Ayah).";
        results.paternalGrandmother!.evidence = LEGAL_BASIS.IJMA;
      }
    }
  }
}

function calculateFurudhShares(
  present: PresentHeirs,
  results: Results,
  shares: Shares,
  notes: string[],
  specialCases: { isGrandfatherWithSiblings: boolean },
  originalSiblingsCount: number
): void {
  const sonExists = present.son > 0;
  const daughterExists = present.daughter > 0;
  const grandsonExists = present.grandson > 0;
  const granddaughterExists = present.granddaughter > 0;
  const descendantExists =
    sonExists || daughterExists || grandsonExists || granddaughterExists;
  const maleDescendantExists = sonExists || grandsonExists;
  const femaleDescendantExists = daughterExists || granddaughterExists;
  const ascendantMaleExists = present.father > 0 || present.grandfather > 0;

  if (present.husband > 0) {
    shares.husband = {
      numerator: 1,
      denominator: descendantExists ? 4 : 2,
      type: "furudh",
    };
    results.husband!.reason = `Mendapat 1/${
      shares.husband.denominator
    } karena ${descendantExists ? "ada" : "tidak ada"} keturunan.`;
    results.husband!.evidence = QURAN_REFS.AN_NISA_12;
  }
  if (present.wife > 0) {
    shares.wife = {
      numerator: 1,
      denominator: descendantExists ? 8 : 4,
      type: "furudh",
    };
    results.wife!.reason = `Mendapat 1/${shares.wife.denominator} karena ${
      descendantExists ? "ada" : "tidak ada"
    } keturunan.`;
    results.wife!.evidence = QURAN_REFS.AN_NISA_12;
  }

  if (present.father > 0) {
    if (descendantExists) {
      shares.father = { numerator: 1, denominator: 6, type: "furudh" };
      results.father!.reason = "Mendapat 1/6 karena ada keturunan.";
      results.father!.evidence = QURAN_REFS.AN_NISA_11;
    }
  } else if (
    present.grandfather > 0 &&
    !specialCases.isGrandfatherWithSiblings
  ) {
    if (descendantExists) {
      shares.grandfather = { numerator: 1, denominator: 6, type: "furudh" };
      results.grandfather!.reason =
        "Mendapat 1/6 (menggantikan Ayah) karena ada keturunan.";
      results.grandfather!.evidence = QURAN_REFS.AN_NISA_11;
    }
  }

  if (present.mother > 0) {
    const isUmariyyatain =
      present.father > 0 &&
      (present.husband > 0 || present.wife > 0) &&
      originalSiblingsCount === 0 &&
      !descendantExists;

    if (descendantExists || originalSiblingsCount >= 2) {
      shares.mother = { numerator: 1, denominator: 6, type: "furudh" };
      results.mother!.reason = `Mendapat 1/6 karena ada keturunan atau ada ${originalSiblingsCount} saudara.`;
      results.mother!.evidence = QURAN_REFS.AN_NISA_11;
    } else if (isUmariyyatain) {
      const spouseShare = shares.husband || shares.wife;
      const remainderNumerator =
        spouseShare!.denominator - spouseShare!.numerator;
      shares.mother = {
        numerator: remainderNumerator,
        denominator: 3 * spouseShare!.denominator,
        type: "furudh",
      };
      results.mother!.reason =
        "Kasus Umariyyatain: Mendapat 1/3 dari sisa setelah bagian Suami/Istri.";
      results.mother!.evidence = LEGAL_BASIS.IJTIHAD_UMAR_UMARIYYATAIN;
      notes.push(
        "Kasus Umariyyatain: Ibu mendapat sepertiga dari sisa harta setelah bagian pasangan."
      );
    } else {
      shares.mother = { numerator: 1, denominator: 3, type: "furudh" };
      results.mother!.reason =
        "Mendapat 1/3 karena tidak ada keturunan dan saudara kurang dari dua.";
      results.mother!.evidence = QURAN_REFS.AN_NISA_11;
    }
  }

  const paternalGrandmotherExists = present.paternalGrandmother > 0;
  const maternalGrandmotherExists = present.maternalGrandmother > 0;
  if (paternalGrandmotherExists || maternalGrandmotherExists) {
    if (paternalGrandmotherExists && maternalGrandmotherExists) {
      shares.paternalGrandmother = {
        numerator: 1,
        denominator: 12,
        type: "furudh",
      };
      shares.maternalGrandmother = {
        numerator: 1,
        denominator: 12,
        type: "furudh",
      };
      results.paternalGrandmother!.reason =
        "Berkongsi 1/6 dengan Nenek dari Ibu.";
      results.maternalGrandmother!.reason =
        "Berkongsi 1/6 dengan Nenek dari Ayah.";
    } else if (paternalGrandmotherExists) {
      shares.paternalGrandmother = {
        numerator: 1,
        denominator: 6,
        type: "furudh",
      };
      results.paternalGrandmother!.reason = "Mendapat 1/6.";
    } else {
      shares.maternalGrandmother = {
        numerator: 1,
        denominator: 6,
        type: "furudh",
      };
      results.maternalGrandmother!.reason = "Mendapat 1/6.";
    }
    if (results.paternalGrandmother)
      results.paternalGrandmother.evidence = LEGAL_BASIS.HADITH_GRANDMOTHER;
    if (results.maternalGrandmother)
      results.maternalGrandmother.evidence = LEGAL_BASIS.HADITH_GRANDMOTHER;
  }

  if (present.daughter > 0 && !sonExists) {
    if (present.daughter === 1) {
      shares.daughter = { numerator: 1, denominator: 2, type: "furudh" };
      results.daughter!.reason =
        "Mendapat 1/2 karena satu-satunya anak perempuan dan tidak ada anak laki-laki.";
    } else {
      shares.daughter = { numerator: 2, denominator: 3, type: "furudh" };
      results.daughter!.reason =
        "Mendapat 2/3 karena ada dua atau lebih anak perempuan dan tidak ada anak laki-laki.";
    }
    results.daughter!.evidence = QURAN_REFS.AN_NISA_11;
  }

  if (present.granddaughter > 0 && !sonExists && !grandsonExists) {
    if (!daughterExists) {
      if (present.granddaughter === 1)
        shares.granddaughter = { numerator: 1, denominator: 2, type: "furudh" };
      else
        shares.granddaughter = { numerator: 2, denominator: 3, type: "furudh" };
      results.granddaughter!.reason = `Mendapat ${
        shares.granddaughter!.numerator
      }/${shares.granddaughter!.denominator} (posisi anak perempuan).`;
    } else if (present.daughter === 1) {
      shares.granddaughter = { numerator: 1, denominator: 6, type: "furudh" };
      results.granddaughter!.reason =
        "Mendapat 1/6 sebagai penyempurna (takmilah) 2/3 bagian keturunan perempuan.";
    }
    if (shares.granddaughter)
      results.granddaughter!.evidence = QURAN_REFS.AN_NISA_11;
  }

  if (
    present.fullSister > 0 &&
    !maleDescendantExists &&
    !ascendantMaleExists &&
    !present.fullBrother &&
    !specialCases.isGrandfatherWithSiblings
  ) {
    if (!femaleDescendantExists) {
      if (present.fullSister === 1)
        shares.fullSister = { numerator: 1, denominator: 2, type: "furudh" };
      else shares.fullSister = { numerator: 2, denominator: 3, type: "furudh" };
      results.fullSister!.reason = `Mendapat ${shares.fullSister!.numerator}/${
        shares.fullSister!.denominator
      } karena (Kalalah).`;
      results.fullSister!.evidence = QURAN_REFS.AN_NISA_176;
    }
  }

  if (
    present.paternalSister > 0 &&
    !maleDescendantExists &&
    !ascendantMaleExists &&
    !present.fullBrother &&
    !present.paternalBrother &&
    !specialCases.isGrandfatherWithSiblings
  ) {
    if (present.fullSister === 1) {
      shares.paternalSister = { numerator: 1, denominator: 6, type: "furudh" };
      results.paternalSister!.reason =
        "Mendapat 1/6 sebagai penyempurna (takmilah) 2/3 bagian saudari.";
      results.paternalSister!.evidence = QURAN_REFS.AN_NISA_176;
    } else if (present.fullSister === 0 && !femaleDescendantExists) {
      if (present.paternalSister === 1)
        shares.paternalSister = {
          numerator: 1,
          denominator: 2,
          type: "furudh",
        };
      else
        shares.paternalSister = {
          numerator: 2,
          denominator: 3,
          type: "furudh",
        };
      results.paternalSister!.reason = `Mendapat ${
        shares.paternalSister!.numerator
      }/${shares.paternalSister!.denominator}.`;
      results.paternalSister!.evidence = QURAN_REFS.AN_NISA_176;
    }
  }

  const maternalSiblingsCount =
    present.maternalBrother + present.maternalSister;
  if (maternalSiblingsCount > 0) {
    const share = {
      numerator: 1,
      denominator: maternalSiblingsCount === 1 ? 6 : 3,
      type: "furudh" as const,
    };
    const reason =
      maternalSiblingsCount === 1
        ? "Mendapat 1/6."
        : `Berkongsi 1/3 (${maternalSiblingsCount} orang).`;
    if (present.maternalBrother > 0) {
      shares.maternalBrother = {
        numerator: share.numerator * present.maternalBrother,
        denominator: share.denominator * maternalSiblingsCount,
        type: "furudh",
      };
      results.maternalBrother!.reason = reason;
      results.maternalBrother!.evidence = QURAN_REFS.AN_NISA_12;
    }
    if (present.maternalSister > 0) {
      shares.maternalSister = {
        numerator: share.numerator * present.maternalSister,
        denominator: share.denominator * maternalSiblingsCount,
        type: "furudh",
      };
      results.maternalSister!.reason = reason;
      results.maternalSister!.evidence = QURAN_REFS.AN_NISA_12;
    }
  }
}

// --- MAIN CALCULATION FUNCTION ---
export const calculateFaraidh = (
  heirs: HeirInputState,
  estate: number
): CalculationResult => {
  const present: PresentHeirs = { ...heirs };
  const shares: Shares = {};
  const results: Results = {};
  const notes: string[] = [];

  for (const key of Object.keys(heirs)) {
    const heir = key as Heir;
    if (present[heir] > 0) {
      results[heir] = {
        name: HEIR_LABELS[heir],
        count: present[heir],
        isBlocked: false,
      };
    }
  }

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

  const isGrandfatherWithSiblings =
    grandfatherExists &&
    !fatherExists &&
    !maleDescendantExists &&
    (fullBrotherExists ||
      fullSisterExists ||
      paternalBrotherExists ||
      paternalSisterExists);
  const initialHeirCount = Object.values(heirs)
    .filter((v) => v > 0)
    .reduce((sum, count) => sum + count, 0);
  const isAkdariyyah =
    present.husband === 1 &&
    present.mother === 1 &&
    present.grandfather === 1 &&
    present.fullSister === 1 &&
    !sonExists &&
    !daughterExists &&
    !grandsonExists &&
    !granddaughterExists &&
    !fatherExists &&
    !fullBrotherExists &&
    initialHeirCount === 4;

  const originalSiblingsCount =
    heirs.fullBrother +
    heirs.fullSister +
    heirs.paternalBrother +
    heirs.paternalSister +
    heirs.maternalBrother +
    heirs.maternalSister;

  applyHajbRules(present, results, { isAkdariyyah });

  let finalDenominator = 1;
  let aslAlMasalah = 1;
  let totalSharesNum = 0;
  const finalSiham: { [key in Heir]?: number } = {};

  if (isAkdariyyah) {
    notes.push(
      "Kasus Al-Akdariyyah: Perhitungan khusus diterapkan pada Kakek dan Saudari Kandung untuk keadilan."
    );
    aslAlMasalah = 6;
    totalSharesNum = 9; // 'Aul happens twice, ends up at 27
    finalDenominator = 27;

    finalSiham.husband = 9;
    finalSiham.mother = 6;
    finalSiham.grandfather = 8;
    finalSiham.fullSister = 4;

    // For display purposes
    shares.husband = { numerator: 1, denominator: 2, type: "furudh" };
    shares.mother = { numerator: 1, denominator: 3, type: "furudh" };
    shares.grandfather = { numerator: 1, denominator: 6, type: "furudh" };
    shares.fullSister = { numerator: 1, denominator: 2, type: "furudh" };

    results.husband!.reason =
      "Bagian pokok 1/2. Disesuaikan karena 'Aul menjadi 9/27.";
    results.husband!.evidence = QURAN_REFS.AN_NISA_12;

    results.mother!.reason =
      "Bagian pokok 1/3. Disesuaikan karena 'Aul menjadi 6/27.";
    results.mother!.evidence = QURAN_REFS.AN_NISA_11;

    results.grandfather!.reason =
      "Bagian pokok 1/6. Setelah 'Aul, berkongsi sisa dengan Saudari (2:1) menjadi 8/27.";
    results.grandfather!.evidence = LEGAL_BASIS.MAZHAB_ZAID_AKDARIYYAH;

    results.fullSister!.reason =
      "Bagian pokok 1/2. Setelah 'Aul, berkongsi sisa dengan Kakek (1:2) menjadi 4/27.";
    results.fullSister!.evidence = LEGAL_BASIS.MAZHAB_ZAID_AKDARIYYAH;
  } else {
    calculateFurudhShares(
      present,
      results,
      shares,
      notes,
      { isGrandfatherWithSiblings },
      originalSiblingsCount
    );

    let ashabahHeirs: { heir: Heir; ratio: number }[] = [];

    // Determine Ashabah Heirs if not grandfather case
    if (!isGrandfatherWithSiblings) {
      if (sonExists) {
        ashabahHeirs.push({ heir: Heir.Son, ratio: 2 * present.son });
        if (daughterExists)
          ashabahHeirs.push({
            heir: Heir.Daughter,
            ratio: 1 * present.daughter,
          });
        if (results.son) {
          results.son.reason =
            "Ashabah bin Nafsi, atau bil Ghairi bersama Anak Perempuan, mengambil sisa harta.";
          results.son.evidence = QURAN_REFS.AN_NISA_11;
        }
        if (results.daughter) {
          results.daughter.reason =
            "Ashabah bil Ghairi bersama Anak Laki-laki, bagian 1:2.";
          results.daughter.evidence = QURAN_REFS.AN_NISA_11;
        }
      } else if (grandsonExists) {
        ashabahHeirs.push({ heir: Heir.Grandson, ratio: 2 * present.grandson });
        if (granddaughterExists)
          ashabahHeirs.push({
            heir: Heir.Granddaughter,
            ratio: 1 * present.granddaughter,
          });
        if (results.grandson) {
          results.grandson.reason =
            "Ashabah bin Nafsi, atau bil Ghairi bersama Cucu Perempuan, mengambil sisa harta.";
          results.grandson.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
        }
        if (results.granddaughter) {
          results.granddaughter.reason =
            "Ashabah bil Ghairi bersama Cucu Laki-laki, bagian 1:2.";
          results.granddaughter.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
        }
      } else if (fatherExists && !maleDescendantExists) {
        ashabahHeirs.push({ heir: Heir.Father, ratio: 1 });
        results.father!.reason =
          (femaleDescendantExists
            ? "Mendapat 1/6 + sisa (Ashabah)"
            : "Ashabah, mengambil seluruh sisa harta") +
          " karena tidak ada keturunan laki-laki.";
        results.father!.evidence = QURAN_REFS.AN_NISA_11;
      } else if (grandfatherExists && !maleDescendantExists) {
        ashabahHeirs.push({ heir: Heir.Grandfather, ratio: 1 });
        results.grandfather!.reason =
          (femaleDescendantExists
            ? "Mendapat 1/6 + sisa (Ashabah)"
            : "Ashabah, mengambil seluruh sisa harta") +
          " karena tidak ada keturunan laki-laki.";
        results.grandfather!.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
      } else if (
        fullSisterExists &&
        femaleDescendantExists &&
        !fullBrotherExists
      ) {
        ashabahHeirs.push({ heir: Heir.FullSister, ratio: present.fullSister });
        results.fullSister!.reason =
          "Ashabah ma'al Ghairi, mengambil sisa harta bersama keturunan perempuan.";
        results.fullSister!.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
      } else if (fullBrotherExists) {
        ashabahHeirs.push({
          heir: Heir.FullBrother,
          ratio: 2 * present.fullBrother,
        });
        if (fullSisterExists)
          ashabahHeirs.push({
            heir: Heir.FullSister,
            ratio: 1 * present.fullSister,
          });
        if (results.fullBrother) {
          results.fullBrother.reason = "Ashabah, mengambil sisa harta.";
          results.fullBrother.evidence = QURAN_REFS.AN_NISA_176;
        }
        if (results.fullSister) {
          results.fullSister.reason =
            "Ashabah bil Ghairi bersama Saudara Laki-laki Kandung.";
          results.fullSister.evidence = QURAN_REFS.AN_NISA_176;
        }
      } else if (
        paternalSisterExists &&
        femaleDescendantExists &&
        !fullSisterExists &&
        !paternalBrotherExists
      ) {
        ashabahHeirs.push({
          heir: Heir.PaternalSister,
          ratio: present.paternalSister,
        });
        results.paternalSister!.reason =
          "Ashabah ma'al Ghairi, mengambil sisa harta bersama keturunan perempuan.";
        results.paternalSister!.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
      } else if (paternalBrotherExists) {
        ashabahHeirs.push({
          heir: Heir.PaternalBrother,
          ratio: 2 * present.paternalBrother,
        });
        if (paternalSisterExists)
          ashabahHeirs.push({
            heir: Heir.PaternalSister,
            ratio: 1 * present.paternalSister,
          });
        if (results.paternalBrother) {
          results.paternalBrother.reason = "Ashabah, mengambil sisa harta.";
          results.paternalBrother.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
        }
        if (results.paternalSister) {
          results.paternalSister.reason =
            "Ashabah bil Ghairi bersama Saudara Laki-laki Seayah.";
          results.paternalSister.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
        }
      }
    }

    const furudhHeirs = Object.keys(shares).filter(
      (h) => shares[h as Heir]?.type === "furudh"
    ) as Heir[];
    const denominators = furudhHeirs.map((h) => shares[h]!.denominator);
    aslAlMasalah =
      denominators.length > 0
        ? denominators.reduce((acc, val) => lcm(acc, val), 1)
        : 1;

    const initialSiham: { [key in Heir]?: number } = {};
    let initialSihamTotal = 0;
    furudhHeirs.forEach((h) => {
      const siham =
        shares[h]!.numerator * (aslAlMasalah / shares[h]!.denominator);
      initialSiham[h] = siham;
      initialSihamTotal += siham;
    });

    if (isGrandfatherWithSiblings) {
      const furudhTotalWithoutSpouse = Object.keys(shares)
        .filter((h) => h !== "husband" && h !== "wife")
        .reduce((sh, h) => addShares(sh, shares[h as Heir]!), {
          numerator: 0,
          denominator: 1,
          type: "furudh",
        } as Share);
      const remainingShareForCompetition = {
        numerator:
          furudhTotalWithoutSpouse.denominator -
          furudhTotalWithoutSpouse.numerator,
        denominator: furudhTotalWithoutSpouse.denominator,
        type: "ashabah" as const,
      };

      const oneSixthOfTotal = 1 / 6;
      const oneThirdOfRemainder =
        remainingShareForCompetition.numerator /
        remainingShareForCompetition.denominator /
        3;

      const competingSiblings =
        present.fullBrother > 0 || present.fullSister > 0
          ? { brothers: present.fullBrother, sisters: present.fullSister }
          : {
              brothers: present.paternalBrother,
              sisters: present.paternalSister,
            };
      const totalHeads =
        2 + competingSiblings.brothers * 2 + competingSiblings.sisters;
      const muqasamahValue =
        (remainingShareForCompetition.numerator /
          remainingShareForCompetition.denominator) *
        (2 / totalHeads);

      const addSiblingsAsAshabah = () => {
        if (present.fullBrother > 0) {
          ashabahHeirs.push({
            heir: Heir.FullBrother,
            ratio: 2 * present.fullBrother,
          });
          if (results.fullBrother) {
            results.fullBrother.reason =
              "Mendapat sisa harta (Ashabah) setelah Kakek mengambil bagian tertentu.";
            results.fullBrother.evidence = LEGAL_BASIS.IJMA;
          }
        }
        if (present.fullSister > 0) {
          ashabahHeirs.push({
            heir: Heir.FullSister,
            ratio: 1 * present.fullSister,
          });
          if (results.fullSister) {
            results.fullSister.reason =
              "Mendapat sisa harta (Ashabah bil Ghairi) bersama Saudara Laki-laki.";
            results.fullSister.evidence = LEGAL_BASIS.IJMA;
          }
        }
        if (present.fullBrother === 0 && present.fullSister === 0) {
          if (present.paternalBrother > 0) {
            ashabahHeirs.push({
              heir: Heir.PaternalBrother,
              ratio: 2 * present.paternalBrother,
            });
            if (results.paternalBrother) {
              results.paternalBrother.reason =
                "Mendapat sisa harta (Ashabah) setelah Kakek mengambil bagian tertentu.";
              results.paternalBrother.evidence = LEGAL_BASIS.IJMA;
            }
          }
          if (present.paternalSister > 0) {
            ashabahHeirs.push({
              heir: Heir.PaternalSister,
              ratio: 1 * present.paternalSister,
            });
            if (results.paternalSister) {
              results.paternalSister.reason =
                "Mendapat sisa harta (Ashabah bil Ghairi) bersama Saudara Laki-laki.";
              results.paternalSister.evidence = LEGAL_BASIS.IJMA;
            }
          }
        }
      };

      if (
        muqasamahValue >= oneSixthOfTotal &&
        muqasamahValue >= oneThirdOfRemainder
      ) {
        ashabahHeirs.push({ heir: Heir.Grandfather, ratio: 2 });
        if (present.fullBrother > 0)
          ashabahHeirs.push({
            heir: Heir.FullBrother,
            ratio: 2 * present.fullBrother,
          });
        if (present.fullSister > 0)
          ashabahHeirs.push({
            heir: Heir.FullSister,
            ratio: 1 * present.fullSister,
          });
        if (present.fullBrother === 0 && present.fullSister === 0) {
          if (present.paternalBrother > 0)
            ashabahHeirs.push({
              heir: Heir.PaternalBrother,
              ratio: 2 * present.paternalBrother,
            });
          if (present.paternalSister > 0)
            ashabahHeirs.push({
              heir: Heir.PaternalSister,
              ratio: 1 * present.paternalSister,
            });
        }

        results.grandfather!.reason = `Bagian terbaik (Muqasamah), berbagi sisa dengan saudara.`;
        results.grandfather!.evidence = LEGAL_BASIS.IJMA;
        notes.push(
          "Catatan Fiqih: Kakek berbagi sisa waris dengan saudara melalui metode Muqasamah, sesuai pendapat mayoritas ulama."
        );
      } else if (oneThirdOfRemainder >= oneSixthOfTotal) {
        const oneThirdRemShare = {
          numerator: remainingShareForCompetition.numerator,
          denominator: remainingShareForCompetition.denominator * 3,
          type: "furudh" as const,
        };
        shares.grandfather = addShares(
          shares.grandfather || {
            numerator: 0,
            denominator: 1,
            type: "furudh",
          },
          oneThirdRemShare
        );
        results.grandfather!.reason = `Bagian terbaik (1/3 sisa).`;
        results.grandfather!.evidence = LEGAL_BASIS.IJMA;
        addSiblingsAsAshabah();
      } else {
        shares.grandfather = addShares(
          shares.grandfather || {
            numerator: 0,
            denominator: 1,
            type: "furudh",
          },
          { numerator: 1, denominator: 6, type: "furudh" }
        );
        results.grandfather!.reason = `Bagian terbaik (minimal 1/6).`;
        results.grandfather!.evidence = LEGAL_BASIS.IJMA;
        addSiblingsAsAshabah();
      }

      const allDenominators = Object.values(shares).map((s) => s!.denominator);
      aslAlMasalah =
        allDenominators.length > 0
          ? allDenominators.reduce((acc, val) => lcm(acc, val), 1)
          : 1;

      initialSihamTotal = 0;
      Object.keys(shares).forEach((h_str) => {
        const h = h_str as Heir;
        const siham =
          shares[h]!.numerator * (aslAlMasalah / shares[h]!.denominator);
        initialSiham[h] = siham;
        initialSihamTotal += siham;
      });
    }

    if (ashabahHeirs.length > 0) {
      const remainingSiham = aslAlMasalah - initialSihamTotal;
      if (remainingSiham > 0) {
        const totalRatio = ashabahHeirs.reduce((sum, h) => sum + h.ratio, 0);
        finalDenominator = aslAlMasalah * totalRatio;
        totalSharesNum = finalDenominator;

        Object.keys(initialSiham).forEach((h) => {
          finalSiham[h as Heir] = initialSiham[h as Heir]! * totalRatio;
        });

        const ashabahTotalSiham = remainingSiham * totalRatio;
        ashabahHeirs.forEach((h) => {
          finalSiham[h.heir] =
            (finalSiham[h.heir] || 0) +
            (ashabahTotalSiham * h.ratio) / totalRatio;
        });
      } else {
        ashabahHeirs.forEach((h) => {
          if (shares[h.heir]?.type === "furudh") {
            if (results[h.heir]) {
              const currentReason = results[h.heir]!.reason || "";
              const cleanReason = currentReason
                .replace(/\+ sisa \(Ashabah\)/g, "")
                .replace(/Ashabah, mengambil seluruh sisa harta/g, "");
              results[
                h.heir
              ]!.reason = `${cleanReason} (Tidak mendapat sisa harta/Ashabah karena harta habis/'Aul).`;
            }
          } else {
            if (results[h.heir]) {
              results[h.heir]!.isBlocked = true;
              results[h.heir]!.reason =
                "Terhalang karena bagian waris telah habis oleh ahli waris furudh.";
              results[h.heir]!.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
            }
          }
        });

        if (initialSihamTotal > aslAlMasalah) {
          finalDenominator = initialSihamTotal;
          notes.push(
            `Kasus 'Aul: Asal masalah ${aslAlMasalah} meningkat menjadi ${finalDenominator}. (${LEGAL_BASIS.IJTIHAD_UMAR_AUL})`
          );
        } else {
          finalDenominator = aslAlMasalah;
        }
        totalSharesNum = initialSihamTotal;
        Object.assign(finalSiham, initialSiham);
      }
    } else {
      if (initialSihamTotal > aslAlMasalah) {
        // 'Aul
        finalDenominator = initialSihamTotal;
        totalSharesNum = initialSihamTotal;
        Object.assign(finalSiham, initialSiham);
        notes.push(
          `Kasus 'Aul: Asal masalah ${aslAlMasalah} meningkat menjadi ${finalDenominator}. (${LEGAL_BASIS.IJTIHAD_UMAR_AUL})`
        );
      } else if (initialSihamTotal < aslAlMasalah) {
        // Radd
        const spouse =
          present.husband > 0
            ? Heir.Husband
            : present.wife > 0
            ? Heir.Wife
            : null;

        if (!spouse || furudhHeirs.length === 1) {
          finalDenominator = initialSihamTotal > 0 ? initialSihamTotal : 1;
          totalSharesNum = initialSihamTotal;
          Object.assign(finalSiham, initialSiham);
          if (initialSihamTotal > 0 && initialSihamTotal < aslAlMasalah) {
            notes.push(
              `Kasus Radd: Sisa harta dikembalikan. Asal masalah ${aslAlMasalah} menjadi ${finalDenominator}. (${LEGAL_BASIS.QAUL_ALI_RADD})`
            );
          }
        } else {
          const spouseShare = shares[spouse]!;
          const sihamSpouse = initialSiham[spouse]!;
          const sihamRaddHeirsTotal = initialSihamTotal - sihamSpouse;
          finalDenominator = spouseShare.denominator * sihamRaddHeirsTotal;
          totalSharesNum = finalDenominator;

          finalSiham[spouse] =
            (spouseShare.numerator * finalDenominator) /
            spouseShare.denominator;
          const remainderSiham = finalDenominator - finalSiham[spouse]!;

          furudhHeirs.forEach((h) => {
            if (h !== spouse) {
              finalSiham[h] =
                (remainderSiham * initialSiham[h]!) / sihamRaddHeirsTotal;
            }
          });
          notes.push(
            `Kasus Radd: Sisa harta dikembalikan kepada ahli waris furudh selain pasangan. (${LEGAL_BASIS.QAUL_ALI_RADD})`
          );
        }
      } else {
        // Adil
        finalDenominator = aslAlMasalah;
        totalSharesNum = initialSihamTotal;
        Object.assign(finalSiham, initialSiham);
      }
    }
  }

  const isAulCase = notes.some((note) => note.includes("'Aul"));
  const isRaddCase = notes.some((note) => note.includes("Radd"));

  const finalResults: HeirResult[] = [];
  for (const key of Object.keys(results)) {
    const heir = key as Heir;
    const res = results[heir]!;
    const siham = finalSiham[heir];

    if (siham && siham > 0 && finalDenominator > 0 && !res.isBlocked) {
      const finalShare: Share = {
        numerator: Math.round(siham),
        denominator: finalDenominator,
        type: shares[heir]?.type || "none",
      };

      let finalReason = res.reason || "";
      if (shares[heir]?.type === "furudh" && (isAulCase || isRaddCase)) {
        const commonDivisor = gcd(finalShare.numerator, finalShare.denominator);
        const simpleNum = finalShare.numerator / commonDivisor;
        const simpleDen = finalShare.denominator / commonDivisor;
        const caseName = isAulCase ? "'Aul" : "Radd";
        if (!finalReason.includes("Disesuaikan karena")) {
          finalReason = `${finalReason} Disesuaikan karena ${caseName} menjadi ${simpleNum}/${simpleDen}.`;
        }
      }

      const percentage = (finalShare.numerator / finalShare.denominator) * 100;
      const value = estate * (finalShare.numerator / finalShare.denominator);

      const simpleShare = shares[heir] || {
        numerator: 0,
        denominator: 1,
        type: "none",
      };
      if (simpleShare.numerator > 0 && simpleShare.denominator > 0) {
        const commonDivisor = gcd(
          simpleShare.numerator,
          simpleShare.denominator
        );
        simpleShare.numerator /= commonDivisor;
        simpleShare.denominator /= commonDivisor;
      }

      finalResults.push({
        ...res,
        reason: finalReason,
        share: simpleShare,
        finalShare,
        percentage,
        value,
        isBlocked: false,
      } as HeirResult);
    } else if (res.isBlocked) {
      const noShare: Share = { numerator: 0, denominator: 1, type: "none" };
      finalResults.push({
        ...res,
        share: noShare,
        finalShare: noShare,
        percentage: 0,
        value: 0,
        evidence: res.evidence || "",
      } as HeirResult);
    }
  }

  return {
    estate,
    heirResults: finalResults.sort((a, b) => b.value - a.value),
    aslAlMasalah,
    totalSharesNum,
    finalDenominator,
    notes,
  };
};
