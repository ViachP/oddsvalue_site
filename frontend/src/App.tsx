// App.tsx
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DataLoader from './components/DataLoader';
import Login from './components/Auth/Login';
import InfoButton from './components/InfoButton';
import PaymentButton from './components/PaymentButton';

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="App">
      <main>
        <DataLoader />

        <div style={{
          position: 'fixed',
          top: '12px',
          right: '12px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '100px'
        }}>
          <Login />
          <InfoButton />
          {user && <PaymentButton />}
        </div>
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