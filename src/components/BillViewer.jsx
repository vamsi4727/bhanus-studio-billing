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
    if (!billRef.current) {
      alert('Bill content not available. Please refresh the page.');
      return;
    }

    try {
      setIsGenerating(true);
      const blob = await generateBillPNG(billRef.current);
      
      if (!blob) {
        throw new Error('Failed to generate PNG blob');
      }
      
      const filename = `bill-${bill.invoiceNumber}.png`;
      
      try {
        downloadPNG(blob, filename);
      } catch (downloadError) {
        console.error('Error downloading PNG:', downloadError);
        alert('Error downloading PNG. Please check browser console for details.');
      }
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert(`Error generating PNG: ${error.message || 'Unknown error'}. Please check browser console for details.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSharePNG = async () => {
    if (!billRef.current) {
      alert('Bill content not available. Please refresh the page.');
      return;
    }

    try {
      setIsGenerating(true);
      const blob = await generateBillPNG(billRef.current);
      
      if (!blob) {
        throw new Error('Failed to generate PNG blob');
      }
      
      const filename = `bill-${bill.invoiceNumber}.png`;
      
      try {
        const shared = await sharePNG(blob, filename);
        
        if (!shared) {
          // Fallback to download if share API is not available
          try {
            downloadPNG(blob, filename);
            
            // Detect if we're on mobile or desktop
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            if (isMobile) {
              alert('Share not available. PNG downloaded. You can share it from your Photos app.');
            } else {
              alert('PNG downloaded. On mobile devices, WhatsApp will appear in the share sheet. On Mac, you can manually share the downloaded file.');
            }
          } catch (downloadError) {
            console.error('Error downloading PNG:', downloadError);
            alert('Share failed and download also failed. Please check browser console for details.');
          }
        }
      } catch (shareError) {
        console.error('Error in share process:', shareError);
        // Try to download as fallback
        try {
          downloadPNG(blob, filename);
          alert('Share failed. PNG downloaded instead.');
        } catch (downloadError) {
          console.error('Fallback download also failed:', downloadError);
          alert(`Share failed: ${shareError.message || 'Unknown error'}. Please check browser console.`);
        }
      }
    } catch (error) {
      console.error('Error generating PNG for share:', error);
      alert(`Error generating PNG: ${error.message || 'Unknown error'}. Please check browser console for details.`);
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

