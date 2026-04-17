const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');
const blockchain = require('../services/blockchain');
const CryptoJS = require('crypto-js');

const SECRET = process.env.AES_KEY || 'barangay-aes-256-secret-key-2024';

const encryptField = (text) => CryptoJS.AES.encrypt(text, SECRET).toString();
const decryptField = (cipher) => {
  try { return CryptoJS.AES.decrypt(cipher, SECRET).toString(CryptoJS.enc.Utf8); } catch { return '[Encrypted]'; }
};
const canViewDetails = (role) => ['Admin', 'Secretary'].includes(role);

exports.getAll = (req, res) => {
  let data = [...db.incidents];
  if (req.user.role === 'Secretary') data = data.filter(i => i.barangay === req.user.barangay);
  if (req.user.role === 'Tanod') data = data.filter(i => i.barangay === req.user.barangay);

  data = data.map(i => {
    const complainant = db.residents.find(r => r.id === i.complainantId);
    const base = {
      id: i.id, type: i.type, priority: i.priority, status: i.status,
      isVawc: i.isVawc, barangay: i.barangay, filedAt: i.filedAt,
      complainantName: complainant ? `${complainant.firstName} ${complainant.lastName}` : 'Anonymous',
    };
    if (canViewDetails(req.user.role) && !i.isVawc) {
      base.description = i.descriptionEncrypted ? decryptField(i.descriptionEncrypted) : i.description;
    } else if (i.isVawc && req.user.role === 'Admin') {
      base.description = i.descriptionEncrypted ? decryptField(i.descriptionEncrypted) : i.description;
    } else {
      base.description = '[RESTRICTED]';
    }
    return base;
  });
  res.json({ success: true, data, total: data.length });
};

exports.create = (req, res) => {
  const { description, ...rest } = req.body;
  const encrypted = encryptField(description || '');
  const record = db.insert('incidents', {
    ...rest,
    descriptionEncrypted: encrypted,
    description: rest.isVawc ? '[VAWC — RESTRICTED]' : description,
    barangay: rest.barangay || req.user.barangay,
    filedBy: req.user.id,
    filedAt: new Date().toISOString(),
    status: 'Open',
  });
  blockchain.addEntry({ action: rest.isVawc ? 'VAWC_FILED' : 'INCIDENT_FILED', recordId: record.id, actor: req.user.email, actorRole: req.user.role });
  res.status(201).json({ success: true, data: { ...record, description } });
};

exports.updateStatus = (req, res) => {
  const record = db.update('incidents', req.params.id, { status: req.body.status });
  if (!record) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true, data: record });
};

exports.remove = (req, res) => {
  const ok = db.delete('incidents', req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
};
