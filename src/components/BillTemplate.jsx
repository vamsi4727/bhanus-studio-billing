import React from 'react';

/**
 * BillTemplate Component
 * Displays bill in the exact format matching the PDF design
 */
export default function BillTemplate({ bill }) {
  if (!bill) return null;

  return (
    <div 
      id="bill-template" 
      className="bg-white text-black p-8 max-w-4xl mx-auto"
      style={{ fontFamily: 'system-ui, sans-serif' }}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-8 border-b-2 border-black pb-4">
        <div className="flex-1">
          {/* Logo - Larger size, replaces all text */}
          <div>
            <img 
              src="/logo.png" 
              alt="Bhanu's Studio Logo" 
              className="h-32 w-auto object-contain"
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
              <div className="text-2xl font-bold">Bhanu's Studio</div>
              <div className="text-sm text-gray-600">Designer Clothing</div>
            </div>
          </div>
        </div>

        {/* Invoice Details - Top Right */}
        <div className="text-right">
          <div className="mb-2">
            <span className="font-semibold">Invoice No: </span>
            <span>{bill.invoiceNumber}</span>
          </div>
          <div>
            <span className="font-semibold">Date: </span>
            <span>{bill.date}</span>
          </div>
        </div>
      </div>

      {/* Customer Details Section */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Bill To:</h2>
        <div className="text-sm space-y-1">
          <p className="font-medium">{bill.customerName}</p>
          {bill.customerPhone && (
            <p>Phone: {bill.customerPhone}</p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-4 py-2 text-left">S.No</th>
              <th className="border border-black px-4 py-2 text-left">Description</th>
              <th className="border border-black px-4 py-2 text-right">Qty</th>
              <th className="border border-black px-4 py-2 text-right">Rate</th>
              <th className="border border-black px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.items && bill.items.map((item, index) => (
              <tr key={index}>
                <td className="border border-black px-4 py-2">{item.sno}</td>
                <td className="border border-black px-4 py-2">{item.description}</td>
                <td className="border border-black px-4 py-2 text-right">{item.qty}</td>
                <td className="border border-black px-4 py-2 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                <td className="border border-black px-4 py-2 text-right">₹{item.amount.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      <div className="border-t-2 border-black pt-4">
        <div className="flex justify-end mb-4">
          <div className="text-right">
            <div className="text-lg font-bold">
              Total Amount: ₹{bill.totalAmount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
        <div className="text-center mt-8 text-sm">
          <p>Thank you for your business</p>
        </div>
      </div>
    </div>
  );
}

