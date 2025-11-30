
import type { Heir, HeirResult } from '../../../types.ts';
import { Heir as HeirEnum } from '../../../types.ts';
import { QURAN_REFS, LEGAL_BASIS } from '../constants.ts';

type PresentHeirs = { [key in Heir]: number };
type Results = { [key in Heir]?: Partial<HeirResult> };

export interface AshabahFlags {
    sonExists: boolean;
    daughterExists: boolean;
    grandsonExists: boolean;
    granddaughterExists: boolean;
    fatherExists: boolean;
    grandfatherExists: boolean;
    maleDescendantExists: boolean;
    femaleDescendantExists: boolean;
    fullBrotherExists: boolean;
    fullSisterExists: boolean;
    paternalBrotherExists: boolean;
    paternalSisterExists: boolean;
    isGrandfatherWithSiblings: boolean;
    maternalBrother: number;
    maternalSister: number;
}

export const determineAshabah = (
    present: PresentHeirs, 
    results: Results,
    flags: AshabahFlags
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
          // Ashabah ma'al Ghairi
          ashabahHeirs.push({ heir: HeirEnum.FullSister, ratio: present.fullSister });
          results.fullSister!.reason = "Mengambil sisa harta setelah bagian keturunan perempuan (Ashabah ma'al Ghairi).";
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
          // Ashabah ma'al Ghairi
          ashabahHeirs.push({ heir: HeirEnum.PaternalSister, ratio: present.paternalSister });
          results.paternalSister!.reason = "Mengambil sisa harta setelah bagian keturunan perempuan (Ashabah ma'al Ghairi).";
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
          // Baitul Mal Case implicitly handled by empty return
      }
    }
    return ashabahHeirs;
};
