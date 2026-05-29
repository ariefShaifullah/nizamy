
import type { Heir, HeirResult, Share } from '../../../types.ts';
import { Heir as HeirEnum } from '../../../types.ts';
import { QURAN_REFS, LEGAL_BASIS } from '../constants.ts';
import type { HeirFlags } from './faraidh-flags.ts';

type PresentHeirs = { [key in Heir]: number };
type Results = { [key in Heir]?: Partial<HeirResult> };
type Shares = { [key in Heir]?: Share };

/** Extended flags for ashabah: HeirFlags + maternal sibling counts */
export interface AshabahFlags extends HeirFlags {
 maternalBrother: number;
 maternalSister: number;
}

export const determineAshabah = (
 present: PresentHeirs, 
 results: Results,
 flags: AshabahFlags,
 shares: Shares
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
      shares.son = shares.son || { numerator: 0, denominator: 1, type: 'ashabah' };
      results.son.reason = "Ashabah bin Nafsi, atau bil Ghairi bersama Anak Perempuan.";
      results.son.evidence = QURAN_REFS.AN_NISA_11;
      }
      if(results.daughter) {
      shares.daughter = shares.daughter || { numerator: 0, denominator: 1, type: 'ashabah' };
      results.daughter.reason = "Ashabah bil Ghairi bersama Anak Laki-laki, bagian 1:2.";
      results.daughter.evidence = QURAN_REFS.AN_NISA_11;
      }
      } else if (grandsonExists) {
      ashabahHeirs.push({ heir: HeirEnum.Grandson, ratio: 2 * present.grandson });
      if(granddaughterExists) ashabahHeirs.push({ heir: HeirEnum.Granddaughter, ratio: 1 * present.granddaughter });
      if(results.grandson) {
      shares.grandson = shares.grandson || { numerator: 0, denominator: 1, type: 'ashabah' };
      results.grandson.reason = "Ashabah bin Nafsi, atau bil Ghairi bersama Cucu Perempuan.";
      results.grandson.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
      }
      if(results.granddaughter) {
      shares.granddaughter = shares.granddaughter || { numerator: 0, denominator: 1, type: 'ashabah' };
      results.granddaughter.reason = "Ashabah bil Ghairi bersama Cucu Laki-laki, bagian 1:2.";
      results.granddaughter.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
      }
      } else if (fatherExists && !maleDescendantExists) {
      ashabahHeirs.push({heir: HeirEnum.Father, ratio: 1});
      if (femaleDescendantExists) {
      // Combined: 1/6 Furudh (already set by calculateFurudhShares) + sisa Ashabah
      results.father!.reason = "1/6 Furudh + sisa Ashabah karena tidak ada keturunan laki-laki.";
      } else {
      // Pure Ashabah — no Furudh share was assigned
      shares.father = { numerator: 0, denominator: 1, type: 'ashabah' };
      results.father!.reason = "Ashabah, mengambil seluruh sisa harta karena tidak ada keturunan laki-laki.";
      }
      results.father!.evidence = QURAN_REFS.AN_NISA_11;
      } else if (grandfatherExists && !maleDescendantExists) {
      ashabahHeirs.push({heir: HeirEnum.Grandfather, ratio: 1});
      if (femaleDescendantExists) {
      // Combined: 1/6 Furudh (already set by calculateFurudhShares) + sisa Ashabah
      results.grandfather!.reason = "1/6 Furudh + sisa Ashabah karena tidak ada keturunan laki-laki.";
      } else {
      // Pure Ashabah — no Furudh share was assigned
      shares.grandfather = { numerator: 0, denominator: 1, type: 'ashabah' };
      results.grandfather!.reason = "Ashabah, mengambil seluruh sisa harta karena tidak ada keturunan laki-laki.";
      }
      results.grandfather!.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
      } else if (fullSisterExists && femaleDescendantExists && !fullBrotherExists) {
      // Ashabah ma'al Ghairi
      ashabahHeirs.push({ heir: HeirEnum.FullSister, ratio: present.fullSister });
      shares.fullSister = shares.fullSister || { numerator: 0, denominator: 1, type: 'ashabah' };
      results.fullSister!.reason = "Mengambil sisa harta setelah bagian keturunan perempuan (Ashabah ma'al Ghairi).";
      results.fullSister!.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
      } else if (fullBrotherExists) {
      ashabahHeirs.push({ heir: HeirEnum.FullBrother, ratio: 2 * present.fullBrother });
      if(fullSisterExists) ashabahHeirs.push({ heir: HeirEnum.FullSister, ratio: 1 * present.fullSister });
      if(results.fullBrother) {
      shares.fullBrother = shares.fullBrother || { numerator: 0, denominator: 1, type: 'ashabah' };
      results.fullBrother.reason = "Ashabah, mengambil sisa harta.";
      results.fullBrother.evidence = QURAN_REFS.AN_NISA_176;
      }
      if(results.fullSister) {
      shares.fullSister = shares.fullSister || { numerator: 0, denominator: 1, type: 'ashabah' };
      results.fullSister.reason = "Ashabah bil Ghairi bersama Saudara Laki-laki Kandung.";
      results.fullSister.evidence = QURAN_REFS.AN_NISA_176;
      }
      } else if (paternalSisterExists && femaleDescendantExists && !fullSisterExists && !paternalBrotherExists) {
      // Ashabah ma'al Ghairi
      ashabahHeirs.push({ heir: HeirEnum.PaternalSister, ratio: present.paternalSister });
      shares.paternalSister = shares.paternalSister || { numerator: 0, denominator: 1, type: 'ashabah' };
      results.paternalSister!.reason = "Mengambil sisa harta setelah bagian keturunan perempuan (Ashabah ma'al Ghairi).";
      results.paternalSister!.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
      } else if (paternalBrotherExists) {
      ashabahHeirs.push({ heir: HeirEnum.PaternalBrother, ratio: 2 * present.paternalBrother });
      if(paternalSisterExists) ashabahHeirs.push({ heir: HeirEnum.PaternalSister, ratio: 1 * present.paternalSister });
      if(results.paternalBrother) {
      shares.paternalBrother = shares.paternalBrother || { numerator: 0, denominator: 1, type: 'ashabah' };
      results.paternalBrother.reason = "Ashabah, mengambil sisa harta.";
      results.paternalBrother.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
      }
      if(results.paternalSister) {
      shares.paternalSister = shares.paternalSister || { numerator: 0, denominator: 1, type: 'ashabah' };
      results.paternalSister.reason = "Ashabah bil Ghairi bersama Saudara Laki-laki Seayah.";
      results.paternalSister.evidence = LEGAL_BASIS.HADITH_NEAREST_MALE;
      }
      }
      // --- KHI Pasal 175 points 6-11: Extended Ashabah chain ---
      // These are MALE relatives through male lines who inherit by ta'sib
      // after the closer ashabah are absent.
      // IMPORTANT: Must check present[heir] > 0 (post-hajb count), not just the flag.
      // Hajb may have set present count to 0 while the flag (from pre-hajb) is still true.
      // Also: only set results[heir] if it doesn't already exist, to avoid overriding hajb data.
      else if (flags.fullBrotherSonExists && present.fullBrotherSon > 0) {
      // Pasal 175 point 6: Anak laki-laki saudara kandung
      ashabahHeirs.push({ heir: HeirEnum.FullBrotherSon, ratio: 2 * present.fullBrotherSon });
      shares.fullBrotherSon = { numerator: 0, denominator: 1, type: 'ashabah' };
      if (!results.fullBrotherSon) {
      results.fullBrotherSon = {
      name: "Keponakan Laki-laki (Saudara Kandung)",
      reason: "Ashabah (KHI Pasal 175 p.6), mengambil sisa harta.",
      evidence: "KHI Pasal 175",
      isBlocked: false,
      };
      }
      } else if (flags.paternalBrotherSonExists && present.paternalBrotherSon > 0) {
      // Pasal 175 point 7: Anak laki-laki saudara seayah
      ashabahHeirs.push({ heir: HeirEnum.PaternalBrotherSon, ratio: 2 * present.paternalBrotherSon });
      shares.paternalBrotherSon = { numerator: 0, denominator: 1, type: 'ashabah' };
      if (!results.paternalBrotherSon) {
      results.paternalBrotherSon = {
      name: "Keponakan Laki-laki (Saudara Seayah)",
      reason: "Ashabah (KHI Pasal 175 p.7), mengambil sisa harta.",
      evidence: "KHI Pasal 175",
      isBlocked: false,
      };
      }
      } else if (flags.paternalUncleFullExists && present.paternalUncleFull > 0) {
      // Pasal 175 point 8: Paman kandung
      ashabahHeirs.push({ heir: HeirEnum.PaternalUncleFull, ratio: 2 * present.paternalUncleFull });
      shares.paternalUncleFull = { numerator: 0, denominator: 1, type: 'ashabah' };
      if (!results.paternalUncleFull) {
      results.paternalUncleFull = {
      name: "Paman Kandung",
      reason: "Ashabah (KHI Pasal 175 p.8), mengambil sisa harta.",
      evidence: "KHI Pasal 175",
      isBlocked: false,
      };
      }
      } else if (flags.paternalUnclePaternalExists && present.paternalUnclePaternal > 0) {
      // Pasal 175 point 9: Paman seayah
      ashabahHeirs.push({ heir: HeirEnum.PaternalUnclePaternal, ratio: 2 * present.paternalUnclePaternal });
      shares.paternalUnclePaternal = { numerator: 0, denominator: 1, type: 'ashabah' };
      if (!results.paternalUnclePaternal) {
      results.paternalUnclePaternal = {
      name: "Paman Seayah",
      reason: "Ashabah (KHI Pasal 175 p.9), mengambil sisa harta.",
      evidence: "KHI Pasal 175",
      isBlocked: false,
      };
      }
      } else if (flags.paternalUnclesSonFullExists && present.paternalUnclesSonFull > 0) {
      // Pasal 175 point 10: Anak laki-laki paman kandung (sepupu laki-laki kandung)
      ashabahHeirs.push({ heir: HeirEnum.PaternalUnclesSonFull, ratio: 2 * present.paternalUnclesSonFull });
      shares.paternalUnclesSonFull = { numerator: 0, denominator: 1, type: 'ashabah' };
      if (!results.paternalUnclesSonFull) {
      results.paternalUnclesSonFull = {
      name: "Sepupu Laki-laki Kandung",
      reason: "Ashabah (KHI Pasal 175 p.10), mengambil sisa harta.",
      evidence: "KHI Pasal 175",
      isBlocked: false,
      };
      }
      } else if (flags.paternalUnclesSonPaternalExists && present.paternalUnclesSonPaternal > 0) {
      // Pasal 175 point 11: Anak laki-laki paman seayah (sepupu laki-laki seayah)
      ashabahHeirs.push({ heir: HeirEnum.PaternalUnclesSonPaternal, ratio: 2 * present.paternalUnclesSonPaternal });
      shares.paternalUnclesSonPaternal = { numerator: 0, denominator: 1, type: 'ashabah' };
      if (!results.paternalUnclesSonPaternal) {
      results.paternalUnclesSonPaternal = {
      name: "Sepupu Laki-laki Seayah",
      reason: "Ashabah (KHI Pasal 175 p.11), mengambil sisa harta.",
      evidence: "KHI Pasal 175",
      isBlocked: false,
      };
      }
      } else if (present.maternalBrother === 0 && present.maternalSister === 0 && !sonExists && !daughterExists && !fatherExists && !grandfatherExists && !fullBrotherExists && !fullSisterExists && !paternalBrotherExists && !paternalSisterExists) {
          // Baitul Mal Case implicitly handled by empty return
      }
    }
    return ashabahHeirs;
};
