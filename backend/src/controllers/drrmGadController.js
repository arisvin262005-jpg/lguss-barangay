const db = require('../models/db');

exports.getPlans = (req, res) => {
  let data = [...db.drrmPlans];
  if (req.user.role === 'Secretary') data = data.filter(d => d.barangay === req.user.barangay);
  res.json({ success: true, data });
};
exports.createPlan = (req, res) => {
  const record = db.insert('drrmPlans', { ...req.body, barangay: req.body.barangay || req.user.barangay });
  res.status(201).json({ success: true, data: record });
};
exports.updatePlan = (req, res) => {
  const record = db.update('drrmPlans', req.params.id, req.body);
  if (!record) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true, data: record });
};

exports.getPrograms = (req, res) => {
  let data = [...db.gadPrograms];
  if (req.user.role === 'Secretary') data = data.filter(g => g.barangay === req.user.barangay);
  res.json({ success: true, data });
};
exports.createProgram = (req, res) => {
  const record = db.insert('gadPrograms', { ...req.body, barangay: req.body.barangay || req.user.barangay });
  res.status(201).json({ success: true, data: record });
};
exports.updateProgram = (req, res) => {
  const record = db.update('gadPrograms', req.params.id, req.body);
  if (!record) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true, data: record });
};
