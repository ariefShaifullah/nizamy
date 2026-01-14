
import type { HafalanState } from '../../../types.ts';
import { formatDate } from '../../../utils.ts';
import { generatePdfFromHtml, generateReportLayout, pdfStyles as styles } from '../../../services/pdf.service.ts';

/**
 * Hafalan Report Builder
 */
export const exportHafalanToPdf = async (state: HafalanState) => {
    
    const sortedItems = [...state.items].sort((a, b) => {
        if (a.surahNo !== b.surahNo) return a.surahNo - b.surahNo;
        return a.startAyah - b.startAyah;
    });

    const rows = sortedItems.map(item => `
        <tr>
            <td style="${styles.td}">
                <strong>${item.surahName}</strong> <span style="color:#64748b;">(${item.startAyah}-${item.endAyah})</span>
            </td>
            <td style="${styles.td}">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; ${item.stage >= 5 ? 'background-color: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0;' : 'background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;'}">
                    ${item.stage >= 5 ? 'MUTQIN' : `Level ${item.stage}`}
                </span>
            </td>
            <td style="${styles.td}">${formatDate(item.nextReviewDate)}</td>
            <td style="${styles.td}; text-align:right;">${item.errorCount > 0 ? `<span style="color:#ef4444;">${item.errorCount}x Lupa</span>` : '<span style="color:#22c55e;">Sempurna</span>'}</td>
        </tr>
    `).join('');

    const contentHtml = `
        <div style="display: flex; gap: 15px; margin-bottom: 30px;">
            <div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; padding:15px; border-radius:8px; text-align:center;">
                <div style="font-size:10px; text-transform:uppercase; color:#64748b; font-weight:700;">Level</div>
                <div style="font-size:24px; font-weight:800; color:#334155;">${state.gamification.level}</div>
            </div>
            <div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; padding:15px; border-radius:8px; text-align:center;">
                <div style="font-size:10px; text-transform:uppercase; color:#64748b; font-weight:700;">Total Hafalan</div>
                <div style="font-size:24px; font-weight:800; color:#334155;">${sortedItems.length}</div>
            </div>
            <div style="flex:1; background:#f8fafc; border:1px solid #e2e8f0; padding:15px; border-radius:8px; text-align:center;">
                <div style="font-size:10px; text-transform:uppercase; color:#64748b; font-weight:700;">Streak</div>
                <div style="font-size:24px; font-weight:800; color:#334155;">${state.gamification.currentStreak} Hari</div>
            </div>
        </div>

        <h3 style="${styles.sectionTitle}">Daftar Hafalan</h3>
        <table style="${styles.table}">
            <thead>
                <tr>
                    <th style="${styles.th}">Surat & Ayat</th>
                    <th style="${styles.th}">Status</th>
                    <th style="${styles.th}">Jadwal Murajaah</th>
                    <th style="${styles.th}; text-align:right;">Riwayat</th>
                </tr>
            </thead>
            <tbody>${rows.length > 0 ? rows : '<tr><td colspan="4" style="padding:20px; text-align:center; color:#94a3b8;">Belum ada data hafalan.</td></tr>'}</tbody>
        </table>
    `;

    const fullHtml = generateReportLayout({
        title: 'Laporan Hafalan (Mutabaah)',
        subtitle: `Metode SRS (Spaced Repetition) - ${state.profile?.name || 'Hamba Allah'}`,
        themeColor: '#4f46e5', // Indigo
        refId: `HFZ-${Date.now().toString().slice(-6)}`
    }, contentHtml);

    await generatePdfFromHtml(fullHtml, `Laporan_Hafalan_${(state.profile?.name || 'user').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};
