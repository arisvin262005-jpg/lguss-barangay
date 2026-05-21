// Built-in demo accounts — login works without CouchDB/Firebase/local disk
const DEMO_PASSWORDS = ['password123', 'admin123'];

const DEMO_USERS = [
  { id: 'demo-admin', firstName: 'System', lastName: 'Administrator', email: 'admin@barangay.gov.ph', barangay: 'LGU Mamburao', role: 'Admin', isVerified: true },
  { id: 'demo-sec', firstName: 'Barangay', lastName: 'Secretary', email: 'secretary@barangay.gov.ph', barangay: 'Barangay 1 (Poblacion)', role: 'Secretary', isVerified: true },
  { id: 'demo-tanod', firstName: 'Juan', lastName: 'Tanod', email: 'tanod@barangay.gov.ph', barangay: 'Barangay 1 (Poblacion)', role: 'Tanod', isVerified: true },
  { id: 'admin-001', firstName: 'CRPS', lastName: 'Administrator', email: 'admin@mamburao.gov.ph', barangay: 'LGU Mamburao', role: 'Admin', isVerified: true },
  { id: 'sec-001', firstName: 'Monica', lastName: 'Robles', email: 'brgy1@mamburao.gov.ph', barangay: 'Barangay 1 (Poblacion)', role: 'Secretary', isVerified: true },
  { id: 'sec-002', firstName: 'Shiela', lastName: 'Villalobos', email: 'brgy2@mamburao.gov.ph', barangay: 'Barangay 2 (Poblacion)', role: 'Secretary', isVerified: true },
  { id: 'sec-003', firstName: 'Mara Cammille', lastName: 'Poblete', email: 'brgy3@mamburao.gov.ph', barangay: 'Barangay 3 (Poblacion)', role: 'Secretary', isVerified: true },
  { id: 'sec-004', firstName: 'Rhea', lastName: 'Venturero', email: 'brgy4@mamburao.gov.ph', barangay: 'Barangay 4 (Poblacion)', role: 'Secretary', isVerified: true },
  { id: 'sec-005', firstName: 'Rhea', lastName: 'Rebato', email: 'brgy5@mamburao.gov.ph', barangay: 'Barangay 5', role: 'Secretary', isVerified: true },
  { id: 'sec-006', firstName: 'Florian Galopa', lastName: 'Alastre', email: 'brgy6@mamburao.gov.ph', barangay: 'Barangay 6', role: 'Secretary', isVerified: true },
  { id: 'sec-007', firstName: 'Janice', lastName: 'Arnedo', email: 'brgy7@mamburao.gov.ph', barangay: 'Barangay 7', role: 'Secretary', isVerified: true },
  { id: 'sec-008', firstName: 'Diane Reyes', lastName: 'Mesina', email: 'brgy8@mamburao.gov.ph', barangay: 'Barangay 8', role: 'Secretary', isVerified: true },
  { id: 'sec-009', firstName: 'Jenny', lastName: 'Navaro', email: 'payompon@mamburao.gov.ph', barangay: 'Payompon', role: 'Secretary', isVerified: true },
  { id: 'sec-010', firstName: 'Sherily P.', lastName: 'Gappi', email: 'tangkalan@mamburao.gov.ph', barangay: 'Tangkalan', role: 'Secretary', isVerified: true },
  { id: 'sec-011', firstName: 'Anthon', lastName: 'Valle', email: 'fatima@mamburao.gov.ph', barangay: 'Fatima', role: 'Secretary', isVerified: true },
  { id: 'sec-012', firstName: 'Shirley', lastName: 'Magana', email: 'sanluis@mamburao.gov.ph', barangay: 'San Luis', role: 'Secretary', isVerified: true },
  { id: 'sec-013', firstName: 'Clarisse V.', lastName: 'Parahinog', email: 'balansay@mamburao.gov.ph', barangay: 'Balansay', role: 'Secretary', isVerified: true },
  { id: 'sec-014', firstName: 'Thalia', lastName: 'Dela Luna', email: 'tayamaan@mamburao.gov.ph', barangay: 'Tayamaan', role: 'Secretary', isVerified: true },
  { id: 'sec-015', firstName: 'Maureen', lastName: 'Callejo', email: 'talabaan@mamburao.gov.ph', barangay: 'Talabaan', role: 'Secretary', isVerified: true },
];

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

const findDemoUser = (email, password) => {
  if (!DEMO_PASSWORDS.includes(password)) return null;
  const normalized = normalizeEmail(email);
  return DEMO_USERS.find((u) => normalizeEmail(u.email) === normalized) || null;
};

module.exports = { DEMO_PASSWORDS, DEMO_USERS, normalizeEmail, findDemoUser };
