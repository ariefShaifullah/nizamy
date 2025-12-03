
import type { ZakatResult, ZakatState } from '../../../types.ts';
import { formatCurrency } from '../../../utils.ts';
import { generatePdfFromHtml, generateReportLayout, pdfStyles as styles } from '../../../services/pdf.service.ts';

/**
 * Zakat Report Builder
 */
export const exportZakatPdf = async (result: ZakatResult, state: ZakatState) => {
    
    const rows = result.items.map(item => `
        <tr>
            <td style="${styles.td}">
                <div style="font-weight: 700; color: #1e293b; font-size: 13px;">${item.label}</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${item.note || '-'}</div>
            </td>
            <td style="${styles.td}; text-align:right;">
                <div style="font-family: monospace; font-size: 13px; color: #0f172a; font-weight: 700;">
                    ${item.formattedValue ? item.formattedValue : formatCurrency(item.zakatAmount)}
                </div>
            </td>
        </tr>
    `).join('');

    const contentHtml = `
        <!-- Basmalah -->
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="font-family: 'Amiri', serif; font-size: 24px; color: #065f46; margin: 0;">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</h2>
        </div>

        <!-- Total Box -->
        <div style="${styles.totalBox}; background-color: #ecfdf5; border-color: #6ee7b7; text-align: center;">
            <div style="font-size: 12px; color: #047857; font-weight: 700; text-transform: uppercase;">Total Kewajiban Zakat</div>
            <div style="font-size: 36px; font-weight: 800; color: #059669; margin: 10px 0;">${result.formattedTotal}</div>
        </div>

        <h3 style="${styles.sectionTitle}">Rincian Perhitungan</h3>
        <table style="${styles.table}">
            <thead>
                <tr>
                    <th style="${styles.th}">Jenis Zakat</th>
                    <th style="${styles.th}; text-align:right;">Kewajiban</th>
                </tr>
            </thead>
            <tbody>
                ${rows.length > 0 ? rows : '<tr><td colspan="2" style="text-align:center; padding: 20px; color: #94a3b8; font-style: italic;">Tidak ada kewajiban zakat terdeteksi dari data input.</td></tr>'}
            </tbody>
        </table>

        <!-- Asset Summary -->
        <div style="margin-top: 30px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #f8fafc;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 10px;">Ringkasan Aset (Input)</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div style="font-size: 11px;"><span style="color: #475569;">Uang/Tabungan:</span> <span style="font-weight: 600; color: #1e293b;">${formatCurrency(state.cash)}</span></div>
                <div style="font-size: 11px;"><span style="color: #475569;">Investasi:</span> <span style="font-weight: 600; color: #1e293b;">${formatCurrency(state.investments)}</span></div>
                <div style="font-size: 11px;"><span style="color: #475569;">Emas:</span> <span style="font-weight: 600; color: #1e293b;">${state.goldWeight} gr</span></div>
                <div style="font-size: 11px;"><span style="color: #475569;">Hutang (Pengurang):</span> <span style="font-weight: 600; color: #ef4444;">${formatCurrency(state.debts)}</span></div>
            </div>
        </div>

        <div style="margin-top: 15px; padding: 15px; background-color: #f0fdf4; border-left: 4px solid #059669; border-radius: 4px;">
            <p style="font-size: 11px; color: #064e3b; line-height: 1.5; font-style: italic; margin: 0;">
                "Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan mensucikan mereka..." (QS. At-Taubah: 103)
            </p>
        </div>
    `;

    const fullHtml = generateReportLayout({
        title: 'Kwitansi Digital Zakat',
        subtitle: 'Hasil Perhitungan Nisab & Haul',
        themeColor: '#059669', // Emerald
        refId: `ZKT-${Date.now().toString().slice(-8)}`
    }, contentHtml);

    await generatePdfFromHtml(fullHtml, `NIZAMY_Zakat_${new Date().toISOString().split('T')[0]}.pdf`);
};
