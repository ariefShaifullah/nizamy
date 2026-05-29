/**
 * faraidh-arham.ts — Dzawil Arham (Distant Kindred) Distribution
 *
 * Implements the tanzil (substitution) method per KHI Pasal 174-193.
 * Dzawil arham inherit ONLY when no ashhab al-furudh or ashabah exist
 * (spouse is an exception — spouse always gets their furudh, arham get the remainder).
 *
 * Tier System (KHI):
 *   Tier 1: Children of daughters (daughterSon, daughterDaughter)
 *           → Step into daughter's position, share 2:1 (male:female)
 * Tier 2: Children of siblings — female only (fullBrotherDaughter, fullSisterSon,
 *          paternalBrotherDaughter)
 * → Step into sibling's position
 * Tier 3: Aunts & maternal uncle (paternalAunt, paternalAuntPaternal,
 *          maternalAunt, maternalUncle)
 * → Step into parent's position
 * Tier 4: Female cousins (paternalUnclesDaughterFull, paternalUnclesDaughterPaternal)
 * → Step into paternal uncle's position
 *
 * NOTE: Male relatives through male lines (FullBrotherSon, PaternalBrotherSon,
 * PaternalUncleFull, PaternalUnclePaternal, PaternalUnclesSonFull,
 * PaternalUnclesSonPaternal) are ASHABAH per KHI Pasal 175, NOT dzawil arham.
 * They inherit by ta'sib, not tanzil.
 *
 * Higher tier blocks lower tier. Within a tier, closer heir blocks more distant.
 * If multiple tiers exist and only one is unblocked, that tier gets the entire arham share.
 */

import { Heir, type Share, type HeirResult } from '../../../types.ts';
import { HEIR_LABELS, LEGAL_BASIS, QURAN_REFS } from '../constants.ts';
import { type HeirFlags } from './faraidh-flags.ts';

/** Greatest common divisor */
function gcd(a: number, b: number): number {
 a = Math.abs(a);
 b = Math.abs(b);
 while (b) { [a, b] = [b, a % b]; }
 return a;
}

type PresentHeirs = { [key in Heir]: number };

export interface ArhamResult {
 /** Heir results for arham heirs */
 heirResults: Partial<HeirResult>[];
 /** Notes explaining the arham distribution */
 notes: string[];
 /** Remaining estate after arham distribution (usually 0 if arham consumed all) */
 remainingEstate: number;
 /** Total shares for ulul-asba arithmetic */
 totalShares: number;
 /** Common denominator */
 commonDenominator: number;
}

/**
 * Pure function: distributes estate among dzawil arham.
 * Called ONLY when isArhamOnlyScenario is true (or when remainder exists
 * after spouse's furudh and no other ashabah).
 */
export function distributeArham(
 present: PresentHeirs,
 flags: HeirFlags,
 estate: number,
 spouseShare: number = 0, // portion already consumed by spouse
): ArhamResult {
 const notes: string[] = [];
 const heirResults: Partial<HeirResult>[] = [];

 // Estate available for arham (after spouse)
 const arhamEstate = Math.max(0, estate - spouseShare);

 if (arhamEstate === 0) {
 return { heirResults, notes, remainingEstate: 0, totalShares: 0, commonDenominator: 1 };
 }

 notes.push("Pembagian Dzawil Arham berdasarkan metode Tanzil (KHI Pasal 174-193).");

 // ============================================
 // Determine which arham tiers are active
 // (after hajb has already been applied in faraidh-hajb.ts)
 // ============================================

 const tier1 = [
 { key: Heir.DaughterSon, count: present[Heir.DaughterSon], weight: 2, label: HEIR_LABELS[Heir.DaughterSon] },
 { key: Heir.DaughterDaughter, count: present[Heir.DaughterDaughter], weight: 1, label: HEIR_LABELS[Heir.DaughterDaughter] },
 ].filter(h => h.count > 0);

 const tier2 = [
 { key: Heir.FullBrotherDaughter, count: present[Heir.FullBrotherDaughter], weight: 1, label: HEIR_LABELS[Heir.FullBrotherDaughter] },
 { key: Heir.FullSisterSon, count: present[Heir.FullSisterSon], weight: 1, label: HEIR_LABELS[Heir.FullSisterSon] },
 { key: Heir.PaternalBrotherDaughter, count: present[Heir.PaternalBrotherDaughter], weight: 1, label: HEIR_LABELS[Heir.PaternalBrotherDaughter] },
 ].filter(h => h.count > 0);

 const tier3 = [
 { key: Heir.PaternalAunt, count: present[Heir.PaternalAunt], weight: 1, label: HEIR_LABELS[Heir.PaternalAunt] },
 { key: Heir.PaternalAuntPaternal, count: present[Heir.PaternalAuntPaternal], weight: 1, label: HEIR_LABELS[Heir.PaternalAuntPaternal] },
 { key: Heir.MaternalAunt, count: present[Heir.MaternalAunt], weight: 1, label: HEIR_LABELS[Heir.MaternalAunt] },
 { key: Heir.MaternalUncle, count: present[Heir.MaternalUncle], weight: 1, label: HEIR_LABELS[Heir.MaternalUncle] },
 ].filter(h => h.count > 0);

 const tier4 = [
 { key: Heir.PaternalUnclesDaughterFull, count: present[Heir.PaternalUnclesDaughterFull], weight: 1, label: HEIR_LABELS[Heir.PaternalUnclesDaughterFull] },
 { key: Heir.PaternalUnclesDaughterPaternal, count: present[Heir.PaternalUnclesDaughterPaternal], weight: 1, label: HEIR_LABELS[Heir.PaternalUnclesDaughterPaternal] },
 ].filter(h => h.count > 0);

 // Higher tier blocks lower tier
 // Tier 1 active → Tier 2, 3, 4 get nothing
 // Tier 2 active → Tier 3, 4 get nothing
 // Tier 3 active → Tier 4 gets nothing
 const activeTier = tier1.length > 0 ? 1 : tier2.length > 0 ? 2 : tier3.length > 0 ? 3 : tier4.length > 0 ? 4 : 0;

 if (activeTier === 0) {
 return { heirResults, notes: ["Tidak ada dzawil arham yang berhak menerima warisan."], remainingEstate: arhamEstate, totalShares: 0, commonDenominator: 1 };
 }

 // Within tier 2, full brother's children take priority over paternal brother's children
 // Within tier 3, paternal aunt takes priority over paternal aunt paternal; both over maternal

 // ============================================
 // Distribute among the active tier
 // ============================================

 let activeHeirs: { key: Heir; count: number; weight: number; label: string }[] = [];
 let distributionNote = "";

 if (activeTier === 1) {
 // Tier 1: Daughter's children — 2:1 male:female ratio
 // Per KHI, they step into the daughter's position.
 // Multiple daughters' children share the daughter's portion with 2:1.
 activeHeirs = tier1;
 distributionNote = "Cucu dari anak perempuan menggantikan posisi anak perempuan (metode tanzil), dengan perbandingan 2:1 (laki-laki:perempuan).";
 } else if (activeTier === 2) {
 // Tier 2: Children of siblings — female only (dzawil arham per KHI Pasal 176)
 // Per KHI, they step into the sibling's position.
 // Sub-tier: full sibling's children block paternal sibling's children
 // All weights are 1 since these are all female heirs (or via female line)
 const hasFullSiblingChildren = tier2.some(h =>
 h.key === Heir.FullBrotherDaughter || h.key === Heir.FullSisterSon
 );
 const hasPaternalSiblingChildren = tier2.some(h =>
 h.key === Heir.PaternalBrotherDaughter
 );

 if (hasFullSiblingChildren) {
 // BUG FIX: Per KHI tanzil, FullBrotherDaughter blocks FullSisterSon
 // because the full brother's line is stronger (ashabah lineage).
 // FullBrotherDaughter steps into FullBrother's position.
 const hasFullBrotherDaughter = tier2.some(h => h.key === Heir.FullBrotherDaughter);
 if (hasFullBrotherDaughter) {
 activeHeirs = tier2.filter(h => h.key === Heir.FullBrotherDaughter);
 // Block FullSisterSon (nephew through sister is weaker than niece through brother)
 for (const blocked of tier2.filter(h =>
 h.key === Heir.FullSisterSon || h.key === Heir.PaternalBrotherDaughter
 )) {
 heirResults.push({
 name: blocked.label,
 isBlocked: true,
 reason: blocked.key === Heir.FullSisterSon
 ? "Terhalang oleh anak perempuan saudara kandung laki-laki yang lebih dekat."
 : "Terhalang oleh anak perempuan saudara kandung yang lebih dekat.",
 evidence: LEGAL_BASIS.HADITH_NEAREST_MALE,
 share: { numerator: 0, denominator: 1, type: 'arham' },
 finalShare: { numerator: 0, denominator: 1, type: 'arham' },
 value: 0,
 percentage: 0,
 count: blocked.count,
 });
 }
 distributionNote = "Anak perempuan dari saudara kandung laki-laki menggantikan posisi saudara kandung (metode tanzil).";
 } else {
 // FullSisterSon present but no FullBrotherDaughter
 activeHeirs = tier2.filter(h => h.key === Heir.FullSisterSon);
 // Block paternal brother's daughter
 for (const blocked of tier2.filter(h =>
 h.key === Heir.PaternalBrotherDaughter
 )) {
 heirResults.push({
 name: blocked.label,
 isBlocked: true,
 reason: "Terhalang oleh anak saudara kandung yang lebih dekat.",
 evidence: LEGAL_BASIS.HADITH_NEAREST_MALE,
 share: { numerator: 0, denominator: 1, type: 'arham' },
 finalShare: { numerator: 0, denominator: 1, type: 'arham' },
 value: 0,
 percentage: 0,
 count: blocked.count,
 });
 }
 distributionNote = "Anak laki-laki dari saudara perempuan kandung menggantikan posisi saudara (metode tanzil).";
 }
 } else {
 // Only paternal sibling's daughter
 activeHeirs = tier2.filter(h =>
 h.key === Heir.PaternalBrotherDaughter
 );
 distributionNote = "Anak perempuan dari saudara seayah menggantikan posisi saudara seayah (metode tanzil).";
 }
 } else if (activeTier === 3) {
 // Tier 3: Aunts & maternal uncle (dzawil arham per KHI Pasal 176)
 // Male paternal uncles are ashabah (KHI Pasal 175), not here.
 // Priority: paternalAunt > paternalAuntPaternal > maternalAunt/maternalUncle

 const hasPaternalAunt = tier3.some(h => h.key === Heir.PaternalAunt);
 const hasPaternalAuntPaternal = tier3.some(h => h.key === Heir.PaternalAuntPaternal);
 const hasMaternalKin = tier3.some(h =>
 h.key === Heir.MaternalAunt || h.key === Heir.MaternalUncle
 );

 if (hasPaternalAunt) {
 // Paternal aunt blocks paternal aunt paternal and maternal kin
 activeHeirs = tier3.filter(h => h.key === Heir.PaternalAunt);
 const blockedKeys = [Heir.PaternalAuntPaternal, Heir.MaternalAunt, Heir.MaternalUncle];
 for (const bk of blockedKeys) {
 const blocked = tier3.find(h => h.key === bk);
 if (blocked) {
 heirResults.push({
 name: blocked.label,
 isBlocked: true,
 reason: "Terhalang oleh bibi kandung yang lebih dekat.",
 evidence: LEGAL_BASIS.HADITH_NEAREST_MALE,
 share: { numerator: 0, denominator: 1, type: 'arham' },
 finalShare: { numerator: 0, denominator: 1, type: 'arham' },
 value: 0,
 percentage: 0,
 count: blocked.count,
 });
 }
 }
 distributionNote = "Bibi kandung menggantikan posisi ayah (metode tanzil).";
 } else if (hasPaternalAuntPaternal) {
 // Paternal aunt paternal blocks maternal kin
 activeHeirs = tier3.filter(h => h.key === Heir.PaternalAuntPaternal);
 const blockedKeys = [Heir.MaternalAunt, Heir.MaternalUncle];
 for (const bk of blockedKeys) {
 const blocked = tier3.find(h => h.key === bk);
 if (blocked) {
 heirResults.push({
 name: blocked.label,
 isBlocked: true,
 reason: "Terhalang oleh bibi seayah yang lebih dekat.",
 evidence: LEGAL_BASIS.HADITH_NEAREST_MALE,
 share: { numerator: 0, denominator: 1, type: 'arham' },
 finalShare: { numerator: 0, denominator: 1, type: 'arham' },
 value: 0,
 percentage: 0,
 count: blocked.count,
 });
 }
 }
 distributionNote = "Bibi seayah menggantikan posisi ayah melalui seayah (metode tanzil).";
 } else if (hasMaternalKin) {
 // Only maternal kin — share equally (no 2:1 distinction for maternal side per KHI)
 activeHeirs = tier3.filter(h =>
 h.key === Heir.MaternalAunt || h.key === Heir.MaternalUncle
 );
 distributionNote = "Bibi/paman seibu menggantikan posisi ibu (metode tanzil).";
 }
 } else if (activeTier === 4) {
 // Tier 4: Female cousins only (dzawil arham per KHI Pasal 176)
 // Male cousins are ashabah (KHI Pasal 175), not here.
 // Sub-tier: full uncle's daughter blocks paternal uncle's daughter

 const hasFullUncleDaughter = tier4.some(h =>
 h.key === Heir.PaternalUnclesDaughterFull
 );
 const hasPaternalUncleDaughter = tier4.some(h =>
 h.key === Heir.PaternalUnclesDaughterPaternal
 );

 if (hasFullUncleDaughter) {
 // Full uncle's daughter blocks paternal uncle's daughter
 activeHeirs = tier4.filter(h =>
 h.key === Heir.PaternalUnclesDaughterFull
 );
 for (const blocked of tier4.filter(h =>
 h.key === Heir.PaternalUnclesDaughterPaternal
 )) {
 heirResults.push({
 name: blocked.label,
 isBlocked: true,
 reason: "Terhalang oleh anak perempuan paman kandung yang lebih dekat.",
 evidence: LEGAL_BASIS.HADITH_NEAREST_MALE,
 share: { numerator: 0, denominator: 1, type: 'arham' },
 finalShare: { numerator: 0, denominator: 1, type: 'arham' },
 value: 0,
 percentage: 0,
 count: blocked.count,
 });
 }
 distributionNote = "Sepupu perempuan kandung menggantikan posisi paman kandung (metode tanzil).";
 } else {
 // Only paternal uncle's daughter
 activeHeirs = tier4.filter(h =>
 h.key === Heir.PaternalUnclesDaughterPaternal
 );
 distributionNote = "Sepupu perempuan seayah menggantikan posisi paman seayah (metode tanzil).";
 }
 }

 notes.push(distributionNote);

 if (activeHeirs.length === 0) {
 return { heirResults, notes, remainingEstate: arhamEstate, totalShares: 0, commonDenominator: 1 };
 }

 // ============================================
 // Calculate shares using ulul-asba method
 // ============================================

 // Total weighted shares
 let totalShares = 0;
 for (const h of activeHeirs) {
 totalShares += h.count * h.weight;
 }

 // Common denominator for all shares
 let commonDenominator = totalShares;
 for (const h of activeHeirs) {
 const individualDenom = totalShares;
 const g = gcd(h.weight, commonDenominator);
 commonDenominator = (commonDenominator * individualDenom) / g;
 }
 // Simplify: just use totalShares as denominator
 commonDenominator = totalShares;

 let distributed = 0;

 for (const h of activeHeirs) {
 const groupShares = h.count * h.weight; // total weight for this heir type
 const shareNumerator = h.weight;
 const individualValue = Math.floor((arhamEstate * groupShares) / totalShares);
 distributed += individualValue;

 const individualShare = Math.floor(individualValue / h.count);
 // BUG FIX: Percentage must be relative to total net estate, not arham sub-estate.
 // E.g., if spouse takes 1/4 and arham share the 3/4 remainder, an heir
 // getting all of the arham-estate should show 75%, not 100%.
 const percentage = Math.round((groupShares / totalShares) * (arhamEstate / estate) * 10000) / 100;

 const share: Share = {
 numerator: shareNumerator,
 denominator: commonDenominator,
 type: 'arham',
 };
 const finalShare: Share = {
 numerator: shareNumerator,
 denominator: commonDenominator,
 type: 'arham',
 };

 let reason = `Dzawil Arham Tier ${activeTier} — ${distributionNote}`;
 let evidence = QURAN_REFS.AN_NISA_176; // General inheritance reference

 if (activeTier === 1) {
 evidence = "KHI Pasal 176-177";
 reason = "Menggantikan posisi anak perempuan (tanzil), bagian 2:1 laki-laki:perempuan.";
 } else if (activeTier === 2) {
 evidence = "KHI Pasal 178-183";
 reason = "Menggantikan posisi saudara (tanzil).";
 } else if (activeTier === 3) {
 evidence = "KHI Pasal 184-193";
 reason = "Menggantikan posisi orang tua (tanzil).";
 }

 heirResults.push({
 name: h.label,
 share,
 finalShare,
 value: individualShare,
 percentage,
 count: h.count,
 reason,
 evidence,
 isBlocked: false,
 });
 }

 // Handle rounding remainder
 const remainder = arhamEstate - distributed;
 if (remainder > 0 && heirResults.length > 0) {
 // Give remainder to the highest-weight heir
 const highest = heirResults.reduce((best, cur) =>
 (!cur.isBlocked && cur.share!.numerator > (best.share?.numerator ?? 0)) ? cur : best
 , heirResults[0]);
 if (highest && !highest.isBlocked) {
 highest.value = (highest.value ?? 0) + remainder;
 }
 }

 notes.push(`Total bagian arham: ${totalShares}, setiap bagian = 1/${totalShares} dari sisa harta.`);

 return {
 heirResults,
 notes,
 remainingEstate: 0,
 totalShares,
 commonDenominator,
 };
}
