require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { apiLimiter } = require('./src/middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Global safety net: never crash the server ──
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION - non-fatal]', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION - non-fatal]', reason);
});

// Security middleware
app.use(helmet());
const allowedOrigins = [
  // Local development
  'http://localhost:5173', 
  'http://localhost:3000', 
  'http://127.0.0.1:5173',
  // Production — i-replace ng iyong actual na domain
  'https://lguss.vercel.app',
  'https://lguss-barangay.vercel.app',
  process.env.FRONTEND_URL,           // Set this in Railway env vars
  process.env.FRONTEND_URL_CUSTOM,    // Optional custom .com domain
].filter(Boolean);

// Custom CORS to guarantee cross-origin capability for all Vercel domains
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Dynamic CORS reflection to allow credentials (which requires specific origin, not '*')
  if (origin && (origin.includes('vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Fallback for non-credentialed requests
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // ── Prevent Vercel & Browser Caching ──
  // This is critical so that after creating a resident, refreshing the page gets the fresh data instead of stale Vercel cache
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// General rate limiter
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/residents', require('./src/routes/residents'));
app.use('/api/households', require('./src/routes/households'));
app.use('/api/certifications', require('./src/routes/certifications'));
app.use('/api/cases', require('./src/routes/cases'));
app.use('/api/legislation', require('./src/routes/legislation'));
app.use('/api/incidents', require('./src/routes/incidents'));
app.use('/api/assets', require('./src/routes/assets'));
app.use('/api/drrm', require('./src/routes/drrm'));
app.use('/api/audit', require('./src/routes/audit'));
app.use('/api/tracking', require('./src/routes/tracking'));
app.use('/api/reports', require('./src/routes/reports'));
app.use('/api/ai', require('./src/routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
  const db = require('./src/models/db');
  res.json({ 
    status: 'OK', 
    system: 'Barangay Management System', 
    timestamp: new Date().toISOString(),
    firebaseConnected: db.isFirebaseConnected(),
    firebaseError: db.getFirebaseError(),
    residentCount: Array.isArray(db.residents) ? db.residents.length : 0
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🏛️  Barangay Management System Backend`);
  console.log(`✅  Server running on http://localhost:${PORT}`);
  console.log(`📡  API Health: http://localhost:${PORT}/api/health\n`);

  // ── Keep-alive ping: prevent Render free tier from sleeping ──
  // Pings itself every 14 minutes so the server never cold-starts
  if (process.env.NODE_ENV !== 'development') {
    const https = require('https');
    const SELF_URL = process.env.RENDER_EXTERNAL_URL || `https://lguss-barangay-m5jk.onrender.com`;
    setInterval(() => {
      https.get(`${SELF_URL}/api/health`, (res) => {
        console.log(`[Keep-Alive] Self-ping OK — status: ${res.statusCode}`);
      }).on('error', (e) => {
        console.warn('[Keep-Alive] Self-ping failed (non-fatal):', e.message);
      });
    }, 14 * 60 * 1000); // every 14 minutes
    console.log(`🔔  Keep-alive pings enabled → ${SELF_URL}/api/health`);
  }
});

module.exports = app;
