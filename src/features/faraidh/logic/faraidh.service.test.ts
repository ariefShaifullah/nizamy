
import { describe, it, expect } from 'vitest';
import { calculateFaraidh } from './faraidh.service.ts';
import { Heir } from '../../../types.ts';
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

 describe('4. Spouse Exclusivity Guard (Phase 1.1)', () => {
 it('When both husband and wife present with female deceased, husband is kept and wife removed', () => {
 const state = createState({ [Heir.Husband]: 1, [Heir.Wife]: 2, [Heir.Daughter]: 1 });
 const result = calculateFaraidh(state, ESTATE, 'female');

 const husband = result.heirResults.find(h => h.name === 'Suami');
 const wife = result.heirResults.find(h => h.name === 'Istri');

 expect(husband).toBeDefined();
 expect(husband?.isBlocked).toBe(false);
 expect(wife).toBeUndefined(); // Wife removed — she cannot exist for a female deceased
 expect(result.notes.some(n => n.includes('Koreksi otomatis'))).toBe(true);
 });

 it('When both husband and wife present with male deceased, wife is kept and husband removed', () => {
 const state = createState({ [Heir.Husband]: 1, [Heir.Wife]: 1, [Heir.Son]: 1 });
 const result = calculateFaraidh(state, ESTATE, 'male');

 const husband = result.heirResults.find(h => h.name === 'Suami');
 const wife = result.heirResults.find(h => h.name === 'Istri');

 expect(wife).toBeDefined();
 expect(wife?.isBlocked).toBe(false);
 expect(husband).toBeUndefined();
 expect(result.notes.some(n => n.includes('Koreksi otomatis'))).toBe(true);
 });

 it('When both husband and wife present with no gender info, wife is kept as default', () => {
 const state = createState({ [Heir.Husband]: 1, [Heir.Wife]: 1, [Heir.Daughter]: 1 });
 const result = calculateFaraidh(state, ESTATE);

 const wife = result.heirResults.find(h => h.name === 'Istri');
 const husband = result.heirResults.find(h => h.name === 'Suami');

 expect(wife).toBeDefined();
 expect(husband).toBeUndefined();
 });
 });

 describe('5. Father Combined Furudh+Ashabah Share (Phase 1.2)', () => {
 it('Father with daughter only: gets 1/6 Furudh + sisa Ashabah as combined share', () => {
 // Deceased male, 1 wife, 1 daughter, 1 father
 // Wife: 1/8 (descendant exists), Daughter: 1/2, Father: 1/6 + sisa
 // Total furudh: 1/8 + 1/2 + 1/6 = 3/24 + 12/24 + 4/24 = 19/24. Sisa = 5/24 for Father.
 // Father total = 1/6 + 5/24 = 4/24 + 5/24 = 9/24
 const state = createState({ [Heir.Wife]: 1, [Heir.Daughter]: 1, [Heir.Father]: 1 });
 const result = calculateFaraidh(state, 240_000_000, 'male');

 const father = result.heirResults.find(h => h.name === 'Ayah');
 expect(father).toBeDefined();
 expect(father?.isBlocked).toBe(false);
 expect(father?.share.type).toBe('combined');
 expect(father?.furudhShare).toBeDefined();
 expect(father?.furudhShare?.numerator).toBe(1);
 expect(father?.furudhShare?.denominator).toBe(6);
 expect(father?.value).toBeGreaterThan(0);
 expect(father?.reason).toContain('1/6 Furudh + sisa Ashabah');
 });

 it('Father with no descendant: pure Ashabah (not combined)', () => {
 const state = createState({ [Heir.Wife]: 1, [Heir.Father]: 1 });
 const result = calculateFaraidh(state, ESTATE, 'male');

 const father = result.heirResults.find(h => h.name === 'Ayah');
 expect(father).toBeDefined();
 expect(father?.share.type).toBe('ashabah');
 expect(father?.furudhShare).toBeUndefined();
 });
 });

 describe('6. Akdariyyah detection (Phase 1.3)', () => {
 it('Akdariyyah correctly detected for 1 Full Sister with Grandfather', () => {
 const state = createState({ [Heir.Husband]: 1, [Heir.Mother]: 1, [Heir.Grandfather]: 1, [Heir.FullSister]: 1 });
 const result = calculateFaraidh(state, 270_000_000);

 expect(result.notes.some(n => n.includes('Akdariyyah'))).toBe(true);

 const grandfather = result.heirResults.find(h => h.name === 'Kakek (dari Ayah)');
 expect(grandfather).toBeDefined();
 expect(grandfather?.finalShare.numerator).toBe(8);
 expect(grandfather?.finalShare.denominator).toBe(27);

 const sister = result.heirResults.find(h => h.name === 'Saudara Perempuan Kandung');
 expect(sister).toBeDefined();
 expect(sister?.finalShare.numerator).toBe(4);
 expect(sister?.finalShare.denominator).toBe(27);
 });
 });

 describe('7. Grandfather + Siblings 3-Options Logic (Phase 1.5)', () => {
 it('Grandfather with 1 Full Brother: muqasamah typically wins', () => {
 // Wife (1/8) + Grandfather + Full Brother
 // Option A: 1/6 ≈ 0.167, Option B: 1/3 of 7/8 ≈ 0.292, Option C: 2/4 of 7/8 ≈ 0.437
 // Muqasamah wins
 const state = createState({ [Heir.Wife]: 1, [Heir.Grandfather]: 1, [Heir.FullBrother]: 1 });
 const result = calculateFaraidh(state, 240_000_000);

 const grandfather = result.heirResults.find(h => h.name === 'Kakek (dari Ayah)');
 expect(grandfather).toBeDefined();
 expect(grandfather?.reason).toContain('Muqasamah');

 const brother = result.heirResults.find(h => h.name === 'Saudara Laki-laki Kandung');
 expect(brother).toBeDefined();
 });

 it('Grandfather with many siblings: 1/3 of remaining wins over muqasamah', () => {
 // Wife (1/8) + Grandfather + 4 Full Brothers + 2 Full Sisters
 // totalHeads = 2 + 4*2 + 2 = 12; muqasamah = 2/12 of 7/8 ≈ 0.146
 // Option A: 1/6 ≈ 0.167, Option B: 1/3 of 7/8 ≈ 0.292 — wins!
 const state = createState({ [Heir.Wife]: 1, [Heir.Grandfather]: 1, [Heir.FullBrother]: 4, [Heir.FullSister]: 2 });
 const result = calculateFaraidh(state, 240_000_000);

 const grandfather = result.heirResults.find(h => h.name === 'Kakek (dari Ayah)');
 expect(grandfather).toBeDefined();
 expect(grandfather?.reason).toContain('1/3');
 });

 it('Grandfather with only sisters: muqasamah with 2:1 ratio', () => {
 // Wife (1/8) + Grandfather + 2 Full Sisters
 // totalHeads = 2 + 0 + 2 = 4; muqasamah = 2/4 of 7/8 = 7/16 ≈ 0.4375
 // Option A: 1/6 ≈ 0.167, Option B: 1/3 of 7/8 ≈ 0.292 — muqasamah wins
 const state = createState({ [Heir.Wife]: 1, [Heir.Grandfather]: 1, [Heir.FullSister]: 2 });
 const result = calculateFaraidh(state, 240_000_000);

 const grandfather = result.heirResults.find(h => h.name === 'Kakek (dari Ayah)');
 expect(grandfather).toBeDefined();
 expect(grandfather?.reason).toContain('Muqasamah');

 const sister = result.heirResults.find(h => h.name === 'Saudara Perempuan Kandung');
 expect(sister).toBeDefined();
 });
 });

 describe('8. Al-Musytarakah (Phase 1.4)', () => {
 it('Classic Musytarakah: Husband + Mother + Maternal + Full siblings', () => {
 // Husband (1/2) + Mother (1/6) + Maternal Brother + Maternal Sister + Full Brother + Full Sister
 // Furudh: 1/2 + 1/6 + 1/3 = 1 — fully consumed, no residue
 // Umar's ruling: all 4 siblings share the 1/3 equally (1/12 each)
 const state = createState({
 [Heir.Husband]: 1,
 [Heir.Mother]: 1,
 [Heir.MaternalBrother]: 1,
 [Heir.MaternalSister]: 1,
 [Heir.FullBrother]: 1,
 [Heir.FullSister]: 1,
 });
 const result = calculateFaraidh(state, 240_000_000);

 expect(result.notes.some(n => n.includes('Al-Musytarakah'))).toBe(true);

 const fullBrother = result.heirResults.find(h => h.name === 'Saudara Laki-laki Kandung');
 expect(fullBrother).toBeDefined();
 expect(fullBrother?.isBlocked).toBe(false);
 expect(fullBrother?.reason).toContain('Musytarakah');
 expect(fullBrother?.finalShare.numerator).toBe(1);
 expect(fullBrother?.finalShare.denominator).toBe(12);

 const fullSister = result.heirResults.find(h => h.name === 'Saudara Perempuan Kandung');
 expect(fullSister).toBeDefined();
 expect(fullSister?.isBlocked).toBe(false);
 expect(fullSister?.reason).toContain('Musytarakah');
 expect(fullSister?.finalShare.numerator).toBe(1);
 expect(fullSister?.finalShare.denominator).toBe(12);

 const maternalBrother = result.heirResults.find(h => h.name === 'Saudara Laki-laki Seibu');
 expect(maternalBrother).toBeDefined();
 expect(maternalBrother?.finalShare.numerator).toBe(1);
 expect(maternalBrother?.finalShare.denominator).toBe(12);

 // No Radd should occur — Musytarakah distributes the entire estate
 expect(result.notes.some(n => n.includes('Radd'))).toBe(false);
 });
 });

 describe('9. Aul (shares exceed 1)', () => {
 it('2 Daughters + Husband + Father + Mother: classic Aul case', () => {
 // Wife 1/8, 2 Daughters 2/3, Father 1/6, Mother 1/6
 // Total: 1/8 + 2/3 + 1/6 + 1/6 = 3/24 + 16/24 + 4/24 + 4/24 = 27/24 > 1
 // Aul: aslAlMasalah increases from 24 to 27
 const state = createState({
 [Heir.Wife]: 1,
 [Heir.Daughter]: 2,
 [Heir.Father]: 1,
 [Heir.Mother]: 1,
 });
 const result = calculateFaraidh(state, 27_000_000, 'male');

 expect(result.notes.some(n => n.includes("'Aul"))).toBe(true);
 expect(result.finalDenominator).toBe(27);

 const wife = result.heirResults.find(h => h.name === 'Istri');
 expect(wife?.finalShare.numerator).toBe(3);
 expect(wife?.finalShare.denominator).toBe(27);

 const daughter = result.heirResults.find(h => h.name === 'Anak Perempuan');
 // 2 daughters share 2/3 collectively; after Aul, collective = 16/27
 expect(daughter?.finalShare.numerator).toBe(16);
 expect(daughter?.finalShare.denominator).toBe(27);
 });
 });

 describe('10. Radd without spouse', () => {
 it('Daughter + Mother: surplus returned proportionally', () => {
 // Daughter 1/2, Mother 1/3
 // Total furudh: 5/6 < 1, no spouse, no ashabah
 // Radd: surplus 1/6 returned proportionally
 // Daughter: 1/2 * 6/5 = 3/5, Mother: 1/3 * 6/5 = 2/5
 const state = createState({
 [Heir.Daughter]: 1,
 [Heir.Mother]: 1,
 });
 const result = calculateFaraidh(state, 30_000_000);

 expect(result.notes.some(n => n.includes('Radd'))).toBe(true);
 // After Radd, total should equal estate
 const totalValue = result.heirResults.reduce((sum, h) => sum + h.value, 0);
 expect(Math.round(totalValue)).toBe(30_000_000);
 });
 });

 describe('11. Hajb: Grandmother blocked by Mother', () => {
 it('Maternal Grandmother is blocked when Mother is present', () => {
 const state = createState({
 [Heir.Husband]: 1,
 [Heir.Mother]: 1,
 [Heir.MaternalGrandmother]: 1,
 [Heir.Daughter]: 1,
 });
 const result = calculateFaraidh(state, ESTATE);

 const grandmother = result.heirResults.find(h => h.name.includes('Kakek/Nenek') || h.name.includes('Nenek'));
 // Grandmother should be blocked
 const blocked = result.heirResults.find(h => h.isBlocked && (h.name.includes('Nenek') || h.name.includes('Kakek')));
 expect(blocked).toBeDefined();
 expect(blocked?.reason).toContain('Ibu');
 });
 });

 describe('12. Hajb: Grandson blocked by Son', () => {
 it('Grandson is blocked when Son is present', () => {
 const state = createState({
 [Heir.Husband]: 1,
 [Heir.Son]: 1,
 [Heir.Grandson]: 1,
 [Heir.Daughter]: 1,
 });
 const result = calculateFaraidh(state, ESTATE, 'female');

 const grandson = result.heirResults.find(h => h.name === 'Cucu Laki-laki (dari Anak Laki-laki)');
 expect(grandson?.isBlocked).toBe(true);
 expect(grandson?.reason).toContain('Anak Laki-laki');
 });
 });

 describe('13. Hajb: Paternal siblings blocked by Full Brother', () => {
 it('Paternal Brother is blocked when Full Brother is present', () => {
 const state = createState({
 [Heir.Wife]: 1,
 [Heir.FullBrother]: 1,
 [Heir.PaternalBrother]: 1,
 });
 const result = calculateFaraidh(state, ESTATE, 'male');

 const paternalBrother = result.heirResults.find(h => h.name === 'Saudara Laki-laki Seayah');
 expect(paternalBrother?.isBlocked).toBe(true);
 });
 });

 describe('14. Hajb: Maternal siblings blocked by Father', () => {
 it('Maternal Brother is blocked when Father is present', () => {
 const state = createState({
 [Heir.Wife]: 1,
 [Heir.Father]: 1,
 [Heir.MaternalBrother]: 1,
 [Heir.Daughter]: 1,
 });
 const result = calculateFaraidh(state, ESTATE, 'male');

 const maternalBrother = result.heirResults.find(h => h.name === 'Saudara Laki-laki Seibu');
 expect(maternalBrother?.isBlocked).toBe(true);
 });
 });

 describe('15. Multiple daughters share 2/3 equally', () => {
 it('4 Daughters share 2/3, each gets 1/6', () => {
 const state = createState({
 [Heir.Husband]: 1,
 [Heir.Daughter]: 4,
 [Heir.Father]: 1,
 [Heir.Mother]: 1,
 });
 const result = calculateFaraidh(state, 120_000_000, 'female');

 const daughter = result.heirResults.find(h => h.name === 'Anak Perempuan');
 expect(daughter).toBeDefined();
 // The share field stores the original furudh portion for all daughters
 // With 4 daughters, share = 2/3 collectively; each daughter's portion is 1/6
 expect(daughter?.share.denominator).toBe(3); // Collective 2/3
 expect(daughter?.share.numerator).toBe(2);
 expect(daughter?.count).toBe(4);
 // Verify total distributed = estate
 const totalValue = result.heirResults.reduce((sum, h) => sum + h.value, 0);
 expect(Math.round(totalValue)).toBe(120_000_000);
 });
 });

 describe('16. Spouse share with/without descendants', () => {
 it('Wife gets 1/8 when descendants exist', () => {
 const state = createState({ [Heir.Wife]: 1, [Heir.Son]: 1 });
 const result = calculateFaraidh(state, 80_000_000, 'male');

 const wife = result.heirResults.find(h => h.name === 'Istri');
 expect(wife?.share.numerator).toBe(1);
 expect(wife?.share.denominator).toBe(8);
 });

 it('Wife gets 1/4 when no descendants exist', () => {
 const state = createState({ [Heir.Wife]: 1, [Heir.Father]: 1 });
 const result = calculateFaraidh(state, 80_000_000, 'male');

 const wife = result.heirResults.find(h => h.name === 'Istri');
 expect(wife?.share.numerator).toBe(1);
 expect(wife?.share.denominator).toBe(4);
 });

 it('Husband gets 1/4 when descendants exist', () => {
 const state = createState({ [Heir.Husband]: 1, [Heir.Daughter]: 1 });
 const result = calculateFaraidh(state, 80_000_000);

 const husband = result.heirResults.find(h => h.name === 'Suami');
 expect(husband?.share.numerator).toBe(1);
 expect(husband?.share.denominator).toBe(4);
 });

 it('Husband gets 1/2 when no descendants exist', () => {
 const state = createState({ [Heir.Husband]: 1, [Heir.Mother]: 1 });
 const result = calculateFaraidh(state, 80_000_000);

 const husband = result.heirResults.find(h => h.name === 'Suami');
 expect(husband?.share.numerator).toBe(1);
 expect(husband?.share.denominator).toBe(2);
 });
 });

 describe('17. Only spouse — Baitul Mal note', () => {
 it('Only Wife: gets her share, remainder noted for Baitul Mal', () => {
 const state = createState({ [Heir.Wife]: 1 });
 const result = calculateFaraidh(state, ESTATE, 'male');

 const wife = result.heirResults.find(h => h.name === 'Istri');
 expect(wife).toBeDefined();
 expect(wife?.share.numerator).toBe(1);
 expect(wife?.share.denominator).toBe(4);
 // Remaining 3/4 goes to Baitul Mal
 expect(result.notes.some(n => n.includes('Baitul Mal'))).toBe(true);
 });
 });

 describe('18. Zero heirs check', () => {
 it('Returns Baitul Mal note when no heirs present', () => {
 const state = createState({});
 const result = calculateFaraidh(state, ESTATE);

 expect(result.heirResults.length).toBe(0);
 expect(result.notes.some(n => n.includes('Baitul Mal'))).toBe(true);
 });
 });

 describe('17. Wasiat & Utang deduction', () => {
 it('Deducts utang from estate before distribution', () => {
 const state = createState({ [Heir.Husband]: 1, [Heir.Daughter]: 2 });
 const result = calculateFaraidh(state, ESTATE, 'male', 0, 30_000_000);

 expect(result.estate).toBe(ESTATE);
 expect(result.utang).toBe(30_000_000);
 expect(result.netEstate).toBe(ESTATE - 30_000_000);
 expect(result.heirResults.length).toBeGreaterThan(0);
 expect(result.notes.some(n => n.includes('utang'))).toBe(true);
 });

 it('Caps wasiat at 1/3 of (estate - utang)', () => {
 const state = createState({ [Heir.Wife]: 1, [Heir.Son]: 1 });
 // No utang: 1/3 of 100M = ~33.33M, wasiat = 50M should be capped
 const result1 = calculateFaraidh(state, ESTATE, 'female', 50_000_000, 0);
 expect(result1.wasiat).toBe(Math.floor(ESTATE / 3));

 // With utang 30M: 1/3 of (100M - 30M) = 1/3 of 70M = ~23.33M
 const result2 = calculateFaraidh(state, ESTATE, 'female', 50_000_000, 30_000_000);
 expect(result2.wasiat).toBe(Math.floor((ESTATE - 30_000_000) / 3));
 expect(result2.netEstate).toBe(ESTATE - 30_000_000 - Math.floor((ESTATE - 30_000_000) / 3));
 expect(result2.notes.some(n => n.includes('sisa setelah utang'))).toBe(true);
 });

 it('Returns empty results when netEstate is 0', () => {
 const state = createState({ [Heir.Son]: 1 });
 const result = calculateFaraidh(state, ESTATE, 'male', 0, ESTATE);

 expect(result.netEstate).toBe(0);
 expect(result.heirResults.length).toBe(0);
 expect(result.notes.some(n => n.includes('Rp 0'))).toBe(true);
 });
 });
});

// ============================================
// REGRESSION TESTS — Bugs 1-6 from logical audit
// ============================================
describe('Regression: Bug 1 — isArhamOnlyScenario double distribution', () => {
 it('FullSister (furudh) + PaternalAunt: no double distribution', () => {
   // BUG: FullSister gets 100% (1/2 furudh + 1/2 radd), then Arham also
   // gave PaternalAunt 50%, totaling 150%.
   // FIX: Since FullSister received shares, arham should NOT run.
   const state = createState({ [Heir.FullSister]: 1, [Heir.PaternalAunt]: 1 });
   const result = calculateFaraidh(state, 100_000_000);

   const sister = result.heirResults.find(h => h.name === 'Saudara Perempuan Kandung');
   const aunt = result.heirResults.find(h => h.name === 'Bibi Kandung (dari Ayah)');

   expect(sister?.isBlocked).toBe(false);
   expect(sister?.value).toBeGreaterThan(0);
   // FullSister should get 100% via radd
   expect(sister?.percentage).toBe(100);

   // PaternalAunt is blocked by FullSister (closer ashabah via KHI Pasal 175).
   // She may be absent from finalResults or present with isBlocked=true.
   if (aunt) {
   expect(aunt.isBlocked).toBe(true);
   }
   // Either way, total distributed must NOT exceed estate
   const totalDistributed = result.heirResults
     .filter(h => !h.isBlocked)
     .reduce((sum, h) => sum + h.value, 0);
   expect(totalDistributed).toBeLessThanOrEqual(100_000_000);
 });
});

describe('Regression: Bug 2 — FullSister-as-furudh blocks extended ashabah', () => {
 it('FullSister (furudh) blocks FullBrotherSon (ashabah)', () => {
   // FullSister inherits as furudh (1/2 Kalalah), FullBrotherSon should be blocked
   const state = createState({ [Heir.FullSister]: 1, [Heir.FullBrotherSon]: 1 });
   const result = calculateFaraidh(state, 100_000_000);

   const nephew = result.heirResults.find(h => h.name.includes('Keponakan'));
   expect(nephew?.isBlocked).toBe(true);
 });
});

describe('Regression: Bug 3 — 2+ FullSisters block extended ashabah', () => {
 it('2 FullSisters block FullBrotherSon', () => {
   // 2 FullSisters get 2/3 furudh. Nephew should be blocked, not get 1/3 ashabah.
   const state = createState({ [Heir.FullSister]: 2, [Heir.FullBrotherSon]: 1 });
   const result = calculateFaraidh(state, 90_000_000);

   const nephew = result.heirResults.find(h => h.name.includes('Keponakan'));
   expect(nephew?.isBlocked).toBe(true);

   const totalDistributed = result.heirResults
     .filter(h => !h.isBlocked)
     .reduce((sum, h) => sum + h.value, 0);
   expect(totalDistributed).toBeLessThanOrEqual(90_000_000);
 });
});

describe('Regression: Bug 4 — Arham percentage relative to total estate', () => {
 it('Arham percentage accounts for spouse share', () => {
   // Husband (1/2) + DaughterDaughter (arham)
   // Husband gets 1/2, DaughterDaughter gets remaining 1/2
   // BUG: DaughterDaughter percentage showed 100% (of arham-estate)
   // FIX: Should show 50% (of total estate)
   const state = createState({ [Heir.Husband]: 1, [Heir.DaughterDaughter]: 1 });
   const result = calculateFaraidh(state, 100_000_000);

   const granddaughter = result.heirResults.find(h => h.name.includes('Cucu'));
   expect(granddaughter).toBeDefined();
   expect(granddaughter?.isBlocked).toBe(false);
   // Percentage should be relative to total estate, not just arham sub-estate
   expect(granddaughter?.percentage).toBeLessThanOrEqual(50);
 });
});

describe('Regression: Bug 5 — Tier 2 FullBrotherDaughter priority over FullSisterSon', () => {
 it('FullBrotherDaughter blocks FullSisterSon in arham Tier 2', () => {
   // Both are Tier 2 arham. FullBrotherDaughter (niece via brother) should
   // block FullSisterSon (nephew via sister).
   const state = createState({
     [Heir.Husband]: 1,
     [Heir.FullBrotherDaughter]: 1,
     [Heir.FullSisterSon]: 1,
   });
   const result = calculateFaraidh(state, 100_000_000);

   // FullBrotherDaughter should inherit
   const inheriting = result.heirResults.filter(h => !h.isBlocked && h.value > 0);
   const nieceInherits = inheriting.some(h => h.name.includes('Keponakan'));
   expect(nieceInherits).toBe(true);

   // FullSisterSon should be blocked
   const nephewBlocked = result.heirResults.find(h =>
   h.isBlocked && h.name.includes('Anak dari Saudari')
   );
   expect(nephewBlocked).toBeDefined();
 });
});

describe('Regression: Bug 6 — PaternalAuntPaternal specific blocking reasons', () => {
 it('PaternalAuntPaternal blocked by father shows specific reason', () => {
   const state = createState({
     [Heir.Father]: 1,
     [Heir.PaternalAuntPaternal]: 1,
     [Heir.Daughter]: 1,
   });
   const result = calculateFaraidh(state, 100_000_000, 'male');

   const aunt = result.heirResults.find(h => h.name.includes('Bibi Seayah'));
   expect(aunt?.isBlocked).toBe(true);
   expect(aunt?.reason).toContain('ayah');
 });

 it('PaternalAuntPaternal blocked by PaternalAunt shows specific reason', () => {
   const state = createState({
     [Heir.PaternalAunt]: 1,
     [Heir.PaternalAuntPaternal]: 1,
     [Heir.Husband]: 1,
   });
   const result = calculateFaraidh(state, 100_000_000);

   const auntPaternal = result.heirResults.find(h => h.name.includes('Bibi Seayah'));
   expect(auntPaternal?.isBlocked).toBe(true);
   expect(auntPaternal?.reason).toContain('Bibi Kandung');
 });
});

describe('Kakek + Saudara: Muqasamah & Opsi Kakek (KHI Pasal 208)', () => {
 it('Kakek + 2 Saudara Kandung Perempuan: Muqasamah (opsi C terbaik)', () => {
 const state = createState({ [Heir.Grandfather]: 1, [Heir.FullSister]: 2 });
 const result = calculateFaraidh(state, 100_000_000, 'male');
 const grandfather = result.heirResults.find(h => h.name === 'Kakek (dari Ayah)');
 const sister = result.heirResults.find(h => h.name === 'Saudara Perempuan Kandung');
 expect(grandfather?.isBlocked).toBe(false);
 expect(sister?.isBlocked).toBe(false);
 expect(grandfather?.percentage).toBe(50);
 expect(sister?.percentage).toBe(50);
 expect(grandfather?.share.type).toBe('ashabah');
 expect(sister?.share.type).toBe('ashabah');
 });

 it('Istri + Kakek + 2 Saudara Kandung Perempuan (Akdariyyah klasik)', () => {
 const state = createState({ [Heir.Wife]: 1, [Heir.Grandfather]: 1, [Heir.FullSister]: 2 });
 const result = calculateFaraidh(state, 100_000_000, 'male');
 const wife = result.heirResults.find(h => h.name === 'Istri');
 const grandfather = result.heirResults.find(h => h.name === 'Kakek (dari Ayah)');
 const sister = result.heirResults.find(h => h.name === 'Saudara Perempuan Kandung');
 expect(wife?.percentage).toBe(25);
 expect(grandfather?.percentage).toBeCloseTo(37.5, 1);
 expect(sister?.percentage).toBeCloseTo(37.5, 1);
 expect(grandfather?.share.type).toBe('ashabah');
 });

 it('Arham: Suami + Keponakan Perempuan (Saudara Kandung) masing 50%', () => {
 const state = createState({ [Heir.Husband]: 1, [Heir.FullBrotherDaughter]: 1 });
 const result = calculateFaraidh(state, 100_000_000, 'male');
 const husband = result.heirResults.find(h => h.name === 'Suami');
 const niece = result.heirResults.find(h => h.name.includes('Keponakan Perempuan (Saudara Kandung)'));
 expect(husband?.percentage).toBe(50);
 expect(niece?.percentage).toBe(50);
 expect(niece?.isBlocked).toBe(false);
 });
});

describe('P1T3: Saudara perempuan menghalangi bibi (hajb)', () => {
 it('Saudara Kandung Perempuan menghalangi Bibi Kandung', () => {
 const state = createState({ [Heir.FullSister]: 1, [Heir.PaternalAunt]: 1 });
 const result = calculateFaraidh(state, 100_000_000, 'male');
 const aunt = result.heirResults.find(h => h.name.includes('Bibi Kandung'));
 expect(aunt).toBeDefined();
 expect(aunt?.isBlocked).toBe(true);
 expect(aunt?.reason).toContain('Saudara Perempuan');
 });

 it('Saudara Seayah menghalangi Bibi Kandung', () => {
 const state = createState({ [Heir.PaternalSister]: 1, [Heir.PaternalAunt]: 1 });
 const result = calculateFaraidh(state, 100_000_000, 'male');
 const aunt = result.heirResults.find(h => h.name.includes('Bibi Kandung'));
 expect(aunt).toBeDefined();
 expect(aunt?.isBlocked).toBe(true);
 });
});

describe('P2T4: Skenario Kritis yang Hilang', () => {
 it('2 Istri + Ayah + Ibu + 2 Anak Perempuan (Aul klasik KHI)', () => {
 const state = createState({ [Heir.Wife]: 2, [Heir.Father]: 1, [Heir.Mother]: 1, [Heir.Daughter]: 2 });
 const result = calculateFaraidh(state, 240_000_000, 'male');
 const total = result.heirResults.reduce((sum, h) => sum + (h.isBlocked ? 0 : h.percentage), 0);
 expect(total).toBeCloseTo(100, 1);
 expect(result.notes.some(n => n.includes("'Aul"))).toBe(true);
 });

 it('Nenek (dari Ibu) terhalang oleh Ibu', () => {
 const state = createState({ [Heir.Mother]: 1, [Heir.MaternalGrandmother]: 1, [Heir.Son]: 1 });
 const result = calculateFaraidh(state, 100_000_000, 'male');
 const grandmother = result.heirResults.find(h => h.name.includes('Nenek'));
 expect(grandmother?.isBlocked).toBe(true);
 });

 it('Nenek (dari Ayah) terhalang oleh Ayah', () => {
 const state = createState({ [Heir.Father]: 1, [Heir.PaternalGrandmother]: 1, [Heir.Daughter]: 1 });
 const result = calculateFaraidh(state, 100_000_000, 'male');
 const grandmother = result.heirResults.find(h => h.name.includes('Nenek') && h.name.includes('Ayah'));
 expect(grandmother?.isBlocked).toBe(true);
 });

 it('1 Anak Laki-laki + 2 Anak Perempuan (Ashabah bil Ghairi 2:1)', () => {
 const state = createState({ [Heir.Son]: 1, [Heir.Daughter]: 2 });
 const result = calculateFaraidh(state, 300_000_000, 'male');
 const son = result.heirResults.find(h => h.name === 'Anak Laki-laki');
 const daughter = result.heirResults.find(h => h.name === 'Anak Perempuan');
 expect(son?.percentage).toBeCloseTo(50, 1);
 expect(daughter?.percentage).toBeCloseTo(50, 1); // combined for 2 daughters
 });

 it('2 Saudara Kandung Perempuan + Saudara Seayah Laki-laki (Lucky Brother)', () => {
 const state = createState({ [Heir.FullSister]: 2, [Heir.PaternalBrother]: 1 });
 const result = calculateFaraidh(state, 100_000_000, 'male');
 const brother = result.heirResults.find(h => h.name.includes('Seayah'));
 const sister = result.heirResults.find(h => h.name === 'Saudara Perempuan Kandung');
 expect(sister?.percentage).toBeCloseTo(66.67, 0);
 expect(brother?.isBlocked).toBe(false);
 });

 it('Ayah + Ibu + Anak Perempuan: semua menerima bagian', () => {
 const state = createState({ [Heir.Father]: 1, [Heir.Mother]: 1, [Heir.Daughter]: 1 });
 const result = calculateFaraidh(state, 120_000_000, 'male');
 const father = result.heirResults.find(h => h.name === 'Ayah');
 const mother = result.heirResults.find(h => h.name === 'Ibu');
 const daughter = result.heirResults.find(h => h.name === 'Anak Perempuan');
 expect(father?.isBlocked).toBe(false);
 expect(mother?.isBlocked).toBe(false);
 expect(daughter?.isBlocked).toBe(false);
 });

 it('Suami + Saudara Perempuan Kandung (Kalalah): masing-masing 1/2', () => {
 const state = createState({ [Heir.Husband]: 1, [Heir.FullSister]: 1 });
 const result = calculateFaraidh(state, 100_000_000, 'male');
 const husband = result.heirResults.find(h => h.name === 'Suami');
 const sister = result.heirResults.find(h => h.name === 'Saudara Perempuan Kandung');
 expect(husband?.percentage).toBe(50);
 expect(sister?.percentage).toBe(50);
 });

 it('Istri + 2 Anak Perempuan + Ayah + Ibu (keluarga inti lengkap)', () => {
 const state = createState({ [Heir.Wife]: 1, [Heir.Daughter]: 2, [Heir.Father]: 1, [Heir.Mother]: 1 });
 const result = calculateFaraidh(state, 240_000_000, 'male');
 const total = result.heirResults.reduce((sum, h) => sum + (h.isBlocked ? 0 : h.percentage), 0);
 expect(total).toBeCloseTo(100, 1);
 });

 it('Paman Kandung (dari Ayah) sebagai ashabah tanpa saudara', () => {
 const state = createState({ [Heir.PaternalUncleFull]: 1, [Heir.Husband]: 1 });
 const result = calculateFaraidh(state, 100_000_000, 'male');
 const uncle = result.heirResults.find(h => h.name.includes('Paman'));
 expect(uncle?.isBlocked).toBe(false);
 expect(uncle?.percentage).toBe(50);
 });

 it('4 Istri berbagi 1/8', () => {
 const state = createState({ [Heir.Wife]: 4, [Heir.Son]: 1 });
 const result = calculateFaraidh(state, 320_000_000, 'male');
 const wife = result.heirResults.find(h => h.name === 'Istri');
 expect(wife?.percentage).toBeCloseTo(12.5, 1);
 });
});

describe('P2T5: Aul (Al-Awd) edge cases', () => {
 it('Aul klasik: Istri + 2 Anak Perempuan + Ayah + Ibu — asl naik 24->27', () => {
 const state = createState({ [Heir.Wife]: 1, [Heir.Daughter]: 2, [Heir.Father]: 1, [Heir.Mother]: 1 });
 const result = calculateFaraidh(state, 27_000_000, 'male');
 expect(result.notes.some(n => n.includes("'Aul"))).toBe(true);
 expect(result.finalDenominator).toBe(27);
 const wife = result.heirResults.find(h => h.name === 'Istri');
 expect(wife?.finalShare.numerator).toBe(3);
 expect(wife?.finalShare.denominator).toBe(27);
 });

 it('Aul: Suami + 2 Anak Perempuan + Ayah + Ibu — asl naik', () => {
 const state = createState({ [Heir.Husband]: 1, [Heir.Daughter]: 2, [Heir.Father]: 1, [Heir.Mother]: 1 });
 const result = calculateFaraidh(state, 30_000_000, 'female');
 expect(result.notes.some(n => n.includes("'Aul"))).toBe(true);
 // Husband 1/4=3/12, 2Daughters 2/3=8/12, Father 1/6=2/12, Mother 1/6=2/12 => 15/12 => asl=15
 expect(result.finalDenominator).toBe(15);
 const husband = result.heirResults.find(h => h.name === 'Suami');
 expect(husband?.finalShare.denominator).toBe(15);
 });

 it('Aul kompleks: Ibu + Suami + Saudara Seibu + Saudari Kandung', () => {
 const state = createState({ [Heir.Mother]: 1, [Heir.Husband]: 1, [Heir.MaternalBrother]: 1, [Heir.MaternalSister]: 1, [Heir.FullSister]: 2 });
 const result = calculateFaraidh(state, 100_000_000, 'female');
 const total = result.heirResults.reduce((sum, h) => sum + (h.isBlocked ? 0 : h.percentage), 0);
 expect(total).toBeCloseTo(100, 1);
 });

 it('TIDAK Aul: Anak Perempuan + Ayah + Istri — ashabah menyerap sisa', () => {
 const state = createState({ [Heir.Daughter]: 1, [Heir.Father]: 1, [Heir.Wife]: 1 });
 const result = calculateFaraidh(state, 24_000_000, 'male');
 expect(result.notes.some(n => n.includes("'Aul"))).toBe(false);
 const father = result.heirResults.find(h => h.name === 'Ayah');
 expect(father?.percentage).toBeCloseTo(37.5, 1);
 });

 it('TIDAK Aul: Ibu + Suami + Anak Perempuan — sisa dikembalikan (radd)', () => {
 const state = createState({ [Heir.Mother]: 1, [Heir.Husband]: 1, [Heir.Daughter]: 1 });
 const result = calculateFaraidh(state, 12_000_000, 'female');
 expect(result.notes.some(n => n.includes("'Aul"))).toBe(false);
 });

 it('Aul: 4 Anak Perempuan + Ayah + Ibu + Istri', () => {
 const state = createState({ [Heir.Daughter]: 4, [Heir.Father]: 1, [Heir.Mother]: 1, [Heir.Wife]: 1 });
 const result = calculateFaraidh(state, 54_000_000, 'male');
 expect(result.notes.some(n => n.includes("'Aul"))).toBe(true);
 const total = result.heirResults.reduce((sum, h) => sum + (h.isBlocked ? 0 : h.percentage), 0);
 expect(total).toBeCloseTo(100, 1);
 });
});
