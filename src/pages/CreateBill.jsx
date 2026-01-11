import React from 'react';
import { useNavigate } from 'react-router-dom';
import BillForm from '../components/BillForm.jsx';

export default function CreateBill() {
  const navigate = useNavigate();

  const handleBillSaved = (bill) => {
    // Navigate to view the created bill
    navigate(`/bills/${bill.invoiceNumber}`);
  };

  return (
    <div>
      <BillForm onSave={handleBillSaved} />
    </div>
  );
}

