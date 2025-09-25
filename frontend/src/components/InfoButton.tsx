// src/components/InfoButton.tsx
import React, { useState } from 'react';
import InfoModal from './InfoModal';
import './InfoButton.css';

const InfoButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInfoClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button className="info-btn" onClick={handleInfoClick}>
        Info
      </button>
      
      <InfoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default InfoButton;