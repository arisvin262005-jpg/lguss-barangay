const db = require('../models/db');

exports.getPlans = (req, res) => {
  try {
    let data = Array.isArray(db.drrmPlans) ? [...db.drrmPlans] : [];
    const { role, barangay } = req.user || {};
    if (role === 'Secretary') data = data.filter(d => d && d.barangay === barangay);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getPlans Error]', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

exports.createPlan = (req, res) => {
  try {
    const { barangay } = req.user || {};
    const record = db.insert('drrmPlans', { ...req.body, barangay: req.body.barangay || barangay });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error('[createPlan Error]', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

exports.updatePlan = (req, res) => {
  try {
    const record = db.update('drrmPlans', req.params.id, req.body);
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, data: record });
  } catch (err) {
    console.error('[updatePlan Error]', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

exports.getPrograms = (req, res) => {
  try {
    let data = Array.isArray(db.gadPrograms) ? [...db.gadPrograms] : [];
    const { role, barangay } = req.user || {};
    if (role === 'Secretary') data = data.filter(g => g && g.barangay === barangay);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getPrograms Error]', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

exports.createProgram = (req, res) => {
  try {
    const { barangay } = req.user || {};
    const record = db.insert('gadPrograms', { ...req.body, barangay: req.body.barangay || barangay });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    console.error('[createProgram Error]', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

exports.updateProgram = (req, res) => {
  try {
    const record = db.update('gadPrograms', req.params.id, req.body);
    if (!record) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, data: record });
  } catch (err) {
    console.error('[updateProgram Error]', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

