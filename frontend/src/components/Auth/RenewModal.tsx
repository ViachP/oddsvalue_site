import React from 'react';
import './AccessModal.css'; // можно тот же стиль

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToPayment: () => void;
}

const RenewModal: React.FC<Props> = ({ isOpen, onClose, onSwitchToPayment }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Subscription Expired</h2>
        <p className="modal-text">
          To continue using filters, please renew your subscription.
        </p>
        <div className="modal-buttons">
          <button className="modal-btn primary" onClick={onSwitchToPayment}>
            Payment
          </button>
          <button className="modal-btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenewModal;