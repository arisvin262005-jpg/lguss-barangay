const db = require('../models/db');
const { addBlock } = require('../services/blockchain');
const { ROLES } = require('../config/constants');

// Initialize incidentReports if it doesn't exist in db.js
if (!Array.isArray(db.incidentReports)) {
  db.incidentReports = [];
}

// Mock tanod locations (lat/lng near Mamburao, Occidental Mindoro)
let tanodLocations = [
  { userId: 'tanod-001', name: 'Pedro Reyes', barangay: 'Barangay 1 (Poblacion)', lat: 13.2236, lng: 120.5989, onDuty: true, lastSeen: new Date().toISOString() },
  { userId: 'tanod-002', name: 'Ramon Cruz', barangay: 'Barangay 2 (Poblacion)', lat: 13.2251, lng: 120.5978, onDuty: true, lastSeen: new Date().toISOString() },
  { userId: 'tanod-003', name: 'Elpidio Garcia', barangay: 'Balansay', lat: 13.2200, lng: 120.6010, onDuty: false, lastSeen: new Date().toISOString() },
];

const getAllLocations = (req, res) => {
  try {
    const role = req.user?.role;
    if (![ROLES.ADMIN, ROLES.SECRETARY].includes(role)) {
      return res.status(403).json({ error: 'Unauthorized to view tanod tracking' });
    }
    res.json({ data: tanodLocations, total: tanodLocations.length });
  } catch (err) {
    console.error('[getAllLocations Error]', err);
    res.status(500).json({ error: 'Failed to fetch tanod locations', details: err.message });
  }
};

const updateLocation = (req, res) => {
  try {
    const { lat, lng, onDuty } = req.body;
    const userId = req.user?.id || 'unknown';
    const name = req.user?.name || 'Unknown';
    const barangay = req.user?.barangay || 'Unknown';
    
    const idx = tanodLocations.findIndex((t) => t.userId === userId);
    const entry = { userId, name, barangay, lat, lng, onDuty: onDuty ?? true, lastSeen: new Date().toISOString() };
    if (idx > -1) tanodLocations[idx] = entry;
    else tanodLocations.push(entry);
    res.json(entry);
  } catch (err) {
    console.error('[updateLocation Error]', err);
    res.status(500).json({ error: 'Failed to update location', details: err.message });
  }
};

const addIncident = (req, res) => {
  try {
    const { lat, lng, description, severity } = req.body;
    const userId = req.user?.id || 'unknown';
    const reporterName = req.user?.name || 'Unknown';
    const barangay = req.user?.barangay || 'Unknown';
    const email = req.user?.email || 'unknown';
    const role = req.user?.role || 'unknown';

    const incident = {
      id: `inc-${Date.now()}`, reportedBy: userId, reporterName,
      lat, lng, description, severity: severity || 'Medium',
      barangay, timestamp: new Date().toISOString(), status: 'Open',
    };
    
    if (!Array.isArray(db.incidentReports)) db.incidentReports = [];
    db.incidentReports.push(incident);
    
    try {
      addBlock({ action: 'INCIDENT_REPORTED', recordType: 'incident', recordId: incident.id, actor: email, actorRole: role, details: { description, severity } });
    } catch (bcErr) {}
    
    res.status(201).json(incident);
  } catch (err) {
    console.error('[addIncident Error]', err);
    res.status(500).json({ error: 'Failed to report incident', details: err.message });
  }
};

const getIncidents = (req, res) => {
  try {
    const role = req.user?.role;
    const barangay = req.user?.barangay;
    const safeIncidents = Array.isArray(db.incidentReports) ? db.incidentReports : [];
    
    const incidents = role === ROLES.ADMIN ? safeIncidents : safeIncidents.filter((i) => i && i.barangay === barangay);
    res.json({ data: incidents, total: incidents.length });
  } catch (err) {
    console.error('[getIncidents Tracking Error]', err);
    res.status(500).json({ error: 'Failed to fetch GPS incidents', details: err.message });
  }
};

module.exports = { getAllLocations, updateLocation, addIncident, getIncidents };
