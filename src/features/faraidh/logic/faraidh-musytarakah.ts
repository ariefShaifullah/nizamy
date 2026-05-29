
import type { Share, Heir, HeirResult } from '../../../types.ts';
import { Heir as HeirEnum } from '../../../types.ts';
import { LEGAL_BASIS, QURAN_REFS } from '../constants.ts';
import { gcd, lcm } from '../../../utils.ts';

type PresentHeirs = { [key in Heir]: number };
type Shares = { [key in Heir]?: Share };
type Results = { [key in Heir]?: Partial<HeirResult> };

/**
 * Al-Musytarakah (The Shared/Partner Case) — Umar bin Khattab's ruling
 *
 * Scenario: When Full Brothers/Sisters are present alongside Maternal Siblings,
 * and the estate is fully consumed by Furudh shares (leaving no residue for
 * Full Brothers as Ashabah), Umar r.a. ruled that Full Brothers share in the
 * 1/3 portion of the Maternal Siblings equally (male and female alike).
 *
 * Conditions:
 * 1. Full Brothers/Sisters exist (not blocked by hajb)
 * 2. Maternal Siblings exist and have 1/3 or 1/6 collective Furudh share
 * 3. No residue remains for Full Brothers after Furudh distribution
 * 4. No Father, no male descendants (otherwise all siblings are blocked)
 *
 * Under this ruling, the collective maternal share (1/3 or 1/6) is redistributed
 * among ALL siblings (maternal + full) equally, regardless of gender.
 */
export const resolveMusytarakah = (
  present: PresentHeirs,
  shares: Shares,
  results: Results,
  notes: string[]
): boolean => {
  const hasFullBrother = present.fullBrother > 0;
  const hasFullSister = present.fullSister > 0;
  const hasMaternalBrother = present.maternalBrother > 0;
  const hasMaternalSister = present.maternalSister > 0;

  if (!(hasFullBrother || hasFullSister) || !(hasMaternalBrother || hasMaternalSister)) {
    return false;
  }

  // Calculate COLLECTIVE maternal share:
  // 1 maternal sibling = 1/6 total; 2+ maternal siblings = 1/3 total
  const maternalCount = (present.maternalBrother || 0) + (present.maternalSister || 0);
  const collectiveMaternalShare: Share = maternalCount === 1
    ? { numerator: 1, denominator: 6, type: 'furudh' }
    : { numerator: 1, denominator: 3, type: 'furudh' };

  // Check if estate is fully consumed by Furudh (no residue for full siblings)
  // Sum all non-sibling Furudh shares + collective maternal share
  const allShares: Share[] = [];
  Object.keys(shares).forEach(h => {
    const heir = h as Heir;
    const s = shares[heir];
    if (s && s.type === 'furudh' &&
      heir !== HeirEnum.FullBrother && heir !== HeirEnum.FullSister &&
      heir !== HeirEnum.MaternalBrother && heir !== HeirEnum.MaternalSister) {
      allShares.push(s);
    }
  });
  allShares.push(collectiveMaternalShare); // Add collective maternal share

  const allDenoms = allShares.map(s => s.denominator);
  const commonDenom = allDenoms.reduce((acc, val) => {
    const g = gcd(acc, val);
    return (acc * val) / g;
  }, 1);

  let furudhTotal = 0;
  allShares.forEach(s => {
    furudhTotal += s.numerator * (commonDenom / s.denominator);
  });

  // If there IS residue for full siblings, they get it as regular Ashabah — no Musytarakah
  if (furudhTotal < commonDenom) {
    return false;
  }

  // === MUSYTARAKAH APPLIES ===
  // All siblings (maternal + full) share the collective maternal portion equally (male=female)
  const totalSiblings = (present.fullBrother || 0) + (present.fullSister || 0) +
    (present.maternalBrother || 0) + (present.maternalSister || 0);

  const portionNum = collectiveMaternalShare.numerator;
  const portionDen = collectiveMaternalShare.denominator;

  // Each individual sibling gets: portionNum / (portionDen * totalSiblings)
  // For the per-heir-group shares:
  // - N maternal brothers share: portionNum * N / (portionDen * totalSiblings)
  // - N full brothers share: portionNum * N / (portionDen * totalSiblings)

  const setMusytarakahShare = (heir: Heir, count: number, label: string, isFull: boolean) => {
    const individualDen = portionDen * totalSiblings;
    // Per-person numerator = portionNum; denominator = portionDen * totalSiblings
    shares[heir] = { numerator: portionNum * count, denominator: individualDen, type: 'musytarakah' };
    results[heir]!.isBlocked = false;
    if (isFull) {
      results[heir]!.reason = `Al-Musytarakah: Berkongsi 1/${portionDen} dengan saudara seibu secara sama rata (${totalSiblings} orang). Putusan Umar bin Khattab r.a.`;
    } else {
      results[heir]!.reason = `Al-Musytarakah: Berkongsi 1/${portionDen} dengan saudara kandung secara sama rata (${totalSiblings} orang).`;
    }
    results[heir]!.evidence = LEGAL_BASIS.IJTIHAD_UMAR_MUSYTARAKAH;
  };

  if (present.maternalBrother > 0) {
    setMusytarakahShare(HeirEnum.MaternalBrother, present.maternalBrother, 'Saudara Laki-laki Seibu', false);
  }
  if (present.maternalSister > 0) {
    setMusytarakahShare(HeirEnum.MaternalSister, present.maternalSister, 'Saudara Perempuan Seibu', false);
  }
  if (present.fullBrother > 0) {
    setMusytarakahShare(HeirEnum.FullBrother, present.fullBrother, 'Saudara Laki-laki Kandung', true);
  }
  if (present.fullSister > 0) {
    setMusytarakahShare(HeirEnum.FullSister, present.fullSister, 'Saudara Perempuan Kandung', true);
  }

  notes.push("Kasus Al-Musytarakah: Saudara kandung berserikat dengan saudara seibu dalam bagian 1/3 (putusan Umar bin Khattab r.a.).");

  return true;
};
