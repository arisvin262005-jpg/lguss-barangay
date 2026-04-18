import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const SESSION_KEY = 'lguss_user_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(() => {
    // Load user from localStorage immediately (enables offline session restore)
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  let inactivityTimer = null;

  const persistUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else    localStorage.removeItem(SESSION_KEY);
  };

  const fetchMe = async () => {
    if (!navigator.onLine) {
      // Offline: restore from localStorage session
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUser(parsed);
          toast('⚡ Offline Mode — Using saved session', { icon: '📱', duration: 3000 });
        } catch { setUser(null); }
      } else {
        setUser(null);
      }
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      if (data && data.authenticated === false) {
        persistUser(null);
      } else {
        if (data.token) localStorage.setItem('lguss_jwt_token', data.token);
        persistUser(data);
      }
    } catch {
      // Server unreachable but user has a saved session
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUser(parsed);
          toast('⚡ Server unreachable — Using saved session', { icon: '📱', duration: 3000 });
        } catch { setUser(null); }
      } else {
        setUser(null);
      }
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
    if (data.token) localStorage.setItem('lguss_jwt_token', data.token);
    persistUser(data.user);
    return data;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('lguss_jwt_token');
    persistUser(null);
    window.location.href = '/';
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    return data;
  };

  const hasRole = (...roles) => roles.includes(user?.role);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
