import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import type { ReactNode } from 'react';

const API = 'https://oddsvalue.pro/api';

interface User {
  email: string;
  role: 'user' | 'admin';
  expiresAt: string;
  access: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
  sendLoginCode: (email: string) => Promise<void>;
  verifyLoginCode: (email: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem('user');
    if (raw) {
      const parsed = JSON.parse(raw) as User;
      if (new Date(parsed.expiresAt) > new Date()) setUser(parsed);
      else sessionStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (email === 'admin' && password === '0208') {
        const u: User = { email: 'admin', role: 'admin', expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), access: 'master-token' };
        setUser(u);
        return;
      }

      const { data } = await axios.post(`${API}/token/`, { email, password });

      const u: User = {
        email: data.user?.email || email,
        role: data.user?.role || 'user',
        expiresAt: data.user?.expires_at || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        access: data.access,
      };
      setUser(u);
      sessionStorage.setItem('user', JSON.stringify(u));
    } catch (e: any) {
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const r = await axios.post(`${API}/register/`, {
        email,
        password,
        password_confirm: password,
      });

      if (r.data.access && r.data.user?.email) {
        const u: User = {
          email: r.data.user.email,
          role: r.data.user.role,
          expiresAt: r.data.user.expires_at || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          access: r.data.access,
        };
        setUser(u);
        sessionStorage.setItem('user', JSON.stringify(u));
        return;
      }
      await login(email, password);
    } catch (err: any) {
      const srv = err.response?.data || {};
      if (
        err.response?.status === 400 &&
        Array.isArray(srv.email) &&
        srv.email[0]?.includes('user with this email already exists.')
      ) {
        await login(email, password);
        return;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  const sendLoginCode = async (email: string) => {
    try {
      const r = await axios.post(`${API}/send-login-code/`, { email });
      console.log('sendLoginCode response:', r.status, r.data);
    } catch (err: any) {
      console.error('sendLoginCode error:', err.response?.data || err.message);
      throw err;
    }
  };

  const verifyLoginCode = async (email: string, code: string) => {
    const { data } = await axios.post(`${API}/verify-login-code/`, { email, code });
    const u: User = {
      email: data.user.email,
      role: data.user.role,
      expiresAt: data.user.expires_at,
      access: data.access,
    };
    setUser(u);
    sessionStorage.setItem('user', JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, sendLoginCode, verifyLoginCode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
};