
// // src/contexts/AuthContext.tsx
// import React, { createContext, useState, useContext } from 'react';
// import type { ReactNode } from 'react'; // ← Используем type-only импорт

// interface AuthContextType {
//   user: any | null;
//   loading: boolean;
//   login: (username: string, password: string) => Promise<void>;
//   logout: () => void;
//   register: (userData: { username: string; email: string; password: string }) => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<any | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   const login = async (username: string, password: string) => {
//     setLoading(true);
//     try {
//       // Твоя логика входа
//     } catch (error) {
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     setLoading(false);
//   };

//   const register = async (userData: { username: string; email: string; password: string }) => {
//     setLoading(true);
//     try {
//       // Твоя логика регистрации
//     } catch (error) {
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, logout, register }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react'; // ← Добавил useEffect
import type { ReactNode } from 'react';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: { username: string; email: string; password: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ← ДОБАВЬ ЭТОТ useEffect ДЛЯ ПРОВЕРКИ АУТЕНТИФИКАЦИИ
  useEffect(() => {
    const checkAuth = () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('user');
        
        // console.log('Auth check - token:', token);
        // console.log('Auth check - saved user:', savedUser);

        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        // console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
        // console.log('Auth check completed');
      }
    };

    checkAuth();
  }, []); // ← Пустой массив зависимостей = выполнится один раз при монтировании

  const login = async (username: string, _password: string) => {
    setLoading(true);
    try {
      // Твоя логика входа
      // console.log('Login attempt:', username);
      // ВРЕМЕННО: симулируем успешный вход
      const mockUser = { username, email: `${username}@example.com` };
      setUser(mockUser);
      localStorage.setItem('authToken', 'mock-token-123');
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setLoading(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const register = async (userData: { username: string; email: string; password: string }) => {
    setLoading(true);
    try {
      // Твоя логика регистрации
      // console.log('Register attempt:', userData);
      // ВРЕМЕННО: симулируем успешную регистрацию и вход
      const mockUser = { username: userData.username, email: userData.email };
      setUser(mockUser);
      localStorage.setItem('authToken', 'mock-token-123');
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};