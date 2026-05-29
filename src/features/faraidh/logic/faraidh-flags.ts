import { Heir } from '../../../types.ts';

type PresentHeirs = { [key in Heir]: number };

/**
 * Centralized computation of boolean flags derived from present heirs.
 * Single source of truth — used by faraidh.service.ts, faraidh-hajb.ts,
 * faraidh-shares.ts, faraidh-ashabah.ts, and special-case resolvers.
 */
export interface HeirFlags {
 sonExists: boolean;
 daughterExists: boolean;
 fatherExists: boolean;
 grandfatherExists: boolean;
 grandsonExists: boolean;
 granddaughterExists: boolean;
 fullBrotherExists: boolean;
 fullSisterExists: boolean;
 paternalBrotherExists: boolean;
 paternalSisterExists: boolean;
 maleDescendantExists: boolean;
 femaleDescendantExists: boolean;
 descendantExists: boolean;
 ascendantMaleExists: boolean;
 /** Grandfather + (no Father) + (no male descendant) + siblings present */
 isGrandfatherWithSiblings: boolean;
 /** Akdariyyah: Husband + Mother + Grandfather + exactly 1 Full Sister, no blocking heirs */
 isAkdariyyah: boolean;
 // --- Dzawil Arham flags ---
 /** Any arham heir is present */
 arhamExists: boolean;
 /** No ashhab al-furudh and no ashabah exist — arham can inherit */
 isArhamOnlyScenario: boolean;
 /** Daughter's children exist */
 daughterSonExists: boolean;
 daughterDaughterExists: boolean;
 /** Children of siblings exist */
 fullSisterSonExists: boolean;
 fullBrotherDaughterExists: boolean;
 paternalBrotherDaughterExists: boolean;
 /** Aunts/uncles exist */
 paternalAuntExists: boolean;
 paternalAuntPaternalExists: boolean;
 maternalAuntExists: boolean;
 maternalUncleExists: boolean;
 /** Extended Ashabah: paternal uncles (KHI Pasal 175 p.8-9) */
 paternalUncleFullExists: boolean;
 paternalUnclePaternalExists: boolean;
 /** Extended Ashabah: nephews — male children of siblings (KHI Pasal 175 p.6-7) */
 fullBrotherSonExists: boolean;
 paternalBrotherSonExists: boolean;
 /** Extended Ashabah: male cousins (KHI Pasal 175 p.10-11) */
 paternalUnclesSonFullExists: boolean;
 /** Dzawil Arham: female cousins */
 paternalUnclesDaughterFullExists: boolean;
 /** Extended Ashabah: male cousins via paternal line (KHI Pasal 175 p.10-11) */
 paternalUnclesSonPaternalExists: boolean;
 /** Dzawil Arham: female cousins via paternal line */
 paternalUnclesDaughterPaternalExists: boolean;
 }

export function computeHeirFlags(present: PresentHeirs): HeirFlags {
 const sonExists = present.son > 0;
 const daughterExists = present.daughter > 0;
 const fatherExists = present.father > 0;
 const grandfatherExists = present.grandfather > 0;
 const grandsonExists = present.grandson > 0;
 const granddaughterExists = present.granddaughter > 0;
 const fullBrotherExists = present.fullBrother > 0;
 const fullSisterExists = present.fullSister > 0;
 const paternalBrotherExists = present.paternalBrother > 0;
 const paternalSisterExists = present.paternalSister > 0;

 const maleDescendantExists = sonExists || grandsonExists;
 const femaleDescendantExists = daughterExists || granddaughterExists;
 const descendantExists = sonExists || daughterExists || grandsonExists || granddaughterExists;
 const ascendantMaleExists = fatherExists || grandfatherExists;

 const isGrandfatherWithSiblings = grandfatherExists && !fatherExists && !maleDescendantExists &&
 (fullBrotherExists || fullSisterExists || paternalBrotherExists || paternalSisterExists);

 const isAkdariyyah = present.husband === 1 && present.mother === 1 && present.grandfather === 1 && present.fullSister === 1 &&
 !sonExists && !daughterExists && !grandsonExists && !granddaughterExists && !fatherExists && !fullBrotherExists;

 // --- Dzawil Arham flags ---
 const daughterSonExists = present.daughterSon > 0;
 const daughterDaughterExists = present.daughterDaughter > 0;
 const fullSisterSonExists = present.fullSisterSon > 0;
 const fullBrotherDaughterExists = present.fullBrotherDaughter > 0;
 const paternalBrotherDaughterExists = present.paternalBrotherDaughter > 0;
 const paternalAuntExists = present.paternalAunt > 0;
 const paternalAuntPaternalExists = present.paternalAuntPaternal > 0;
 const maternalAuntExists = present.maternalAunt > 0;
 const maternalUncleExists = present.maternalUncle > 0;
 const paternalUnclesDaughterFullExists = present.paternalUnclesDaughterFull > 0;
 const paternalUnclesDaughterPaternalExists = present.paternalUnclesDaughterPaternal > 0;

 // --- Extended Ashabah flags (KHI Pasal 175 points 6-11) ---
 const fullBrotherSonExists = present.fullBrotherSon > 0;
 const paternalBrotherSonExists = present.paternalBrotherSon > 0;
 const paternalUncleFullExists = present.paternalUncleFull > 0;
 const paternalUnclePaternalExists = present.paternalUnclePaternal > 0;
 const paternalUnclesSonFullExists = present.paternalUnclesSonFull > 0;
 const paternalUnclesSonPaternalExists = present.paternalUnclesSonPaternal > 0;

 // Arham heirs = only those per KHI Pasal 176 (connected through female line, or female via male line)
 const arhamExists = daughterSonExists || daughterDaughterExists ||
 fullSisterSonExists || fullBrotherDaughterExists ||
 paternalBrotherDaughterExists ||
 paternalAuntExists || paternalAuntPaternalExists || maternalAuntExists || maternalUncleExists ||
 paternalUnclesDaughterFullExists || paternalUnclesDaughterPaternalExists;

 // Extended ashabah = KHI Pasal 175 points 6-11
 const extendedAsabahExists = fullBrotherSonExists || paternalBrotherSonExists ||
 paternalUncleFullExists || paternalUnclePaternalExists ||
 paternalUnclesSonFullExists || paternalUnclesSonPaternalExists;

 // Arham-only scenario: no furudh heirs (except spouse) and no ashabah (including extended)
 // Arham inherit when there's no son, grandson, father, grandfather, full brother, paternal brother,
 // no extended ashabah, and no full sister/paternal sister who are ashabah.
 // Spouse is NOT an ashabah — they always get their furudh share, arham get the remainder.
 const hasMaleAsl = fatherExists || grandfatherExists; // male ascendants (ashl)
 const hasMaleFar = sonExists || grandsonExists; // male descendants (far')
 const hasMaleSiblingAsabah = fullBrotherExists || paternalBrotherExists;
 const hasFemaleSiblingAsabah = (fullSisterExists && (femaleDescendantExists || hasMaleAsl)) ||
 (paternalSisterExists && (femaleDescendantExists || hasMaleAsl || fullBrotherExists || (fullSisterExists && !paternalBrotherExists)));
 // Simplified: arham-only if no male asl, no male far', no male sibling ashabah, no extended ashabah
 const isArhamOnlyScenario = arhamExists && !hasMaleFar && !hasMaleAsl && !hasMaleSiblingAsabah &&
 !extendedAsabahExists && !hasFemaleSiblingAsabah;

 return {
 sonExists, daughterExists, fatherExists, grandfatherExists,
 grandsonExists, granddaughterExists, fullBrotherExists, fullSisterExists,
 paternalBrotherExists, paternalSisterExists,
 maleDescendantExists, femaleDescendantExists, descendantExists, ascendantMaleExists,
 isGrandfatherWithSiblings, isAkdariyyah,
 arhamExists, isArhamOnlyScenario,
 daughterSonExists, daughterDaughterExists,
 fullBrotherSonExists, fullSisterSonExists, fullBrotherDaughterExists,
 paternalBrotherSonExists, paternalBrotherDaughterExists,
 paternalUncleFullExists, paternalUnclePaternalExists,
 paternalAuntExists, paternalAuntPaternalExists, maternalAuntExists, maternalUncleExists,
 paternalUnclesSonFullExists, paternalUnclesDaughterFullExists,
 paternalUnclesSonPaternalExists, paternalUnclesDaughterPaternalExists,
 };
}
