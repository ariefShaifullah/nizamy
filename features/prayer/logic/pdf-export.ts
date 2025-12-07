
import type { PrayerData } from '../../../types.ts';
import { generatePdfFromHtml, pdfStyles as styles } from '../../../services/pdf.service.ts';

/**
 * Prayer Schedule Report Builder with Smart Pagination
 */
export const exportPrayerSchedulePdf = async (data: PrayerData[], locationName: string, monthLabel: string) => {
    
    // Chunking data into pages 
    // Balanced split: 16 rows per page ensures ample space for headers/footers on A4
    // 31 days -> Page 1 (16 rows), Page 2 (15 rows). Balanced & readable.
    const ROWS_PER_PAGE = 16;
    const pages = [];
    
    for (let i = 0; i < data.length; i += ROWS_PER_PAGE) {
        pages.push(data.slice(i, i + ROWS_PER_PAGE));
    }

    // High Contrast Header Style
    const headerStyle = `background-color: #064e3b; color: #ffffff; padding: 10px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #065f46;`;
    const titleColor = '#064e3b'; // Emerald Dark

    // A4 Pixel Dimensions at 96 DPI: 794px x 1122px
    const pageStyle = `
        width: 794px; 
        height: 1122px; 
        padding: 40px 50px 50px 50px; 
        box-sizing: border-box; 
        background-color: white; 
        position: relative; 
        display: flex; 
        flex-direction: column;
    `;

    const pagesHtml = pages.map((chunk, pageIndex) => {
        const rows = chunk.map((item, index) => {
            const date = item.date.gregorian;
            const hijri = item.date.hijri;
            const timings = item.timings;
            const isFriday = date.weekday.en.toLowerCase() === 'friday';
            
            // Formatting function for time (remove timezone suffix if any)
            const ft = (t: string) => t.split(' ')[0];

            // Format Date Strings
            // Gregorian: "01 Des 2025"
            const dateObj = new Date(`${date.year}-${date.month.number}-${date.day}`);
            const gregStr = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
            
            // Hijri: "14 Jumadil Akhir"
            const hijriStr = `${hijri.day} ${hijri.month.en}`;

            const rowBg = index % 2 === 0 ? '#ffffff' : '#f0fdf4'; // Slight green tint for alternating rows
            const dateColor = isFriday ? '#15803d' : '#1e293b'; // Green text for Friday

            return `
                <tr style="background-color: ${rowBg};">
                    <td style="${styles.td}; padding: 8px 10px; border-right: 1px solid #e2e8f0; vertical-align: middle;">
                        <div style="font-size: 11px; font-weight: 700; color: ${dateColor}; margin-bottom: 2px;">
                            ${gregStr}
                        </div>
                        <div style="font-size: 9px; color: #64748b; font-weight: normal;">
                            ${hijriStr}
                        </div>
                    </td>
                    <td style="${styles.td}; text-align: center; font-size: 12px; font-weight:600; border-right: 1px solid #f1f5f9; vertical-align: middle;">${ft(timings.Fajr)}</td>
                    <td style="${styles.td}; text-align: center; font-size: 12px; color: #64748b; border-right: 1px solid #f1f5f9; vertical-align: middle;">${ft(timings.Sunrise)}</td>
                    <td style="${styles.td}; text-align: center; font-size: 12px; font-weight:600; border-right: 1px solid #f1f5f9; vertical-align: middle;">${ft(timings.Dhuhr)}</td>
                    <td style="${styles.td}; text-align: center; font-size: 12px; font-weight:600; border-right: 1px solid #f1f5f9; vertical-align: middle;">${ft(timings.Asr)}</td>
                    <td style="${styles.td}; text-align: center; font-size: 12px; font-weight:600; border-right: 1px solid #f1f5f9; vertical-align: middle;">${ft(timings.Maghrib)}</td>
                    <td style="${styles.td}; text-align: center; font-size: 12px; font-weight:600; vertical-align: middle;">${ft(timings.Isha)}</td>
                </tr>
            `;
        }).join('');

        return `
            <div class="pdf-page" style="${pageStyle}">
                
                <!-- HEADER SECTION -->
                <div style="flex-shrink: 0; margin-bottom: 20px; border-bottom: 3px solid ${titleColor}; padding-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <div style="font-size: 28px; font-weight: 800; color: ${titleColor}; margin: 0; line-height: 1.2;">Jadwal Sholat</div>
                        <div style="font-size: 14px; color: #64748b; margin-top: 5px; font-weight: 500;">${locationName} • ${monthLabel}</div>
                    </div>
                    <div style="text-align: right;">
                        <img src="/images/icon.svg" style="height:35px; opacity:0.9;" />
                        <div style="font-size: 10px; color: #94a3b8; margin-top: 4px; font-weight: 600;">NIZAMY Apps</div>
                    </div>
                </div>

                <!-- TABLE SECTION (Flex Grow to push footer down, but table auto-heights) -->
                <div style="flex: 1;">
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #064e3b; border-radius: 4px; overflow: hidden;">
                        <thead>
                            <tr>
                                <th style="${headerStyle} text-align: left; width: 140px;">Tanggal</th>
                                <th style="${headerStyle} text-align: center;">Subuh</th>
                                <th style="${headerStyle} text-align: center; color: #a7f3d0;">Terbit</th>
                                <th style="${headerStyle} text-align: center;">Dzuhur</th>
                                <th style="${headerStyle} text-align: center;">Ashar</th>
                                <th style="${headerStyle} text-align: center;">Maghrib</th>
                                <th style="${headerStyle} text-align: center;">Isya</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                    
                    <div style="margin-top: 15px; font-size: 10px; color: #64748b; font-style: italic; background-color: #f8fafc; padding: 8px; border-radius: 4px;">
                        * Waktu sholat berdasarkan metode Kemenag RI (Ihtiyati +2 menit). Pastikan jam Anda akurat.
                    </div>
                </div>

                <!-- FOOTER SECTION (Pushed to bottom by Flex) -->
                <div style="flex-shrink: 0; margin-top: auto; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 9px; color: #94a3b8;">
                        Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
                    </div>
                    <div style="font-size: 10px; color: #64748b; font-weight: 600;">
                        Halaman ${pageIndex + 1} dari ${pages.length}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // We pass the concatenated pages directly to generatePdfFromHtml
    // The service detects .pdf-page class and handles slicing.
    await generatePdfFromHtml(pagesHtml, `Jadwal_Sholat_${locationName.replace(/\s+/g, '_')}_${monthLabel.replace(/\s+/g, '_')}.pdf`);
};
