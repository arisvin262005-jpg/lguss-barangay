const db = require('../models/db');
const { addBlock } = require('../services/blockchain');
const { encrypt, decrypt } = require('../utils/encryption');
const { ROLES, CASE_STATUS } = require('../config/constants');

const safeDecrypt = (val) => {
  try { return val ? decrypt(val) : ''; } catch { return val || ''; }
};

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
    const { complainantId, respondentId, caseType, description, hearingDate, hearingTime, hearingVenue, notes, filedDate, caseNumber } = req.body;
    const { role, barangay, email } = req.user || {};
    const caseCount = Array.isArray(db.cases) ? db.cases.length + 1 : 1;
    const generatedNumber = caseNumber || `KP-${new Date().getFullYear()}-${String(caseCount).padStart(3, '0')}`;
    const kpCase = db.insert('cases', {
      caseNumber: generatedNumber, complainantId, respondentId, caseType,
      description: encrypt(description || ''),
      notes: encrypt(notes || ''),
      hearingDate, hearingTime, hearingVenue,
      status: CASE_STATUS.FILED,
      filedDate: filedDate || new Date().toISOString().split('T')[0],
      barangay,
    });
    try {
      addBlock({ action: 'CASE_FILED', recordType: 'case', recordId: kpCase.id, actor: email || 'unknown', actorRole: role || 'unknown', details: { caseNumber: generatedNumber, caseType } });
    } catch (bcErr) {}
    res.status(201).json({ ...kpCase, description: description || '', notes: notes || '' });
  } catch (err) {
    console.error('[create Case Error]', err);
    res.status(500).json({ error: 'Failed to create case', details: err.message });
  }
};

const update = (req, res) => {
  try {
    const kpCase = db.findById('cases', req.params.id);
    if (!kpCase) return res.status(404).json({ error: 'Case not found' });
    const { description, notes, ...rest } = req.body;
    const payload = { ...rest };
    if (description !== undefined) payload.description = encrypt(description);
    if (notes !== undefined) payload.notes = encrypt(notes);
    const updated = db.update('cases', req.params.id, payload);
    try {
      addBlock({ action: 'CASE_UPDATED', recordType: 'case', recordId: kpCase.id, actor: req.user?.email || 'unknown', actorRole: req.user?.role || 'unknown', details: { fields: Object.keys(req.body) } });
    } catch (bcErr) {}
    res.json({ ...updated, description: description || '', notes: notes || '' });
  } catch (err) {
    console.error('[update Case Error]', err);
    res.status(500).json({ error: 'Failed to update case', details: err.message });
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
    const decrypted = cases.map((c) => ({ ...c, description: safeDecrypt(c.description), notes: safeDecrypt(c.notes) }));
    res.json({ data: decrypted.map((c) => sanitizeCase(c, req.user?.role)), total: cases.length });
  } catch (err) {
    console.error('[getResidentCases Error]', err);
    res.status(500).json({ error: 'Failed to fetch resident cases', details: err.message });
  }
};

/**
 * GET /api/cases/cross-check/:residentId
 * Cross-Barangay Case History — NO AI required, pure database logic.
 * Matches by firstName + lastName + birthDate across ALL barangays.
 * Even if a resident moved/transferred, their case history is still found.
 */
const getCrossBarangayCaseHistory = (req, res) => {
  try {
    const { residentId } = req.params;
    const allResidents = Array.isArray(db.residents) ? db.residents : [];
    const allCases    = Array.isArray(db.cases) ? db.cases : [];

    // 1. Find the target resident
    const target = allResidents.find(r => r && r.id === residentId);
    if (!target) return res.status(404).json({ error: 'Resident not found' });

    // 2. Match all identities across all barangays (same name + birthdate)
    const matchingIds = allResidents
      .filter(r =>
        r &&
        r.firstName?.toLowerCase() === target.firstName?.toLowerCase() &&
        r.lastName?.toLowerCase()  === target.lastName?.toLowerCase() &&
        r.birthDate === target.birthDate
      )
      .map(r => r.id);

    // 3. Find ALL cases across all barangays where any matched ID is involved
    const crossCases = allCases.filter(c =>
      c && (matchingIds.includes(c.complainantId) || matchingIds.includes(c.respondentId))
    );

    // 4. Enrich with names, barangay origin flag, role in case
    const enriched = crossCases.map(c => {
      const complainant = allResidents.find(r => r && r.id === c.complainantId);
      const respondent  = allResidents.find(r => r && r.id === c.respondentId);
      return {
        ...c,
        description:     safeDecrypt(c.description),
        notes:           safeDecrypt(c.notes),
        complainantName: complainant ? `${complainant.firstName} ${complainant.lastName}` : (c.complainantId || '—'),
        respondentName:  respondent  ? `${respondent.firstName} ${respondent.lastName}`   : (c.respondentId  || '—'),
        involvedAs:      matchingIds.includes(c.complainantId) ? 'Complainant' : 'Respondent',
        originBarangay:  c.barangay,
        isCrossBarangay: c.barangay !== target.barangay,
      };
    }).sort((a, b) => new Date(b.filedDate || 0) - new Date(a.filedDate || 0));

    // 5. Compute risk level based on respondent frequency
    const asRespondentCount = enriched.filter(c => c.involvedAs === 'Respondent').length;
    const riskLevel =
      asRespondentCount >= 3 ? 'HIGH' :
      asRespondentCount >= 1 ? 'MODERATE' : 'CLEAR';

    const summary = {
      residentName:        `${target.firstName} ${target.lastName}`,
      currentBarangay:     target.barangay,
      totalCases:          enriched.length,
      crossBarangayCases:  enriched.filter(c => c.isCrossBarangay).length,
      activeCases:         enriched.filter(c => !['Settled', 'Dismissed'].includes(c.status)).length,
      settledCases:        enriched.filter(c => c.status === 'Settled').length,
      escalatedCases:      enriched.filter(c => c.status === 'Escalated to Court').length,
      asComplainant:       enriched.filter(c => c.involvedAs === 'Complainant').length,
      asRespondent:        asRespondentCount,
      barangaysInvolved:   [...new Set(enriched.map(c => c.originBarangay).filter(Boolean))],
      riskLevel,
    };

    try {
      addBlock({
        action: 'CROSS_BARANGAY_CHECK', recordType: 'case', recordId: residentId,
        actor: req.user?.email || 'unknown', actorRole: req.user?.role || 'unknown',
        details: { residentName: summary.residentName, totalFound: enriched.length, riskLevel },
      });
    } catch (bcErr) {}

    res.json({ summary, cases: enriched, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[getCrossBarangayCaseHistory Error]', err);
    res.status(500).json({ error: 'Failed to perform cross-barangay case check', details: err.message });
  }
};

module.exports = { getAll, getById, create, update, updateStatus, getResidentCases, getCrossBarangayCaseHistory };
