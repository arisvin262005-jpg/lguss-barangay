import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  let inactivityTimer = null;

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMe(); }, []);

  // 30-min inactivity timeout
  const resetTimer = useCallback(() => {
    clearTimeout(inactivityTimer);
    if (user) {
      inactivityTimer = setTimeout(() => { logout(); }, 30 * 60 * 1000);
    }
  }, [user]);

  useEffect(() => {
    ['mousemove', 'keydown', 'click', 'scroll'].forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      ['mousemove', 'keydown', 'click', 'scroll'].forEach((e) => window.removeEventListener(e, resetTimer));
      clearTimeout(inactivityTimer);
    };
  }, [resetTimer]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    window.location.href = '/login';
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    return data;
  };

  const hasRole = (...roles) => roles.includes(user?.role);
  const isAdmin = () => user?.role === 'Admin';
  const isSecretary = () => user?.role === 'Secretary';
  const isTanod = () => user?.role === 'Tanod';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, hasRole, isAdmin, isSecretary, isTanod }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
