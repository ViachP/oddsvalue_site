// // src/components/Auth/Login.tsx
// import './Login.css'; // Импортируем файл стилей

// function Login() {
//   const handleSubmit = (event: React.FormEvent) => {
//     event.preventDefault();
//     // Логика входа
//   };

//   return (
//     <div className="login-container">
//       <form className="login-form" onSubmit={handleSubmit}>
//         <div className="form-row">
//           <div className="input-group">
//             <label htmlFor="username" className="sr-only">Username</label>
//             <input 
//               type="text" 
//               id="username" 
//               placeholder="Username"
//               className="login-input"
//             />
//           </div>
          
//           <div className="input-group">
//             <label htmlFor="password" className="sr-only">Password</label>
//             <input 
//               type="password" 
//               id="password" 
//               placeholder="Password"
//               className="login-input"
//             />
//           </div>
          
//           <button type="submit" className="login-btn">
//             Login
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default Login;

// src/components/Auth/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from './LoginModal';
import './Login.css';

const Login: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { login } = useAuth();

  const handleLoginClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleLogin = async (username: string, password: string) => {
    await login(username, password);
  };

  return (
    <>
      <button className="login-btn" onClick={handleLoginClick}>
        Login
      </button>
      
      <LoginModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onLogin={handleLogin}
      />
    </>
  );
};

export default Login;