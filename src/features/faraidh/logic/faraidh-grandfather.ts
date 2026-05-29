
import type { Share, Heir, HeirResult } from '../../../types.ts';
import { Heir as HeirEnum } from '../../../types.ts';
import { LEGAL_BASIS } from '../constants.ts';

type PresentHeirs = { [key in Heir]: number };
type Shares = { [key in Heir]?: Share };
type Results = { [key in Heir]?: Partial<HeirResult> };

/**
 * KHI Pasal 193: When Grandfather coexists with siblings (no Father),
 * Grandfather has 3 options and takes the BEST (highest) one:
 *
 *   Option A: 1/6 of total estate (minimum guarantee)
 *   Option B: 1/3 of the remaining estate after Furudh deductions
 *   Option C: Muqasamah — share the residue with siblings at 2:1 (male:female)
 *
 * Per KHI, Grandfather takes whichever option yields the largest share.
 * When Grandfather takes Option A or B, siblings get Ashabah of the rest.
 * When Grandfather takes Option C, he and siblings share as Ashabah bil Ghairi.
 */
export const resolveGrandfatherWithSiblings = (
  present: PresentHeirs,
  shares: Shares,
  results: Results,
  ashabahHeirs: { heir: Heir, ratio: number }[]
): void => {
  // Calculate total Furudh shares (excluding Grandfather and siblings who are competing)
  // to determine the "remaining" for option B and C.
  const spouseHeir = present.husband > 0 ? HeirEnum.Husband : (present.wife > 0 ? HeirEnum.Wife : null);

  let furudhTotalNumerator = 0;
  let furudhTotalDenominator = 1;

  // Sum all Furudh shares to find what's left
  Object.keys(shares).forEach(h => {
    const heir = h as Heir;
    const s = shares[heir];
    if (s && s.type === 'furudh' && heir !== HeirEnum.Grandfather) {
      // Find common denominator
      const newDenom = lcm(furudhTotalDenominator, s.denominator);
      furudhTotalNumerator = furudhTotalNumerator * (newDenom / furudhTotalDenominator) 
        + s.numerator * (newDenom / s.denominator);
      furudhTotalDenominator = newDenom;
    }
  });

  const totalEstateFraction = { num: furudhTotalNumerator, den: furudhTotalDenominator };
  const remainingNum = totalEstateFraction.den - totalEstateFraction.num;
  const remainingDen = totalEstateFraction.den;

  // Identify competing siblings (full siblings preferred over paternal per KHI)
  const hasFullSiblings = present.fullBrother > 0 || present.fullSister > 0;
  const hasPaternalSiblings = present.paternalBrother > 0 || present.paternalSister > 0;

  const siblingBrother = hasFullSiblings ? HeirEnum.FullBrother : HeirEnum.PaternalBrother;
  const siblingSister = hasFullSiblings ? HeirEnum.FullSister : HeirEnum.PaternalSister;
  const brotherCount = hasFullSiblings ? present.fullBrother : present.paternalBrother;
  const sisterCount = hasFullSiblings ? present.fullSister : present.paternalSister;

  // --- Calculate 3 Options ---

  // Option A: 1/6 of total estate
  const optionA_value = 1 / 6;

  // Option B: 1/3 of remaining estate
  const optionB_value = remainingNum > 0 ? (remainingNum / remainingDen) / 3 : 0;

  // Option C: Muqasamah — share residue with siblings at 2:1 ratio
  // Grandfather counts as 2 heads; each brother as 2, each sister as 1
  const totalHeads = 2 + (brotherCount * 2) + sisterCount;
  const optionC_value = remainingNum > 0 ? (remainingNum / remainingDen) * (2 / totalHeads) : 0;

  // Find the best option
  const bestValue = Math.max(optionA_value, optionB_value, optionC_value);

  // Remove Grandfather from any prior Furudh share assignment (he was assigned 1/6 in faraidh-shares.ts)
  // We'll reassign based on the best option below.
  delete shares.grandfather;

  // Also remove siblings from ashabahHeirs if they were already added by determineAshabah
  // (they'll be re-added below with correct ratios)
  const siblingHeirs = [HeirEnum.FullBrother, HeirEnum.FullSister, HeirEnum.PaternalBrother, HeirEnum.PaternalSister];
  for (let i = ashabahHeirs.length - 1; i >= 0; i--) {
    if (siblingHeirs.includes(ashabahHeirs[i].heir)) {
      ashabahHeirs.splice(i, 1);
    }
  }

  // Compare using small epsilon to avoid floating-point issues
  const eps = 1e-10;

  if (Math.abs(bestValue - optionC_value) < eps || (optionC_value > optionA_value + eps && optionC_value > optionB_value + eps)) {
  // === OPTION C: Muqasamah ===
  // Grandfather and siblings share the residue as Ashabah at 2:1 ratio
  ashabahHeirs.push({ heir: HeirEnum.Grandfather, ratio: 2 });
  if (brotherCount > 0) ashabahHeirs.push({ heir: siblingBrother, ratio: 2 * brotherCount });
  if (sisterCount > 0) ashabahHeirs.push({ heir: siblingSister, ratio: 1 * sisterCount });
  const totalHeadsC = 2 + brotherCount * 2 + sisterCount;
  shares.grandfather = { numerator: remainingNum * 2, denominator: remainingDen * totalHeadsC, type: 'ashabah' };
  if (sisterCount > 0) {
  shares[siblingSister] = { numerator: remainingNum * sisterCount, denominator: remainingDen * totalHeadsC, type: 'ashabah' };
  }
  if (brotherCount > 0) {
  shares[siblingBrother] = { numerator: remainingNum * brotherCount * 2, denominator: remainingDen * totalHeadsC, type: 'ashabah' };
  }
  results.grandfather!.reason = "Muqasamah (berbagi sisa dengan saudara, porsi 2:1 laki:perempuan).";
  results.grandfather!.evidence = LEGAL_BASIS.IJMA;

  } else if (Math.abs(bestValue - optionB_value) < eps || (optionB_value > optionA_value + eps && optionB_value > optionC_value + eps)) {
    // === OPTION B: 1/3 of remaining ===
    shares.grandfather = { numerator: remainingNum, denominator: remainingDen * 3, type: 'furudh' };
    results.grandfather!.reason = "1/3 dari sisa harta setelah bagian furudh lainnya.";
    results.grandfather!.evidence = LEGAL_BASIS.IJMA;
    // Siblings get Ashabah of whatever remains after Grandfather's 1/3 of remaining
    // The remaining-after-Grandfather = 2/3 of (remaining after other furudh)
    // Siblings share this as regular Ashabah
    if (brotherCount > 0) ashabahHeirs.push({ heir: siblingBrother, ratio: 2 * brotherCount });
    if (sisterCount > 0) ashabahHeirs.push({ heir: siblingSister, ratio: 1 * sisterCount });

  } else {
    // === OPTION A: 1/6 of total estate (minimum guarantee) ===
    shares.grandfather = { numerator: 1, denominator: 6, type: 'furudh' };
    results.grandfather!.reason = "1/6 dari total harta (bagian minimal sebagai Kakek).";
    results.grandfather!.evidence = LEGAL_BASIS.IJMA;
    // Siblings get Ashabah of the rest
    if (brotherCount > 0) ashabahHeirs.push({ heir: siblingBrother, ratio: 2 * brotherCount });
    if (sisterCount > 0) ashabahHeirs.push({ heir: siblingSister, ratio: 1 * sisterCount });
  }
};

// Helpers
function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}
