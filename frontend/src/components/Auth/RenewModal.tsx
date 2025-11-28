// import React from 'react';
// import './AccessModal.css';

// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
//   onSwitchToPayment: () => void; // ← эта функция должна открывать PaymentModal
// }

// const RenewModal: React.FC<Props> = ({ isOpen, onClose, onSwitchToPayment }) => {
//   if (!isOpen) return null;

//   const handlePaymentClick = () => {
//     onClose(); // Закрываем RenewModal
//     onSwitchToPayment(); // ← ОТКРЫВАЕМ PaymentModal
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//         <h2 className="modal-title" style={{ color: '#ffcc00' }}>
//           Attention!
//         </h2>
//         <p className="modal-text">
//           Your 7-day trial is over. Please choose a subscription plan<br />
//           to keep using the service.
//         </p>
//         <div className="modal-buttons">
//           <button className="modal-btn primary" onClick={handlePaymentClick}>
//             Payment
//           </button>
//           <button className="modal-btn secondary" onClick={onClose}>
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RenewModal;

import React from 'react';
import './AccessModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToPayment: () => void;
}

const RenewModal: React.FC<Props> = ({ isOpen, onClose, onSwitchToPayment }) => {
  if (!isOpen) return null;

  const handlePaymentClick = () => {
    console.log('🟡 [RenewModal] Payment button clicked');
    console.log('🟡 [RenewModal] Calling onSwitchToPayment...');
    onSwitchToPayment();
    console.log('🟡 [RenewModal] onSwitchToPayment called');
  };

  const handleCloseClick = () => {
    console.log('🔴 [RenewModal] Close button clicked');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCloseClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title" style={{ color: '#ffcc00' }}>
          Attention!
        </h2>
        <p className="modal-text">
          Your 7-day trial is over. Please choose a subscription plan<br />
          to keep using the service.
        </p>
        <div className="modal-buttons">
          <button 
            className="modal-btn primary" 
            onClick={handlePaymentClick}
          >
            Payment
          </button>
          <button 
            className="modal-btn secondary" 
            onClick={handleCloseClick}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenewModal;