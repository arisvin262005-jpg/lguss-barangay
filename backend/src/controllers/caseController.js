const db = require('../models/db');
const { addBlock } = require('../services/blockchain');
const { encrypt, decrypt } = require('../utils/encryption');
const { ROLES, CASE_STATUS } = require('../config/constants');

const SENSITIVE_FIELDS = ['description', 'notes', 'complainantId', 'respondentId'];

const sanitizeCase = (kpCase, role) => {
  if (!kpCase) return null;
  if (role === ROLES.ADMIN || role === ROLES.SECRETARY) return kpCase;
  const { id, caseNumber, caseType, status, filedDate, hearingDate, barangay } = kpCase;
  return { id, caseNumber, caseType, status, filedDate, hearingDate, barangay, restricted: true };
};

const getAll = (req, res) => {
  try {
    let data = Array.isArray(db.cases) ? [...db.cases] : [];
    const { role, barangay } = req.user || {};
    if (role !== ROLES.ADMIN) data = data.filter((c) => c && c.barangay === barangay);
    const sanitized = data.filter(Boolean).map((c) => sanitizeCase(c, role));
    res.json({ data: sanitized, total: sanitized.length });
  } catch (err) {
    console.error('[getAll Cases Error]', err);
    res.status(500).json({ error: 'Failed to fetch cases', details: err.message });
  }
};

const getById = (req, res) => {
  try {
    const kpCase = db.findById('cases', req.params.id);
    if (!kpCase) return res.status(404).json({ error: 'Case not found' });
    try {
      addBlock({ action: 'CASE_VIEWED', recordType: 'case', recordId: kpCase.id, actor: req.user?.email || 'unknown', actorRole: req.user?.role || 'unknown', details: {} });
    } catch (bcErr) {}
    res.json(sanitizeCase(kpCase, req.user?.role));
  } catch (err) {
    console.error('[getById Case Error]', err);
    res.status(500).json({ error: 'Failed to fetch case', details: err.message });
  }
};

const create = (req, res) => {
  try {
    const { complainantId, respondentId, caseType, description, hearingDate, notes } = req.body;
    const { role, barangay, email } = req.user || {};
    const caseCount = Array.isArray(db.cases) ? db.cases.length + 1 : 1;
    const caseNumber = `KP-${new Date().getFullYear()}-${String(caseCount).padStart(3, '0')}`;
    const kpCase = db.insert('cases', {
      caseNumber, complainantId, respondentId, caseType,
      description: encrypt(description),
      notes: encrypt(notes || ''),
      hearingDate, status: CASE_STATUS.FILED,
      filedDate: new Date().toISOString().split('T')[0],
      barangay,
    });
    try {
      addBlock({ action: 'CASE_FILED', recordType: 'case', recordId: kpCase.id, actor: email || 'unknown', actorRole: role || 'unknown', details: { caseNumber, caseType } });
    } catch (bcErr) {}
    res.status(201).json({ ...kpCase, description, notes });
  } catch (err) {
    console.error('[create Case Error]', err);
    res.status(500).json({ error: 'Failed to create case', details: err.message });
  }
};

const updateStatus = (req, res) => {
  try {
    const kpCase = db.findById('cases', req.params.id);
    if (!kpCase) return res.status(404).json({ error: 'Case not found' });
    const updated = db.update('cases', req.params.id, { status: req.body.status, notes: encrypt(req.body.notes || '') });
    try {
      addBlock({ action: 'CASE_STATUS_UPDATED', recordType: 'case', recordId: kpCase.id, actor: req.user?.email || 'unknown', actorRole: req.user?.role || 'unknown', details: { newStatus: req.body.status } });
    } catch (bcErr) {}
    res.json(updated);
  } catch (err) {
    console.error('[updateStatus Case Error]', err);
    res.status(500).json({ error: 'Failed to update case status', details: err.message });
  }
};

const getResidentCases = (req, res) => {
  try {
    const { residentId } = req.params;
    const cases = Array.isArray(db.cases) ? db.cases.filter((c) => c && (c.complainantId === residentId || c.respondentId === residentId)) : [];
    const decrypted = cases.map((c) => ({ ...c, description: decrypt(c.description), notes: decrypt(c.notes) }));
    res.json({ data: decrypted.map((c) => sanitizeCase(c, req.user?.role)), total: cases.length });
  } catch (err) {
    console.error('[getResidentCases Error]', err);
    res.status(500).json({ error: 'Failed to fetch resident cases', details: err.message });
  }
};

module.exports = { getAll, getById, create, updateStatus, getResidentCases };
