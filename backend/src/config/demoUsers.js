// Built-in demo accounts — login works without CouchDB/Firebase/local disk
const DEMO_PASSWORDS = ['password123', 'admin123'];

const DEMO_USERS = [
  { id: 'demo-admin', firstName: 'System', lastName: 'Administrator', email: 'admin@barangay.gov.ph', barangay: 'LGU Mamburao', role: 'Admin', isVerified: true },
  { id: 'demo-sec', firstName: 'Barangay', lastName: 'Secretary', email: 'secretary@barangay.gov.ph', barangay: 'Barangay 1 (Poblacion)', role: 'Secretary', isVerified: true },
  { id: 'demo-tanod', firstName: 'Juan', lastName: 'Tanod', email: 'tanod@barangay.gov.ph', barangay: 'Barangay 1 (Poblacion)', role: 'Tanod', isVerified: true },
  { id: 'admin-001', firstName: 'CRPS', lastName: 'Administrator', email: 'admin@mamburao.gov.ph', barangay: 'LGU Mamburao', role: 'Admin', isVerified: true },
  { id: 'sec-001', firstName: 'Monica', lastName: 'Robles', email: 'brgy1@mamburao.gov.ph', barangay: 'Barangay 1 (Poblacion)', role: 'Secretary', isVerified: true },
  { id: 'sec-002', firstName: 'Shiela', lastName: 'Villalobos', email: 'brgy2@mamburao.gov.ph', barangay: 'Barangay 2 (Poblacion)', role: 'Secretary', isVerified: true },
];

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

const findDemoUser = (email, password) => {
  if (!DEMO_PASSWORDS.includes(password)) return null;
  const normalized = normalizeEmail(email);
  return DEMO_USERS.find((u) => normalizeEmail(u.email) === normalized) || null;
};

module.exports = { DEMO_PASSWORDS, DEMO_USERS, normalizeEmail, findDemoUser };
