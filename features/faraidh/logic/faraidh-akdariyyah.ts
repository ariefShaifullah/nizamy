
import type { Share, HeirResult } from '../../../types.ts';
import { Heir as HeirEnum } from '../../../types.ts';
import { QURAN_REFS, LEGAL_BASIS } from '../constants.ts';

type Shares = { [key in HeirEnum]?: Share };
type Results = { [key in HeirEnum]?: Partial<HeirResult> };

export const resolveAkdariyyah = (
    shares: Shares, 
    results: Results, 
    notes: string[]
): { finalSiham: Record<string, number>, finalDenominator: number } => {
    notes.push("Kasus Al-Akdariyyah: Perhitungan khusus diterapkan pada Kakek dan Saudari Kandung untuk keadilan.");
    
    const finalSiham: Record<string, number> = {};
    
    // Standard Aul to 27
    finalSiham[HeirEnum.Husband] = 9;
    finalSiham[HeirEnum.Mother] = 6;
    finalSiham[HeirEnum.Grandfather] = 8;
    finalSiham[HeirEnum.FullSister] = 4;
    
    // Display setup
    shares[HeirEnum.Husband] = { numerator: 1, denominator: 2, type: 'furudh' };
    shares[HeirEnum.Mother] = { numerator: 1, denominator: 3, type: 'furudh' };
    shares[HeirEnum.Grandfather] = { numerator: 1, denominator: 6, type: 'furudh' };
    shares[HeirEnum.FullSister] = { numerator: 1, denominator: 2, type: 'furudh' };
    
    results[HeirEnum.Husband]!.reason = "Bagian pokok 1/2. Disesuaikan karena 'Aul menjadi 9/27.";
    results[HeirEnum.Husband]!.evidence = QURAN_REFS.AN_NISA_12;
    
    results[HeirEnum.Mother]!.reason = "Bagian pokok 1/3. Disesuaikan karena 'Aul menjadi 6/27.";
    results[HeirEnum.Mother]!.evidence = QURAN_REFS.AN_NISA_11;
    
    results[HeirEnum.Grandfather]!.reason = "Bagian pokok 1/6. Setelah 'Aul, berkongsi sisa dengan Saudari (2:1) menjadi 8/27.";
    results[HeirEnum.Grandfather]!.evidence = LEGAL_BASIS.MAZHAB_ZAID_AKDARIYYAH;

    results[HeirEnum.FullSister]!.reason = "Bagian pokok 1/2. Setelah 'Aul, berkongsi sisa dengan Kakek (1:2) menjadi 4/27.";
    results[HeirEnum.FullSister]!.evidence = LEGAL_BASIS.MAZHAB_ZAID_AKDARIYYAH;

    return { finalSiham, finalDenominator: 27 };
};
