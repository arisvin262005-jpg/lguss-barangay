const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const { addBlock } = require('../services/blockchain');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '30m';

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, barangay, role } = req.body;
    if (db.findByEmail(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = db.insert('users', {
      id: uuidv4(), firstName, lastName, email, password: hashedPassword,
      barangay, role: role || 'Viewer', isVerified: false,
    });
    // Mock email verification — auto-verify in dev
    db.update('users', user.id, { isVerified: true });
    addBlock({ action: 'USER_REGISTERED', recordType: 'user', recordId: user.id, actor: email, actorRole: role, details: { email, role, barangay } });
    res.status(201).json({ message: 'Registration successful. You can now log in.', userId: user.id });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    if (!user.password) {
      console.error(`[Login] User ${email} has no password set in database.`);
      return res.status(401).json({ error: 'Invalid credentials (missing password)' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ error: 'Email not verified' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, barangay: user.barangay, name: `${user.firstName} ${user.lastName}` },
      JWT_SECRET, { expiresIn: JWT_EXPIRES }
    );
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      maxAge: 30 * 60 * 1000
    };
    
    res.cookie('token', token, cookieOptions);
    addBlock({ action: 'USER_LOGIN', recordType: 'user', recordId: user.id, actor: email, actorRole: user.role, details: { ip: req.ip || '0.0.0.0' } });
    res.json({ message: 'Login successful', token, user: { id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email, role: user.role, barangay: user.barangay } });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
};

const logout = (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd
  });
  res.json({ message: 'Logged out successfully' });
};

const forgotPassword = (req, res) => {
  const { email } = req.body;
  const user = db.findByEmail(email);
  // Mock: always respond success to prevent email enumeration
  res.json({ message: `If ${email} is registered, a password reset link has been sent. Check your email.` });
};

const getMe = (req, res) => {
  const user = db.findById('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...userData } = user;
  
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, barangay: user.barangay, name: `${user.firstName} ${user.lastName}` },
    JWT_SECRET, { expiresIn: JWT_EXPIRES }
  );

  res.json({ ...userData, token });
};

module.exports = { register, login, logout, forgotPassword, getMe };
