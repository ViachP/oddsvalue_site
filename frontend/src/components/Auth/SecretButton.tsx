
export default function SecretButton() {
  const handleClick = () => {
    const login = prompt('Login:');
    const pwd   = prompt('Password:');
    if (login === 'admin_123' && pwd === '0208') {
      localStorage.setItem('adminKey', 'admin_123_0208');
      window.location.reload();          // перечитает флажок
    } else {
      alert('Wrong credentials');
    }
  };

  // если уже активировано – не показываем кнопку
  if (localStorage.getItem('adminKey') === 'admin_123_0208') return null;

  return (
    <button
      onClick={handleClick}
      title="Secret entry"
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: 'none',
        background: 'rgba(0,0,0,.05)',
        color: '#666',
        fontSize: 18,
        cursor: 'pointer',
        opacity: .35,
      }}
    >
      ⚙
    </button>
  );
}
