import type { HeirResult, Share } from "../../../types.ts";
import { Heir } from "../../../types.ts";
import { QURAN_REFS, LEGAL_BASIS } from "../constants.ts";
import { lcm } from "../../../utils.ts";

type PresentHeirs = { [key in Heir]: number };
type Shares = { [key in Heir]?: Share };
type Results = { [key in Heir]?: Partial<HeirResult> };

export const addShares = (s1: Share, s2: Share): Share => {
  if (s1.numerator === 0) return s2;
  if (s2.numerator === 0) return s1;
  const denominator = lcm(s1.denominator, s2.denominator);
  const numerator =
    s1.numerator * (denominator / s1.denominator) +
    s2.numerator * (denominator / s2.denominator);
  return { numerator, denominator, type: "furudh" };
};

export function calculateFurudhShares(
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
