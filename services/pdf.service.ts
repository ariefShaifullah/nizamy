import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type React from "react";
import { formatCurrency } from '../utils.ts';
import type { CalculationResult } from '../types.ts';

export const exportToPdf = async (resultsRef: React.RefObject<HTMLDivElement>, result: CalculationResult | null) => {
    const input = resultsRef.current;
    if (!(input instanceof HTMLElement) || !result) return;

    const exportButton = input.querySelector<HTMLElement>('[data-html2canvas-ignore="true"]');
    if (exportButton) {
      exportButton.style.display = 'none';
    }
    
    let printRoot: HTMLElement | null = null;

    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const contentWidth = input.offsetWidth;
        const pageHeightInPixels = contentWidth * (pdfHeight / pdfWidth);

        const renderPage = async (content: HTMLElement) => {
            const canvas = await html2canvas(content, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                width: content.offsetWidth,
                height: content.offsetHeight,
            });
            const imgData = canvas.toDataURL('image/png');
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            return { imgData, imgHeight };
        };

        const createSimplifiedHeader = () => {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'p-6 bg-white';
            headerDiv.innerHTML = `
                <div class="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
                    <h3 class="text-xl font-bold text-slate-800">Rincian Per Ahli Waris (Lanjutan)</h3>
                    <p class="text-sm text-slate-600">Total Harta: ${formatCurrency(result.estate)}</p>
                </div>
            `;
            return headerDiv;
        };

        const fullHeaderTemplate = input.cloneNode(true);
        if (!(fullHeaderTemplate instanceof HTMLElement)) {
          console.error("Failed to clone the results container.");
          return;
        }
        
        const listContainerInTemplate = fullHeaderTemplate.querySelector('.results-list-container');
        if (listContainerInTemplate) {
            listContainerInTemplate.innerHTML = '';
        }

        const allResultCards = Array.from(input.querySelectorAll<HTMLElement>('.result-card-wrapper'));
        let pageNum = 1;

        printRoot = document.createElement('div');
        printRoot.style.position = 'absolute';
        printRoot.style.left = '-9999px';
        printRoot.style.top = '0px';
        printRoot.style.width = `${contentWidth}px`;
        printRoot.className = document.body.className + ` bg-white`;
        document.body.appendChild(printRoot);

        let currentPageContainer = document.createElement('div');
        currentPageContainer.appendChild(fullHeaderTemplate.cloneNode(true));
        let currentListContainer = currentPageContainer.querySelector('.results-list-container')!;
        printRoot.appendChild(currentPageContainer);

        for (let i = 0; i < allResultCards.length; i++) {
            const card = allResultCards[i];
            currentListContainer.appendChild(card.cloneNode(true));

            if (currentPageContainer.offsetHeight > pageHeightInPixels) {
                const cardToRemove = currentListContainer.lastElementChild;
                if (cardToRemove) {
                  currentListContainer.removeChild(cardToRemove);

                  const { imgData, imgHeight } = await renderPage(currentPageContainer);
                  if (pageNum > 1) pdf.addPage();
                  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
                  pageNum++;

                  printRoot.innerHTML = '';
                  currentPageContainer = document.createElement('div');
                  currentPageContainer.appendChild(createSimplifiedHeader());
                  
                  currentListContainer = document.createElement('div');
                  currentListContainer.className = 'space-y-4 px-6 pb-6';
                  currentPageContainer.appendChild(currentListContainer);
                  
                  currentListContainer.appendChild(cardToRemove);
                  printRoot.appendChild(currentPageContainer);
                }
            }
        }

        if (currentListContainer.children.length > 0) {
            const { imgData, imgHeight } = await renderPage(currentPageContainer);
            if (pageNum > 1) pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        }

        pdf.save(`NIZAMY_Faraidh_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
        console.error("Failed to export PDF:", error);
        alert("An error occurred while exporting to PDF.");
    } finally {
        if (exportButton) {
            exportButton.style.display = 'block';
        }
        if (printRoot && document.body.contains(printRoot)) {
            document.body.removeChild(printRoot);
        }
    }
};
