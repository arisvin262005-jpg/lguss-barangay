const ROLES = {
  ADMIN: 'Admin',
  SECRETARY: 'Secretary',
  TANOD: 'Tanod',
  VIEWER: 'Viewer',
};

const CERT_TYPES = {
  CLEARANCE: 'Barangay Clearance',
  RESIDENCY: 'Certificate of Residency',
  INDIGENCY: 'Certificate of Indigency',
  BUSINESS: 'Business Permit Endorsement',
};

const CERT_STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  RELEASED: 'Released',
  DENIED: 'Denied',
  ON_HOLD: 'On Hold',
};

const CASE_STATUS = {
  FILED: 'Filed',
  MEDIATION: 'Mediation',
  SETTLED: 'Settled',
  ESCALATED: 'Escalated',
  DISMISSED: 'Dismissed',
};

const DSS_DECISION = {
  APPROVE: 'Approve',
  HOLD: 'Hold',
  DENY: 'Deny',
};

const BARANGAYS = [
  'Barangay 1 (Poblacion)',
  'Barangay 2 (Poblacion)',
  'Barangay 3 (Poblacion)',
  'Barangay 4 (Poblacion)',
  'Balansay',
  'Fatima',
  'Tayamaan',
  'Calawag',
  'Dalahican',
];

module.exports = { ROLES, CERT_TYPES, CERT_STATUS, CASE_STATUS, DSS_DECISION, BARANGAYS };
