import React from 'react';
import './PaymentModal.css';

type Props = { isOpen: boolean; onClose: () => void };

export const PaymentModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const copyWallet = () => {
    navigator.clipboard.writeText('TEbSfSCJ8dFJc8oSMujF41kqLcVcxxaeJo');
    alert('Wallet copied!');
  };

  return (
    <div className="pay-modal-overlay" onClick={onClose}>
      <div className="pay-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="pay-modal-close" onClick={onClose}>×</button>

        <h3 className="pay-modal-title">Subscription</h3>

        <div className="pay-modal-section">
          1 month – <span className="pay-yellow">19.95</span> USDT<br/>
          3 months – <span className="pay-yellow">58</span> USDT
        </div>

        <div className="pay-modal-section">
          crypto wallet<br/>
          <code className="pay-wallet">TEbSfSCJ8dFJc8oSMujF41kqLcVcxxaeJo</code>
          <button className="pay-copy-btn" onClick={copyWallet}>Copy</button>
        </div>

      </div>
    </div>
  );
};