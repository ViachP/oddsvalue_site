// src/components/InfoModal.tsx
import './InfoModal.css';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="info-modal-overlay" onClick={onClose}>
      <div className="info-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="info-modal-close" onClick={onClose}>×</button>

        <h2 className="info-modal-title">COLUMNS GUIDE</h2>

        <section className="info-sect intro">
          <p className="white-text">Each market shows two values:</p>
          <p className="white-text"><code>1_o</code> – opening odds</p>
          <p className="white-text"><code>1_e</code> – closing odds</p>
        </section>

        <section className="info-sect">
          <h3>COLUMN LEGEND</h3>
          <div className="legend-table">
            <div className="legend-row">
              <div className="legend-code">1_o / 1_e</div>
              <div className="legend-desc white-text">Home Team</div>
            </div>
            <div className="legend-row">
              <div className="legend-code">X_o / X_e</div>
              <div className="legend-desc white-text">Draw</div>
            </div>
            <div className="legend-row">
              <div className="legend-code">2_o / 2_e</div>
              <div className="legend-desc white-text">Away Team</div>
            </div>
            <div className="legend-row">
              <div className="legend-code">B_o / B_e</div>
              <div className="legend-desc white-text">Both Teams to Score</div>
            </div>
            <div className="legend-row">
              <div className="legend-code">Bno_o / Bno_e</div>
              <div className="legend-desc white-text">Both Teams Not to Score</div>
            </div>
            <div className="legend-row">
              <div className="legend-code">Ov_o / Ov_e</div>
              <div className="legend-desc white-text">Over 2.5 goals</div>
            </div>
            <div className="legend-row">
              <div className="legend-code">Un_o / Un_e</div>
              <div className="legend-desc white-text">Under 2.5 goals</div>
            </div>
            <div className="legend-row">
              <div className="legend-code">1H</div>
              <div className="legend-desc white-text">1st half result (1 / X / 2)</div>
            </div>
            <div className="legend-row">
              <div className="legend-code">FT</div>
              <div className="legend-desc white-text">Full-time result (1 / X / 2)</div>
            </div>
          </div>
        </section>

        <div className="info-note">
          <span className="note-icon">⚠️</span>
          <div className="note-content">
            <span className="note-text">If you have any questions, please write to us at</span>
            <span className="note-email">pv.slawa@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}