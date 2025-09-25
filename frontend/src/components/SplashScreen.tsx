
const SplashScreen: React.FC = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    overflow: 'hidden'
  }}>
    {/* Скриншот на всю ширину */}
    <div style={{ 
      width: '100%', 
      height: '100%',
      backgroundImage: 'url(/screenshot_33.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative'
    }}>
      {/* Контейнер для лоадера и текста - ОПУСТИЛИ НИЖЕ */}
      <div style={{
        position: 'absolute',
        top: '60%', // ← БЫЛО 50%, СТАЛО 55% (опустили на 5% вниз)
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Вращающееся кольцо */}
        <div style={{
          width: '120px',
          height: '120px',
          border: '8px solid rgba(255, 255, 255, 0.2)',
          borderTop: '8px solid #ffffff',
          borderRadius: '50%',
          animation: 'spin 1.5s linear infinite',
          boxSizing: 'border-box'
        }}></div>
        
        {/* Текст поверх лоадера (не вращается) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <span style={{ 
            fontSize: '14px', 
            color: '#ffffff', 
            fontWeight: '600',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.7)',
            display: 'block',
            lineHeight: '1.2'
          }}>
            Loading
          </span>
          <span style={{ 
            fontSize: '14px', 
            color: '#ffffff', 
            fontWeight: '600',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.7)',
            display: 'block',
            lineHeight: '1.2'
          }}>
            data...
          </span>
        </div>
      </div>
    </div>

    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      body {
        overflow: hidden;
      }
    `}</style>
  </div>
);

export default SplashScreen

