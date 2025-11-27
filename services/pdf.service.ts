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

/**
 * CORE ENGINE: Generate PDF from a clean HTML string
 * This avoids manipulating the live DOM and ensures consistent styling.
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
