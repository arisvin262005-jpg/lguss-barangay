import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Cache for GET requests so the UI still loads data offline
const getCache = {};

api.interceptors.request.use((config) => {
  // If we are offline
  if (!navigator.onLine) {
    if (config.method === 'post' && config.url.includes('/auth/login')) {
      const payload = JSON.parse(config.data);
      if (payload.email === 'admin@barangay.gov.ph' || payload.email === 'secretary@barangay.gov.ph') {
         // Capstone Defense Bypass: Allow offline login for demo accounts
         const role = payload.email.includes('admin') ? 'Admin' : 'Secretary';
         const name = role === 'Admin' ? 'Juan dela Cruz' : 'Maria Santos';
         toast.success('Offline Authentication Mode: Active', { icon: '⚡' });
         return {
           data: { message: 'Login successful', user: { id: 'offline-001', name, email: payload.email, role, barangay: 'Barangay 1 (Poblacion)' } },
           status: 200, statusText: 'OK', config, headers: {}
         };
      }
    }

    if (config.method === 'get') {
      config.adapter = async () => {
        let cachedData = getCache[config.url] ? JSON.parse(JSON.stringify(getCache[config.url])) : { data: [] };
        
        // Optimistically merge offline queued POSTs into this GET request so they show up on tables
        const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        const endpoint = config.url.split('?')[0]; // e.g., /api/residents
        
        queue.forEach((task) => {
           if (task.method === 'post' && task.url === endpoint) {
               const newDoc = { ...JSON.parse(task.data), id: 'offline-' + Math.random().toString(36).substr(2, 9), _isOfflineDraft: true };
               if (Array.isArray(cachedData)) {
                 cachedData.push(newDoc);
               } else if (cachedData.data && Array.isArray(cachedData.data)) {
                 cachedData.data.push(newDoc);
               }
           }
        });

        return { data: cachedData, status: 200, statusText: 'OK', config, headers: {} };
      };
    } else {
      config.adapter = async () => {
        const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        const task = { method: config.method, url: config.url, data: config.data, timestamp: new Date().toISOString() };
        queue.push(task);
        localStorage.setItem('offlineQueue', JSON.stringify(queue));
        
        window.dispatchEvent(new CustomEvent('offline-action-added', { detail: queue.length }));

        // Fire toast for offline queueing
        toast.success('Saved to Offline Drafts', { icon: '📦', position: 'bottom-right' });

        const fakeResponse = { data: JSON.parse(config.data || '{}'), success: true, message: 'Saved Offline' };
        return { data: { data: fakeResponse }, status: 200, statusText: 'OK (Saved Offline)', config, headers: {} };
      };
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (res.config.method === 'get' && res.data) {
      getCache[res.config.url] = res.data;
    } else if (['post', 'put', 'delete'].includes(res.config.method)) {
      // Fire toast for online successful DB writes
      if (res.status >= 200 && res.status < 300 && res.data?.message !== 'Saved Offline') {
        toast.success('Saved Successfully to Database!', { position: 'bottom-right' });
      }
    }
    return res;
  },
  (err) => {
    return Promise.reject(err);
  }
);

export default api;
