import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const SESSION_KEY = 'lguss_user_session';
const TOKEN_KEY   = 'lguss_jwt_token';

export const AuthProvider = ({ children }) => {
  // ── 1. Trust localStorage FIRST — no loading flicker ──
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; }
    catch { return null; }
  });

  // If a stored session already exists we are NOT loading — skip fetchMe entirely
  const hasSavedSession = !!localStorage.getItem(SESSION_KEY);
  const [loading, setLoading] = useState(!hasSavedSession);

  const inactivityTimerRef = useRef(null);
  const fetchMeRunning = useRef(false); // prevent duplicate calls

  const persistUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  // ── 2. Only call fetchMe when there is NO saved session ──
  const fetchMe = useCallback(async () => {
    if (fetchMeRunning.current) return;
    fetchMeRunning.current = true;

    // Already have a session in localStorage → trust it, skip network check
    const savedRaw = localStorage.getItem(SESSION_KEY);
    if (savedRaw) {
      try {
        const saved = JSON.parse(savedRaw);
        setUser(saved);
      } catch {}
      setLoading(false);
      fetchMeRunning.current = false;
      return;
    }

    // No saved session → check if server has a cookie session
    if (!navigator.onLine) {
      setUser(null);
      setLoading(false);
      fetchMeRunning.current = false;
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      if (data && data.authenticated === false) {
        // Verify AGAIN that nothing was written since we started
        const latestSession = localStorage.getItem(SESSION_KEY);
        if (!latestSession) setUser(null);
      } else if (data && data.id) {
        if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
        persistUser(data);
      }
    } catch {
      // Server unreachable but no saved session → user is a guest
      setUser(null);
    } finally {
      setLoading(false);
      fetchMeRunning.current = false;
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  // ── 3. Inactivity timer ──
  const resetTimer = useCallback(() => {
    clearTimeout(inactivityTimerRef.current);
    if (user) {
      inactivityTimerRef.current = setTimeout(() => { logout(); }, 30 * 60 * 1000);
    }
  }, [user]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(inactivityTimerRef.current);
    };
  }, [resetTimer]);

  // ── 4. Login — persist immediately, never overwritten by fetchMe ──
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
    persistUser(data.user);
    return data;
  };

  // ── 5. Logout — clear everything ──
  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
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
