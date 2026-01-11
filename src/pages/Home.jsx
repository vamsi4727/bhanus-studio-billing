import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBillsSorted } from '../services/indexedDB.js';

export default function Home() {
  const navigate = useNavigate();
  const [recentBills, setRecentBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentBills();
  }, []);

  const loadRecentBills = async () => {
    try {
      setIsLoading(true);
      const bills = await getAllBillsSorted();
      setRecentBills(bills.slice(0, 5)); // Show only 5 most recent
    } catch (error) {
      console.error('Error loading recent bills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Bhanus Studio Billing</h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => navigate('/create')}
          className="p-6 bg-black text-white rounded-lg hover:bg-gray-800 text-left"
        >
          <h2 className="text-xl font-semibold mb-2">Create New Bill</h2>
          <p className="text-gray-300">Create a new invoice</p>
        </button>

        <button
          onClick={() => navigate('/bills')}
          className="p-6 bg-gray-100 text-black rounded-lg hover:bg-gray-200 text-left border-2 border-gray-300"
        >
          <h2 className="text-xl font-semibold mb-2">View All Bills</h2>
          <p className="text-gray-600">Browse and search bills</p>
        </button>
      </div>

      {/* Recent Bills */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Recent Bills</h2>
        
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : recentBills.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No bills yet. Create your first bill!
          </div>
        ) : (
          <div className="space-y-2">
            {recentBills.map((bill) => (
              <div
                key={bill.invoiceNumber}
                onClick={() => navigate(`/bills/${bill.invoiceNumber}`)}
                className="p-4 bg-white rounded border border-gray-200 hover:border-gray-400 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">{bill.invoiceNumber}</span>
                    <span className="text-gray-600 ml-4">{bill.customerName}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{bill.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className="text-sm text-gray-600">{bill.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

