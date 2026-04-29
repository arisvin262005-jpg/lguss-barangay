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

// ─────────────────────────────────────────────────────────────
// PERSISTENT GET CACHE — survives page refresh (uses localStorage)
// ─────────────────────────────────────────────────────────────
const CACHE_KEY = 'lguss_get_cache';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

const loadCache = () => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); }
  catch { return {}; }
};
const saveCache = (cache) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch {}
};
const getCachedResponse = (url) => {
  const cache = loadCache();
  const entry = cache[url];
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { delete cache[url]; saveCache(cache); return null; }
  return entry.data;
};
const setCachedResponse = (url, data) => {
  const cache = loadCache();
  cache[url] = { data, ts: Date.now() };
  saveCache(cache);
};

// ─────────────────────────────────────────────────────────────
// Simple password hash (djb2) for offline credential matching
// ─────────────────────────────────────────────────────────────
const hashPassword = (str) => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) { hash = ((hash << 5) + hash) + str.charCodeAt(i); }
  return (hash >>> 0).toString(36);
};

// ─────────────────────────────────────────────────────────────
// Helper: Build an offline login response (used as fail-over)
// ─────────────────────────────────────────────────────────────
const createOfflineLoginResponse = (config) => {
  const payload = JSON.parse(config.data || '{}');
  const SESSION_KEY  = 'lguss_user_session';
  const CREDS_KEY    = 'lguss_offline_creds';
  let offlineUser = null;
  let credentialsOk = false;

  // 1. Match against saved hashed credentials (most secure)
  try {
    const creds = JSON.parse(localStorage.getItem(CREDS_KEY) || '[]');
    const match = creds.find(c => c.email === payload.email && c.pwHash === hashPassword(payload.password));
    if (match) { credentialsOk = true; }
  } catch {}

  // 2. Match against last saved session (email only, for backward compat)
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (saved && saved.email === payload.email) {
      offlineUser = saved;
      if (!credentialsOk) credentialsOk = true; // trust existing session email match
    }
  } catch {}

  // 3. Match against accounts registered while offline
  if (!offlineUser) {
    try {
      const offlineRegs = JSON.parse(localStorage.getItem('offline_registered_users') || '[]');
      const found = offlineRegs.find(u => u.email === payload.email);
      if (found) {
        offlineUser = { ...found, id: 'offline-reg-' + Date.now(), isOfflineMode: true, isDraftAccount: true };
        credentialsOk = true;
      }
    } catch {}
  }

  if (!credentialsOk || !offlineUser) {
    toast.error('❌ Offline login failed — incorrect credentials or account not cached.', { duration: 5000 });
    return Promise.reject({ response: { status: 401, data: { error: 'Offline: credentials not found. Please login while online first.' } } });
  }

  toast.success('⚡ Offline Mode — using cached session', { icon: '📱', duration: 4000 });

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

  // ── Offline GET → serve from PERSISTENT localStorage cache ──
  if (isOffline && config.method === 'get') {
    config.adapter = async () => {
      let cachedData = getCachedResponse(config.url);
      if (!cachedData) cachedData = { data: [] };
      else cachedData = JSON.parse(JSON.stringify(cachedData)); // deep clone

      // Merge offline queued POSTs/PUTs optimistically so new records appear immediately
      const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
      const endpoint = config.url.split('?')[0];
      
      queue.forEach((task) => {
        if (task.method === 'post' && task.url === endpoint) {
          const newDoc = {
            ...JSON.parse(task.data || '{}'),
            id: 'offline-' + Math.random().toString(36).substr(2, 9),
            _isOfflineDraft: true,
          };
          if (Array.isArray(cachedData)) cachedData.unshift(newDoc);
          else if (cachedData?.data && Array.isArray(cachedData.data)) cachedData.data.unshift(newDoc);
        } else if (task.method === 'put' && task.url.startsWith(`${endpoint}/`)) {
          const targetId = task.url.split('/').pop();
          const updates = JSON.parse(task.data || '{}');
          const list = Array.isArray(cachedData) ? cachedData : (cachedData?.data || []);
          const idx = list.findIndex(item => item.id === targetId);
          if (idx >= 0) list[idx] = { ...list[idx], ...updates, _isOfflineDraft: true };
        }
      });

      toast('📂 Showing cached data (Offline Mode)', { icon: '💾', duration: 2500 });
      return { data: cachedData, status: 200, statusText: 'OK (Cached)', config, headers: {} };
    };
  }

  // ── Offline WRITE → queue for later sync ──
  if (isOffline && !isLoginEndpoint && config.method !== 'get') {
    config.adapter = async () => {
      // Mock DSS Check for Certifications when Offline
      if (config.url.includes('/dss-check')) {
        return { 
          data: { decision: 'Approve', reason: 'Offline Mode: Temporary approval. Final DSS verification will run when synced.', flags: ['OFFLINE_MODE'] }, 
          status: 200, statusText: 'OK (Offline DSS)', config, headers: {} 
        };
      }
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
// ─────────────────────────────────────────────────────────────
// Helper: cache login credentials for offline use
// ─────────────────────────────────────────────────────────────
const cacheCredentials = (email, password) => {
  try {
    const CREDS_KEY = 'lguss_offline_creds';
    const creds = JSON.parse(localStorage.getItem(CREDS_KEY) || '[]');
    const idx = creds.findIndex(c => c.email === email);
    const entry = { email, pwHash: hashPassword(password), ts: Date.now() };
    if (idx >= 0) creds[idx] = entry; else creds.push(entry);
    localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
  } catch {}
};

api.interceptors.response.use(
  (res) => {
    // Persist GET responses to localStorage for offline fallback
    if (res.config?.method === 'get' && res.data) {
      setCachedResponse(res.config.url, res.data);
    }
    // Cache credentials on successful login for offline use
    if (res.config?.url?.includes('/auth/login') && res.config?.method === 'post') {
      try {
        const payload = JSON.parse(res.config.data || '{}');
        if (payload.email && payload.password) cacheCredentials(payload.email, payload.password);
      } catch {}
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

/**
 * resolveOfflineResponse — Use this in every handleSave across all pages.
 * Safely extracts the saved record from BOTH online and offline API responses.
 *
 * Online  response shape: res.data = { id, ... }   OR   res.data = { data: { id, ... } }
 * Offline response shape: res.data = { data: payload, success: true }
 *
 * @param {object} res      - The axios response object
 * @param {object} fallback - The form payload (used as fallback for offline drafts)
 * @param {string} idOverride - Optional: existing record ID for PUT operations
 * @returns {object} The resolved record object ready to push into state
 */
export const resolveOfflineResponse = (res, fallback = {}, idOverride = null) => {
  const d = res?.data;
  // Online: direct object with id
  if (d?.id) return d;
  // Online: nested under data key
  if (d?.data?.id) return d.data;
  // Online: nested under certification key
  if (d?.certification?.id) return d.certification;
  // Offline queue: success:true means it was queued — build draft record
  return {
    ...fallback,
    id: idOverride || ('offline-' + Date.now()),
    _isOfflineDraft: true,
  };
};
