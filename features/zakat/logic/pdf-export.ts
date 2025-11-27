import type { ZakatResult, ZakatState } from '../../../types.ts';
import { formatCurrency, formatDate } from '../../../utils.ts';
import { generatePdfFromHtml, pdfStyles as styles } from '../../../services/pdf.service.ts';

/**
 * Zakat Report Builder
 */
export const exportZakatPdf = async (result: ZakatResult, state: ZakatState) => {
    const dateStr = formatDate(new Date().toISOString(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const rows = result.items.map(item => `
        <tr>
            <td style="${styles.td}">
                <div style="font-weight: 600;">${item.label}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${item.note || '-'}</div>
            </td>
            <td style="${styles.td}; text-align:right;">
                ${item.formattedValue ? item.formattedValue : formatCurrency(item.zakatAmount)}
            </td>
        </tr>
    `).join('');

    const html = `
        <div style="padding: 40px;">
            <div style="${styles.header}; border-bottom-color: #10b981;">
                <div>
                    <h1 style="${styles.title}; color: #065f46;">Kwitansi Zakat</h1>
                    <p style="${styles.subtitle}">Laporan Perhitungan Mandiri</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 12px; color: #64748b;">Tanggal</div>
                    <div style="font-weight: 700; color: #0f172a;">${dateStr}</div>
                </div>
            </div>

            <div style="${styles.totalBox}; background-color: #ecfdf5; border-color: #a7f3d0;">
                <div style="font-size: 12px; color: #065f46; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Total Kewajiban Zakat</div>
                <div style="font-size: 32px; font-weight: 800; color: #047857; margin-top: 5px;">${result.formattedTotal}</div>
            </div>

            <h3 style="${styles.sectionTitle}">Rincian Perhitungan</h3>
            <table style="${styles.table}">
                <thead>
                    <tr>
                        <th style="${styles.th}">Jenis Zakat</th>
                        <th style="${styles.th}; text-align:right;">Jumlah Wajib</th>
                    </tr>
                </thead>
                <tbody>${rows.length > 0 ? rows : '<tr><td colspan="2" style="padding:20px; text-align:center; color:#94a3b8;">Tidak ada data zakat.</td></tr>'}</tbody>
            </table>

            <div style="${styles.sectionTitle}; margin-top: 40px;">Ringkasan Aset (Input)</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <div style="${styles.row}"><span style="${styles.rowLabel}">Uang Tunai/Tabungan</span> <span style="${styles.rowValue}">${formatCurrency(state.cash)}</span></div>
                    <div style="${styles.row}"><span style="${styles.rowLabel}">Emas</span> <span style="${styles.rowValue}">${state.goldWeight} gram</span></div>
                </div>
                <div>
                    <div style="${styles.row}"><span style="${styles.rowLabel}">Investasi</span> <span style="${styles.rowValue}">${formatCurrency(state.investments)}</span></div>
                    <div style="${styles.row}"><span style="${styles.rowLabel}">Hutang (Pengurang)</span> <span style="${styles.rowValue}; color:#ef4444;">-${formatCurrency(state.debts)}</span></div>
                </div>
            </div>

            <div style="${styles.footer}">
                Dihitung menggunakan NIZAMY Zakat Calculator.<br/>
                "Ambillah zakat dari sebagian harta mereka..." (QS. At-Taubah: 103)
            </div>
        </div>
    `;

    await generatePdfFromHtml(html, `NIZAMY_Zakat_${new Date().toISOString().split('T')[0]}.pdf`);
};
