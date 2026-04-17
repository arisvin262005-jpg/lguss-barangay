const db = require('../models/db');
const { addBlock } = require('../services/blockchain');
const { encrypt, decrypt } = require('../utils/encryption');
const { ROLES, CASE_STATUS } = require('../config/constants');

// Fields only visible to Admin/Secretary
const SENSITIVE_FIELDS = ['description', 'notes', 'complainantId', 'respondentId'];

const sanitizeCase = (kpCase, role) => {
  if (role === ROLES.ADMIN || role === ROLES.SECRETARY) return kpCase;
  // Tanod and Viewer see limited info
  const { id, caseNumber, caseType, status, filedDate, hearingDate, barangay } = kpCase;
  return { id, caseNumber, caseType, status, filedDate, hearingDate, barangay, restricted: true };
};

const getAll = (req, res) => {
  let data = [...db.cases];
  const { role, barangay } = req.user;
  if (role !== ROLES.ADMIN) data = data.filter((c) => c.barangay === barangay);
  const sanitized = data.map((c) => sanitizeCase(c, role));
  res.json({ data: sanitized, total: sanitized.length });
};

const getById = (req, res) => {
  const kpCase = db.findById('cases', req.params.id);
  if (!kpCase) return res.status(404).json({ error: 'Case not found' });
  addBlock({ action: 'CASE_VIEWED', recordType: 'case', recordId: kpCase.id, actor: req.user.email, actorRole: req.user.role, details: {} });
  res.json(sanitizeCase(kpCase, req.user.role));
};

const create = (req, res) => {
  const { complainantId, respondentId, caseType, description, hearingDate, notes } = req.body;
  const { role, barangay, email } = req.user;
  const caseCount = db.cases.length + 1;
  const caseNumber = `KP-${new Date().getFullYear()}-${String(caseCount).padStart(3, '0')}`;
  const kpCase = db.insert('cases', {
    caseNumber, complainantId, respondentId, caseType,
    description: encrypt(description),
    notes: encrypt(notes || ''),
    hearingDate, status: CASE_STATUS.FILED,
    filedDate: new Date().toISOString().split('T')[0],
    barangay,
  });
  addBlock({ action: 'CASE_FILED', recordType: 'case', recordId: kpCase.id, actor: email, actorRole: role, details: { caseNumber, caseType } });
  res.status(201).json({ ...kpCase, description, notes });
};

const updateStatus = (req, res) => {
  const kpCase = db.findById('cases', req.params.id);
  if (!kpCase) return res.status(404).json({ error: 'Case not found' });
  const updated = db.update('cases', req.params.id, { status: req.body.status, notes: encrypt(req.body.notes || '') });
  addBlock({ action: 'CASE_STATUS_UPDATED', recordType: 'case', recordId: kpCase.id, actor: req.user.email, actorRole: req.user.role, details: { newStatus: req.body.status } });
  res.json(updated);
};

const getResidentCases = (req, res) => {
  const { residentId } = req.params;
  const cases = db.cases.filter((c) => c.complainantId === residentId || c.respondentId === residentId);
  const decrypted = cases.map((c) => ({ ...c, description: decrypt(c.description), notes: decrypt(c.notes) }));
  res.json({ data: decrypted.map((c) => sanitizeCase(c, req.user.role)), total: cases.length });
};

module.exports = { getAll, getById, create, updateStatus, getResidentCases };
