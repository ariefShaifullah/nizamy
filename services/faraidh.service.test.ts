
import { describe, it, expect } from 'vitest';
import { calculateFaraidh } from './faraidh.service.ts';
import { Heir } from '../types.ts';
import { initialHeirsState } from '../constants.ts';

// Helper to create state quickly
const createState = (overrides: Partial<Record<Heir, number>>) => ({
  ...initialHeirsState,
  ...overrides,
});

describe('Faraidh Calculator Service', () => {
  const ESTATE = 120_000_000; // Base estate for easy calculation

  describe('1. Aturan Dasar & Ashabah (Sisa)', () => {
    it('Anak Laki-laki memborong seluruh harta (Ashabah bin Nafsi)', () => {
      const state = createState({ [Heir.Son]: 1 });
      const result = calculateFaraidh(state, ESTATE);
      
      const son = result.heirResults.find(h => h.name === 'Anak Laki-laki');
      expect(son?.value).toBe(ESTATE);
      expect(son?.percentage).toBe(100);
      expect(son?.finalShare.numerator).toBe(son?.finalShare.denominator); 
    });

    it('Anak Laki-laki & Perempuan berbagi sisa 2:1 (Ashabah bil Ghairi)', () => {
      const state = createState({ [Heir.Son]: 1, [Heir.Daughter]: 1 });
      const result = calculateFaraidh(state, 300_000_000);

      const son = result.heirResults.find(h => h.name === 'Anak Laki-laki');
      const daughter = result.heirResults.find(h => h.name === 'Anak Perempuan');

      expect(son?.value).toBe(200_000_000);
      expect(daughter?.value).toBe(100_000_000);
    });
  });

  describe('2. Aturan Hajb (Penghalang) Khusus', () => {
    it('Saudari Seayah terhalang oleh 2 Saudari Kandung', () => {
      const state = createState({ [Heir.FullSister]: 2, [Heir.PaternalSister]: 1 });
      const result = calculateFaraidh(state, ESTATE);

      const patSister = result.heirResults.find(h => h.name.includes('Seayah'));
      expect(patSister?.isBlocked).toBe(true);
    });

    it('Saudari Seayah TIDAK terhalang oleh 2 Saudari Kandung JIKA ada Saudara Seayah (The Lucky Brother)', () => {
      const state = createState({ [Heir.FullSister]: 2, [Heir.PaternalSister]: 1, [Heir.PaternalBrother]: 1 });
      const result = calculateFaraidh(state, 100_000_000);

      // 2 Full Sisters get 2/3. Remainder 1/3.
      // Remainder shared by Paternal Siblings 2:1.
      const patSister = result.heirResults.find(h => h.name === 'Saudara Perempuan Seayah');
      const patBrother = result.heirResults.find(h => h.name === 'Saudara Laki-laki Seayah');
      
      expect(patSister?.isBlocked).toBe(false);
      expect(patBrother?.isBlocked).toBe(false);
      expect(patSister?.value).toBeGreaterThan(0);
    });
  });

  describe('3. Kasus Radd dengan Pasangan', () => {
    it('Suami (1/2) + Anak Perempuan (1/2). Sisa habis? Tidak, Radd untuk anak.', () => {
       // Standard: Suami 1/4 (ada anak), Anak Pr 1/2. Total 3/4. Sisa 1/4.
       // Radd: Suami tetap 1/4. Anak Pr dapat 1/2 + Sisa.
       // Final: Suami 1/4, Anak Pr 3/4.
       const state = createState({ [Heir.Husband]: 1, [Heir.Daughter]: 1 });
       const result = calculateFaraidh(state, 40_000_000);
       
       const husband = result.heirResults.find(h => h.name === 'Suami');
       const daughter = result.heirResults.find(h => h.name === 'Anak Perempuan');
       
       expect(husband?.value).toBe(10_000_000); // 1/4
       expect(daughter?.value).toBe(30_000_000); // 3/4
       expect(result.notes.some(n => n.includes("Radd"))).toBe(true);
    });

    it('Istri (1/8) + Anak Perempuan (1/2) + Ibu (1/6). Sisa dikembalikan ke Anak & Ibu.', () => {
        // Istri 1/8. Sisa 7/8.
        // Anak Pr (3/6) vs Ibu (1/6) -> Ratio 3:1.
        // Sisa 7/8 dibagi 4 bagian.
        // Final Denom 32.
        // Istri 4/32 (1/8).
        // Anak Pr 21/32.
        // Ibu 7/32.
        const state = createState({ [Heir.Wife]: 1, [Heir.Daughter]: 1, [Heir.Mother]: 1 });
        const result = calculateFaraidh(state, 32_000_000);

        const wife = result.heirResults.find(h => h.name === 'Istri');
        const daughter = result.heirResults.find(h => h.name === 'Anak Perempuan');
        const mother = result.heirResults.find(h => h.name === 'Ibu');

        expect(result.finalDenominator).toBe(32);
        expect(wife?.value).toBe(4_000_000);
        expect(daughter?.value).toBe(21_000_000);
        expect(mother?.value).toBe(7_000_000);
    });
  });
});
