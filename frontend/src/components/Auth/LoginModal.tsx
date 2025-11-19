// src/components/Auth/LoginModal.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './LoginModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendLoginCode, verifyLoginCode } = useAuth();

  const handleSendCode = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await sendLoginCode(email);
      setStage('code');
    } catch {
      alert('Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      await verifyLoginCode(email, code);
      onClose();
      setEmail('');
      setCode('');
      setStage('email');
    } catch {
      alert('Invalid code');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pay-modal-overlay" onClick={onClose}>
      <div className="pay-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="pay-modal-close" onClick={onClose}>×</button>

        {stage === 'email' && (
          <>
            <h3 className="pay-modal-title">Code Verification</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleSendCode(); }}>
              <div className="pay-input-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="pay-submit-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Get Code'}
              </button>
            </form>
          </>
        )}

        {stage === 'code' && (
          <>
            <h3 className="pay-modal-title">Enter Verification Code</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
              <div className="pay-input-group">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <button type="submit" className="pay-submit-btn" disabled={loading || code.length !== 6}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginModal;