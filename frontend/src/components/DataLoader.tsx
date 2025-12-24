// DataLoader.tsx
import React, { useState, useEffect } from 'react';
import MatchList from './MatchList';
import { useAuth } from '../contexts/AuthContext';

const DataLoader: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'none' | 'access' | 'login' | 'renew' | 'payment'>('none');
  const { user } = useAuth();
  
  // Удаляем неиспользуемую переменную isMobile
  // const isMobile = useMobileDetection();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        console.log('Admin user detected');
      } else if (user.role === 'user' && user.expiresAt) {
        const expiryDate = new Date(user.expiresAt);
        const now = new Date();
        if (expiryDate <= now) {
          setActiveModal('renew');
        }
      }
    }
  }, [user]);

  return (
    <div>
      <MatchList 
        activeModal={activeModal}
        setActiveModal={setActiveModal}
      />
    </div>
  );
};

export default DataLoader;