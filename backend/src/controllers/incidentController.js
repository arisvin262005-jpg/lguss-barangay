const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');
const { addBlock } = require('../services/blockchain');
const CryptoJS = require('crypto-js');

const SECRET = process.env.AES_KEY || 'barangay-aes-256-secret-key-2024';

const encryptField = (text) => CryptoJS.AES.encrypt(String(text || ''), SECRET).toString();
const decryptField = (cipher) => {
  if (!cipher) return '';
  try { return CryptoJS.AES.decrypt(String(cipher), SECRET).toString(CryptoJS.enc.Utf8); } catch { return '[Encrypted]'; }
};
const canViewDetails = (role) => ['Admin', 'Secretary'].includes(role);

exports.getAll = (req, res) => {
  try {
    let data = Array.isArray(db.incidents) ? [...db.incidents] : [];
    const role = req.user?.role;
    const barangay = req.user?.barangay;
    
    if (role === 'Secretary' || role === 'Tanod') {
      data = data.filter(i => i && i.barangay === barangay);
    }
    
    const safeResidents = Array.isArray(db.residents) ? db.residents : [];

    data = data.filter(Boolean).map(i => {
      const complainant = safeResidents.find(r => r && r.id === i.complainantId);
      const base = {
        id: i.id, type: i.type, priority: i.priority, status: i.status,
        isVawc: i.isVawc, barangay: i.barangay, filedAt: i.filedAt,
        complainantName: complainant ? `${complainant.firstName || ''} ${complainant.lastName || ''}`.trim() : 'Anonymous',
      };
      if (canViewDetails(role) && !i.isVawc) {
        base.description = i.descriptionEncrypted ? decryptField(i.descriptionEncrypted) : i.description;
      } else if (i.isVawc && role === 'Admin') {
        base.description = i.descriptionEncrypted ? decryptField(i.descriptionEncrypted) : i.description;
      } else {
        base.description = '[RESTRICTED]';
      }
      return base;
    });
    res.json({ success: true, data, total: data.length });
  } catch (err) {
    console.error('[getAll Incidents Error]', err);
    res.status(500).json({ error: 'Failed to fetch incidents', details: err.message });
  }
};

exports.create = (req, res) => {
  try {
    const { description, ...rest } = req.body;
    const encrypted = encryptField(description || '');
    const record = db.insert('incidents', {
      ...rest,
      descriptionEncrypted: encrypted,
      description: rest.isVawc ? '[VAWC — RESTRICTED]' : description,
      barangay: rest.barangay || req.user?.barangay || 'Unknown',
      filedBy: req.user?.id || 'Unknown',
      filedAt: new Date().toISOString(),
      status: 'Open',
    });
    try {
      addBlock({ action: rest.isVawc ? 'VAWC_FILED' : 'INCIDENT_FILED', recordType: 'incident', recordId: record.id, actor: req.user?.email || 'unknown', actorRole: req.user?.role || 'unknown', details: {} });
    } catch (bcErr) {}
    res.status(201).json({ success: true, data: { ...record, description } });
  } catch (err) {
    console.error('[create Incident Error]', err);
    res.status(500).json({ error: 'Failed to create incident', details: err.message });
  }
};

exports.updateStatus = (req, res) => {
  try {
    const record = db.update('incidents', req.params.id, { status: req.body.status });
    if (!record) return res.status(404).json({ error: 'Not found' });
    try {
      addBlock({ action: 'INCIDENT_STATUS_UPDATED', recordType: 'incident', recordId: record.id, actor: req.user?.email || 'unknown', actorRole: req.user?.role || 'unknown', details: { status: req.body.status } });
    } catch (bcErr) {}
    res.json({ success: true, data: record });
  } catch (err) {
    console.error('[updateStatus Incident Error]', err);
    res.status(500).json({ error: 'Failed to update incident', details: err.message });
  }
};

exports.remove = (req, res) => {
  try {
    const ok = db.delete('incidents', req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    try {
      addBlock({ action: 'INCIDENT_DELETED', recordType: 'incident', recordId: req.params.id, actor: req.user?.email || 'unknown', actorRole: req.user?.role || 'unknown', details: {} });
    } catch (bcErr) {}
    res.json({ success: true });
  } catch (err) {
    console.error('[remove Incident Error]', err);
    res.status(500).json({ error: 'Failed to delete incident', details: err.message });
  }
};
