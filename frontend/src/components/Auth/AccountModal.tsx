// src/components/Auth/AccountModal.tsx
import React from 'react';
import './AccountModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const AccountModal: React.FC<Props> = ({ isOpen, onClose, onLogout }) => {
  if (!isOpen) return null;

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content account-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Account</h3>
        <div className="account-actions">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;