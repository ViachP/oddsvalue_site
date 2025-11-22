// src/components/Auth/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from './LoginModal';
import AccountModal from './AccountModal';
import './Login.css';

const Login: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  if (user)
    return (
      <>
        <button className="login-btn" onClick={() => setIsAccountOpen(true)} title={user.email}>
          <span className="email-short">
            {user.email.split('@')[0]}@...
          </span>
        </button>
        <AccountModal
          isOpen={isAccountOpen}
          onClose={() => setIsAccountOpen(false)}
          onLogout={() => {
            logout();
            setIsAccountOpen(false);
          }}
        />
      </>
    );

  return (
    <>
      <button className="login-btn" onClick={() => setIsLoginOpen(true)}>
        Login
      </button>
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
};

export default Login;