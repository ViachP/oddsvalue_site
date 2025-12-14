// components/MobileHeader.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './Auth/LoginModal';
import AccountModal from './Auth/AccountModal';

interface MobileHeaderProps {
  onTrialExpired: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onTrialExpired }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Фиксированный хедер */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#282c34',
        padding: '12px 15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 2000,
        boxShadow: '0 2px 15px rgba(0,0,0,0.4)',
        borderBottom: '1px solid #3a3f4b'
      }}>
        {/* Логотип */}
        <div style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ 
            background: 'linear-gradient(90deg, #4CAF50, #2196F3)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            OV
          </span>
          <span>oddsvalue.pro</span>
        </div>
        
        {/* Правая часть с кнопками */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Кнопка логина/профиля (иконка) */}
          <button
            onClick={() => {
              if (user) {
                setIsAccountOpen(true);
              } else {
                setIsLoginOpen(true);
              }
            }}
            style={{
              background: 'none',
              border: `1px solid ${user ? '#4CAF50' : '#FF9800'}`,
              color: user ? '#4CAF50' : '#FF9800',
              fontSize: '18px',
              padding: '8px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            aria-label={user ? "Account" : "Login"}
            title={user ? user.email : "Login"}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {user ? '👤' : '🔓'}
          </button>
          
          {/* Гамбургер меню */}
          <button
            onClick={toggleMenu}
            style={{
              background: 'none',
              border: '1px solid #666',
              color: 'white',
              fontSize: '20px',
              padding: '8px',
              borderRadius: '6px',
              cursor: 'pointer',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            aria-label="Menu"
            aria-expanded={isMenuOpen}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ☰
          </button>
        </div>
      </header>

      {/* Выпадающее меню */}
      {isMenuOpen && (
        <>
          {/* Overlay для закрытия */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1999
            }}
            onClick={closeMenu}
            role="presentation"
          />
          
          {/* Меню - ТОЛЬКО нужные пункты */}
          <div style={{
            position: 'fixed',
            top: '68px',
            right: '15px',
            backgroundColor: '#282c34',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            minWidth: '180px',
            zIndex: 2000,
            border: '1px solid #444',
            overflow: 'hidden',
            animation: 'slideDown 0.2s ease-out'
          }}>
            {/* Info в меню */}
            <div 
              onClick={() => {
                setIsInfoOpen(true);
                closeMenu();
              }}
              style={{ 
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                borderBottom: '1px solid #444',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ fontSize: '18px' }}>ℹ️</span>
              <span>Info</span>
            </div>
            
            {/* Контакты */}
            <div 
              onClick={() => {
                closeMenu();
                alert('По вопросам: contact@oddsvalue.pro');
              }}
              style={{ 
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ fontSize: '18px' }}>📧</span>
              <span>Contact</span>
            </div>
          </div>
        </>
      )}

      {/* Модальные окна */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onTrialExpired={onTrialExpired}
      />
      
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onLogout={() => {
          logout();
          setIsAccountOpen(false);
        }}
      />

      {/* Info модалка - обновленная с акцентом на мобильные ограничения */}
      {isInfoOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setIsInfoOpen(false)}
        >
          <div 
            style={{
              backgroundColor: '#282c34',
              padding: '25px',
              borderRadius: '10px',
              maxWidth: '400px',
              width: '100%',
              border: '1px solid #444',
              color: 'white'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: 0 }}>📱 Mobile Version</h3>
              <button
                onClick={() => setIsInfoOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ 
              backgroundColor: '#2c3e50', 
              padding: '15px', 
              borderRadius: '6px',
              marginBottom: '15px'
            }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#4CAF50' }}>
                ⚠️ На мобильном отображаются первые 20 матчей
              </p>
            </div>
            
            <p style={{ lineHeight: '1.6', marginBottom: '15px' }}>
              <strong>Полная версия на ПК включает:</strong>
            </p>
            <ul style={{ 
              paddingLeft: '20px', 
              marginBottom: '20px',
              lineHeight: '1.8'
            }}>
              <li>Базу из более <strong>13,000+ матчей</strong></li>
              <li>Расширенную фильтрацию по коэффициентам</li>
              <li>Подробную статистику по основым рынкам</li>
              <li>Показатели ROI по каждому рынку</li>
            </ul>
            
            <div style={{ 
              backgroundColor: '#34495e', 
              padding: '12px',
              borderRadius: '6px',
              textAlign: 'center',
              fontSize: '14px'
            }}>
              Откройте этот сайт на компьютере для доступа ко всем функциям
            </div>
          </div>
        </div>
      )}

      {/* Отступ для контента */}
      <div style={{ height: '70px' }} />

      {/* Стили анимации */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default MobileHeader;