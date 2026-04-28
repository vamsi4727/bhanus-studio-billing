import React from 'react';

/**
 * BillTemplate Component
 * Displays bill in the exact format matching the PDF design
 */
export default function BillTemplate({ bill, forExport = false }) {
  if (!bill) return null;

  const wrapperClass = forExport
    ? 'bg-white text-black p-8 w-[960px] mx-auto'
    : 'bg-white text-black p-4 sm:p-6 md:p-8 max-w-4xl mx-auto';

  const headerClass = forExport
    ? 'flex items-start justify-between mb-8 border-b-2 border-black pb-4 gap-0'
    : 'flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 border-b-2 border-black pb-4 gap-4 sm:gap-0';

  const logoClass = forExport
    ? 'h-32 w-auto object-contain'
    : 'h-20 sm:h-28 md:h-32 w-auto object-contain';

  const tableContainerClass = 'mb-6 sm:mb-8 overflow-visible';

  const tableClass = forExport
    ? 'w-full table-fixed border-collapse border border-black min-w-0'
    : 'w-full table-fixed border-collapse border border-black min-w-0';

  return (
    <div 
      id="bill-template" 
      className={wrapperClass}
      style={{ fontFamily: 'system-ui, sans-serif' }}
    >
      {/* Header Section */}
      <div className={headerClass}>
        <div className="flex-1">
          {/* Logo - Larger size, replaces all text */}
          <div>
            <img 
              src="/logo.png" 
              alt="Bhanu's Studio Logo" 
              className={logoClass}
              style={{ maxHeight: '150px' }}
              onError={(e) => {
                // Fallback: Show text if logo doesn't load
                e.target.style.display = 'none';
                const fallback = e.target.nextElementSibling;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            {/* Fallback text logo if image doesn't load */}
            <div style={{ display: 'none' }} className="mb-2">
              <div className="text-xl sm:text-2xl font-bold">Bhanu's Studio</div>
              <div className="text-xs sm:text-sm text-gray-600">Designer Clothing</div>
            </div>
          </div>
        </div>

        {/* Invoice Details - Top Right */}
        <div className="text-left sm:text-right">
          <div className="mb-2 text-sm sm:text-base">
            <span className="font-semibold">Invoice No: </span>
            <span>{bill.invoiceNumber}</span>
          </div>
          <div className="text-sm sm:text-base">
            <span className="font-semibold">Date: </span>
            <span>{bill.date}</span>
          </div>
        </div>
      </div>

      {/* Customer Details Section */}
      <div className="mb-4 sm:mb-6">
        <h2 className="font-semibold mb-2 text-sm sm:text-base">Bill To:</h2>
        <div className="text-xs sm:text-sm space-y-1">
          <p className="font-medium">{bill.customerName}</p>
          {bill.customerPhone && (
            <p>Phone: {bill.customerPhone}</p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className={tableContainerClass} data-export-expand="true">
        <table className={tableClass}>
          <thead>
            <tr className="bg-gray-100">
              <th className="w-[10%] border border-black px-1.5 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-base">S.No</th>
              <th className="w-[40%] border border-black px-1.5 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-base">Description</th>
              <th className="w-[10%] border border-black px-1.5 sm:px-3 py-1.5 sm:py-2 text-right text-xs sm:text-base">Qty</th>
              <th className="w-[20%] border border-black px-1.5 sm:px-3 py-1.5 sm:py-2 text-right text-xs sm:text-base">Rate</th>
              <th className="w-[20%] border border-black px-1.5 sm:px-3 py-1.5 sm:py-2 text-right text-xs sm:text-base">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.items && bill.items.map((item, index) => (
              <tr key={index}>
                <td className="border border-black px-1.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-base align-top">{item.sno}</td>
                <td className="border border-black px-1.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-base break-words align-top">{item.description}</td>
                <td className="border border-black px-1.5 sm:px-3 py-1.5 sm:py-2 text-right text-xs sm:text-base align-top">{item.qty}</td>
                <td className="border border-black px-1.5 sm:px-3 py-1.5 sm:py-2 text-right text-xs sm:text-base break-words align-top">₹{item.rate.toLocaleString('en-IN')}</td>
                <td className="border border-black px-1.5 sm:px-3 py-1.5 sm:py-2 text-right text-xs sm:text-base break-words align-top">₹{item.amount.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      <div className="border-t-2 border-black pt-4">
        <div className="flex justify-end mb-4">
          <div className="text-right">
            <div className="text-base sm:text-lg font-bold">
              Total Amount: ₹{bill.totalAmount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
        <div className="text-center mt-6 sm:mt-8 text-xs sm:text-sm">
          <p>Thank you for your business</p>
        </div>
      </div>
    </div>
  );
}

