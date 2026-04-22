const db = require('../models/db');
const { addBlock } = require('../services/blockchain');
const { ROLES } = require('../config/constants');

const getAll = (req, res) => {
  try {
    let data = Array.isArray(db.residents) ? [...db.residents] : [];
    const { role, barangay } = req.user || {};

    if (role !== ROLES.ADMIN) {
      data = data.filter((r) => r && r.barangay === barangay);
    }
    if (req.query.barangay) {
      data = data.filter((r) => r && r.barangay === req.query.barangay);
    }
    if (req.query.search) {
      const q = String(req.query.search).toLowerCase();
      data = data.filter((r) => {
        if (!r) return false;
        const nameMatch = `${r.firstName || ''} ${r.lastName || ''}`.toLowerCase().includes(q);
        const emailMatch = typeof r.email === 'string' && r.email.toLowerCase().includes(q);
        return nameMatch || emailMatch;
      });
    }

    try {
      addBlock({ action: 'RESIDENTS_VIEWED', recordType: 'residents', recordId: 'list', actor: req.user?.email || 'unknown', actorRole: role || 'unknown', details: { count: data.length } });
    } catch (bcErr) {
      console.error('[Blockchain Error]', bcErr);
    }

    res.json({ data, total: data.length });
  } catch (err) {
    console.error('[getAll Residents Error]', err);
    res.status(500).json({ error: 'Failed to fetch residents', details: err.message });
  }
};

const getById = (req, res) => {
  try {
    const resident = db.findById('residents', req.params.id);
    if (!resident) return res.status(404).json({ error: 'Resident not found' });
    
    try {
      addBlock({ action: 'RESIDENT_VIEWED', recordType: 'resident', recordId: resident.id, actor: req.user?.email || 'unknown', actorRole: req.user?.role || 'unknown', details: {} });
    } catch (bcErr) {}
    
    res.json(resident);
  } catch (err) {
    console.error('[getById Resident Error]', err);
    res.status(500).json({ error: 'Failed to fetch resident', details: err.message });
  }
};

const create = (req, res) => {
  try {
    const resident = db.insert('residents', req.body);
    try {
      addBlock({ action: 'RESIDENT_CREATED', recordType: 'resident', recordId: resident.id, actor: req.user?.email || 'unknown', actorRole: req.user?.role || 'unknown', details: { name: `${resident.firstName} ${resident.lastName}` } });
    } catch (bcErr) {}
    res.status(201).json(resident);
  } catch (err) {
    console.error('[create Resident Error]', err);
    res.status(500).json({ error: 'Failed to create resident', details: err.message });
  }
};

const update = (req, res) => {
  try {
    const updated = db.update('residents', req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Resident not found' });
    try {
      addBlock({ action: 'RESIDENT_UPDATED', recordType: 'resident', recordId: updated.id, actor: req.user?.email || 'unknown', actorRole: req.user?.role || 'unknown', details: { fields: Object.keys(req.body) } });
    } catch (bcErr) {}
    res.json(updated);
  } catch (err) {
    console.error('[update Resident Error]', err);
    res.status(500).json({ error: 'Failed to update resident', details: err.message });
  }
};

const remove = (req, res) => {
  try {
    const resident = db.findById('residents', req.params.id);
    if (!resident) return res.status(404).json({ error: 'Resident not found' });
    db.delete('residents', req.params.id);
    try {
      addBlock({ action: 'RESIDENT_DELETED', recordType: 'resident', recordId: req.params.id, actor: req.user?.email || 'unknown', actorRole: req.user?.role || 'unknown', details: {} });
    } catch (bcErr) {}
    res.json({ message: 'Resident deleted' });
  } catch (err) {
    console.error('[remove Resident Error]', err);
    res.status(500).json({ error: 'Failed to delete resident', details: err.message });
  }
};

const getStats = (req, res) => {
  try {
    const { role, barangay } = req.user || {};
    let data = Array.isArray(db.residents) ? db.residents : [];
    if (role !== ROLES.ADMIN) data = data.filter((r) => r && r.barangay === barangay);
    
    const byBarangay = data.reduce((acc, r) => { 
      if (r && r.barangay) {
        acc[r.barangay] = (acc[r.barangay] || 0) + 1; 
      }
      return acc; 
    }, {});

    res.json({ total: data.length, byBarangay });
  } catch (err) {
    console.error('[getStats Error]', err);
    res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove, getStats };
