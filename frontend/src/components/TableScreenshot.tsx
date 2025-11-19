// src/components/TableScreenshot.tsx
import { useEffect } from 'react';
import './TableScreenshot.css';

interface Props {
  onLoaded: () => void;
}

export default function TableScreenshot({ onLoaded }: Props) {
  useEffect(() => {
    const t = setTimeout(() => onLoaded(), 6000);
    return () => clearTimeout(t);
  }, [onLoaded]);

  return (
    <div className="screenshot-wrapper">
      <img src="/screen.png" alt="loading" className="screenshot-img" />
      {/* большой лоадер + текст */}
      <div className="loader-box">
        <div className="big-loader" />
        <span className="loader-text">Loading data...</span>
      </div>
    </div>
  );
}