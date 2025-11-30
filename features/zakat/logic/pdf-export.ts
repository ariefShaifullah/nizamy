
import type { ZakatResult, ZakatState } from '../../../types.ts';
import { formatCurrency, formatDate } from '../../../utils.ts';
import { generatePdfFromHtml } from '../../../services/pdf.service.ts';

/**
 * Zakat Report Builder - World Class Receipt Style
 */
export const exportZakatPdf = async (result: ZakatResult, state: ZakatState) => {
    const dateStr = formatDate(new Date().toISOString(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('id-ID');

    const rows = result.items.map(item => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 0;">
                <div style="font-weight: 700; color: #1e293b; font-size: 13px;">${item.label}</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${item.note || '-'}</div>
            </td>
            <td style="padding: 12px 0; text-align:right;">
                <div style="font-family: monospace; font-size: 13px; color: #0f172a; font-weight: 700;">
                    ${item.formattedValue ? item.formattedValue : formatCurrency(item.zakatAmount)}
                </div>
            </td>
        </tr>
    `).join('');

    const html = `
        <div style="padding: 40px; font-family: 'Inter', sans-serif; color: #334155; position: relative; background-color: #ffffff;">
            
            <!-- Watermark -->
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; color: #f1f5f9; font-weight: 900; z-index: 0; opacity: 0.5; pointer-events: none;">
                NIZAMY
            </div>

            <div style="position: relative; z-index: 1;">
                <!-- Header Basmalah -->
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="font-family: 'Amiri', serif; font-size: 24px; color: #065f46; margin: 0;">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</h2>
                </div>

                <!-- Main Receipt Card -->
                <div style="border: 2px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Card Header -->
                    <div style="background-color: #059669; color: white; padding: 30px; display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9; font-weight: 600;">Bukti Perhitungan Zakat</div>
                            <h1 style="font-size: 28px; font-weight: 800; margin: 5px 0 0 0; letter-spacing: -0.5px;">Digital Receipt</h1>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">NIZAMY</div>
                            <div style="font-size: 10px; opacity: 0.9;">Islamic Apps Suite</div>
                        </div>
                    </div>

                    <!-- Card Body -->
                    <div style="padding: 30px; background-color: white;">
                        
                        <!-- Metadata Row -->
                        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px dashed #e2e8f0; padding-bottom: 20px;">
                            <div>
                                <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Tanggal Cetak</div>
                                <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px;">${dateStr}</div>
                                <div style="font-size: 11px; color: #64748b;">${timeStr}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">ID Referensi</div>
                                <div style="font-size: 13px; font-family: monospace; font-weight: 600; color: #0f172a; margin-top: 2px;">#ZKT-${Date.now().toString().slice(-8)}</div>
                            </div>
                        </div>

                        <!-- Main Table -->
                        <h3 style="font-size: 12px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Rincian Kewajiban</h3>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                            ${rows.length > 0 ? rows : '<tr><td colspan="2" style="text-align:center; padding: 20px; color: #94a3b8; font-style: italic;">Tidak ada kewajiban zakat terdeteksi.</td></tr>'}
                        </table>

                        <!-- Total Box -->
                        <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-size: 12px; font-weight: 700; color: #047857; text-transform: uppercase;">Total Zakat</div>
                            <div style="font-size: 28px; font-weight: 800; color: #059669;">${result.formattedTotal}</div>
                        </div>
                    </div>
                </div>

                <!-- Footer / Asset Summary -->
                <div style="margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="padding: 15px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #f8fafc;">
                        <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 10px;">Ringkasan Aset (Input)</div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 11px;">
                            <span style="color: #475569;">Uang/Tabungan:</span> <span style="font-weight: 600; color: #1e293b;">${formatCurrency(state.cash)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 11px;">
                            <span style="color: #475569;">Investasi:</span> <span style="font-weight: 600; color: #1e293b;">${formatCurrency(state.investments)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 11px;">
                            <span style="color: #475569;">Emas:</span> <span style="font-weight: 600; color: #1e293b;">${state.goldWeight} gr</span>
                        </div>
                    </div>
                    <div style="padding: 15px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #f8fafc;">
                        <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 10px;">Catatan Syariah</div>
                        <p style="font-size: 11px; color: #475569; line-height: 1.5; font-style: italic; margin: 0;">
                            "Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan mensucikan mereka..."<br/>(QS. At-Taubah: 103)
                        </p>
                    </div>
                </div>

                <div style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    Dokumen ini dihasilkan secara otomatis oleh NIZAMY App.<br/>
                    Perhitungan berdasarkan data yang dimasukkan pengguna. Mohon verifikasi ulang dengan amil zakat jika diperlukan.
                </div>
            </div>
        </div>
    `;

    await generatePdfFromHtml(html, `NIZAMY_Zakat_${new Date().toISOString().split('T')[0]}.pdf`);
};
