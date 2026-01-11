import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BillList from '../components/BillList.jsx';

export default function ViewBills() {
  const navigate = useNavigate();

  const handleBillSelect = (bill) => {
    navigate(`/bills/${bill.invoiceNumber}`);
  };

  return (
    <div>
      <BillList onBillSelect={handleBillSelect} />
    </div>
  );
}

