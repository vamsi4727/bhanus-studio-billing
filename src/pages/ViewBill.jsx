import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BillViewer from '../components/BillViewer.jsx';
import { getBillByInvoiceNumber } from '../services/indexedDB.js';

export default function ViewBill() {
  const { invoiceNumber } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBill();
  }, [invoiceNumber]);

  const loadBill = async () => {
    try {
      setIsLoading(true);
      const billData = await getBillByInvoiceNumber(invoiceNumber);
      if (billData) {
        setBill(billData);
      } else {
        alert('Bill not found');
        navigate('/bills');
      }
    } catch (error) {
      console.error('Error loading bill:', error);
      alert('Error loading bill');
      navigate('/bills');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/bills');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-8">Loading bill...</div>
      </div>
    );
  }

  return (
    <div>
      <BillViewer bill={bill} onBack={handleBack} />
    </div>
  );
}

