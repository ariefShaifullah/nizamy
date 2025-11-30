import type { HedeResult, RiskFactor, ActionStep, CategoryScore, HedeCategory, RiskLevel, Question } from '../../../types.ts';
import { QUESTIONS_DB } from '../constants.ts';

// Helper: Check if question should be calculated based on dependencies
const isQuestionRelevant = (question: Question, currentAnswers: Record<string, string>): boolean => {
    if (!question.dependency) return true;

    const parentAnswer = currentAnswers[question.dependency.id];
    if (!parentAnswer) return false; 

    const { type, values } = question.dependency;
    if (type === 'include') {
        return values.includes(parentAnswer);
    } else {
        return !values.includes(parentAnswer);
    }
};

// --- WORLD CLASS ROADMAP GENERATOR ---
const generateStepsForRisk = (
    risk: RiskFactor, 
    approach: 'immediate_exit' | 'gradual_exit' | 'maintenance',
    answers: Record<string, string> // Need answers for context
): ActionStep[] => {
    const steps: ActionStep[] = [];
    const isGradual = approach === 'gradual_exit';
    const riskId = risk.id.replace('risk_', ''); // e.g. 'job_affiliate'

    // --- 1. SPESIFIK: JOB & PROFESI ---
    
    // Case: Afiliator / Fake Review
    if (riskId === 'job_affiliate') {
        if (risk.violationType === 'zulm') { // Fake Review
            steps.push({
                phase: 'short_term',
                action: "Hapus/Take-down konten review palsu & produk haram.",
                impact: "Menghentikan dosa jariyah dari penipuan (Qaul Zur).",
                difficulty: 'medium',
                cta: 'internal:toolkit:taubat',
                ctaLabel: 'Buat Ikrar Taubat'
            });
            steps.push({
                phase: 'mid_term',
                action: "Buat konten ralat/klarifikasi jika memungkinkan, atau mulai review jujur barang yang dimiliki.",
                impact: "Membangun kepercayaan audiens yang berkah.",
                difficulty: 'hard'
            });
        } else if (risk.violationType === 'gharar') { // Blind Share
            steps.push({
                phase: 'short_term',
                action: "Hanya share link produk yang Anda tahu kualitasnya atau dari toko Official/Terpercaya.",
                impact: "Menghindari mempromosikan 'kucing dalam karung'.",
                difficulty: 'easy'
            });
        }
    }

    // Case: Software Bajakan (Crack)
    if (riskId === 'job_tools') {
        steps.push({
            phase: 'short_term',
            action: "Uninstall software bajakan untuk pekerjaan produktif utama.",
            impact: "Membersihkan sarana pencari nafkah dari Ghasab hak cipta.",
            difficulty: 'medium'
        });
        steps.push({
            phase: 'mid_term',
            action: "Beralih ke alternatif Open Source Gratis (Linux, LibreOffice, Inkscape, GIMP) atau beli lisensi bertahap.",
            impact: "Solusi permanen tanpa biaya mahal.",
            difficulty: 'medium'
        });
    }

    // Case: Pekerja Lapangan (Curang Timbangan/Spek)
    if (riskId === 'field_integrity') {
        steps.push({
            phase: 'short_term',
            action: "Kalibrasi ulang timbangan/meteran dan jujur soal spesifikasi bahan kepada klien.",
            impact: "Menghindari dosa Al-Mutaffifin (Orang curang).",
            difficulty: 'easy'
        });
    }

    // Case: Risywah (Suap/Kickback)
    if (riskId === 'job_risywah') {
        steps.push({
            phase: 'short_term',
            action: "Tolak tegas 'fee' di luar kontrak resmi. Jika dipaksa sistem, catat sebagai bukti & niatkan benci dalam hati.",
            impact: "Menjaga integritas dan keberkahan gaji.",
            difficulty: 'hard'
        });
    }

    // --- 2. SPESIFIK: KEUANGAN ---

    // Case: Asuransi Konvensional
    if (riskId === 'fin_insurance') {
        steps.push({
            phase: 'short_term',
            action: "Tutup polis asuransi konvensional (terutama Unit Link yang rugi). Beralih ke BPJS Kesehatan.",
            impact: "BPJS dinilai Maslahah Mursalah oleh ulama & bebas Gharar investasi.",
            difficulty: 'medium'
        });
        steps.push({
            phase: 'mid_term',
            action: "Jika butuh proteksi lebih, buka polis Asuransi Syariah (Takaful) murni (bukan investasi).",
            impact: "Proteksi halal dengan akad Tabarru' (Tolong menolong).",
            difficulty: 'medium'
        });
    }

    // Case: Warisan (Inheritance)
    if (riskId === 'fin_inheritance') {
        steps.push({
            phase: 'short_term',
            action: "Segera kumpulkan ahli waris untuk musyawarah pembagian.",
            impact: "Mencegah memakan harta anak yatim/saudara secara batil.",
            difficulty: 'medium',
            cta: '/faraidh',
            ctaLabel: 'Hitung Waris Sekarang'
        });
    }

    // Case: Zakat
    if (riskId === 'fin_zakat') {
        steps.push({
            phase: 'short_term',
            action: "Hitung total aset (Emas, Tabungan, Saham). Jika > 85gr Emas, tunaikan 2.5%.",
            impact: "Membersihkan harta dari hak fakir miskin.",
            difficulty: 'easy',
            cta: '/zakat',
            ctaLabel: 'Hitung Zakat Maal'
        });
    }

    // Case: Utang Riba (KPR/Leasing)
    if (riskId === 'fin_debt') {
        steps.push({
            phase: 'short_term',
            action: "Stop Top-up Plafond (Gali lubang tutup lubang). Niatkan lunas.",
            impact: "Langkah awal taubat.",
            difficulty: 'easy'
        });
        if (isGradual) {
            steps.push({
                phase: 'mid_term',
                action: "Jual aset non-produktif (Gadget/Hobi/Motor ke-2) untuk kurangi pokok utang.",
                impact: "Mengurangi beban bunga & mempercepat lunas.",
                difficulty: 'hard'
            });
        } else {
            steps.push({
                phase: 'mid_term',
                action: "Over Kredit atau Jual Aset Agunan untuk pelunasan total (Cut Loss).",
                impact: "Bebas total dari Riba.",
                difficulty: 'hard',
                cta: 'internal:toolkit:loan_payoff',
                ctaLabel: 'Download Surat Pelunasan'
            });
        }
    }

    // --- 3. SPESIFIK: DIGITAL ---

    // Case: E-Wallet / Paylater
    if (riskId === 'dig_ewallet' || riskId === 'dig_paylater') {
        steps.push({
            phase: 'short_term',
            action: "Lunasi tagihan Paylater & Matikan fiturnya. Kosongkan saldo E-Wallet (gunakan sistem pass-through).",
            impact: "Menghindari Riba Qardh (Manfaat atas utang/saldo mengendap).",
            difficulty: 'easy'
        });
    }

    // Case: Crypto Futures / Gacha
    if (riskId === 'fin_invest' || riskId === 'dig_gacha') {
        if (risk.violationType === 'maysir') {
            steps.push({
                phase: 'short_term',
                action: "Tarik seluruh modal dari akun Futures/Judi. Hapus aplikasi.",
                impact: "Menyelamatkan sisa harta dari spekulasi haram.",
                difficulty: 'medium'
            });
        }
    }

    // --- 4. GENERIC FALLBACKS (Jika tidak ada match spesifik) ---
    if (steps.length === 0) {
        if (risk.violationType === 'riba') {
            steps.push({
                phase: 'mid_term',
                action: "Prioritaskan pelunasan utang ini di atas gaya hidup.",
                impact: "Fokus pada kebebasan finansial.",
                difficulty: 'medium',
                cta: 'internal:tathhir',
                ctaLabel: 'Hitung Dana Tathhir'
            });
        } else if (risk.violationType === 'gharar') {
            steps.push({
                phase: 'short_term',
                action: "Perbaiki akad agar jelas (transparan) di awal.",
                impact: "Menghilangkan potensi sengketa.",
                difficulty: 'easy'
            });
        }
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
        if (!isQuestionRelevant(q, answers)) {
            return; 
        }

        const answerValue = answers[q.id];
        if (!answerValue) return;

        const selectedOption = q.options.find(opt => opt.value === answerValue);
        if (!selectedOption) return;

        // Update Category Stats
        if (q.category !== 'emergency') {
            categoryScores[q.category].totalWeight += selectedOption.riskWeight;
            categoryScores[q.category].count += 1;
            categoryScores[q.category].maxRisk = Math.max(categoryScores[q.category].maxRisk, selectedOption.riskWeight);
            
            globalMaxRisk = Math.max(globalMaxRisk, selectedOption.riskWeight);
        } else {
            hardshipScore += (selectedOption.hardshipWeight || 0);
        }

        // Detect Risks
        if (selectedOption.riskWeight >= 30) {
            let desc = '';
            let rule = '';
            
            // Contextual Descriptions based on Question ID for better UX
            if (q.id === 'job_tools') desc = "Penggunaan software tanpa lisensi resmi (Bajakan/Crack).";
            else if (q.id === 'job_affiliate') desc = "Promosi produk dengan cara yang tidak jujur (Fake Review/Blind Share).";
            else if (q.id === 'fin_insurance') desc = "Asuransi dengan akad pertukaran (jual beli) yang mengandung Gharar & Maysir.";
            else if (q.id === 'fin_inheritance') desc = "Penundaan pembagian waris yang menzalimi hak ahli waris lain.";
            else if (q.id === 'field_integrity') desc = "Kecurangan dalam takaran/timbangan atau spesifikasi kerja.";
            else {
                switch (selectedOption.violationType) {
                    case 'riba': desc = "Terindikasi transaksi Riba (Bunga/Pertambahan nilai)."; break;
                    case 'gharar': desc = "Ketidakjelasan (Gharar) dalam objek/akad."; break;
                    case 'maysir': desc = "Unsur spekulasi tinggi/perjudian."; break;
                    case 'zulm': desc = "Akad bermasalah atau mengambil hak orang lain."; break;
                    default: desc = "Risiko syariah yang perlu diperhatikan.";
                }
            }

            // Rules
            switch (selectedOption.violationType) {
                case 'riba': rule = "QS. Al-Baqarah: 275 - Allah menghalalkan jual beli dan mengharamkan riba."; break;
                case 'gharar': rule = "Hadits: Rasulullah SAW melarang jual beli gharar (HR. Muslim)."; break;
                case 'maysir': rule = "QS. Al-Maidah: 90 - Judi adalah perbuatan keji."; break;
                case 'zulm': rule = "Kaidah: Kerusakan akad membatalkan keberkahan."; break;
                default: rule = "Prinsip Kehati-hatian (Wara').";
            }

            risks.push({
                id: `risk_${q.id}`, // e.g., risk_job_affiliate
                category: q.category,
                title: q.text, 
                description: desc,
                riskLevel: selectedOption.riskWeight >= 80 ? 'critical' : selectedOption.riskWeight >= 50 ? 'high' : 'medium',
                violationType: selectedOption.violationType || 'none',
                fiqhRule: rule
            });
        }
    });

    // Normalize Hardship Score
    const emergencyQCount = QUESTIONS_DB.filter(q => q.category === 'emergency').length;
    hardshipScore = emergencyQCount > 0 ? hardshipScore / emergencyQCount : 0;

    // --- SCORING LOGIC ---
    const finalCategoryScores: CategoryScore[] = Object.keys(categoryScores)
        .filter(k => k !== 'emergency')
        .map(key => {
            const cat = key as HedeCategory;
            const data = categoryScores[cat];
            const avgRisk = data.count > 0 ? data.totalWeight / data.count : 0;
            let score = Math.max(0, 100 - avgRisk);
            
            if (data.maxRisk >= 80) score = Math.min(score, 40);
            else if (data.maxRisk >= 50) score = Math.min(score, 60);

            let level: RiskLevel = 'safe';
            if (score < 40) level = 'critical';
            else if (score < 60) level = 'high';
            else if (score < 80) level = 'medium';
            else if (score < 95) level = 'low';

            return { category: cat, score: Math.round(score), riskLevel: level };
        });

    // Total Score Calculation
    const totalQuestions = Object.values(categoryScores).reduce((acc, curr) => acc + curr.count, 0);
    const sumAllWeights = Object.values(categoryScores).reduce((acc, curr) => acc + curr.totalWeight, 0);
    
    let rawScore = 100;
    if (totalQuestions > 0) rawScore = Math.max(0, 100 - (sumAllWeights / totalQuestions));

    let scoreCap = 100;
    let poisonFactor = 0;

    if (globalMaxRisk >= 80) { scoreCap = 40; poisonFactor = 0.1; }
    else if (globalMaxRisk >= 50) { scoreCap = 60; poisonFactor = 0.2; }
    else if (globalMaxRisk >= 30) { scoreCap = 80; poisonFactor = 0.5; }

    let totalScore = Math.round(Math.min(rawScore, scoreCap));
    if (rawScore > scoreCap) totalScore = Math.round(scoreCap + ((rawScore - scoreCap) * poisonFactor));

    let riskLevel: RiskLevel = 'safe';
    if (totalScore <= 49) riskLevel = 'critical';
    else if (totalScore <= 69) riskLevel = 'high';
    else if (totalScore <= 85) riskLevel = 'medium';
    else if (totalScore < 95) riskLevel = 'low';

    // Roadmap Matrix Logic
    let approach: 'immediate_exit' | 'gradual_exit' | 'maintenance' = 'maintenance';
    let explanation = "Kondisi Anda Insya Allah aman (Halal Thayyib). Pertahankan & sucikan harta dengan Zakat/Sedekah.";

    if (riskLevel === 'critical' || riskLevel === 'high') {
        if (hardshipScore > 60) {
            approach = 'gradual_exit';
            explanation = "Terdeteksi pelanggaran syariah serius, namun kondisi ekonomi masuk kategori Dharurat/Hajah. Fiqh menyarankan Tadarruj (bertahap): Fokus lunasi utang pokok & cari pengganti sebelum lepas total.";
        } else {
            approach = 'immediate_exit';
            explanation = "Risiko syariah tinggi dan Anda memiliki kemampuan (qudrah) untuk berhijrah. Disarankan Bara'ah (berlepas diri) secepatnya untuk keberkahan.";
        }
    } else if (riskLevel === 'medium') {
        approach = 'immediate_exit';
        explanation = "Terdapat transaksi syubhat (meragukan). Sebaiknya ditinggalkan segera untuk menjaga kesucian harta (Wara').";
    }

    // GENERATE ROADMAP STEPS
    risks.forEach(risk => {
        // Pass 'answers' to generator for context-aware advice
        const riskSteps = generateStepsForRisk(risk, approach, answers);
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