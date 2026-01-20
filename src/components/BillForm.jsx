import React, { useState, useEffect } from 'react';
import { getNextInvoiceNumber } from '../services/invoiceNumber.js';
import { getCurrentDate, getISOTimestamp } from '../utils/dateFormatter.js';
import { saveBill } from '../services/indexedDB.js';

export default function BillForm({ onSave }) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    items: [{ sno: 1, description: '', qty: '', rate: '', amount: 0 }]
  });
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load next invoice number on mount
    getNextInvoiceNumber().then(setInvoiceNumber);
  }, []);

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate amount if qty or rate changed
    if (field === 'qty' || field === 'rate') {
      const qty = parseFloat(newItems[index].qty) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      newItems[index].amount = qty * rate;
    }
    
    // Update S.No for all items
    newItems.forEach((item, idx) => {
      item.sno = idx + 1;
    });
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    const newItem = {
      sno: formData.items.length + 1,
      description: '',
      qty: '',
      rate: '',
      amount: 0
    };
    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, idx) => idx !== index);
      // Update S.No
      newItems.forEach((item, idx) => {
        item.sno = idx + 1;
      });
      setFormData({ ...formData, items: newItems });
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    if (formData.items.some(item => !item.description.trim())) {
      alert('Please fill all item descriptions');
      return;
    }

    setIsSaving(true);

    try {
      const bill = {
        invoiceNumber,
        date: getCurrentDate(),
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim() || null,
        items: formData.items.map(item => ({
          sno: item.sno,
          description: item.description.trim(),
          qty: parseFloat(item.qty) || 0,
          rate: parseFloat(item.rate) || 0,
          amount: parseFloat(item.amount) || 0
        })),
        totalAmount: calculateTotal(),
        createdAt: getISOTimestamp(),
        syncedToGoogleDrive: false,
        googleDriveFileId: null
      };

      await saveBill(bill);

      // Reset form
      setFormData({
        customerName: '',
        customerPhone: '',
        items: [{ sno: 1, description: '', qty: '', rate: '', amount: 0 }]
      });

      // Get next invoice number
      const nextInvoice = await getNextInvoiceNumber();
      setInvoiceNumber(nextInvoice);

      if (onSave) {
        onSave(bill);
      }

      alert('Bill saved successfully!');
    } catch (error) {
      console.error('Error saving bill:', error);
      alert('Error saving bill. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:p-4">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Create New Bill</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Invoice Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Invoice Number</label>
              <input
                type="text"
                value={invoiceNumber}
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Date</label>
              <input
                type="text"
                value={getCurrentDate()}
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-base"
              />
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Customer Details</h3>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-blue-500 focus:outline-none"
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Customer Phone (Optional)</label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-blue-500 focus:outline-none"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-base font-medium"
            >
              + Add Item
            </button>
          </div>

          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="bg-gray-50 border border-gray-300 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Item #{item.sno}</span>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="px-3 py-1.5 bg-red-500 text-white rounded text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-blue-500 focus:outline-none"
                    placeholder="Item description"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Quantity</label>
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base text-right font-semibold focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Rate (₹)</label>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base text-right font-semibold focus:border-blue-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Amount</span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left">S.No</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Description</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Qty</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Rate</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Amount</th>
                  <th className="border border-gray-300 px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-3 py-2">{item.sno}</td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded"
                        placeholder="Item description"
                        required
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(index, 'qty', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded text-right font-semibold focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded text-right font-semibold focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Amount */}
          <div className="flex justify-end mt-4 pt-4 border-t-2 border-gray-300">
            <div className="text-lg md:text-xl font-bold">
              Total Amount: ₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 text-base font-medium min-h-[44px]"
          >
            {isSaving ? 'Saving...' : 'Save Bill'}
          </button>
        </div>
      </form>
    </div>
  );
}

