const db = require('../models/db');
const { addBlock } = require('../services/blockchain');
const { ROLES } = require('../config/constants');

const getAll = (req, res) => {
  const { search, barangay: barangayQuery, tag } = req.query;
  const { role, barangay: userBarangay } = req.user || {};

  console.log(`[GET /api/residents] Incoming request - User: ${req.user?.email}, Role: ${role}, Search: "${search || ''}", Barangay Query: "${barangayQuery || ''}"`);

  try {
    // 1. Initialize data from db (with fallback)
    let data = Array.isArray(db.residents) ? [...db.residents] : [];
    
    // 2. Filter by role (Secretary only sees their own barangay)
    if (role !== ROLES.ADMIN) {
      if (!userBarangay) {
        console.warn(`[getAll Residents] Non-admin user ${req.user?.email} has no assigned barangay!`);
        return res.status(403).json({ error: 'Access denied. No barangay assigned to your account.' });
      }
      data = data.filter((r) => r && r.barangay === userBarangay);
    }

    // 3. Filter by barangay query parameter (if provided and not empty)
    // We check for both presence and non-empty string to prevent crashes or incorrect filtering
    if (barangayQuery && String(barangayQuery).trim() !== "") {
      data = data.filter((r) => r && r.barangay === String(barangayQuery).trim());
    }

    // 4. Filter by search query parameter
    if (search && String(search).trim() !== "") {
      const q = String(search).toLowerCase().trim();
      data = data.filter((r) => {
        if (!r) return false;
        const firstName = (r.firstName || '').toLowerCase();
        const lastName = (r.lastName || '').toLowerCase();
        const middleName = (r.middleName || '').toLowerCase();
        const email = (r.email || '').toLowerCase();
        
        return firstName.includes(q) || 
               lastName.includes(q) || 
               middleName.includes(q) ||
               email.includes(q);
      });
    }

    // 5. Tag filtering (senior, pwd, voter, fourPs, soloPar, ip)
    if (tag && String(tag).trim() !== "") {
      const t = String(tag).toLowerCase().trim();
      data = data.filter((r) => {
        if (!r || !r.tags) return false;
        switch (t) {
          case 'senior':   return r.tags.senior === true;
          case 'pwd':      return r.tags.pwd === true;
          case 'voter':    return r.tags.voter === true;
          case 'fourps':   return r.tags.fourPs === true;
          case 'solopar':  return r.tags.soloPar === true;
          case 'ip':       return r.tags.ip === true;
          default:         return true;
        }
      });
    }

    // 6. Log activity to blockchain (non-blocking/non-fatal)
    try {
      addBlock({
        action: 'RESIDENTS_VIEWED',
        recordType: 'residents',
        recordId: 'list',
        actor: req.user?.email || 'unknown',
        actorRole: role || 'unknown',
        details: { count: data.length, filters: { search, barangayQuery, tag } },
      });
    } catch (bcErr) {
      console.error('[Blockchain Error - non-fatal]', bcErr.message);
    }

    console.log(`[GET /api/residents] Success - Returned ${data.length} residents.`);
    res.json({ data, total: data.length });

  } catch (err) {
    console.error('[CRITICAL] getAll Residents Error:', err);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: err.message,
      path: '/api/residents',
      timestamp: new Date().toISOString()
    });
  }
};


const getById = (req, res) => {
  try {
    const resident = db.findById('residents', req.params.id);
    if (!resident) return res.status(404).json({ error: 'Resident not found' });

    try {
      addBlock({ action: 'RESIDENT_VIEWED', recordType: 'resident', recordId: resident.id, actor: req.user?.email || 'unknown', actorRole: req.user?.role || 'unknown', details: {} });
    } catch (bcErr) {}

    res.json(resident);
  } catch (err) {
    console.error('[getById Resident Error]', err);
    res.status(500).json({ error: 'Failed to fetch resident', details: err.message });
  }
};

const create = (req, res) => {
  try {
    const { role, barangay: userBarangay } = req.user || {};
    const residentData = { ...req.body };

    // Security & Consistency: If user is not Admin, enforce their own barangay
    if (role !== ROLES.ADMIN && userBarangay) {
      console.log(`[create Resident] Enforcing barangay ${userBarangay} for Secretary ${req.user?.email}`);
      residentData.barangay = userBarangay;
    }

    const resident = db.insert('residents', residentData);
    console.log(`[create Resident] Success - ID: ${resident.id}, Name: ${resident.firstName} ${resident.lastName}, Barangay: ${resident.barangay}`);

    try {
      addBlock({ 
        action: 'RESIDENT_CREATED', 
        recordType: 'resident', 
        recordId: resident.id, 
        actor: req.user?.email || 'unknown', 
        actorRole: role || 'unknown', 
        details: { name: `${resident.firstName} ${resident.lastName}`, barangay: resident.barangay } 
      });
    } catch (bcErr) {
      console.error('[Blockchain Error]', bcErr.message);
    }

    res.status(201).json(resident);
  } catch (err) {
    console.error('[create Resident Error]', err);
    res.status(500).json({ error: 'Failed to create resident', details: err.message });
  }
};

const update = (req, res) => {
  try {
    const { role, barangay: userBarangay } = req.user || {};
    const updateData = { ...req.body };

    // Safety: Secretaries cannot move residents to another barangay
    if (role !== ROLES.ADMIN && userBarangay) {
      updateData.barangay = userBarangay;
    }

    const updated = db.update('residents', req.params.id, updateData);
    if (!updated) return res.status(404).json({ error: 'Resident not found' });

    try {
      addBlock({ 
        action: 'RESIDENT_UPDATED', 
        recordType: 'resident', 
        recordId: updated.id, 
        actor: req.user?.email || 'unknown', 
        actorRole: role || 'unknown', 
        details: { fields: Object.keys(req.body) } 
      });
    } catch (bcErr) {}

    res.json(updated);
  } catch (err) {
    console.error('[update Resident Error]', err);
    res.status(500).json({ error: 'Failed to update resident', details: err.message });
  }
};


const remove = (req, res) => {
  try {
    const resident = db.findById('residents', req.params.id);
    if (!resident) return res.status(404).json({ error: 'Resident not found' });
    db.delete('residents', req.params.id);
    try {
      addBlock({ action: 'RESIDENT_DELETED', recordType: 'resident', recordId: req.params.id, actor: req.user?.email || 'unknown', actorRole: req.user?.role || 'unknown', details: {} });
    } catch (bcErr) {}
    res.json({ message: 'Resident deleted' });
  } catch (err) {
    console.error('[remove Resident Error]', err);
    res.status(500).json({ error: 'Failed to delete resident', details: err.message });
  }
};

const getStats = (req, res) => {
  try {
    const { role, barangay } = req.user || {};
    let data = Array.isArray(db.residents) ? db.residents : [];
    if (role !== ROLES.ADMIN) data = data.filter((r) => r && r.barangay === barangay);

    const byBarangay = data.reduce((acc, r) => {
      if (r && r.barangay) {
        acc[r.barangay] = (acc[r.barangay] || 0) + 1;
      }
      return acc;
    }, {});

    res.json({ total: data.length, byBarangay });
  } catch (err) {
    console.error('[getStats Error]', err);
    res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove, getStats };
