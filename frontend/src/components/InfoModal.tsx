// src/components/InfoModal.tsx
import './InfoModal.css';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="info-overlay" onClick={onClose}>
      <div className="info-box" onClick={(e) => e.stopPropagation()}>
        <button className="info-close" onClick={onClose}>×</button>

        <h2 className="info-title">Columns Guide</h2>

        <section className="info-sect">
          <h3>Opening and Closing Odds</h3>
          <p>Each market shows two values: opening (o) and closing (e).</p>
          <p><code>1(o)</code> – opening odds for Home team.</p>
          <p><code>1(e)</code> – closing odds for Home team.</p>
          <p>The same pattern applies to every market.</p>
        </section>

        <section className="info-sect">
          <h3>Column Legend</h3>
          <div className="info-list">
            <div><code>1(o) / 1(e)</code> – Home odds open / close</div>
            <div><code>X(o) / X(e)</code> – Draw odds open / close</div>
            <div><code>2(o) / 2(e)</code> – Away odds open / close</div>
            <div><code>BTS(o) / BTS(e)</code> – Both-Teams-to-Score open / close</div>
            <div><code>B_no(o) / B_no(e)</code> – Clean-sheet open / close</div>
            <div><code>Over(o) / Over(e)</code> – Over 2.5 goals open / close</div>
            <div><code>Under(o) / Under(e)</code> – Under 2.5 goals open / close</div>
            <div><code>1H</code> – 1st half result (1 / X / 2)</div>
            <div><code>FT</code> – Full-time result (1 / X / 2)</div>
          </div>
        </section>
      </div>
    </div>
  );
}