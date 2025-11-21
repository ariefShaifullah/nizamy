import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import type React from "react";
import type { CalculationResult, HafalanState } from "../types.ts";
import { SRS_INTERVALS } from "./hafalan.service.ts";
import { formatDate } from "../utils.ts";

// A4 width in pixels at 96 DPI is approximately 794px.
// We use 800px to ensure good padding.
const PRINT_WIDTH = 800;

/**
 * Helper to generate PDF from an element with fixed width cloning
 * Compatible with jsPDF v3.x and v2.5.x
 * Uses off-screen rendering instead of visibility:hidden to prevent blank pages
 */
const generatePdfFromElement = async (
  element: HTMLElement,
  filename: string
) => {
  let printContainer: HTMLElement | null = null;

  try {
    // 1. Create hidden container with fixed width (A4-like)
    printContainer = document.createElement("div");
    printContainer.style.position = "fixed";
    printContainer.style.top = "0";
    printContainer.style.left = "-10000px"; // Move off-screen instead of hidden
    printContainer.style.width = `${PRINT_WIDTH}px`;
    printContainer.style.zIndex = "-9999";
    printContainer.style.backgroundColor = "#ffffff";

    // 2. Clone the element
    const clone = element.cloneNode(true) as HTMLElement;

    // 3. Reset styles on clone to ensure full expansion
    clone.style.width = "100%";
    clone.style.height = "auto";
    clone.style.overflow = "visible";
    clone.style.maxHeight = "none";
    clone.style.position = "relative";
    clone.style.transform = "none";
    clone.style.margin = "0";
    clone.style.padding = "20px"; // Add padding for better PDF look

    const scrollables = clone.querySelectorAll(
      ".overflow-y-auto, .custom-scrollbar"
    );
    scrollables.forEach((el) => {
      (el as HTMLElement).style.overflow = "visible";
      (el as HTMLElement).style.maxHeight = "none";
    });

    printContainer.appendChild(clone);
    document.body.appendChild(printContainer);

    // 4. Capture using html2canvas
    const canvas = await html2canvas(printContainer, {
      scale: 2, // High resolution
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      width: PRINT_WIDTH,
      windowWidth: PRINT_WIDTH,
      height: printContainer.scrollHeight,
      windowHeight: printContainer.scrollHeight,
      onclone: (clonedDoc) => {
        // Ensure SVGs (Recharts) are visible
        const svgs = clonedDoc.getElementsByTagName("svg");
        for (let i = 0; i < svgs.length; i++) {
          svgs[i].setAttribute("width", "100%");
          // Fix for some browsers not rendering svg text in canvas
          svgs[i].style.fontFamily = "sans-serif";
        }
      },
    });

    // 5. Generate PDF
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } catch (err) {
    console.error("PDF Export failed", err);
    alert("Gagal mengunduh PDF. Silakan coba lagi.");
  } finally {
    if (printContainer && document.body.contains(printContainer)) {
      document.body.removeChild(printContainer);
    }
  }
};

export const exportToPdf = async (
  resultsRef: React.RefObject<HTMLDivElement>,
  result: CalculationResult | null
) => {
  const input = resultsRef.current;
  if (!(input instanceof HTMLElement) || !result) return;

  // Hide export button during capture
  const exportButton = input.querySelector<HTMLElement>(
    '[data-html2canvas-ignore="true"]'
  );
  if (exportButton) exportButton.style.display = "none";

  let printRoot: HTMLElement | null = null;

  try {
    const contentWidth = PRINT_WIDTH;
    printRoot = document.createElement("div");
    printRoot.style.position = "fixed";
    printRoot.style.left = "-10000px"; // Off-screen
    printRoot.style.top = "0";
    printRoot.style.width = `${contentWidth}px`;
    printRoot.style.zIndex = "-9999";
    printRoot.style.backgroundColor = "#ffffff";
    document.body.appendChild(printRoot);

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const fullContentClone = input.cloneNode(true) as HTMLElement;
    fullContentClone.style.width = "100%";
    fullContentClone.style.height = "auto";

    // --- PAGE 1: Header & Chart ---
    const headerClone = fullContentClone.cloneNode(true) as HTMLElement;
    // Remove the detailed list from the first page clone
    const listInHeader = headerClone.querySelector(".results-list-container");
    if (listInHeader && listInHeader.parentNode)
      listInHeader.parentNode.removeChild(listInHeader);

    // Add padding/styling
    headerClone.style.padding = "20px";
    printRoot.innerHTML = "";
    printRoot.appendChild(headerClone);

    const headerCanvas = await html2canvas(printRoot, {
      scale: 2,
      backgroundColor: "#ffffff",
      width: contentWidth,
      windowWidth: contentWidth,
    });
    const headerImgData = headerCanvas.toDataURL("image/png");
    const headerImgHeight =
      (headerCanvas.height * pdfWidth) / headerCanvas.width;

    let currentY = 0;
    if (headerImgHeight > 0) {
      pdf.addImage(headerImgData, "PNG", 0, 0, pdfWidth, headerImgHeight);
      currentY = headerImgHeight;
    }

    // --- PAGE 2+: Detailed List Cards ---
    // We render cards individually to handle page breaks better
    const allResultCards = Array.from(
      fullContentClone.querySelectorAll(".result-card-wrapper")
    );

    if (allResultCards.length > 0) {
      // Prepare container for card rendering
      printRoot.innerHTML = "";
      const cardContainer = document.createElement("div");
      cardContainer.className = "results-list-container bg-white";
      cardContainer.style.width = "100%";
      cardContainer.style.padding = "20px";
      printRoot.appendChild(cardContainer);

      // Title for the list section
      const titleDiv = document.createElement("div");
      titleDiv.innerHTML = `<h4 class="text-lg font-bold mb-5 text-slate-700 flex items-center pt-4 border-t border-slate-200"><span class="w-1.5 h-6 bg-blue-500 rounded-full mr-2"></span>Rincian Per Ahli Waris</h4>`;
      cardContainer.appendChild(titleDiv);

      // If not enough space on first page for title, add page
      if (currentY + 30 > pdfHeight) {
        pdf.addPage();
        currentY = 10;
      } else {
        currentY += 5; // spacer
      }

      // Render Title
      const titleCanvas = await html2canvas(printRoot, {
        scale: 2,
        backgroundColor: "#ffffff",
        width: contentWidth,
        windowWidth: contentWidth,
      });
      const titleHeight = (titleCanvas.height * pdfWidth) / titleCanvas.width;
      pdf.addImage(
        titleCanvas.toDataURL("image/png"),
        "PNG",
        0,
        currentY,
        pdfWidth,
        titleHeight
      );
      currentY += titleHeight;

      // Loop through cards
      for (let i = 0; i < allResultCards.length; i++) {
        const card = allResultCards[i] as HTMLElement;

        // Clear previous content
        cardContainer.innerHTML = "";
        const tempWrapper = document.createElement("div");
        tempWrapper.className = "space-y-4 mb-4";
        tempWrapper.appendChild(card.cloneNode(true));
        cardContainer.appendChild(tempWrapper);

        const cardCanvas = await html2canvas(printRoot, {
          scale: 2,
          backgroundColor: "#ffffff",
          width: contentWidth,
          windowWidth: contentWidth,
        });
        const cardImgHeight = (cardCanvas.height * pdfWidth) / cardCanvas.width;

        // Check if we need a new page
        if (currentY + cardImgHeight > pdfHeight - 10) {
          pdf.addPage();
          currentY = 10; // Top margin for new page
        }

        const cardImgData = cardCanvas.toDataURL("image/png");
        pdf.addImage(cardImgData, "PNG", 0, currentY, pdfWidth, cardImgHeight);
        currentY += cardImgHeight;
      }
    }

    pdf.save(`NIZAMY_Faraidh_${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (e) {
    console.error(e);
    alert("Gagal mengunduh PDF Waris.");
  } finally {
    if (exportButton) exportButton.style.display = "block";
    if (printRoot && document.body.contains(printRoot))
      document.body.removeChild(printRoot);
  }
};

export const exportZakatToPdf = async (
  elementRef: React.RefObject<HTMLDivElement>,
  filename: string
) => {
  const element = elementRef.current;
  if (!element) return;
  await generatePdfFromElement(element, filename);
};

export const exportHafalanToPdf = async (state: HafalanState) => {
  let printContainer: HTMLElement | null = null;

  try {
    printContainer = document.createElement("div");
    printContainer.className = "p-8 bg-white text-slate-800 font-sans";
    printContainer.style.width = `${PRINT_WIDTH}px`;
    printContainer.style.position = "fixed";
    printContainer.style.top = "0";
    printContainer.style.left = "-10000px"; // Off-screen
    printContainer.style.zIndex = "-9999";

    const dateStr = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const items = [...state.items].sort((a, b) => {
      if (a.surahNo !== b.surahNo) return a.surahNo - b.surahNo;
      return a.startAyah - b.startAyah;
    });

    const htmlContent = `
            <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <h1 style="font-size: 24px; font-weight: 800; color: #312e81;">Laporan Hafalan Quran</h1>
                    <p style="color: #4f46e5; font-weight: 500; margin-top: 4px;">NIZAMY Tracker (SRS Method)</p>
                </div>
                <div style="text-align: right;">
                    <p style="font-weight: 700; color: #334155;">${
                      state.profile?.name || "User"
                    }</p>
                    <p style="font-size: 14px; color: #64748b;">${dateStr}</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;">
                <div style="background-color: #eef2ff; padding: 16px; border-radius: 8px; border: 1px solid #e0e7ff; text-align: center;">
                    <p style="font-size: 12px; color: #4f46e5; font-weight: 700; text-transform: uppercase;">Level</p>
                    <p style="font-size: 24px; font-weight: 700; color: #312e81;">${
                      state.gamification.level
                    }</p>
                </div>
                <div style="background-color: #eef2ff; padding: 16px; border-radius: 8px; border: 1px solid #e0e7ff; text-align: center;">
                    <p style="font-size: 12px; color: #4f46e5; font-weight: 700; text-transform: uppercase;">Total Hafalan</p>
                    <p style="font-size: 24px; font-weight: 700; color: #312e81;">${
                      items.length
                    } Item</p>
                </div>
                <div style="background-color: #eef2ff; padding: 16px; border-radius: 8px; border: 1px solid #e0e7ff; text-align: center;">
                    <p style="font-size: 12px; color: #4f46e5; font-weight: 700; text-transform: uppercase;">Streak</p>
                    <p style="font-size: 24px; font-weight: 700; color: #312e81;">${
                      state.gamification.currentStreak
                    } Hari</p>
                </div>
            </div>

            <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Daftar Progres Hafalan</h3>
            
            <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 14px;">
                <thead>
                    <tr style="background-color: #f1f5f9; color: #334155;">
                        <th style="padding: 12px; border-bottom: 1px solid #cbd5e1;">Surat & Ayat</th>
                        <th style="padding: 12px; border-bottom: 1px solid #cbd5e1;">Status (Level SRS)</th>
                        <th style="padding: 12px; border-bottom: 1px solid #cbd5e1;">Jadwal Murajaah</th>
                        <th style="padding: 12px; border-bottom: 1px solid #cbd5e1;">Kualitas</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                      items.length === 0
                        ? '<tr><td colspan="4" style="padding: 16px; text-align: center; color: #64748b;">Belum ada data hafalan.</td></tr>'
                        : ""
                    }
                    ${items
                      .map(
                        (item) => `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px; font-weight: 500; color: #1e293b;">
                                ${
                                  item.surahName
                                } <span style="color: #64748b; font-weight: 400;">(${
                          item.startAyah
                        }-${item.endAyah})</span>
                            </td>
                            <td style="padding: 12px;">
                                <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 700; ${
                                  item.stage >= 5
                                    ? "background-color: #fef9c3; color: #854d0e;"
                                    : "background-color: #e0e7ff; color: #4338ca;"
                                }">
                                    ${
                                      item.stage >= 5
                                        ? "Mutqin (Lancar)"
                                        : `Level ${item.stage}`
                                    }
                                </span>
                            </td>
                            <td style="padding: 12px; color: #475569;">
                                ${formatDate(item.nextReviewDate)}
                            </span>
                            </td>
                             <td style="padding: 12px; color: #475569;">
                                ${
                                  item.errorCount === 0
                                    ? '<span style="color: #16a34a; font-weight:bold;">Sempurna</span>'
                                    : `<span style="color: #ea580c;">${item.errorCount}x Lupa</span>`
                                }
                            </td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>
        `;

    printContainer.innerHTML = htmlContent;
    document.body.appendChild(printContainer);

    // Use standard a4 sizing from helper logic
    const canvas = await html2canvas(printContainer, {
      scale: 2,
      backgroundColor: "#ffffff",
      width: PRINT_WIDTH,
      windowWidth: PRINT_WIDTH,
      height: printContainer.scrollHeight,
      windowHeight: printContainer.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(
      `Laporan_Hafalan_${state.profile?.name.replace(
        /\s+/g,
        "_"
      )}_${dateStr}.pdf`
    );
  } catch (err) {
    console.error("PDF Export Error:", err);
    alert("Gagal membuat PDF Hafalan.");
  } finally {
    if (printContainer && document.body.contains(printContainer)) {
      document.body.removeChild(printContainer);
    }
  }
};
