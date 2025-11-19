import React from 'react';
import './AccessModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const AccessModal: React.FC<Props> = ({ isOpen, onClose, onSwitchToLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Добавляем крестик */}
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2 className="modal-title">Access Restricted</h2>
        <p className="modal-text">
          To get full access to the site functionality for one week, you must register.               
        </p>
        <div className="modal-buttons">
          <button
            className="modal-btn primary"
            onClick={onSwitchToLogin}
          >
            Register
          </button>
          <button className="modal-btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessModal;