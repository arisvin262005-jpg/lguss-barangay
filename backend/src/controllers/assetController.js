const db = require('../models/db');

exports.getAll = (req, res) => {
  let data = [...db.assets];
  if (req.user.role === 'Secretary') data = data.filter(a => a.barangay === req.user.barangay);
  res.json({ success: true, data, total: data.length });
};
exports.create = (req, res) => {
  const record = db.insert('assets', { ...req.body, barangay: req.body.barangay || req.user.barangay });
  res.status(201).json({ success: true, data: record });
};
exports.update = (req, res) => {
  const record = db.update('assets', req.params.id, req.body);
  if (!record) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true, data: record });
};
exports.remove = (req, res) => {
  const ok = db.delete('assets', req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
};
