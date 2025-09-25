import './App.css';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
// import SplashScreen from './components/SplashScreen';
import MatchList from './components/MatchList';
import Login from './components/Auth/Login';
import InfoButton from './components/InfoButton';

function AppContent() {
  // убираем оверлей сразу после первого рендера
  useEffect(() => {
    const t = setTimeout(() => document.getElementById('splash')?.remove(), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="App">
      <main>
        <MatchList />
        
        {/* фиксация кнопок Login & Info в правом верхнем углу */}
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
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent  /> 
    </AuthProvider>
  );
}

export default App;


