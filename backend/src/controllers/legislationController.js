const db = require('../models/db');
const { v4: uuidv4 } = require('uuid');
const blockchain = require('../services/blockchain');

exports.getAll = (req, res) => {
  try {
    let data = Array.isArray(db.legislation) ? [...db.legislation] : [];
    const { type } = req.query;
    const { role, barangay } = req.user || {};

    if (type) data = data.filter(l => l && l.type === type);
    if (role === 'Secretary') {
      data = data.filter(l => l && l.barangay === barangay);
    }

    data.sort((a, b) => {
      const dateA = a && a.dateEnacted ? new Date(a.dateEnacted) : 0;
      const dateB = b && b.dateEnacted ? new Date(b.dateEnacted) : 0;
      return dateB - dateA;
    });

    res.json({ success: true, data, total: data.length });
  } catch (err) {
    console.error('[getAll Legislation Error]', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

exports.getById = (req, res) => {
  try {
    const item = db.findById('legislation', req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    console.error('[getById Legislation Error]', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

exports.create = (req, res) => {
  try {
    const { role, barangay, email } = req.user || {};
    const record = db.insert('legislation', { 
      ...req.body, 
      barangay: req.body.barangay || barangay 
    });
    
    try {
      blockchain.addBlock({ 
        action: 'LEGISLATION_CREATED', 
        recordType: 'legislation',
        recordId: record.id, 
        actor: email || 'unknown', 
        actorRole: role || 'unknown',
        details: { title: record.title }
      });
    } catch (bcErr) {}
    
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error('[create Legislation Error]', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

exports.update = (req, res) => {
  try {
    const record = db.update('legislation', req.params.id, req.body);
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, data: record });
  } catch (err) {
    console.error('[update Legislation Error]', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

exports.remove = (req, res) => {
  try {
    const ok = db.delete('legislation', req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('[remove Legislation Error]', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

