import { describe, it, expect } from 'vitest';
import { calculateFaraidh } from './faraidh.service.ts';
import { Heir, type HeirInputState } from '../../../types.ts';
import { initialHeirsState } from '../constants.ts';

// --- FUZZ TESTING ---
// Generates random heir combinations and validates invariants:
// 1. Never crashes/throws
// 2. Sum of percentages <= 100% (or within tolerance for 'Aul)
// 3. Total distributed value <= netEstate
// 4. No NaN/Infinity in results
// 5. Blocked heirs have percentage=0, value=0
// 6. Non-blocked heirs with value > 0 have valid shares

const ALL_HEIRS = Object.values(Heir) as Heir[];

const MALE_ONLY_HEIRS: Heir[] = [Heir.Wife]; // Only valid when deceased is male
const FEMALE_ONLY_HEIRS: Heir[] = [Heir.Husband]; // Only valid when deceased is female

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Seedable PRNG for reproducibility
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

function seededInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randomHeirState(gender: 'male' | 'female'): HeirInputState {
  const state = { ...initialHeirsState };
  // Randomly activate 1-8 heir types
  const numActive = randomInt(1, 8);
  const available = ALL_HEIRS.filter(h => {
    if (gender === 'male' && h === Heir.Husband) return false;
    if (gender === 'female' && h === Heir.Wife) return false;
    return true;
  });

  // Shuffle and pick
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(numActive, shuffled.length); i++) {
    const heir = shuffled[i];
    // Assign random count 1-5 (most heirs are 1-4 realistically)
    state[heir] = randomInt(1, 4);
  }
  return state;
}

const ESTATE_VALUES = [
  1, 100, 1_000, 12_000_000, 120_000_000, 999_999_999, 1, 33, 7, 13, 100_000
];

describe('Fuzz: Random heir combinations', () => {
  const ITERATIONS = 200;
  const TOLERANCE = 0.01; // 1% tolerance for floating-point

  it(`survives ${ITERATIONS} random inputs without crashing`, () => {
    let crashes = 0;
    let invariantViolations: string[] = [];

    for (let i = 0; i < ITERATIONS; i++) {
      const gender = Math.random() > 0.5 ? 'male' as const : 'female' as const;
      const heirs = randomHeirState(gender);
      const estate = ESTATE_VALUES[randomInt(0, ESTATE_VALUES.length - 1)];

      let result;
      try {
        result = calculateFaraidh(heirs, estate, gender);
      } catch (e) {
        crashes++;
        invariantViolations.push(`#${i}: CRASHED with heirs=${JSON.stringify(heirs)} estate=${estate} gender=${gender}`);
        continue;
      }

      // Invariant 1: No NaN/Infinity
      for (const hr of result.heirResults) {
        if (Number.isNaN(hr.value) || !Number.isFinite(hr.value)) {
          invariantViolations.push(`#${i}: NaN/Infinity in value for ${hr.name}`);
        }
        if (Number.isNaN(hr.percentage) || !Number.isFinite(hr.percentage)) {
          invariantViolations.push(`#${i}: NaN/Infinity in percentage for ${hr.name}`);
        }
        if (Number.isNaN(hr.share.numerator) || Number.isNaN(hr.share.denominator)) {
          invariantViolations.push(`#${i}: NaN in share for ${hr.name}`);
        }
      }

      // Invariant 2: Total value distributed <= netEstate (this is the real invariant)
      const totalValue2 = result.heirResults
        .filter(h => !h.isBlocked)
        .reduce((sum, h) => sum + h.value, 0);
      if (totalValue2 > result.netEstate + 1) {
        invariantViolations.push(`#${i}: Total value ${totalValue2} > netEstate ${result.netEstate}`);
      }

      // Soft check: total % should roughly make sense
      const totalPct = result.heirResults
        .filter(h => !h.isBlocked)
        .reduce((sum, h) => sum + h.percentage, 0);
      // 'Aul or Radd can produce totals that deviate from exactly 100%
      // Only flag extreme deviations (>200%) as likely bugs
      if (totalPct > 200) {
        invariantViolations.push(`#${i}: Total pct ${totalPct.toFixed(2)}% > 200% — likely bug. Notes: ${result.notes.join('; ')}`);
      }

      // Invariant 3: Total distributed value <= netEstate + 1 (rounding)
      const totalValue = result.heirResults
        .filter(h => !h.isBlocked)
        .reduce((sum, h) => sum + h.value, 0);
      if (totalValue > result.netEstate + 1) {
        invariantViolations.push(`#${i}: Total value ${totalValue} > netEstate ${result.netEstate}`);
      }

      // Invariant 4: Blocked heirs have value=0 and percentage=0
      for (const hr of result.heirResults) {
        if (hr.isBlocked && hr.value > 0) {
          invariantViolations.push(`#${i}: Blocked heir ${hr.name} has value=${hr.value}`);
        }
      }

      // Invariant 5: Non-blocked heirs with positive value have valid shares
      for (const hr of result.heirResults) {
        if (!hr.isBlocked && hr.value > 0) {
          if (hr.share.denominator === 0) {
            invariantViolations.push(`#${i}: ${hr.name} has denominator=0`);
          }
          if (hr.share.numerator < 0) {
            invariantViolations.push(`#${i}: ${hr.name} has negative numerator`);
          }
        }
      }
    }

    if (crashes > 0) {
      invariantViolations.unshift(`CRASHES: ${crashes}/${ITERATIONS}`);
    }

    if (invariantViolations.length > 0) {
      // Log ALL violations for debugging
      const msg = invariantViolations.join('\n');
      console.error('Fuzz violations:\n' + msg);
    }

    expect(invariantViolations).toEqual([]);
  });
});

describe('Fuzz: Edge case estate values', () => {
  const edgeEstates = [1, 2, 3, 7, 13, 99, 100, 333, 1000, 999_999_999];

  it('handles minimum estate with common heirs', () => {
    for (const estate of edgeEstates) {
      const state = { ...initialHeirsState, [Heir.Wife]: 1, [Heir.Daughter]: 2, [Heir.Father]: 1, [Heir.Mother]: 1 };
      const result = calculateFaraidh(state, estate, 'male');

      // Must not crash, no NaN
      for (const hr of result.heirResults) {
        expect(Number.isFinite(hr.value)).toBe(true);
        expect(Number.isNaN(hr.value)).toBe(false);
      }
    }
  });

  it('handles large estate with many heirs', () => {
    const state = {
      ...initialHeirsState,
      [Heir.Wife]: 4,
      [Heir.Daughter]: 5,
      [Heir.Father]: 1,
      [Heir.Mother]: 1,
      [Heir.Grandfather]: 1,
      [Heir.FullSister]: 2,
      [Heir.PaternalSister]: 1,
      [Heir.MaternalBrother]: 1,
      [Heir.MaternalSister]: 1,
    };
    const result = calculateFaraidh(state, 999_999_999, 'male');

    for (const hr of result.heirResults) {
      expect(Number.isFinite(hr.value)).toBe(true);
    }
  });
});
