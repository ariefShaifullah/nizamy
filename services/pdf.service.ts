
import { formatCurrency, formatDate } from '../utils.ts';

// Constants
const PRINT_WIDTH = 800; 

/**
 * Helper to load PDF libraries dynamically
 */
export const loadPdfLibs = async () => {
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;
    return { jsPDF, html2canvas };
};

export const pdfStyles = {
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

interface ReportMetadata {
    title: string;
    subtitle: string;
    date?: string;
    refId?: string;
    themeColor?: string; // Hex code for borders/accents
}

/**
 * CORE ENGINE: Standardized Layout Generator
 * Wraps content in a consistent NIZAMY branded template.
 */
export const generateReportLayout = (metadata: ReportMetadata, contentHtml: string): string => {
    const dateStr = metadata.date || formatDate(new Date().toISOString(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const color = metadata.themeColor || '#3b82f6'; // Default Blue

    return `
        <div style="padding: 40px; font-family: 'Inter', sans-serif; color: #334155; position: relative; background-color: #ffffff;">
            
            <!-- Watermark -->
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; color: #f8fafc; font-weight: 900; z-index: 0; opacity: 0.6; pointer-events: none;">
                NIZAMY
            </div>

            <div style="position: relative; z-index: 1;">
                <!-- Header -->
                <div style="border-bottom: 2px solid ${color}; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <h1 style="font-size: 28px; font-weight: 800; color: ${color}; margin: 0; line-height: 1.2;">${metadata.title}</h1>
                        <p style="font-size: 14px; color: #64748b; margin-top: 5px; font-weight: 500;">${metadata.subtitle}</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 12px; color: #64748b;">Tanggal Cetak</div>
                        <div style="font-weight: 700; color: #0f172a;">${dateStr}</div>
                        ${metadata.refId ? `<div style="font-size: 10px; color: #94a3b8; margin-top: 2px; font-family: monospace;">REF: ${metadata.refId}</div>` : ''}
                    </div>
                </div>

                <!-- Main Content -->
                ${contentHtml}

                <!-- Footer -->
                <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8;">
                    Dokumen ini dihasilkan secara otomatis oleh <strong>NIZAMY Islamic Apps Suite</strong>.<br/>
                    Hasil perhitungan adalah estimasi/alat bantu. Mohon verifikasi dengan ahli ilmu terkait untuk keputusan krusial.
                </div>
            </div>
        </div>
    `;
};

/**
 * CORE ENGINE: Generate PDF from a clean HTML string
 */
export const generatePdfFromHtml = async (htmlContent: string, filename: string) => {
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
            windowHeight: container.scrollHeight,
            useCORS: true // Important for external images/fonts if any
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
