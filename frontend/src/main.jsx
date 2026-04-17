import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // Import Tailwind and global styles here

// Polyfill for process to avoid PouchDB errors in browser
window.global = window;
window.process = { env: { DEBUG: undefined } };

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
