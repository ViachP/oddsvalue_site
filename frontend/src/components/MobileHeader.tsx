// components/MobileHeader.tsx
import React, { useState } from 'react';

const MobileHeader: React.FC = () => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

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
        
        {/* Кнопка Info */}
        <button
          onClick={() => setIsInfoOpen(true)}
          style={{
            background: 'none',
            border: '1px solid #666',
            color: '#FF9800',
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
          aria-label="Columns Guide"
          title="Columns Guide"
        >
          ℹ️
        </button>
      </header>

      {/* Модалка с гайдом по колонкам */}
      {isInfoOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '15px'
          }}
          onClick={() => setIsInfoOpen(false)}
        >
          <div 
            style={{
              backgroundColor: '#1a1d24',
              padding: '0',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '100%',
              border: '1px solid #3a3f4b',
              color: '#e0e0e0',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Шапка модалки с крестиком */}
            <div style={{
              position: 'relative',
              padding: '25px 20px 15px 20px',
              borderBottom: '1px solid #3a3f4b',
              backgroundColor: '#21252e'
            }}>
              {/* Крестик закрытия */}
              <button
                onClick={() => setIsInfoOpen(false)}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'none',
                  border: 'none',
                  color: '#aaa',
                  fontSize: '28px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  fontWeight: '300'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.backgroundColor = '#3a3f4b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#aaa';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
              
              {/* Центрированный заголовок с градиентом */}
              <h2 style={{ 
                margin: 0, 
                background: 'linear-gradient(90deg, #4CAF50, #2196F3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textAlign: 'center',
                fontSize: '22px',
                fontWeight: '700',
                paddingTop: '5px',
                letterSpacing: '0.5px'
              }}>
                Columns Guide
              </h2>
            </div>
            
            {/* Контент модалки */}
            <div style={{ padding: '20px' }}>
              {/* Блок с типами odds */}
              <div style={{ 
                backgroundColor: '#21252e', 
                padding: '18px',
                borderRadius: '8px',
                marginBottom: '25px',
                border: '1px solid #3a3f4b'
              }}>
                <p style={{ 
                  margin: '0 0 15px 0', 
                  fontWeight: '600', 
                  background: 'linear-gradient(90deg, #4CAF50, #2196F3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '16px'
                }}>
                  For each market, two types of odds are provided:
                </p>
                <div style={{ marginLeft: '0' }}>
                  <div style={{ 
                    marginBottom: '12px',
                    display: 'flex', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '6px'
                  }}>
                    <strong style={{ 
                      color: '#fff', 
                      minWidth: '120px',
                      background: 'linear-gradient(90deg, #66BB6A, #4CAF50)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>Opening Odds</strong>
                    <span style={{ color: '#aaa' }}>- ends with</span>
                    <code style={{ 
                      backgroundColor: '#3a3f4b', 
                      color: '#4CAF50', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      border: '1px solid #4CAF50'
                    }}>o</code>
                    <span style={{ color: '#aaa' }}>(e.g., 
                      <strong style={{
                        background: 'linear-gradient(90deg, #66BB6A, #4CAF50)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginLeft: '5px'
                      }}>1_o</strong>)
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '6px'
                  }}>
                    <strong style={{ 
                      color: '#fff', 
                      minWidth: '120px',
                      background: 'linear-gradient(90deg, #2196F3, #1976D2)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>Closing Odds</strong>
                    <span style={{ color: '#aaa' }}>- ends with</span>
                    <code style={{ 
                      backgroundColor: '#3a3f4b', 
                      color: '#2196F3', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      border: '1px solid #2196F3'
                    }}>e</code>
                    <span style={{ color: '#aaa' }}>(e.g., 
                      <strong style={{
                        background: 'linear-gradient(90deg, #2196F3, #1976D2)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginLeft: '5px'
                      }}>1_e</strong>)
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Список маркета */}
              <div style={{ marginBottom: '10px' }}>
                <h3 style={{ 
                  background: 'linear-gradient(90deg, #4CAF50, #2196F3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '18px',
                  fontSize: '18px',
                  fontWeight: '700'
                }}>
                  Markets Description:
                </h3>
                
                {/* Стилизованные строки маркетов */}
                <div style={{ 
                  backgroundColor: '#21252e',
                  border: '1px solid #3a3f4b',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  {[
                    { code: '1_o / 1_e', desc: 'Home Team to Win' },
                    { code: 'X_o / X_e', desc: 'Draw' },
                    { code: '2_o / 2_e', desc: 'Away Team to Win' },
                    { code: 'B_o / B_e', desc: 'Both Teams to Score' },
                    { code: 'Bno_o / Bno_e', desc: 'Both Teams Not to Score' },
                    { code: 'Ov_o / Ov_e', desc: 'Over 2.5 Goals' },
                    { code: 'Un_o / Un_e', desc: 'Under 2.5 Goals' },
                    { code: '1H', desc: 'First Half Result' },
                    { code: 'FT', desc: 'Full Time Result' }
                  ].map((market, index) => (
                    <div 
                      key={index}
                      style={{
                        padding: '14px 16px',
                        borderBottom: index < 8 ? '1px solid #3a3f4b' : 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: index % 2 === 0 ? '#21252e' : '#1d2028',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2a2e3a';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#21252e' : '#1d2028';
                      }}
                    >
                      <span>
                        <strong style={{ 
                          background: 'linear-gradient(90deg, #4CAF50, #2196F3)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          fontFamily: 'monospace',
                          fontSize: '15px',
                          fontWeight: '700'
                        }}>
                          {market.code}
                        </strong>
                      </span>
                      <span style={{ 
                        color: '#e0e0e0',
                        fontSize: '15px',
                        textAlign: 'right',
                        maxWidth: '60%'
                      }}>
                        {market.desc}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Предупреждение */}
                <div style={{ 
                  backgroundColor: '#2d1f1a',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '25px',
                  fontSize: '14px',
                  color: '#ffab91',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  border: '1px solid #5d4037'
                }}>
                  <span style={{ 
                    color: '#ff8a65', 
                    fontSize: '18px',
                    flexShrink: 0
                  }}>
                    ⚠️
                  </span>
                  <div style={{ lineHeight: '1.5' }}>
                    <strong style={{ color: '#ffccbc' }}>Note:</strong> The FT column shows the match score in regular time. Goals scored during extra time and penalty shootouts are not displayed here.
                  </div>
                </div>
              </div>
            </div>
            
            {/* Футер модалки */}
            <div style={{
              padding: '15px 20px',
              borderTop: '1px solid #3a3f4b',
              backgroundColor: '#21252e',
              textAlign: 'center',
              fontSize: '12px',
              color: '#888'
            }}>
              <div>oddsvalue.pro</div>
            </div>
          </div>
        </div>
      )}

      {/* Отступ для контента */}
      <div style={{ height: '70px' }} />
    </>
  );
};

export default MobileHeader;