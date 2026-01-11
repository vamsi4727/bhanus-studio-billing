import React, { useRef, useState } from 'react';
import BillTemplate from './BillTemplate.jsx';
import { generateBillPNG, downloadPNG, sharePNG } from '../services/billGenerator.js';

export default function BillViewer({ bill, onBack }) {
  const billRef = useRef(null);
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
    if (!billRef.current) return;

    try {
      setIsGenerating(true);
      const blob = await generateBillPNG(billRef.current);
      const filename = `bill-${bill.invoiceNumber}.png`;
      downloadPNG(blob, filename);
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('Error generating PNG. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSharePNG = async () => {
    if (!billRef.current) return;

    try {
      setIsGenerating(true);
      const blob = await generateBillPNG(billRef.current);
      const filename = `bill-${bill.invoiceNumber}.png`;
      
      const shared = await sharePNG(blob, filename);
      
      if (!shared) {
        // Fallback to download if share API is not available
        downloadPNG(blob, filename);
        alert('Share API not available. PNG downloaded instead.');
      }
    } catch (error) {
      console.error('Error sharing PNG:', error);
      alert('Error sharing PNG. Please try again.');
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
          
          {navigator.share && (
            <button
              onClick={handleSharePNG}
              disabled={isGenerating}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Share (WhatsApp)'}
            </button>
          )}
        </div>
      </div>

      {/* Bill Template */}
      <div ref={billRef}>
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

