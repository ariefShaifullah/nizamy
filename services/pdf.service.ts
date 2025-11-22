import type React from "react";
import type { CalculationResult, HafalanState } from "../types.ts";
import type { jsPDF } from "jspdf";
import { formatDate } from "../utils.ts";

// Constants
const PRINT_WIDTH = 800;
const A4_RATIO = 1.414;
const PRINT_HEIGHT = Math.floor(PRINT_WIDTH * A4_RATIO); // ~1131px height per page

/**
 * Helper to load PDF libraries dynamically
 */
const loadPdfLibs = async () => {
  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;
  return { jsPDF, html2canvas };
};

/**
 * MASTER FUNCTION: Generate PDF from any HTML Element
 * Uses "Smart Snapshot" technique:
 * 1. Clones element
 * 2. Applies Smart Pagination (adds margins to prevent page-break cuts)
 * 3. Snapshots to Canvas
 * 4. Slices into A4 pages
 */
const generatePdfFromElement = async (
  element: HTMLElement,
  filename: string,
  onClone?: (clonedElement: HTMLElement) => void
) => {
  let printContainer: HTMLElement | null = null;

  try {
    const { jsPDF, html2canvas } = await loadPdfLibs();

    // 1. Create hidden container with fixed width (A4-like quality)
    printContainer = document.createElement("div");
    printContainer.style.position = "fixed";
    printContainer.style.top = "0";
    printContainer.style.left = "-10000px"; // Off-screen
    printContainer.style.width = `${PRINT_WIDTH}px`;
    printContainer.style.zIndex = "-9999";
    printContainer.style.backgroundColor = "#ffffff";

    // 2. Clone the element
    const clone = element.cloneNode(true) as HTMLElement;

    // 3. Reset base styles on clone to ensure clean print look
    clone.style.width = "100%";
    clone.style.height = "auto";
    clone.style.overflow = "visible";
    clone.style.maxHeight = "none";
    clone.style.position = "relative";
    clone.style.transform = "none";
    clone.style.margin = "0";
    clone.style.padding = "40px"; // Generous padding for paper margins
    clone.style.backgroundColor = "#ffffff"; // Force white bg
    clone.style.color = "#000000"; // Force absolute black text

    // Remove screen-specific styles
    clone.classList.remove(
      "shadow-lg",
      "shadow-xl",
      "dark:bg-slate-800",
      "dark:border-slate-700",
      "rounded-2xl"
    );
    clone.classList.add("text-slate-900");

    // 4. Apply custom manipulators (e.g. expand lists, pagination logic)
    if (onClone) {
      onClone(clone);
    }

    printContainer.appendChild(clone);
    document.body.appendChild(printContainer);

    // Wait for images/charts to stabilize
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 5. Capture using html2canvas
    const canvas = await html2canvas(printContainer, {
      scale: 2, // High resolution (Retina-like)
      backgroundColor: "#ffffff",
      useCORS: true, // For external images/fonts
      logging: false,
      width: PRINT_WIDTH,
      windowWidth: PRINT_WIDTH,
      height: printContainer.scrollHeight, // Capture full scroll height
      windowHeight: printContainer.scrollHeight,
      ignoreElements: (el) => {
        return el.hasAttribute("data-html2canvas-ignore");
      },
      onclone: (clonedDoc) => {
        // Fix: Ensure SVGs (Recharts) are visible
        const svgs = clonedDoc.getElementsByTagName("svg");
        for (let i = 0; i < svgs.length; i++) {
          svgs[i].setAttribute("width", "100%");
          svgs[i].style.fontFamily = "sans-serif";
        }
      },
    });

    // 6. Generate PDF with Page Slicing
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

    // First Page
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Subsequent Pages (Slice)
    // Since we used Smart Pagination in onClone, the cuts should happen in whitespace
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

/**
 * Export Faraidh (Waris) Result
 */
export const exportToPdf = async (
  resultsRef: React.RefObject<HTMLDivElement>,
  result: CalculationResult | null
) => {
  const input = resultsRef.current;
  if (!(input instanceof HTMLElement) || !result) return;

  const filename = `NIZAMY_Waris_${new Date().toISOString().split("T")[0]}.pdf`;

  await generatePdfFromElement(input, filename, (clone) => {
    // --- 1. PREPARE HEADER ---
    const headerDiv = document.createElement("div");
    headerDiv.className = "pdf-block"; // Mark as a block for pagination
    headerDiv.style.marginBottom = "30px";
    headerDiv.innerHTML = `
            <div style="border-bottom: 2px solid #0ea5e9; padding-bottom: 16px;">
                <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 0;">Laporan Pembagian Waris</h1>
                <div style="display: flex; justify-content: space-between; margin-top: 8px;">
                    <p style="color: #64748b; font-size: 14px;">NIZAMY Faraidh Calculator</p>
                    <p style="color: #64748b; font-size: 14px;">${new Date().toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}</p>
                </div>
            </div>
        `;
    clone.prepend(headerDiv);

    // --- 2. LINEARIZE LAYOUT ---
    const gridElements = clone.querySelectorAll(".grid");
    gridElements.forEach((el) => {
      (el as HTMLElement).style.display = "block";
    });

    const colSpanElements = clone.querySelectorAll(
      ".lg\\:col-span-2, .lg\\:col-span-3"
    );
    colSpanElements.forEach((el) => {
      const element = el as HTMLElement;
      element.style.width = "100%";
      element.style.display = "block";
      element.style.marginBottom = "24px";
    });

    // --- 3. FIX CHART (Don't hide, but fix size) ---
    const chartCard = clone
      .querySelector(".recharts-responsive-container")
      ?.closest(".bg-slate-50");
    if (chartCard) {
      const el = chartCard as HTMLElement;
      el.classList.add("pdf-block"); // Mark for pagination
      el.style.display = "block";
      el.style.height = "auto";
      el.style.backgroundColor = "#ffffff";
      el.style.border = "1px solid #e2e8f0";
      el.style.marginBottom = "24px";
      el.style.pageBreakInside = "avoid";

      // Fix Recharts container inside
      const responsiveContainer = el.querySelector(
        ".recharts-responsive-container"
      ) as HTMLElement;
      if (responsiveContainer) {
        responsiveContainer.style.width = "100%";
        responsiveContainer.style.height = "300px"; // Fixed height for print
        responsiveContainer.style.position = "relative";
      }

      // Hide the Tooltip div from Recharts if captured
      const tooltips = el.querySelectorAll(".recharts-tooltip-wrapper");
      tooltips.forEach((t) => ((t as HTMLElement).style.display = "none"));
    }

    // --- 4. EXPAND LISTS & STYLE CARDS ---
    const listWrapper = clone.querySelector(".result-card-wrapper");
    if (listWrapper) {
      const el = listWrapper as HTMLElement;
      el.style.maxHeight = "none";
      el.style.overflow = "visible";
      el.style.height = "auto";

      // Mark children (cards) as blocks for pagination
      const children = el.children;
      for (let i = 0; i < children.length; i++) {
        children[i].classList.add("pdf-block");
      }
    }

    // Style all "cards" (Total Estate, Notes, Results)
    const allCards = clone.querySelectorAll(".rounded-xl, .rounded-lg");
    allCards.forEach((c) => {
      const card = c as HTMLElement;
      card.style.boxShadow = "none";
      card.style.border = "1px solid #cbd5e1";
      card.style.backgroundColor = "#ffffff"; // No backgrounds
      card.style.color = "#000000";

      // Fix Gradient Card (Total Estate)
      if (card.classList.contains("bg-gradient-to-r")) {
        card.classList.add("pdf-block");
        card.style.background = "#f0f9ff"; // Light blue plain
        card.style.border = "2px solid #0284c7";
        card.style.marginBottom = "20px";

        const texts = card.querySelectorAll("*");
        texts.forEach((t) => ((t as HTMLElement).style.color = "#0284c7"));
      } else {
        // Result Cards
        if (!card.classList.contains("pdf-block")) {
          card.classList.add("pdf-block");
        }
        card.style.marginBottom = "12px";
      }
    });

    // --- 5. FORCE BLACK TEXT ---
    const textElements = clone.querySelectorAll("p, h1, h2, h3, h4, span, div");
    textElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        // Preserve colored highlights for values, but make everything else black
        if (
          !el.classList.contains("text-primary-600") &&
          !el.classList.contains("text-emerald-600") &&
          !el.parentElement?.classList.contains("bg-gradient-to-r")
        ) {
          el.style.color = "#000000";
        }
      }
    });

    // --- 6. SMART PAGINATION LOGIC ---
    // Iterate through all major blocks and insert spacers if they cross page boundary
    const blocks = clone.querySelectorAll(".pdf-block");
    let currentY = 40; // Start with padding-top
    const pageHeight = PRINT_HEIGHT;

    blocks.forEach((block) => {
      const el = block as HTMLElement;
      const height =
        el.offsetHeight +
        parseInt(getComputedStyle(el).marginTop || "0") +
        parseInt(getComputedStyle(el).marginBottom || "0");

      // Check if this block crosses the page boundary
      if (currentY + height > pageHeight) {
        // Calculate space needed to push to next page
        const spacer = pageHeight - currentY;
        el.style.marginTop = `${spacer + 40}px`; // +40 for top margin of next page
        currentY = 40 + height; // Reset Y for next page
      } else {
        currentY += height;
      }

      // Handle case where block itself is larger than a page (unlikely for cards, but safe to wrap)
      if (currentY >= pageHeight) {
        currentY = currentY % pageHeight;
      }
    });
  });
};

/**
 * Export Zakat Result (Simplified)
 */
export const exportZakatToPdf = async (
  elementRef: React.RefObject<HTMLDivElement>,
  filename: string
) => {
  const element = elementRef.current;
  if (!element) return;

  await generatePdfFromElement(element, filename, (clone) => {
    clone.classList.remove("rounded-2xl", "border-2", "shadow-sm");
    clone.style.border = "none";

    // Force chart container if exists
    const chart = clone.querySelector(
      ".recharts-responsive-container"
    ) as HTMLElement;
    if (chart) {
      chart.style.width = "100%";
      chart.style.height = "250px";
    }

    const texts = clone.querySelectorAll("*");
    texts.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.color = "#000000";
      }
    });
  });
};

/**
 * Export Hafalan Report (Custom Builder)
 * This one generates HTML from data directly, so it doesn't use the DOM cloner above.
 */
export const exportHafalanToPdf = async (state: HafalanState) => {
  let printContainer: HTMLElement | null = null;

  try {
    const { jsPDF, html2canvas } = await loadPdfLibs();

    printContainer = document.createElement("div");
    printContainer.className = "p-8 bg-white text-slate-800 font-sans";
    printContainer.style.width = `${PRINT_WIDTH}px`;
    printContainer.style.position = "fixed";
    printContainer.style.top = "0";
    printContainer.style.left = "-10000px";
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

    // Capture using the same logic
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
