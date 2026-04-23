const db = require('../models/db');
const { addBlock } = require('../services/blockchain');
const { evaluateDSS, buildDSSLogEntry } = require('../services/dss');
const { ROLES, CERT_STATUS } = require('../config/constants');

const getAll = (req, res) => {
  try {
    let data = Array.isArray(db.certifications) ? [...db.certifications] : [];
    const { role, barangay } = req.user || {};
    if (role !== ROLES.ADMIN) data = data.filter((c) => c && c.barangay === barangay);
    res.json({ data, total: data.length });
  } catch (err) {
    console.error('[getAll Certs Error]', err);
    res.status(500).json({ error: 'Failed to fetch certifications', details: err.message });
  }
};

const getById = (req, res) => {
  try {
    const cert = db.findById('certifications', req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certification not found' });
    res.json(cert);
  } catch (err) {
    console.error('[getById Cert Error]', err);
    res.status(500).json({ error: 'Failed to fetch certification', details: err.message });
  }
};

const checkDSS = (req, res) => {
  try {
    const { residentId, certType } = req.body;
    const evaluation = evaluateDSS({ 
      residentId, 
      certType, 
      residents: Array.isArray(db.residents) ? db.residents : [],
      casesInvolved: Array.isArray(db.cases) ? db.cases : [], 
      requestedBy: req.user?.email || 'unknown'
    });
    const logEntry = buildDSSLogEntry(evaluation, req.user?.email || 'unknown');
    if (!Array.isArray(db.dssLogs)) db.dssLogs = [];
    db.dssLogs.push(logEntry);
    
    try {
      addBlock({ action: 'DSS_EVALUATED', recordType: 'dss', recordId: residentId, actor: req.user?.email || 'unknown', actorRole: req.user?.role || 'unknown', details: { decision: evaluation.decision, certType } });
    } catch (bcErr) {}
    
    res.json(evaluation);
  } catch (err) {
    console.error('[checkDSS Error]', err);
    res.status(500).json({ error: 'Failed to evaluate DSS', details: err.message });
  }
};

const create = (req, res) => {
  try {
    const { residentId, certType, purpose } = req.body;
    const { role, barangay, email } = req.user || {};
    
    const evaluation = evaluateDSS({ 
      residentId, 
      certType, 
      residents: Array.isArray(db.residents) ? db.residents : [],
      casesInvolved: Array.isArray(db.cases) ? db.cases : [], 
      requestedBy: email || 'unknown'
    });
    
    if (!Array.isArray(db.dssLogs)) db.dssLogs = [];
    db.dssLogs.push(buildDSSLogEntry(evaluation, email || 'unknown'));

    const status = evaluation.decision === 'Approve' ? CERT_STATUS.PROCESSING : evaluation.decision === 'Hold' ? CERT_STATUS.ON_HOLD : CERT_STATUS.DENIED;
    const cert = db.insert('certifications', { residentId, certType, purpose, status, barangay: barangay, issuedBy: req.user?.id, dssDecision: evaluation.decision, dssFlags: evaluation.flags });
    
    try {
      addBlock({ action: 'CERTIFICATION_CREATED', recordType: 'certification', recordId: cert.id, actor: email || 'unknown', actorRole: role || 'unknown', details: { certType, status, dssDecision: evaluation.decision } });
    } catch (bcErr) {}
    
    res.status(201).json({ certification: cert, dssEvaluation: evaluation });
  } catch (err) {
    console.error('[create Cert Error]', err);
    res.status(500).json({ error: 'Failed to create certification', details: err.message });
  }
};

const updateStatus = (req, res) => {
  try {
    const cert = db.findById('certifications', req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certification not found' });
    
    const { status } = req.body;
    const updates = { status };
    
    // Auto-generate OR Number and IssuedAt when Released
    if (status === CERT_STATUS.RELEASED && !cert.orNumber) {
      const year = new Date().getFullYear();
      const releasedCerts = Array.isArray(db.certifications) ? db.certifications.filter(c => c.orNumber) : [];
      const nextNum = (releasedCerts.length + 1).toString().padStart(4, '0');
      updates.orNumber = `OR-${year}-${nextNum}`;
      updates.issuedAt = new Date().toISOString();
    }

    const updated = db.update('certifications', req.params.id, updates);
    
    try {
      addBlock({ 
        action: 'CERTIFICATION_STATUS_UPDATED', 
        recordType: 'certification', 
        recordId: cert.id, 
        actor: req.user?.email || 'unknown', 
        actorRole: req.user?.role || 'unknown', 
        details: { newStatus: status, orNumber: updates.orNumber } 
      });
    } catch (bcErr) {}
    
    res.json(updated);
  } catch (err) {
    console.error('[updateStatus Cert Error]', err);
    res.status(500).json({ error: 'Failed to update certification status', details: err.message });
  }
};

const remove = (req, res) => {
  try {
    const cert = db.findById('certifications', req.params.id);
    if (!cert) return res.status(404).json({ error: 'Certification not found' });
    
    db.delete('certifications', req.params.id);
    
    try {
      addBlock({ 
        action: 'CERTIFICATION_DELETED', 
        recordType: 'certification', 
        recordId: req.params.id, 
        actor: req.user?.email || 'unknown', 
        actorRole: req.user?.role || 'unknown' 
      });
    } catch (bcErr) {}
    
    res.json({ message: 'Certification deleted successfully' });
  } catch (err) {
    console.error('[remove Cert Error]', err);
    res.status(500).json({ error: 'Failed to delete certification', details: err.message });
  }
};

const getDSSLogs = (req, res) => {
  try {
    const safeLogs = Array.isArray(db.dssLogs) ? db.dssLogs : [];
    const logs = req.query.residentId
      ? safeLogs.filter((l) => l && l.residentId === req.query.residentId)
      : safeLogs;
    res.json({ data: logs, total: logs.length });
  } catch (err) {
    console.error('[getDSSLogs Error]', err);
    res.status(500).json({ error: 'Failed to fetch DSS logs', details: err.message });
  }
};

module.exports = { getAll, getById, checkDSS, create, updateStatus, remove, getDSSLogs };
