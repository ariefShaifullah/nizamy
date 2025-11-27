
import type { HedeResult, HedeCategory } from '../../../types.ts';
import { CATEGORY_LABELS, VIOLATION_LABELS, RISK_CONFIG } from '../constants.ts';
import { formatDate } from '../../../utils.ts';
import { generatePdfFromHtml, pdfStyles as styles } from '../../../services/pdf.service.ts';

/**
 * H.E.D.E Report Builder
 */
export const exportHedePdf = async (result: HedeResult) => {
    const dateStr = formatDate(new Date().toISOString(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Use Centralized Config for Hex Colors
    const getScoreColor = (score: number) => {
        if (score > 80) return RISK_CONFIG.safe.hex; 
        if (score > 50) return RISK_CONFIG.medium.hex; 
        return RISK_CONFIG.critical.hex; 
    };

    const getRiskColor = (level: string) => {
        // Safe casting as we know level matches RiskLevel keys
        return RISK_CONFIG[level as keyof typeof RISK_CONFIG]?.hex || '#3b82f6';
    };

    // 1. Category Scores Breakdown
    const categoryRows = result.categoryScores.map(cat => `
        <tr>
            <td style="${styles.td}">
                <strong>${CATEGORY_LABELS[cat.category]}</strong>
            </td>
            <td style="${styles.td}; text-align:right;">
                <span style="font-weight: 800; color: ${getScoreColor(cat.score)};">
                    ${cat.score}/100
                </span>
            </td>
        </tr>
    `).join('');

    // 2. Risks List
    const risksHtml = result.risks.map(risk => `
        <div style="margin-bottom: 15px; padding: 10px; border-left: 4px solid ${getRiskColor(risk.riskLevel)}; background-color: #f8fafc;">
            <div style="font-weight: 700; color: #334155; font-size: 13px; margin-bottom: 4px;">
                ${risk.title}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
                ${risk.description}
            </div>
            <div style="font-size: 10px; color: #94a3b8; font-style: italic;">
                Kategori: ${CATEGORY_LABELS[risk.category]} | Jenis: ${VIOLATION_LABELS[risk.violationType]}
            </div>
        </div>
    `).join('');

    // 3. Roadmap Steps
    const roadmapHtml = result.roadmap.map(step => `
        <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
            <div style="font-weight: 700; color: #1e293b; font-size: 13px;">
                ${step.phase === 'short_term' ? '🔴 FASE 1 (Segera)' : step.phase === 'mid_term' ? '🟠 FASE 2 (Transisi)' : '🟢 FASE 3 (Ideal)'}: ${step.action}
            </div>
            <div style="font-size: 11px; color: #475569; margin-top: 4px;">
                <strong>Dampak:</strong> ${step.impact}
            </div>
        </div>
    `).join('');

    const html = `
        <div style="padding: 40px; font-family: sans-serif;">
            <div style="${styles.header}; border-bottom-color: #7e22ce;">
                <div>
                    <h1 style="${styles.title}; color: #581c87;">Laporan Audit Syariah</h1>
                    <p style="${styles.subtitle}">H.E.D.E (Halal Economic Diagnostic Engine)</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 12px; color: #64748b;">Tanggal</div>
                    <div style="font-weight: 700; color: #0f172a;">${dateStr}</div>
                </div>
            </div>

            <!-- Score Box -->
            <div style="${styles.totalBox}; background-color: #faf5ff; border-color: #e9d5ff; text-align: center;">
                <div style="font-size: 12px; color: #7e22ce; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Skor Kepatuhan Total</div>
                <div style="font-size: 48px; font-weight: 800; color: ${getScoreColor(result.totalScore)}; margin: 10px 0;">
                    ${result.totalScore}
                </div>
                <div style="font-size: 14px; font-weight: 600; color: #581c87;">
                    Status: ${result.totalScore > 80 ? 'Halal Thayyib' : result.totalScore > 50 ? 'Syubhat (Meragukan)' : 'Kritis (Haram)'}
                </div>
            </div>

            <!-- Fiqh Context -->
            <div style="margin-top: 30px; padding: 15px; border-radius: 8px; background-color: #f1f5f9; border-left: 4px solid #475569;">
                <h4 style="margin: 0 0 5px 0; font-size: 14px; color: #1e293b;">Metode Fiqh: ${result.fiqhContext.approach === 'gradual_exit' ? 'Tadarruj (Bertahap)' : 'Bara\'ah (Langsung)'}</h4>
                <p style="margin: 0; font-size: 12px; color: #475569;">${result.fiqhContext.explanation}</p>
            </div>

            <div style="display: flex; gap: 30px; margin-top: 30px;">
                <!-- Left: Breakdown -->
                <div style="flex: 1;">
                    <h3 style="${styles.sectionTitle}">Skor Per Kategori</h3>
                    <table style="${styles.table}">
                        <tbody>${categoryRows}</tbody>
                    </table>
                </div>
            </div>

            <!-- Risks -->
            <h3 style="${styles.sectionTitle}">Identifikasi Risiko</h3>
            ${risksHtml.length > 0 ? risksHtml : '<p style="font-size:12px; color:#64748b;">Tidak ada risiko signifikan terdeteksi.</p>'}

            <!-- Roadmap -->
            <h3 style="${styles.sectionTitle}">Roadmap Hijrah</h3>
            ${roadmapHtml.length > 0 ? roadmapHtml : '<p style="font-size:12px; color:#64748b;">Pertahankan kondisi saat ini.</p>'}

            <div style="${styles.footer}">
                Hasil audit ini bersifat indikatif berdasarkan input pengguna. Konsultasikan kasus kompleks dengan Asatidz ahli Muamalah.
            </div>
        </div>
    `;

    await generatePdfFromHtml(html, `HEDE_Audit_${new Date().toISOString().split('T')[0]}.pdf`);
};
