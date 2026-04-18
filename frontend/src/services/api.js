import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 60000, // 60 seconds for Render cold starts
  headers: { 'Content-Type': 'application/json' },
});

// Cache for GET requests so the UI still loads data offline
const getCache = {};

// Helper to generate a valid-looking offline login response
const createOfflineLoginResponse = (config) => {
  const payload = JSON.parse(config.data || '{}');
  const SESSION_KEY = 'lguss_user_session';
  let offlineUser = null;

  // 1. Match against last session
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (saved && saved.email === payload.email) offlineUser = saved;
  } catch {}

  // 2. Match against offline-registered users
  if (!offlineUser) {
    try {
      const offlineRegs = JSON.parse(localStorage.getItem('offline_registered_users') || '[]');
      const found = offlineRegs.find(u => u.email === payload.email);
      if (found) {
        offlineUser = { ...found, id: 'offline-reg-' + Date.now(), isOfflineMode: true, isDraftAccount: true };
      }
    } catch {}
  }

  // 3. Fallback to demo accounts
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

  toast.success('⚡ Entered in Offline Mode (Server Wake-up)', { icon: '📱', duration: 4000 });

  return {
    data: {
      message: 'Login successful (Offline Fail-over)',
      user: { ...offlineUser, isOfflineMode: true },
    },
    status: 200, statusText: 'OK', config, headers: {},
  };
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lguss_jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const isLoginEndpoint = config.url?.includes('/auth/login') && config.method === 'post';
  const isLogoutEndpoint = config.url?.includes('/auth/logout');
  
  let isOfflineModeUser = false;
  try {
    const sessionUser = JSON.parse(localStorage.getItem('lguss_user_session'));
    if (sessionUser && sessionUser.isOfflineMode) isOfflineModeUser = true;
  } catch {}

  const isOffline = !navigator.onLine || isOfflineModeUser;

  // ── OFFLINE LOGIN: works for ALL accounts using saved session ──
  if (isLoginEndpoint && isOffline) {
    return Promise.resolve(createOfflineLoginResponse(config));
  }
  
  if (isLogoutEndpoint && isOffline) {
    return Promise.resolve({
      data: { message: 'Logged out successful (Offline Mode)' },
      status: 200, statusText: 'OK', config, headers: {},
    });
  }

  // ── OFFLINE: Cache GET requests, Queue write requests ──
  if (isOffline) {
    if (config.method === 'get') {
      config.adapter = async () => {
        let cachedData = getCache[config.url] ? JSON.parse(JSON.stringify(getCache[config.url])) : { data: [] };

        // Optimistically merge offline queued POSTs
        const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        const endpoint = config.url.split('?')[0];

        queue.forEach((task) => {
          if (task.method === 'post' && task.url === endpoint) {
            const newDoc = {
              ...JSON.parse(task.data || '{}'),
              id: 'offline-' + Math.random().toString(36).substr(2, 9),
              _isOfflineDraft: true,
            };
            if (Array.isArray(cachedData)) {
              cachedData.push(newDoc);
            } else if (cachedData.data && Array.isArray(cachedData.data)) {
              cachedData.data.push(newDoc);
            }
          }
        });

        return { data: cachedData, status: 200, statusText: 'OK', config, headers: {} };
      };
    } else if (!isLoginEndpoint) {
      config.adapter = async () => {
        const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        const payload = JSON.parse(config.data || '{}');
        
        // Special case: If this is a registration, save it so they can login immediately
        if (config.url?.includes('/auth/register')) {
          const offlineRegs = JSON.parse(localStorage.getItem('offline_registered_users') || '[]');
          offlineRegs.push({
            firstName: payload.firstName,
            lastName: payload.lastName,
            name: `${payload.firstName} ${payload.lastName}`,
            email: payload.email,
            role: payload.role || 'Secretary',
            barangay: payload.barangay || 'Pending Sync'
          });
          localStorage.setItem('offline_registered_users', JSON.stringify(offlineRegs));
        }

        const task = {
          method: config.method,
          url: config.url,
          data: config.data,
          timestamp: new Date().toISOString(),
        };
        queue.push(task);
        localStorage.setItem('offlineQueue', JSON.stringify(queue));
        window.dispatchEvent(new CustomEvent('offline-action-added', { detail: queue.length }));
        toast.success(config.url?.includes('/auth/register') ? 'Registration saved to Offline Queue!' : 'Saved to Offline Queue — will sync when online', { icon: '📦', position: 'bottom-right' });
        const fakeResponse = { data: payload, success: true, message: 'Saved Offline' };
        return { data: { data: fakeResponse }, status: 200, statusText: 'OK (Saved Offline)', config, headers: {} };
      };
    }
  }

  return config;
});

api.interceptors.response.use(
  (res) => {
    // Cache successful GET responses for offline use
    if (res.config?.method === 'get' && res.data) {
      getCache[res.config.url] = res.data;
    }
    return res;
  },
  (err) => {
    const isOfflineErr = !navigator.onLine || err.code === 'ECONNABORTED' || err.message === 'Network Error';
    const isAuthRoute  = err.config?.url?.includes('/auth/');

    // ── HYBRID FAIL-OVER: If login fails due to network, silently switch to Offline Mode ──
    const isLoginAttempt = err.config?.url?.includes('/auth/login') && err.config?.method === 'post';
    if (isLoginAttempt && isOfflineErr) {
      return Promise.resolve(createOfflineLoginResponse(err.config));
    }

    // ── Suppress noisy 401 toasts for auth routes (handled by UI) ──
    const is401 = err.response?.status === 401;
    const is429 = err.response?.status === 429;

    if (!isOfflineErr && !is401 && !is429 && !isAuthRoute) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Something went wrong';
      toast.error(msg, { position: 'bottom-right' });
    }

    if (is429) {
      toast.error('⚠️ Too many attempts. Please wait 15 minutes.', { position: 'bottom-right', duration: 6000 });
    }

    return Promise.reject(err);
  }
);


export default api;
