const db = require('../models/db');
const { addBlock } = require('../services/blockchain');
const { ROLES } = require('../config/constants');

// Mock tanod locations (lat/lng near Mamburao, Occidental Mindoro)
let tanodLocations = [
  { userId: 'tanod-001', name: 'Pedro Reyes', barangay: 'Barangay 1 (Poblacion)', lat: 13.2236, lng: 120.5989, onDuty: true, lastSeen: new Date().toISOString() },
  { userId: 'tanod-002', name: 'Ramon Cruz', barangay: 'Barangay 2 (Poblacion)', lat: 13.2251, lng: 120.5978, onDuty: true, lastSeen: new Date().toISOString() },
  { userId: 'tanod-003', name: 'Elpidio Garcia', barangay: 'Balansay', lat: 13.2200, lng: 120.6010, onDuty: false, lastSeen: new Date().toISOString() },
];

const getAllLocations = (req, res) => {
  const { role } = req.user;
  if (![ROLES.ADMIN, ROLES.SECRETARY].includes(role)) {
    return res.status(403).json({ error: 'Unauthorized to view tanod tracking' });
  }
  res.json({ data: tanodLocations, total: tanodLocations.length });
};

const updateLocation = (req, res) => {
  const { lat, lng, onDuty } = req.body;
  const idx = tanodLocations.findIndex((t) => t.userId === req.user.id);
  const entry = { userId: req.user.id, name: req.user.name, barangay: req.user.barangay, lat, lng, onDuty: onDuty ?? true, lastSeen: new Date().toISOString() };
  if (idx > -1) tanodLocations[idx] = entry;
  else tanodLocations.push(entry);
  res.json(entry);
};

const addIncident = (req, res) => {
  const { lat, lng, description, severity } = req.body;
  const incident = {
    id: `inc-${Date.now()}`, reportedBy: req.user.id, reporterName: req.user.name,
    lat, lng, description, severity: severity || 'Medium',
    barangay: req.user.barangay, timestamp: new Date().toISOString(), status: 'Open',
  };
  db.incidentReports.push(incident);
  addBlock({ action: 'INCIDENT_REPORTED', recordType: 'incident', recordId: incident.id, actor: req.user.email, actorRole: req.user.role, details: { description, severity } });
  res.status(201).json(incident);
};

const getIncidents = (req, res) => {
  const { role, barangay } = req.user;
  const incidents = role === ROLES.ADMIN ? db.incidentReports : db.incidentReports.filter((i) => i.barangay === barangay);
  res.json({ data: incidents, total: incidents.length });
};

module.exports = { getAllLocations, updateLocation, addIncident, getIncidents };
