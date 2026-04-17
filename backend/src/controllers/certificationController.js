const db = require('../models/db');
const { addBlock } = require('../services/blockchain');
const { evaluateDSS, buildDSSLogEntry } = require('../services/dss');
const { ROLES, CERT_STATUS } = require('../config/constants');

const getAll = (req, res) => {
  let data = [...db.certifications];
  const { role, barangay } = req.user;
  if (role !== ROLES.ADMIN) data = data.filter((c) => c.barangay === barangay);
  res.json({ data, total: data.length });
};

const getById = (req, res) => {
  const cert = db.findById('certifications', req.params.id);
  if (!cert) return res.status(404).json({ error: 'Certification not found' });
  res.json(cert);
};

const checkDSS = (req, res) => {
  const { residentId, certType } = req.body;
  const evaluation = evaluateDSS({ 
    residentId, 
    certType, 
    residents: db.residents,
    casesInvolved: db.cases, 
    requestedBy: req.user.email 
  });
  const logEntry = buildDSSLogEntry(evaluation, req.user.email);
  db.dssLogs.push(logEntry);
  addBlock({ action: 'DSS_EVALUATED', recordType: 'dss', recordId: residentId, actor: req.user.email, actorRole: req.user.role, details: { decision: evaluation.decision, certType } });
  res.json(evaluation);
};

const create = (req, res) => {
  const { residentId, certType, purpose } = req.body;
  const { role, barangay, email } = req.user;
  // Auto-run DSS check
  const evaluation = evaluateDSS({ 
    residentId, 
    certType, 
    residents: db.residents,
    casesInvolved: db.cases, 
    requestedBy: email 
  });
  db.dssLogs.push(buildDSSLogEntry(evaluation, email));

  const status = evaluation.decision === 'Approve' ? CERT_STATUS.PROCESSING : evaluation.decision === 'Hold' ? CERT_STATUS.ON_HOLD : CERT_STATUS.DENIED;
  const cert = db.insert('certifications', { residentId, certType, purpose, status, barangay: barangay, issuedBy: req.user.id, dssDecision: evaluation.decision, dssFlags: evaluation.flags });
  addBlock({ action: 'CERTIFICATION_CREATED', recordType: 'certification', recordId: cert.id, actor: email, actorRole: role, details: { certType, status, dssDecision: evaluation.decision } });
  res.status(201).json({ certification: cert, dssEvaluation: evaluation });
};

const updateStatus = (req, res) => {
  const cert = db.findById('certifications', req.params.id);
  if (!cert) return res.status(404).json({ error: 'Certification not found' });
  const updated = db.update('certifications', req.params.id, { status: req.body.status, orNumber: req.body.orNumber });
  addBlock({ action: 'CERTIFICATION_STATUS_UPDATED', recordType: 'certification', recordId: cert.id, actor: req.user.email, actorRole: req.user.role, details: { newStatus: req.body.status } });
  res.json(updated);
};

const getDSSLogs = (req, res) => {
  const logs = req.query.residentId
    ? db.dssLogs.filter((l) => l.residentId === req.query.residentId)
    : db.dssLogs;
  res.json({ data: logs, total: logs.length });
};

module.exports = { getAll, getById, checkDSS, create, updateStatus, getDSSLogs };
