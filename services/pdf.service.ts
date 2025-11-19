import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type React from "react";
import { formatCurrency } from '../utils.ts';
import type { CalculationResult } from '../types.ts';

// A4 width in pixels at 96 DPI is approximately 794px.
// We use roughly this width to force a "Desktop" layout look on mobile devices.
const PRINT_WIDTH = 800; 

/**
 * Export Faraidh Results to PDF with Pagination
 */
export const exportToPdf = async (resultsRef: React.RefObject<HTMLDivElement>, result: CalculationResult | null) => {
  const input = resultsRef.current;
  if (!(input instanceof HTMLElement) || !result) return;

  // Hide the export button in the clone
  const exportButton = input.querySelector<HTMLElement>(
    '[data-html2canvas-ignore="true"]'
  );
  if (exportButton) exportButton.style.display = "none";

  let printRoot: HTMLElement | null = null;

  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Use FIXED width for calculation to ensure desktop layout
    const contentWidth = PRINT_WIDTH;
    const pageHeightInPixels = contentWidth * (pdfHeight / pdfWidth);

    // Helper to render an element to image data
    const renderToImage = async (element: HTMLElement) => {
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        backgroundColor: "#ffffff",
        useCORS: true,
        width: contentWidth, // Force width
        windowWidth: contentWidth, // Force window width simulation
      });
      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      return { imgData, imgHeight };
    };

    // --- DOM MANIPULATION ---
    // Create a temporary container with fixed width off-screen
    printRoot = document.createElement("div");
    printRoot.style.position = "fixed";
    printRoot.style.left = "-9999px";
    printRoot.style.top = "0px";
    printRoot.style.width = `${contentWidth}px`; // FORCE DESKTOP WIDTH
    printRoot.style.backgroundColor = "#ffffff";
    printRoot.className = "font-sans text-slate-800"; // Ensure basic fonts
    document.body.appendChild(printRoot);

    // Header Construction for subsequent pages
    const createSimplifiedHeader = () => {
      const headerDiv = document.createElement("div");
      headerDiv.className = "p-6 bg-white mb-4";
      headerDiv.innerHTML = `
                <div class="flex justify-between items-center border-b border-slate-200 pb-2">
                    <h3 class="text-xl font-bold text-slate-800">Rincian Per Ahli Waris (Lanjutan)</h3>
                    <p class="text-sm text-slate-600">Total Harta: ${formatCurrency(
                      result.estate
                    )}</p>
                </div>
            `;
      return headerDiv;
    };

    // Clone the main content
    const fullContentClone = input.cloneNode(true) as HTMLElement;

    // Reset specific styles that might interfere
    fullContentClone.style.width = "100%";
    fullContentClone.style.height = "auto";
    fullContentClone.style.overflow = "visible";

    // Prepare pagination containers
    const allResultCards = Array.from(
      fullContentClone.querySelectorAll(".result-card-wrapper")
    );
    const listContainer = fullContentClone.querySelector(
      ".results-list-container"
    );
    if (listContainer) listContainer.innerHTML = ""; // Clear list to rebuild page by page

    let currentPageContent = document.createElement("div");
    currentPageContent.style.width = "100%";
    currentPageContent.appendChild(fullContentClone); // Start with the header/summary part

    let currentListContainer = currentPageContent.querySelector(
      ".results-list-container"
    );
    if (!currentListContainer) {
      // Fallback if structure changes
      currentListContainer = document.createElement("div");
      currentPageContent.appendChild(currentListContainer);
    }

    printRoot.appendChild(currentPageContent);

    // Pagination Loop
    let pageNum = 1;
    for (let i = 0; i < allResultCards.length; i++) {
      const card = allResultCards[i] as HTMLElement;
      currentListContainer.appendChild(card);

      // Check if overflow
      if (currentPageContent.offsetHeight > pageHeightInPixels) {
        // Remove the card that caused overflow
        currentListContainer.removeChild(card);

        // Capture current page
        const { imgData, imgHeight } = await renderToImage(currentPageContent);
        if (pageNum > 1) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
        pageNum++;

        // Reset for next page
        printRoot.innerHTML = ""; // Clear DOM
        currentPageContent = document.createElement("div");
        currentPageContent.style.width = "100%";
        currentPageContent.appendChild(createSimplifiedHeader()); // New header

        currentListContainer = document.createElement("div");
        currentListContainer.className = "space-y-4 px-6 pb-6";
        currentPageContent.appendChild(currentListContainer);

        currentListContainer.appendChild(card); // Add the card back
        printRoot.appendChild(currentPageContent);
      }
    }

    // Print remaining content
    if (printRoot.hasChildNodes()) {
      const { imgData, imgHeight } = await renderToImage(currentPageContent);
      if (pageNum > 1) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
    }

    pdf.save(`NIZAMY_Faraidh_${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("Failed to export PDF:", error);
    alert("Gagal membuat PDF. Silakan coba lagi.");
  } finally {
    if (exportButton) exportButton.style.display = "block";
    if (printRoot && document.body.contains(printRoot)) {
      document.body.removeChild(printRoot);
    }
  }
};

/**
 * Export Zakat Receipt to PDF
 */
export const exportZakatToPdf = async (elementRef: React.RefObject<HTMLDivElement>, filename: string) => {
    const element = elementRef.current;
    if (!element) return;

    let printContainer: HTMLElement | null = null;

    try {
        // Create hidden container with fixed width (A4-like width for desktop layout)
        printContainer = document.createElement('div');
        printContainer.style.position = 'fixed';
        printContainer.style.top = '0';
        printContainer.style.left = '-9999px';
        printContainer.style.width = `${PRINT_WIDTH}px`;
        printContainer.style.backgroundColor = '#ffffff';
        printContainer.style.zIndex = '-9999';
        
        // Clone the receipt
        const clone = element.cloneNode(true) as HTMLElement;
        
        // Adjust styles for print cleanliness
        clone.classList.remove('shadow-sm', 'border-2'); // Remove screen shadows/borders if needed
        clone.style.border = '2px solid #e2e8f0'; // Ensure clean border
        clone.style.padding = '40px'; // Add padding for paper look
        clone.style.width = '100%';
        
        printContainer.appendChild(clone);
        document.body.appendChild(printContainer);

        // Generate Canvas from the Fixed-Width Container
        const canvas = await html2canvas(printContainer, {
            scale: 2, // High resolution
            backgroundColor: '#ffffff',
            useCORS: true,
            width: PRINT_WIDTH,
            windowWidth: PRINT_WIDTH
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        pdf.save(filename);

    } catch (err) {
        console.error("PDF Export failed", err);
        alert("Gagal mengunduh PDF.");
    } finally {
        if (printContainer && document.body.contains(printContainer)) {
            document.body.removeChild(printContainer);
        }
    }
};