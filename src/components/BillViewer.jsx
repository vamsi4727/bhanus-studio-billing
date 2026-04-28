import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import BillTemplate from './BillTemplate.jsx';
import { generateBillPNG, downloadPNG, sharePNG } from '../services/billGenerator.js';

/**
 * Renders BillTemplate (forExport) into a temporary off-screen DOM node,
 * returns the element and a cleanup function.
 * Using createRoot + flushSync ensures the component is fully rendered
 * (with all Tailwind styles applied) before html2canvas captures it.
 */
function renderExportElement(bill) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '-99999px';
  container.style.width = '960px';
  container.style.overflow = 'visible';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '-1';
  document.body.appendChild(container);

  const root = createRoot(container);
  flushSync(() => {
    root.render(<BillTemplate bill={bill} forExport />);
  });

  return {
    element: container.firstElementChild,
    cleanup: () => {
      root.unmount();
      if (container.parentNode) container.parentNode.removeChild(container);
    },
  };
}

export default function BillViewer({ bill, onBack }) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!bill) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-8">No bill selected</div>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back
          </button>
        )}
      </div>
    );
  }

  const handleDownloadPNG = async () => {
    try {
      setIsGenerating(true);
      const { element, cleanup } = renderExportElement(bill);
      try {
        const blob = await generateBillPNG(element);
        if (!blob) throw new Error('Failed to generate PNG blob');
        downloadPNG(blob, `bill-${bill.invoiceNumber}.png`);
      } finally {
        cleanup();
      }
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert(`Error generating PNG: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSharePNG = async () => {
    try {
      setIsGenerating(true);
      const { element, cleanup } = renderExportElement(bill);
      let blob;
      try {
        blob = await generateBillPNG(element);
        if (!blob) throw new Error('Failed to generate PNG blob');
      } finally {
        cleanup();
      }

      const filename = `bill-${bill.invoiceNumber}.png`;
      const shared = await sharePNG(blob, filename);

      if (!shared) {
        downloadPNG(blob, filename);
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          alert('Share not available. PNG downloaded. You can share it from your Photos app.');
        } else {
          alert('PNG downloaded. On mobile, WhatsApp will appear in the share sheet.');
        }
      }
    } catch (error) {
      console.error('Error generating PNG for share:', error);
      alert(`Error generating PNG: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ← Back to List
            </button>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleDownloadPNG}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Download PNG'}
          </button>

          <button
            onClick={handleSharePNG}
            disabled={isGenerating}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Share (WhatsApp)'}
          </button>
        </div>
      </div>

      {/* Bill Template - visible view only */}
      <div>
        <BillTemplate bill={bill} />
      </div>

      {/* Print-friendly styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
