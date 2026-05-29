
import type { CalculationResult } from '../../../types.ts';
import { formatCurrency } from '../../../utils.ts';
import { generatePdfFromHtml, generateReportLayout, pdfStyles as styles } from '../../../services/pdf.service.ts';

/**
 * Faraidh (Waris) Report Builder
 */
export const exportFaraidhPdf = async (result: CalculationResult) => {
    
    const rows = result.heirResults.map(h => `
    <tr>
    <td style="${styles.td}; word-break: break-word; max-width: 160px;">
    <div style="font-weight: 600;">${h.name}</div>
    <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${h.reason}</div>
    </td>
    <td style="${styles.td}">${h.count > 1 ? `${h.count} Orang` : 'Sendiri'}</td>
    <td style="${styles.td}">${h.share.numerator}/${h.share.denominator}</td>
    <td style="${styles.td}">${h.share.numerator !== h.finalShare.numerator ? `${h.finalShare.numerator}/${h.finalShare.denominator}` : '—'}</td>
    <td style="${styles.td}">
    ${h.isBlocked 
    ? '<span style="color: #ef4444; font-weight:bold;">Terhalang (Mahjub)</span>' 
    : `<span style="color: #059669; font-weight:bold;">${formatCurrency(h.value)}</span>`
    }
    </td>
    </tr>
    `).join('');

    const notes = result.notes.length > 0 ? `
        <div style="margin-top: 20px; background-color: #fffbeb; padding: 15px; border-radius: 8px; border: 1px solid #fcd34d;">
            <strong style="color: #92400e; font-size: 13px;">Catatan Penting (Fiqh):</strong>
            <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 12px; color: #b45309;">
                ${result.notes.map(n => `<li>${n}</li>`).join('')}
            </ul>
        </div>
    ` : '';

    const contentHtml = `
        <div style="${styles.totalBox}; background-color: #eff6ff; border-color: #bfdbfe;">
        <div style="font-size: 12px; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Harta Dibagi (Bersih)</div>
        <div style="font-size: 32px; font-weight: 800; color: #1e3a8a; margin-top: 5px;">${formatCurrency(result.netEstate)}</div>
        ${(result.wasiat > 0 || result.utang > 0) ? `<div style="font-size: 11px; color: #60a5fa; margin-top: 5px;">Bruto: ${formatCurrency(result.estate)}${result.utang > 0 ? ' | Utang: ' + formatCurrency(result.utang) : ''}${result.wasiat > 0 ? ' | Wasiat: ' + formatCurrency(result.wasiat) : ''}</div>` : ''}
        <div style="font-size: 12px; color: #60a5fa; margin-top: 5px;">Asal Masalah: ${result.aslAlMasalah} &rarr; ${result.finalDenominator}</div>
        </div>

        <h3 style="${styles.sectionTitle}">Rincian Ahli Waris</h3>
        <table style="${styles.table}">
            <thead>
            <tr>
            <th style="${styles.th}">Ahli Waris</th>
            <th style="${styles.th}">Jumlah</th>
            <th style="${styles.th}">Bagian (Furudh)</th>
            <th style="${styles.th}">Bagian Akhir</th>
            <th style="${styles.th}">Nominal Hak</th>
            </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>

        ${notes}
    `;

    const fullHtml = generateReportLayout({
        title: 'Hasil Pembagian Waris',
        subtitle: "Metode: Syafi'i / Jumhur Ulama",
        themeColor: '#2563eb', // Blue
        refId: `FR-${Date.now().toString().slice(-6)}`
    }, contentHtml);

    await generatePdfFromHtml(fullHtml, `NIZAMY_Waris_${new Date().toISOString().split('T')[0]}.pdf`);
};
