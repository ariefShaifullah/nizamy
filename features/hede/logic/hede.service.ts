
import type { HedeResult, RiskFactor, ActionStep, CategoryScore, HedeCategory, RiskLevel } from '../../../types.ts';
import { QUESTIONS_DB } from '../constants.ts';

// Helper: Generate specific steps based on category, violation type, and approach
const generateStepsForRisk = (
    risk: RiskFactor, 
    approach: 'immediate_exit' | 'gradual_exit' | 'maintenance'
): ActionStep[] => {
    const steps: ActionStep[] = [];
    const isGradual = approach === 'gradual_exit';

    // 1. SPECIAL ECOSYSTEM INTEGRATION (Cross-Selling Features)
    if (risk.id === 'risk_fin_zakat') {
        steps.push({
            phase: 'short_term',
            action: "Hitung potensi Zakat Maal Anda sekarang untuk membersihkan harta.",
            impact: "Membersihkan harta dari hak fakir miskin (Tathhir).",
            difficulty: 'easy',
            cta: '/zakat',
            ctaLabel: 'Buka Kalkulator Zakat'
        });
        return steps; 
    }
    
    if (risk.id === 'risk_fin_inheritance') {
        steps.push({
            phase: 'short_term',
            action: "Segera hitung & bagikan harta warisan yang tertahan sesuai syariat.",
            impact: "Mencegah sengketa keluarga dan memakan harta batil (Ghasab).",
            difficulty: 'medium',
            cta: '/faraidh',
            ctaLabel: 'Buka Kalkulator Waris'
        });
        return steps;
    }

    // 2. VIOLATION BASED LOGIC
    if (risk.violationType === 'riba') {
        steps.push({
            phase: 'short_term',
            action: "Taubat Nasuha & Stop menambah utang baru (Top-up/Gali lubang tutup lubang).",
            impact: "Memutus rantai dosa Riba yang diperangi Allah.",
            difficulty: 'easy'
        });
        
        if (risk.category === 'finance' || risk.category === 'payment') {
            if (isGradual) {
                steps.push({
                    phase: 'mid_term',
                    action: "Jual aset sekunder (Gadget/Kendaraan/Tas Branded) untuk melunasi pokok utang.",
                    impact: "Mengurangi beban bunga drastis & mempercepat lunas.",
                    difficulty: 'medium'
                });
            } else {
                steps.push({
                    phase: 'mid_term',
                    action: "Likuidasi aset investasi & tabungan untuk pelunasan total.",
                    impact: "Membersihkan harta dari sisa Riba seketika.",
                    difficulty: 'hard'
                });
            }
        } else if (risk.category === 'job') {
             steps.push({
                phase: 'mid_term',
                action: isGradual 
                    ? "Mulai membangun 'Side Hustle' atau melamar kerja di sektor riil." 
                    : "Ajukan resign. Yakinlah rezeki Allah itu luas.",
                impact: "Transisi dari pencatat riba menjadi pencari rezeki halal.",
                difficulty: 'hard'
            });
        }
    } else if (risk.violationType === 'gharar') {
        steps.push({
            phase: 'short_term',
            action: "Perbaiki akad kerja/bisnis. Pastikan jobdesc & KPI jelas (Ijarah/Ju'alah).",
            impact: "Menghilangkan ketidakjelasan yang memicu sengketa.",
            difficulty: 'medium'
        });
    } else if (risk.violationType === 'maysir') {
        steps.push({
            phase: 'short_term',
            action: "Tarik seluruh modal pokok (Cut Loss jika perlu). Tinggalkan market futures/judi.",
            impact: "Menyelamatkan sisa harta dari kehancuran spekulasi.",
            difficulty: 'hard'
        });
    } else if (risk.violationType === 'zulm') {
        if (risk.category === 'digital' || risk.category === 'payment') {
             steps.push({
                phase: 'short_term',
                action: "Tutup akun/kartu tersebut. Jangan menyepakati denda riba meski yakin bisa bayar.",
                impact: "Keluar dari perjanjian yang batil.",
                difficulty: 'medium'
            });
        }
    }

    if (risk.category === 'digital' && risk.description.includes('E-Wallet')) {
         steps.push({
            phase: 'short_term',
            action: "Kosongkan saldo mengendap. Top-up hanya saat checkout (Pass-through).",
            impact: "Menghindari Riba Qardh (Utang yang mengambil manfaat diskon).",
            difficulty: 'easy'
        });
    }

    return steps;
};

export const calculateRiskScore = (answers: Record<string, string>): HedeResult => {
    const categoryScores: Record<HedeCategory, { totalWeight: number; count: number; maxRisk: number }> = {
        job: { totalWeight: 0, count: 0, maxRisk: 0 },
        business: { totalWeight: 0, count: 0, maxRisk: 0 },
        finance: { totalWeight: 0, count: 0, maxRisk: 0 },
        digital: { totalWeight: 0, count: 0, maxRisk: 0 },
        payment: { totalWeight: 0, count: 0, maxRisk: 0 },
        emergency: { totalWeight: 0, count: 0, maxRisk: 0 }
    };

    let hardshipScore = 0;
    const risks: RiskFactor[] = [];
    let roadmap: ActionStep[] = [];
    
    // Track Global Max Risk to enforce "Weakest Link" logic
    let globalMaxRisk = 0;

    // Process Answers
    QUESTIONS_DB.forEach(q => {
        const answerValue = answers[q.id];
        if (!answerValue) return;

        const selectedOption = q.options.find(opt => opt.value === answerValue);
        if (!selectedOption) return;

        // Update Category Stats
        if (q.category !== 'emergency') {
            categoryScores[q.category].totalWeight += selectedOption.riskWeight;
            categoryScores[q.category].count += 1;
            categoryScores[q.category].maxRisk = Math.max(categoryScores[q.category].maxRisk, selectedOption.riskWeight);
            
            // Update Global Max Risk
            globalMaxRisk = Math.max(globalMaxRisk, selectedOption.riskWeight);
        } else {
            hardshipScore += (selectedOption.hardshipWeight || 0);
        }

        // Detect Risks (Weight >= 30 is typically Syubhat/Warning)
        if (selectedOption.riskWeight >= 30) {
            let desc = '';
            let rule = '';
            
            switch (selectedOption.violationType) {
                case 'riba':
                    desc = "Terindikasi adanya transaksi Riba (Bunga/Pertambahan nilai pinjaman).";
                    rule = "QS. Al-Baqarah: 275 - Allah menghalalkan jual beli dan mengharamkan riba.";
                    break;
                case 'gharar':
                    desc = "Terdapat ketidakjelasan (Gharar) dalam objek atau akad transaksi.";
                    rule = "Hadits: Rasulullah SAW melarang jual beli gharar (HR. Muslim).";
                    break;
                case 'maysir':
                    desc = "Mengandung unsur spekulasi tinggi atau perjudian (Zero Sum Game).";
                    rule = "QS. Al-Maidah: 90 - Judi adalah perbuatan keji termasuk perbuatan syaitan.";
                    break;
                case 'zulm':
                    desc = "Akad bermasalah/rusak (Fasid) atau mengambil hak orang lain (Ghasab).";
                    rule = "Kaidah: Kerusakan akad membatalkan keberkahan transaksi.";
                    break;
                default:
                    desc = "Risiko syariah ringan/syubhat yang perlu diperhatikan.";
                    rule = "Tinggalkan yang meragukan menuju yang tidak meragukan.";
            }

            risks.push({
                id: `risk_${q.id}`,
                category: q.category,
                title: q.text, 
                description: desc,
                // Assign visual level based on individual question weight
                riskLevel: selectedOption.riskWeight >= 80 ? 'critical' : selectedOption.riskWeight >= 50 ? 'high' : 'medium',
                violationType: selectedOption.violationType || 'none',
                fiqhRule: rule
            });
        }
    });

    // Normalize Hardship Score
    const emergencyQCount = QUESTIONS_DB.filter(q => q.category === 'emergency').length;
    hardshipScore = emergencyQCount > 0 ? hardshipScore / emergencyQCount : 0;

    // --- SCORING LOGIC V2 (Constraint-Based) ---
    
    // 1. Calculate Category Scores (For Radar Chart Only)
    // We still use average for the visual chart breakdown to show which area is "relatively" better.
    const finalCategoryScores: CategoryScore[] = Object.keys(categoryScores)
        .filter(k => k !== 'emergency')
        .map(key => {
            const cat = key as HedeCategory;
            const data = categoryScores[cat];
            
            // Logic: Base score 100 minus weighted average risk
            const avgRisk = data.count > 0 ? data.totalWeight / data.count : 0;
            let score = Math.max(0, 100 - avgRisk);
            
            // Category Constraint: If this category has a critical violation, 
            // the category score cannot exceed 40 (Red Zone).
            if (data.maxRisk >= 80) {
                score = Math.min(score, 40);
            } else if (data.maxRisk >= 50) {
                score = Math.min(score, 60);
            }

            let level: RiskLevel = 'safe';
            if (score < 40) level = 'critical';
            else if (score < 60) level = 'high';
            else if (score < 80) level = 'medium';
            else if (score < 95) level = 'low';

            return {
                category: cat,
                score: Math.round(score),
                riskLevel: level
            };
        });

    // 2. Calculate Total Score (The MAIN Number)
    // Formula: 100 - (Average Risk of All Questions)
    // BUT APPLIED WITH A HARD CEILING based on the worst violation found.
    
    const totalQuestions = Object.values(categoryScores).reduce((acc, curr) => acc + curr.count, 0);
    const sumAllWeights = Object.values(categoryScores).reduce((acc, curr) => acc + curr.totalWeight, 0);
    
    let baseScore = 100;
    if (totalQuestions > 0) {
        baseScore = Math.max(0, 100 - (sumAllWeights / totalQuestions));
    }

    // --- THE FIX: POISON LOGIC (Weakest Link) ---
    // If you have Riba (Critical), your financial purity cannot be > 40 (Critical).
    // Even if 90% of your other transactions are halal.
    let scoreCap = 100;

    if (globalMaxRisk >= 80) { // Critical Violation Present (e.g. Riba/Alcohol)
        scoreCap = 40; // Force Critical Status
    } else if (globalMaxRisk >= 50) { // High Risk Present (e.g. Dropship Illegal)
        scoreCap = 60; // Force Warning Status
    } else if (globalMaxRisk >= 30) { // Medium Risk Present
        scoreCap = 80;
    }

    // Final Score is the LOWER of the Base Score or the Cap.
    let totalScore = Math.round(Math.min(baseScore, scoreCap));

    // Determine Final Risk Level
    let riskLevel: RiskLevel = 'safe';
    if (totalScore <= 40) riskLevel = 'critical';
    else if (totalScore <= 60) riskLevel = 'high';
    else if (totalScore <= 80) riskLevel = 'medium';
    else if (totalScore < 95) riskLevel = 'low';

    // Roadmap Matrix Logic
    let approach: 'immediate_exit' | 'gradual_exit' | 'maintenance' = 'maintenance';
    let explanation = "Kondisi Anda Insya Allah aman (Halal Thayyib). Pertahankan & sucikan harta dengan Zakat/Sedekah.";

    if (riskLevel === 'critical' || riskLevel === 'high') {
        if (hardshipScore > 60) {
            approach = 'gradual_exit';
            explanation = "Terdeteksi pelanggaran syariah serius, namun kondisi ekonomi masuk kategori Dharurat. Fiqh menyarankan Tadarruj (bertahap): Fokus lunasi utang pokok & cari pengganti sebelum lepas total.";
        } else {
            approach = 'immediate_exit';
            explanation = "Risiko syariah tinggi dan Anda memiliki kemampuan (qudrah) untuk berhijrah. Disarankan Bara'ah (berlepas diri) secepatnya untuk keberkahan.";
        }
    } else if (riskLevel === 'medium') {
        approach = 'immediate_exit'; // Syubhat should be left immediately usually
        explanation = "Terdapat transaksi syubhat (meragukan). Sebaiknya ditinggalkan segera untuk menjaga kesucian harta (Wara').";
    }

    risks.forEach(risk => {
        const riskSteps = generateStepsForRisk(risk, approach);
        roadmap = [...roadmap, ...riskSteps];
    });

    // Deduplicate Steps
    const uniqueSteps = new Map();
    roadmap.forEach(step => {
        if(!uniqueSteps.has(step.action)) uniqueSteps.set(step.action, step);
    });
    roadmap = Array.from(uniqueSteps.values());

    const phaseOrder = { 'short_term': 1, 'mid_term': 2, 'long_term': 3 };
    roadmap.sort((a, b) => phaseOrder[a.phase] - phaseOrder[b.phase]);

    return {
        totalScore,
        riskLevel,
        categoryScores: finalCategoryScores,
        risks,
        roadmap,
        fiqhContext: {
            hardshipLevel: hardshipScore > 70 ? 'extreme' : hardshipScore > 30 ? 'moderate' : 'low',
            approach,
            explanation
        },
        timestamp: new Date().toISOString()
    };
};
