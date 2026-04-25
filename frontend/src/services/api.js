import axios from 'axios';
import toast from 'react-hot-toast';

const getBaseURL = () => {
  // If VITE_API_URL is set (e.g. in Vercel env vars), use it as is.
  let envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('YOUR-BACKEND-URL')) {
    // Ensure it ends with /api to match backend routes
    if (!envUrl.endsWith('/api') && !envUrl.endsWith('/api/')) {
      envUrl = envUrl.endsWith('/') ? `${envUrl}api` : `${envUrl}/api`;
    }
    return envUrl;
  }
  // Default to relative for local development
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 60000, // 60 seconds for Render cold starts
  headers: { 'Content-Type': 'application/json' },
});

// Cache for GET requests so the UI still has data when offline
const getCache = {};

// ─────────────────────────────────────────────────────────────
// Helper: Build an offline login response (used as fail-over)
// ─────────────────────────────────────────────────────────────
const createOfflineLoginResponse = (config) => {
  const payload = JSON.parse(config.data || '{}');
  const SESSION_KEY = 'lguss_user_session';
  let offlineUser = null;

  // 1. Match against last saved session
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (saved && saved.email === payload.email) offlineUser = saved;
  } catch {}

  // 2. Match against accounts registered while offline
  if (!offlineUser) {
    try {
      const offlineRegs = JSON.parse(localStorage.getItem('offline_registered_users') || '[]');
      const found = offlineRegs.find(u => u.email === payload.email);
      if (found) {
        offlineUser = { ...found, id: 'offline-reg-' + Date.now(), isOfflineMode: true, isDraftAccount: true };
      }
    } catch {}
  }

  // 3. Fallback: generic demo user based on email
  if (!offlineUser) {
    const role = payload.email?.includes('admin') ? 'Admin' : 'Secretary';
    offlineUser = {
      id: 'offline-' + role.toLowerCase(),
      name: role === 'Admin' ? 'Juan dela Cruz' : 'Maria Santos',
      email: payload.email,
      role,
      barangay: 'Barangay 1 (Poblacion)',
      isOfflineMode: true,
    };
  }

  toast.success('⚡ Entered Offline Mode (Server unreachable)', { icon: '📱', duration: 4000 });

  return {
    data: {
      message: 'Login successful (Offline Fail-over)',
      user: { ...offlineUser, isOfflineMode: true },
    },
    status: 200, statusText: 'OK', config, headers: {},
  };
};

// ─────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR
// ─────────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  // Attach JWT Bearer token on every request
  const token = localStorage.getItem('lguss_jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const isLoginEndpoint   = config.url?.includes('/auth/login') && config.method === 'post';
  const isLogoutEndpoint  = config.url?.includes('/auth/logout');

  // ── Use navigator.onLine ONLY — never block online users ──
  const isOffline = !navigator.onLine;

  // ── Offline Login ──
  if (isLoginEndpoint && isOffline) {
    return Promise.resolve(createOfflineLoginResponse(config));
  }

  // ── Offline Logout ──
  if (isLogoutEndpoint && isOffline) {
    return Promise.resolve({
      data: { message: 'Logged out (Offline Mode)' },
      status: 200, statusText: 'OK', config, headers: {},
    });
  }

  // ── Offline GET → serve from cache ──
  if (isOffline && config.method === 'get') {
    config.adapter = async () => {
      let cachedData = getCache[config.url]
        ? JSON.parse(JSON.stringify(getCache[config.url]))
        : { data: [] };

      // Merge offline queued POSTs optimistically
      const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
      const endpoint = config.url.split('?')[0];
      queue.forEach((task) => {
        if (task.method === 'post' && task.url === endpoint) {
          const newDoc = {
            ...JSON.parse(task.data || '{}'),
            id: 'offline-' + Math.random().toString(36).substr(2, 9),
            _isOfflineDraft: true,
          };
          if (Array.isArray(cachedData)) cachedData.push(newDoc);
          else if (cachedData.data && Array.isArray(cachedData.data)) cachedData.data.push(newDoc);
        }
      });

      return { data: cachedData, status: 200, statusText: 'OK', config, headers: {} };
    };
  }

  // ── Offline WRITE → queue for later sync ──
  if (isOffline && !isLoginEndpoint && config.method !== 'get') {
    config.adapter = async () => {
      const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
      const payload = JSON.parse(config.data || '{}');

      // If registering offline, cache credentials so user can login immediately
      if (config.url?.includes('/auth/register')) {
        const offlineRegs = JSON.parse(localStorage.getItem('offline_registered_users') || '[]');
        offlineRegs.push({
          firstName: payload.firstName,
          lastName: payload.lastName,
          name: `${payload.firstName} ${payload.lastName}`,
          email: payload.email,
          role: payload.role || 'Secretary',
          barangay: payload.barangay || 'Pending Sync',
        });
        localStorage.setItem('offline_registered_users', JSON.stringify(offlineRegs));
      }

      const task = { method: config.method, url: config.url, data: config.data, timestamp: new Date().toISOString() };
      queue.push(task);
      localStorage.setItem('offlineQueue', JSON.stringify(queue));
      window.dispatchEvent(new CustomEvent('offline-action-added', { detail: queue.length }));

      toast.success(
        config.url?.includes('/auth/register')
          ? '📦 Registration saved — will sync when online'
          : '📦 Saved to Offline Queue — will sync when online',
        { position: 'bottom-right' }
      );

      return { data: { data: payload, success: true }, status: 200, statusText: 'OK (Saved Offline)', config, headers: {} };
    };
  }

  return config;
});

// ─────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// ─────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => {
    // Cache successful GET responses for offline fallback
    if (res.config?.method === 'get' && res.data) {
      getCache[res.config.url] = res.data;
    }
    return res;
  },
  (err) => {
    const isOfflineErr = !navigator.onLine || err.code === 'ECONNABORTED' || err.message === 'Network Error';
    const isAuthRoute  = err.config?.url?.includes('/auth/');

    // ── Hybrid Fail-over: login network failure → offline mode ──
    const isLoginAttempt = err.config?.url?.includes('/auth/login') && err.config?.method === 'post';
    if (isLoginAttempt && isOfflineErr) {
      return Promise.resolve(createOfflineLoginResponse(err.config));
    }

    const is401 = err.response?.status === 401;
    const is429 = err.response?.status === 429;

    // ── 401 Unauthorized: token expired or secret changed ──
    if (is401 && !isAuthRoute) {
      localStorage.removeItem('lguss_user_session');
      localStorage.removeItem('lguss_jwt_token');
      window.location.href = '/';
      return Promise.reject(err);
    }

    // ── 429 Rate-limit: show friendly message ──
    if (is429) {
      toast.error('⚠️ Too many attempts. Please wait 15 minutes.', { position: 'bottom-right', duration: 6000 });
      return Promise.reject(err);
    }

    // ── Suppress noisy 401 toasts (auth routes handle their own errors) ──
    if (!isOfflineErr && !is401 && !isAuthRoute) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Something went wrong';
      toast.error(msg, { position: 'bottom-right' });
    }

    return Promise.reject(err);
  }
);

export default api;
