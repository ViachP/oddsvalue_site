// src/components/InfoModal.tsx
import React from 'react';
import './InfoModal.css';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content info-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Information</h2>
        <div className="info-content">
          <p>This is the information modal. Content will be added later.</p>
          {/* Здесь потом добавим нужную информацию */}
        </div>
      </div>
    </div>
  );
};

export default InfoModal;