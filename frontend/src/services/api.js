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

api.interceptors.request.use((config) => {
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
    const payload = JSON.parse(config.data || '{}');

    // Try to match against any previously saved session
    const SESSION_KEY = 'lguss_user_session';
    let offlineUser = null;
    try {
      const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (saved && saved.email === payload.email) {
        offlineUser = saved;
      }
    } catch {}

    // Fallback to demo accounts if no saved session found
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

    toast.success('⚡ Offline Login Successful', { icon: '📱', duration: 4000 });

    return Promise.resolve({
      data: {
        message: 'Login successful (Offline Mode)',
        user: { ...offlineUser, isOfflineMode: true },
      },
      status: 200, statusText: 'OK', config, headers: {},
    });
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
        const task = {
          method: config.method,
          url: config.url,
          data: config.data,
          timestamp: new Date().toISOString(),
        };
        queue.push(task);
        localStorage.setItem('offlineQueue', JSON.stringify(queue));
        window.dispatchEvent(new CustomEvent('offline-action-added', { detail: queue.length }));
        toast.success('Saved to Offline Queue — will sync when online', { icon: '📦', position: 'bottom-right' });
        const fakeResponse = { data: JSON.parse(config.data || '{}'), success: true, message: 'Saved Offline' };
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
    const isAuthMeFail = err.response?.status === 401 && err.config?.url?.includes('/auth/me');
    
    if (!isOfflineErr && !isAuthMeFail) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Something went wrong';
      toast.error(msg, { position: 'bottom-right' });
    }
    return Promise.reject(err);
  }
);

export default api;
