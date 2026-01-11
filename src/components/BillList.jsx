import React, { useState, useEffect } from 'react';
import { getAllBillsSorted, searchBillsByCustomerName, filterBillsByDateRange } from '../services/indexedDB.js';

export default function BillList({ onBillSelect }) {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBills();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bills, searchTerm, fromDate, toDate]);

  const loadBills = async () => {
    try {
      setIsLoading(true);
      const allBills = await getAllBillsSorted();
      setBills(allBills);
      setFilteredBills(allBills);
    } catch (error) {
      console.error('Error loading bills:', error);
      alert('Error loading bills');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = async () => {
    let result = [...bills];

    // Apply search filter first
    if (searchTerm.trim()) {
      result = await searchBillsByCustomerName(searchTerm.trim());
    }

    // Apply date range filter on the current result set
    if (fromDate && toDate) {
      // Filter the current results by date range
      const from = parseDateForComparison(fromDate);
      const to = parseDateForComparison(toDate);
      result = result.filter(bill => {
        const billDate = parseDateForComparison(bill.date);
        return billDate >= from && billDate <= to;
      });
    } else if (fromDate) {
      // Only from date
      const from = parseDateForComparison(fromDate);
      result = result.filter(bill => {
        const billDate = parseDateForComparison(bill.date);
        return billDate >= from;
      });
    } else if (toDate) {
      // Only to date
      const to = parseDateForComparison(toDate);
      result = result.filter(bill => {
        const billDate = parseDateForComparison(bill.date);
        return billDate <= to;
      });
    }

    setFilteredBills(result);
  };

  const parseDateForComparison = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFromDate('');
    setToDate('');
  };

  const formatDateForInput = (dateString) => {
    // Convert DD/MM/YYYY to YYYY-MM-DD for input[type="date"]
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const formatInputDateToDisplay = (inputDate) => {
    // Convert YYYY-MM-DD to DD/MM/YYYY
    const [year, month, day] = inputDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleFromDateChange = (e) => {
    const value = e.target.value;
    setFromDate(value ? formatInputDateToDisplay(value) : '');
  };

  const handleToDateChange = (e) => {
    const value = e.target.value;
    setToDate(value ? formatInputDateToDisplay(value) : '');
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-8">Loading bills...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">View Bills</h2>

      {/* Search and Filter Section */}
      <div className="bg-gray-50 p-4 rounded mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search by Customer Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Search by Customer Name</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter customer name"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          {/* From Date */}
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              value={fromDate ? formatDateForInput(fromDate) : ''}
              onChange={handleFromDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              value={toDate ? formatDateForInput(toDate) : ''}
              onChange={handleToDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        {(searchTerm || fromDate || toDate) && (
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Bills List */}
      {filteredBills.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {bills.length === 0 ? 'No bills found. Create your first bill!' : 'No bills match the filters.'}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-2">
            Showing {filteredBills.length} of {bills.length} bills
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Invoice No</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Customer Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Total Amount</th>
                  <th className="border border-gray-300 px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill.invoiceNumber} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{bill.invoiceNumber}</td>
                    <td className="border border-gray-300 px-4 py-2">{bill.date}</td>
                    <td className="border border-gray-300 px-4 py-2">{bill.customerName}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">
                      ₹{bill.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <button
                        onClick={() => onBillSelect && onBillSelect(bill)}
                        className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

