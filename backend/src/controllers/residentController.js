const db = require('../models/db');
const { addBlock } = require('../services/blockchain');
const { ROLES } = require('../config/constants');

const getAll = (req, res) => {
  let data = [...db.residents];
  const { role, barangay } = req.user;
  if (role !== ROLES.ADMIN) data = data.filter((r) => r.barangay === barangay);
  if (req.query.barangay) data = data.filter((r) => r.barangay === req.query.barangay);
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    data = data.filter((r) => `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q));
  }
  addBlock({ action: 'RESIDENTS_VIEWED', recordType: 'residents', recordId: 'list', actor: req.user.email, actorRole: role, details: { count: data.length } });
  res.json({ data, total: data.length });
};

const getById = (req, res) => {
  const resident = db.findById('residents', req.params.id);
  if (!resident) return res.status(404).json({ error: 'Resident not found' });
  addBlock({ action: 'RESIDENT_VIEWED', recordType: 'resident', recordId: resident.id, actor: req.user.email, actorRole: req.user.role, details: {} });
  res.json(resident);
};

const create = (req, res) => {
  const resident = db.insert('residents', req.body);
  addBlock({ action: 'RESIDENT_CREATED', recordType: 'resident', recordId: resident.id, actor: req.user.email, actorRole: req.user.role, details: { name: `${resident.firstName} ${resident.lastName}` } });
  res.status(201).json(resident);
};

const update = (req, res) => {
  const updated = db.update('residents', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Resident not found' });
  addBlock({ action: 'RESIDENT_UPDATED', recordType: 'resident', recordId: updated.id, actor: req.user.email, actorRole: req.user.role, details: { fields: Object.keys(req.body) } });
  res.json(updated);
};

const remove = (req, res) => {
  const resident = db.findById('residents', req.params.id);
  if (!resident) return res.status(404).json({ error: 'Resident not found' });
  db.delete('residents', req.params.id);
  addBlock({ action: 'RESIDENT_DELETED', recordType: 'resident', recordId: req.params.id, actor: req.user.email, actorRole: req.user.role, details: {} });
  res.json({ message: 'Resident deleted' });
};

const getStats = (req, res) => {
  const { role, barangay } = req.user;
  let data = db.residents;
  if (role !== ROLES.ADMIN) data = data.filter((r) => r.barangay === barangay);
  res.json({ total: data.length, byBarangay: data.reduce((acc, r) => { acc[r.barangay] = (acc[r.barangay] || 0) + 1; return acc; }, {}) });
};

module.exports = { getAll, getById, create, update, remove, getStats };
