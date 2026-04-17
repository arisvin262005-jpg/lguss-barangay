const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');
const blockchain = require('../services/blockchain');

exports.getAll = (req, res) => {
  let data = [...db.households];
  const { barangay } = req.query;
  if (req.user.role === 'Secretary') data = data.filter(h => h.barangay === req.user.barangay);
  if (barangay && req.user.role === 'Admin') data = data.filter(h => h.barangay === barangay);
  // Attach head name
  data = data.map(h => {
    const head = db.residents.find(r => r.id === h.headId);
    const members = db.residents.filter(r => r.householdId === h.id);
    return { ...h, headName: head ? `${head.firstName} ${head.lastName}` : 'N/A', memberCount: members.length };
  });
  res.json({ success: true, data, total: data.length });
};

exports.getById = (req, res) => {
  const h = db.findById('households', req.params.id);
  if (!h) return res.status(404).json({ error: 'Household not found' });
  const members = db.residents.filter(r => r.householdId === h.id);
  const head = db.residents.find(r => r.id === h.headId);
  res.json({ success: true, data: { ...h, members, headName: head ? `${head.firstName} ${head.lastName}` : 'N/A' } });
};

exports.create = (req, res) => {
  const record = db.insert('households', { ...req.body, id: `hh-${uuidv4().slice(0,8)}` });
  blockchain.addEntry({ action: 'HOUSEHOLD_CREATED', recordId: record.id, actor: req.user.email, actorRole: req.user.role });
  res.status(201).json({ success: true, data: record });
};

exports.update = (req, res) => {
  const record = db.update('households', req.params.id, req.body);
  if (!record) return res.status(404).json({ error: 'Household not found' });
  blockchain.addEntry({ action: 'HOUSEHOLD_UPDATED', recordId: record.id, actor: req.user.email, actorRole: req.user.role });
  res.json({ success: true, data: record });
};

exports.remove = (req, res) => {
  const ok = db.delete('households', req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
};
