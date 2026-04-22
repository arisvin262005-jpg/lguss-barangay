const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');
const { addBlock } = require('../services/blockchain');

exports.getAll = (req, res) => {
  try {
    let data = Array.isArray(db.households) ? [...db.households] : [];
    const { barangay } = req.query;
    const { role, barangay: userBarangay } = req.user || {};
    
    if (role === 'Secretary') data = data.filter(h => h && h.barangay === userBarangay);
    if (barangay && role === 'Admin') data = data.filter(h => h && h.barangay === barangay);
    
    const safeResidents = Array.isArray(db.residents) ? db.residents : [];
    
    data = data.filter(Boolean).map(h => {
      const head = safeResidents.find(r => r && r.id === h.headId);
      const members = safeResidents.filter(r => r && r.householdId === h.id);
      return { ...h, headName: head ? `${head.firstName || ''} ${head.lastName || ''}`.trim() : 'N/A', memberCount: members.length };
    });
    res.json({ success: true, data, total: data.length });
  } catch (err) {
    console.error('[getAll Households Error]', err);
    res.status(500).json({ error: 'Failed to fetch households', details: err.message });
  }
};

exports.getById = (req, res) => {
  try {
    const h = db.findById('households', req.params.id);
    if (!h) return res.status(404).json({ error: 'Household not found' });
    const safeResidents = Array.isArray(db.residents) ? db.residents : [];
    const members = safeResidents.filter(r => r && r.householdId === h.id);
    const head = safeResidents.find(r => r && r.id === h.headId);
    res.json({ success: true, data: { ...h, members, headName: head ? `${head.firstName || ''} ${head.lastName || ''}`.trim() : 'N/A' } });
  } catch (err) {
    console.error('[getById Household Error]', err);
    res.status(500).json({ error: 'Failed to fetch household', details: err.message });
  }
};

exports.create = (req, res) => {
  try {
    const record = db.insert('households', { ...req.body, id: `hh-${uuidv4().slice(0,8)}` });
    try {
      addBlock({ action: 'HOUSEHOLD_CREATED', recordType: 'household', recordId: record.id, actor: req.user?.email || 'unknown', actorRole: req.user?.role || 'unknown', details: {} });
    } catch (bcErr) {}
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error('[create Household Error]', err);
    res.status(500).json({ error: 'Failed to create household', details: err.message });
  }
};

exports.update = (req, res) => {
  try {
    const record = db.update('households', req.params.id, req.body);
    if (!record) return res.status(404).json({ error: 'Household not found' });
    try {
      addBlock({ action: 'HOUSEHOLD_UPDATED', recordType: 'household', recordId: record.id, actor: req.user?.email || 'unknown', actorRole: req.user?.role || 'unknown', details: {} });
    } catch (bcErr) {}
    res.json({ success: true, data: record });
  } catch (err) {
    console.error('[update Household Error]', err);
    res.status(500).json({ error: 'Failed to update household', details: err.message });
  }
};

exports.remove = (req, res) => {
  try {
    const ok = db.delete('households', req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    try {
      addBlock({ action: 'HOUSEHOLD_DELETED', recordType: 'household', recordId: req.params.id, actor: req.user?.email || 'unknown', actorRole: req.user?.role || 'unknown', details: {} });
    } catch (bcErr) {}
    res.json({ success: true });
  } catch (err) {
    console.error('[remove Household Error]', err);
    res.status(500).json({ error: 'Failed to delete household', details: err.message });
  }
};
