import { describe, it, expect } from 'vitest';
import { calculateRiskScore, calculateDynamicScore } from './hede.service.ts';

describe('HEDE Service', () => {
    describe('calculateRiskScore', () => {
        it('returns safe score for clean financial profile', () => {
            const answers = {
                'job_role': 'office',
                'job_contract': 'clear',
                'job_tools': 'original',
                'job_risywah': 'clean',
                'fin_debt': 'debt_free',
                'fin_insurance': 'none_bpjs',
                'fin_invest': 'real_asset',
                'fin_zakat': 'routine',
                'fin_inheritance': 'no_inheritance',
                'dig_ewallet': 'pass_through',
                'dig_paylater': 'no',
                'dig_gacha': 'clean_gamer',
                'em_fund': 'safe',
            };

            const result = calculateRiskScore(answers);

            expect(result.totalScore).toBeGreaterThanOrEqual(80);
            expect(result.riskLevel).toMatch(/safe|low/);
            expect(result.risks.length).toBe(0);
        });

        it('returns critical score for riba involvement (poison logic)', () => {
            const answers = {
                'job_role': 'office',
                'job_contract': 'clear',
                'job_tools': 'original',
                'job_risywah': 'clean',
                'fin_debt': 'kpr_conv', // Critical Riba - conventional mortgage
                'fin_invest': 'none',
                'fin_insurance': 'none_bpjs',
                'fin_zakat': 'routine',
                'fin_inheritance': 'no_inheritance',
                'dig_ewallet': 'pass_through',
                'dig_paylater': 'no',
                'em_fund': 'safe',
            };

            const result = calculateRiskScore(answers);

            // Poison logic: any riba should cap score
            expect(result.totalScore).toBeLessThanOrEqual(50);
            expect(result.riskLevel).toMatch(/critical|high/);
            expect(result.risks.length).toBeGreaterThan(0);

            const ribaRisk = result.risks.find(r => r.violationType === 'riba');
            expect(ribaRisk).toBeDefined();
        });

        it('generates roadmap steps for detected risks', () => {
            const answers = {
                'job_role': 'office',
                'job_contract': 'clear',
                'job_tools': 'original',
                'job_risywah': 'clean',
                'fin_debt': 'kpr_conv', // This triggers roadmap
                'fin_invest': 'none',
                'fin_insurance': 'none_bpjs',
                'fin_zakat': 'routine',
                'fin_inheritance': 'no_inheritance',
                'dig_ewallet': 'pass_through',
                'dig_paylater': 'no',
                'em_fund': 'safe',
            };

            const result = calculateRiskScore(answers);

            // Should have roadmap steps related to debt
            expect(result.roadmap.length).toBeGreaterThan(0);
        });

        it('applies gradual approach for high hardship users', () => {
            const answers = {
                'job_role': 'office',
                'job_contract': 'clear',
                'job_tools': 'original',
                'job_risywah': 'clean',
                'fin_debt': 'kpr_conv', // Critical riba
                'fin_invest': 'none',
                'fin_insurance': 'none_bpjs',
                'fin_zakat': 'routine',
                'fin_inheritance': 'no_inheritance',
                'dig_ewallet': 'pass_through',
                'dig_paylater': 'no',
                'em_fund': 'danger', // High hardship - critical fund
            };

            const result = calculateRiskScore(answers);

            expect(result.fiqhContext.approach).toBe('gradual_exit');
        });
    });

    describe('calculateDynamicScore', () => {
        it('returns 100 when no steps exist', () => {
            const score = calculateDynamicScore(50, 0, 0);
            expect(score).toBe(100);
        });

        it('returns base score when no progress', () => {
            const score = calculateDynamicScore(40, 10, 0);
            expect(score).toBe(40);
        });

        it('returns 100 when all steps completed', () => {
            const score = calculateDynamicScore(40, 10, 10);
            expect(score).toBe(100);
        });

        it('calculates progress correctly for partial completion', () => {
            // 50% completion: 40 + (100-40) * 0.5 = 40 + 30 = 70
            const score = calculateDynamicScore(40, 10, 5);
            expect(score).toBe(70);
        });
    });
});
