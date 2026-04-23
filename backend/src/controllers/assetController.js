const db = require('../models/db');

exports.getAll = (req, res) => {
  try {
    let data = Array.isArray(db.assets) ? [...db.assets] : [];
    const { role, barangay } = req.user || {};
    if (role === 'Secretary') data = data.filter(a => a && a.barangay === barangay);
    res.json({ success: true, data, total: data.length });
  } catch (err) {
    console.error('[getAll Assets Error]', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

exports.create = (req, res) => {
  try {
    const { barangay } = req.user || {};
    const record = db.insert('assets', { ...req.body, barangay: req.body.barangay || barangay });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error('[create Asset Error]', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

exports.update = (req, res) => {
  try {
    const record = db.update('assets', req.params.id, req.body);
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, data: record });
  } catch (err) {
    console.error('[update Asset Error]', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

exports.remove = (req, res) => {
  try {
    const ok = db.delete('assets', req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('[remove Asset Error]', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

