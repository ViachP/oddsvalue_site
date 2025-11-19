import React, { useState } from 'react';
import { PaymentModal } from './PaymentModal';
import './PaymentButton.css';

const PaymentButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="payment-btn" onClick={() => setOpen(true)}>
        Payment
      </button>
      <PaymentModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default PaymentButton;