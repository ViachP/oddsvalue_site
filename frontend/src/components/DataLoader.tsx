// src/components/DataLoader.tsx
import { useState, useEffect } from 'react';
import TableScreenshot from './TableScreenshot';
import MatchList from './MatchList';

interface Props {
  activeModal: 'none' | 'access' | 'login' | 'renew' | 'payment';
  setActiveModal: (modal: 'none' | 'access' | 'login' | 'renew' | 'payment') => void;
}

export default function DataLoader({ activeModal, setActiveModal }: Props) {
  const [showReal, setShowReal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowReal(true), 6000); // 6 секунд
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {!showReal && <TableScreenshot onLoaded={() => {}} />}
      <div style={{ display: showReal ? 'block' : 'none' }}>
        <MatchList activeModal={activeModal} setActiveModal={setActiveModal} />
      </div>
    </>
  );
}