
import type { CalculationResult, HafalanState, ZakatResult, ZakatState } from '../types.ts';
import { formatCurrency, formatDate } from '../utils.ts';

// Constants
const PRINT_WIDTH = 800; 
const A4_RATIO = 1.414;
const PRINT_HEIGHT = Math.floor(PRINT_WIDTH * A4_RATIO);

/**
 * Helper to load PDF libraries dynamically
 */
const loadPdfLibs = async () => {
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;
    return { jsPDF, html2canvas };
};

/**
 * CORE ENGINE: Generate PDF from a clean HTML string
 * This avoids manipulating the live DOM and ensures consistent styling.
 */
const generatePdfFromHtml = async (htmlContent: string, filename: string) => {
    let container: HTMLElement | null = null;

    try {
        const { jsPDF, html2canvas } = await loadPdfLibs();

        // 1. Create Sandboxed Container
        container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '-10000px';
        container.style.width = `${PRINT_WIDTH}px`;
        container.style.zIndex = '-9999';
        container.style.backgroundColor = '#ffffff';
        container.style.color = '#0f172a'; // Slate-900
        container.style.fontFamily = 'sans-serif';
        container.innerHTML = htmlContent;
        
        document.body.appendChild(container);

        // Wait for rendering
        await new Promise(resolve => setTimeout(resolve, 100));

        // 2. Capture
        const canvas = await html2canvas(container, {
            scale: 2, // Retina quality
            backgroundColor: '#ffffff',
            width: PRINT_WIDTH,
            windowWidth: PRINT_WIDTH,
            height: container.scrollHeight,
            windowHeight: container.scrollHeight
        });

        // 3. PDF Generation (Auto-Slicing)
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // First Page
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Subsequent Pages
        while (heightLeft > 0) {
            position = heightLeft - imgHeight; 
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(filename);

    } catch (err) {
        console.error("PDF Gen Error:", err);
        alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
        if (container && document.body.contains(container)) {
            document.body.removeChild(container);
        }
    }
};

// --- TEMPLATE BUILDERS ---

const styles = {
    header: `border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;`,
    title: `font-size: 28px; font-weight: 800; color: #1e3a8a; margin: 0; line-height: 1.2;`,
    subtitle: `font-size: 14px; color: #64748b; margin-top: 5px; font-weight: 500;`,
    sectionTitle: `font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 25px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;`,
    row: `display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9;`,
    rowLabel: `font-size: 14px; color: #334155; font-weight: 500;`,
    rowValue: `font-size: 14px; color: #0f172a; font-weight: 700; font-family: monospace;`,
    table: `width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px;`,
    th: `background-color: #f8fafc; padding: 12px; text-align: left; font-weight: 700; color: #475569; border-bottom: 2px solid #e2e8f0;`,
    td: `padding: 12px; border-bottom: 1px solid #f1f5f9; color: #334155;`,
    totalBox: `background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 20px; border-radius: 12px; margin-top: 30px; text-align: right;`,
    footer: `margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8;`
};

/**
 * Faraidh (Waris) Report Builder
 */
export const exportFaraidhPdf = async (result: CalculationResult) => {
    const dateStr = formatDate(new Date().toISOString(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const rows = result.heirResults.map(h => `
        <tr>
            <td style="${styles.td}">
                <div style="font-weight: 600;">${h.name}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${h.reason}</div>
            </td>
            <td style="${styles.td}">${h.count > 1 ? `${h.count} Orang` : 'Sendiri'}</td>
            <td style="${styles.td}">${h.share.numerator}/${h.share.denominator}</td>
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

    const html = `
        <div style="padding: 40px;">
            <div style="${styles.header}">
                <div>
                    <h1 style="${styles.title}">Hasil Pembagian Waris</h1>
                    <p style="${styles.subtitle}">Metode: Syafi'i / Jumhur Ulama</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 12px; color: #64748b;">Tanggal Perhitungan</div>
                    <div style="font-weight: 700; color: #0f172a;">${dateStr}</div>
                </div>
            </div>

            <div style="${styles.totalBox}; background-color: #eff6ff; border-color: #bfdbfe;">
                <div style="font-size: 12px; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Total Harta Waris</div>
                <div style="font-size: 32px; font-weight: 800; color: #1e3a8a; margin-top: 5px;">${formatCurrency(result.estate)}</div>
                <div style="font-size: 12px; color: #60a5fa; margin-top: 5px;">Asal Masalah: ${result.aslAlMasalah} &rarr; ${result.finalDenominator}</div>
            </div>

            <h3 style="${styles.sectionTitle}">Rincian Ahli Waris</h3>
            <table style="${styles.table}">
                <thead>
                    <tr>
                        <th style="${styles.th}">Ahli Waris</th>
                        <th style="${styles.th}">Jumlah</th>
                        <th style="${styles.th}">Bagian (Furudh)</th>
                        <th style="${styles.th}">Nominal Hak</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>

            ${notes}

            <div style="${styles.footer}">
                Dihitung menggunakan NIZAMY Faraidh Calculator.<br/>
                Hasil ini adalah estimasi berdasarkan input pengguna. Mohon verifikasi dengan ulama/ahli waris terpercaya.
            </div>
        </div>
    `;

    await generatePdfFromHtml(html, `NIZAMY_Waris_${new Date().toISOString().split('T')[0]}.pdf`);
};

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

/**
 * Hafalan Report Builder
 */
export const exportHafalanToPdf = async (state: HafalanState) => {
    const dateStr = formatDate(new Date().toISOString(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
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

    const html = `
        <div style="padding: 40px;">
            <div style="${styles.header}; border-bottom-color: #4f46e5;">
                <div>
                    <h1 style="${styles.title}; color: #312e81;">Laporan Hafalan</h1>
                    <p style="${styles.subtitle}">Metode SRS (Spaced Repetition)</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${state.profile?.name || 'Hamba Allah'}</div>
                    <div style="font-size: 12px; color: #64748b;">${dateStr}</div>
                </div>
            </div>

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

            <div style="${styles.footer}">
                NIZAMY Hafalan Tracker - Menjaga Al-Quran Sepanjang Hayat.
            </div>
        </div>
    `;

    await generatePdfFromHtml(html, `Laporan_Hafalan_${state.profile?.name.replace(/\s+/g, '_')}_${dateStr}.pdf`);
};
