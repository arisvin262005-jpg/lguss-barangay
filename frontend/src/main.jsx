import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Polyfill for process to avoid PouchDB errors in browser
window.global = window;
window.process = { env: { DEBUG: undefined } };

// Register PWA Service Worker
if (typeof window !== 'undefined') {
  registerSW({
    onNeedRefresh() {
      if (confirm('New version available. Reload now?')) window.location.reload();
    },
    onOfflineReady() {
      console.log('App is ready for offline use!');
    },
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
