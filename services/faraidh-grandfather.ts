
import type { Share, Heir, HeirResult } from '../types.ts';
import { Heir as HeirEnum } from '../types.ts';
import { LEGAL_BASIS } from '../constants.ts';
import { addShares } from './faraidh-shares.ts';

type PresentHeirs = { [key in Heir]: number };
type Shares = { [key in Heir]?: Share };
type Results = { [key in Heir]?: Partial<HeirResult> };

export const resolveGrandfatherWithSiblings = (
    present: PresentHeirs,
    shares: Shares,
    results: Results,
    ashabahHeirs: { heir: Heir, ratio: number }[]
): void => {
    // Handle Grandfather + Siblings (Muqasamah vs 1/3)
    const furudhTotalWithoutSpouse = Object.keys(shares)
        .filter(h => h !== 'husband' && h !== 'wife')
        .reduce(
            (sh, h) => addShares(sh, shares[h as Heir]!), 
            {numerator:0, denominator:1, type:'furudh'} as Share
        );
    
    const remainingShare = {
        numerator: furudhTotalWithoutSpouse.denominator - furudhTotalWithoutSpouse.numerator, 
        denominator: furudhTotalWithoutSpouse.denominator
    };
    
    const competingSiblings = (present.fullBrother > 0 || present.fullSister > 0) 
        ? { b: present.fullBrother, s: present.fullSister } 
        : { b: present.paternalBrother, s: present.paternalSister };
    
    const totalHeads = 2 + (competingSiblings.b * 2) + competingSiblings.s;
    const muqasamahValue = (remainingShare.numerator / remainingShare.denominator) * (2 / totalHeads);
    
    // Decision: Muqasamah vs 1/3 Sisa vs 1/6 Total
    // Logic: If Muqasamah yields more than 1/6 total and 1/3 remainder, take it.
    if (muqasamahValue >= (1/6) && muqasamahValue >= ((remainingShare.numerator/remainingShare.denominator)/3)) {
        ashabahHeirs.push({heir: HeirEnum.Grandfather, ratio: 2});
        if (present.fullBrother > 0 || present.fullSister > 0) {
            if (present.fullBrother > 0) ashabahHeirs.push({heir: HeirEnum.FullBrother, ratio: 2 * present.fullBrother});
            if (present.fullSister > 0) ashabahHeirs.push({heir: HeirEnum.FullSister, ratio: 1 * present.fullSister});
        } else {
            if (present.paternalBrother > 0) ashabahHeirs.push({heir: HeirEnum.PaternalBrother, ratio: 2 * present.paternalBrother});
            if (present.paternalSister > 0) ashabahHeirs.push({heir: HeirEnum.PaternalSister, ratio: 1 * present.paternalSister});
        }
        results.grandfather!.reason = `Muqasamah (Berbagi sisa dengan saudara).`;
        results.grandfather!.evidence = LEGAL_BASIS.IJMA;
    } else {
        // Best is 1/6 Fixed
        shares.grandfather = addShares(shares.grandfather || {numerator:0, denominator:1, type:'furudh'}, {numerator:1, denominator:6, type:'furudh'});
        results.grandfather!.reason = `Bagian terbaik (minimal 1/6).`;
        if (present.fullBrother > 0) ashabahHeirs.push({heir: HeirEnum.FullBrother, ratio: 2 * present.fullBrother});
        else if (present.paternalBrother > 0) ashabahHeirs.push({heir: HeirEnum.PaternalBrother, ratio: 2 * present.paternalBrother});
    }
};
