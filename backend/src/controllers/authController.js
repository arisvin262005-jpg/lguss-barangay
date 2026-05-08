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

    // Only 'Secretary' is allowed for self-registration. Admin is a permanent singleton.
    if (!firstName || !lastName || !email || !password || !barangay) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (role === 'Admin') {
      return res.status(403).json({ error: 'Admin accounts cannot be created via registration.' });
    }
    const allowedRoles = ['Secretary'];
    const assignedRole = allowedRoles.includes(role) ? role : 'Secretary';

    if (db.findByEmail(email)) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = db.insert('users', {
      id: uuidv4(), firstName, lastName, email, password: hashedPassword,
      barangay, role: assignedRole,
      // isVerified stays false — Admin must approve before user can log in
      isVerified: false,
      pendingApproval: true,
    });
    addBlock({ action: 'USER_REGISTERED', recordType: 'user', recordId: user.id, actor: email, actorRole: assignedRole, details: { email, role: assignedRole, barangay } });
    res.status(201).json({ message: 'Registration submitted. Your account is pending admin approval.', userId: user.id });
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
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Your account is pending approval by the Administrator. Please wait for confirmation.' });
    }

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

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, password } = req.body;
    const user = db.findById('users', req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const updatedUser = db.update('users', req.user.id, updates);
    addBlock({ action: 'USER_PROFILE_UPDATE', recordType: 'user', recordId: user.id, actor: user.email, actorRole: user.role, details: { fields: Object.keys(updates).join(',') } });

    res.json({ message: 'Profile updated successfully', user: { ...updatedUser, password: '' } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
};

// ── Admin: list all users ──
const getUsers = (req, res) => {
  try {
    const users = db.users.map(({ password, ...u }) => u);
    res.json({ data: users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
};

// ── Admin: approve a pending Secretary account ──
const approveUser = (req, res) => {
  try {
    const { id } = req.params;
    const user = db.findById('users', id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'Admin') return res.status(400).json({ error: 'Cannot modify the Admin account.' });
    const updated = db.update('users', id, {
      isVerified: true,
      pendingApproval: false,
      approvedBy: req.user.id,
      approvedAt: new Date().toISOString(),
    });
    addBlock({ action: 'USER_APPROVED', recordType: 'user', recordId: id, actor: req.user.email, actorRole: req.user.role, details: { approvedUser: user.email } });
    res.json({ message: `Account for ${user.firstName} ${user.lastName} approved successfully.`, user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Approval failed', details: err.message });
  }
};

// ── Admin: reject/delete a pending or existing Secretary account ──
const rejectUser = (req, res) => {
  try {
    const { id } = req.params;
    const user = db.findById('users', id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'Admin') return res.status(400).json({ error: 'Cannot delete the Admin account.' });
    db.delete('users', id);
    addBlock({ action: 'USER_REJECTED', recordType: 'user', recordId: id, actor: req.user.email, actorRole: req.user.role, details: { rejectedUser: user.email } });
    res.json({ message: `Account for ${user.firstName} ${user.lastName} has been removed.` });
  } catch (err) {
    res.status(500).json({ error: 'Rejection failed', details: err.message });
  }
};

module.exports = { register, login, logout, forgotPassword, getMe, updateProfile, getUsers, approveUser, rejectUser };
