const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');
const blockchain = require('../services/blockchain');

exports.getAll = (req, res) => {
  let data = [...db.legislation];
  const { type } = req.query;
  if (type) data = data.filter(l => l.type === type);
  if (req.user.role === 'Secretary') data = data.filter(l => l.barangay === req.user.barangay);
  data.sort((a, b) => new Date(b.dateEnacted) - new Date(a.dateEnacted));
  res.json({ success: true, data, total: data.length });
};

exports.getById = (req, res) => {
  const item = db.findById('legislation', req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true, data: item });
};

exports.create = (req, res) => {
  const record = db.insert('legislation', { ...req.body, barangay: req.body.barangay || req.user.barangay });
  blockchain.addEntry({ action: 'LEGISLATION_CREATED', recordId: record.id, actor: req.user.email, actorRole: req.user.role });
  res.status(201).json({ success: true, data: record });
};

exports.update = (req, res) => {
  const record = db.update('legislation', req.params.id, req.body);
  if (!record) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true, data: record });
};

exports.remove = (req, res) => {
  const ok = db.delete('legislation', req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
};
