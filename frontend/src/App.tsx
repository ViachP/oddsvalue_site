
// App.tsx
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MatchList from './components/MatchList';
import MobileHeader from './components/MobileHeader';
import Login from './components/Auth/Login';
import InfoButton from './components/InfoButton';
import PaymentButton from './components/PaymentButton';
import { useState } from 'react';
import { useMobileDetection } from './hooks/useMobileDetection';

function AppContent() {
  const { user } = useAuth();
  const isMobile = useMobileDetection();
  const [activeModal, setActiveModal] = useState<'none' | 'access' | 'login' | 'renew' | 'payment'>('none');

  return (
    <div className="App">
      {/* Мобильный хедер */}
      {isMobile && (
        <MobileHeader />
      )}

      <main>
        {/* Основной контент - MatchList с передачей модальных пропсов */}
        <MatchList activeModal={activeModal} setActiveModal={setActiveModal} />

        {/* Десктопные кнопки (только для не-мобильных) */}
        {!isMobile && (
          <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100px'
          }} className="safari-buttons-fix">
            <Login 
              onTrialExpired={() => setActiveModal('renew')}
            />
            <InfoButton />
            {user && <PaymentButton />}
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;