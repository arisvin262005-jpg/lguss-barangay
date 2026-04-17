// In-memory store for mock database
// In production: PouchDB/CouchDB persistent storage

const { v4: uuidv4 } = require('uuid');

let users = [
  { id: 'admin-001', firstName: 'Juan', lastName: 'dela Cruz', email: 'admin@barangay.gov.ph',
    password: '$2b$10$xLAUhlWMFDtZEuLihOUlGu8LTFSOWacBdAIvdDq9JdruhWfB6UkAO',
    barangay: 'Barangay 1 (Poblacion)', role: 'Admin', isVerified: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'sec-001', firstName: 'Maria', lastName: 'Santos', email: 'secretary@barangay.gov.ph',
    password: '$2b$10$xLAUhlWMFDtZEuLihOUlGu8LTFSOWacBdAIvdDq9JdruhWfB6UkAO',
    barangay: 'Barangay 2 (Poblacion)', role: 'Secretary', isVerified: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'tanod-001', firstName: 'Pedro', lastName: 'Reyes', email: 'tanod@barangay.gov.ph',
    password: '$2b$10$xLAUhlWMFDtZEuLihOUlGu8LTFSOWacBdAIvdDq9JdruhWfB6UkAO',
    barangay: 'Barangay 1 (Poblacion)', role: 'Tanod', isVerified: true,
    lat: 13.2236, lng: 120.5989, onDuty: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'tanod-002', firstName: 'Roberto', lastName: 'Flores', email: 'tanod2@barangay.gov.ph',
    password: '$2b$10$xLAUhlWMFDtZEuLihOUlGu8LTFSOWacBdAIvdDq9JdruhWfB6UkAO',
    barangay: 'Barangay 1 (Poblacion)', role: 'Tanod', isVerified: true,
    lat: 13.2251, lng: 120.6012, onDuty: true, createdAt: '2024-01-10T00:00:00.000Z' },
];

let households = [
  { id: 'hh-001', householdNumber: 'HH-001', address: '123 Rizal Street, Purok 1', purok: 'Purok 1', zone: 'Zone A',
    barangay: 'Barangay 1 (Poblacion)', houseType: 'Concrete', toiletFacility: 'Water Sealed', waterSource: 'MCWD Piped Water',
    electricity: true, headId: 'res-001', memberCount: 4, createdAt: '2023-06-01T00:00:00.000Z' },
  { id: 'hh-002', householdNumber: 'HH-002', address: '456 Mabini Street, Purok 2', purok: 'Purok 2', zone: 'Zone A',
    barangay: 'Barangay 1 (Poblacion)', houseType: 'Semi-Concrete', toiletFacility: 'Open Pit', waterSource: 'Deep Well',
    electricity: true, headId: 'res-002', memberCount: 3, createdAt: '2023-06-01T00:00:00.000Z' },
  { id: 'hh-003', householdNumber: 'HH-003', address: '789 Luna Street, Purok 3', purok: 'Purok 3', zone: 'Zone B',
    barangay: 'Balansay', houseType: 'Wood', toiletFacility: 'Water Sealed', waterSource: 'Spring',
    electricity: false, headId: 'res-003', memberCount: 5, createdAt: '2023-07-15T00:00:00.000Z' },
];

let residents = [
  { id: 'res-001', firstName: 'Ana', lastName: 'Ramos', middleName: 'Cruz', suffix: '', birthDate: '1990-05-12',
    gender: 'Female', civilStatus: 'Married', citizenship: 'Filipino', religion: 'Roman Catholic', birthplace: 'Mamburao',
    address: '123 Rizal Street, Purok 1', barangay: 'Barangay 1 (Poblacion)', contactNumber: '09171234567',
    email: 'ana.ramos@example.com', education: 'College Graduate', occupation: 'Teacher', monthlyIncome: 25000,
    bloodType: 'O+', householdId: 'hh-001', relationToHead: 'Head', photo: null,
    tags: { voter: true, senior: false, pwd: false, fourPs: false, soloPar: false, ip: false },
    precinctNo: 'P-001', createdAt: '2024-01-15T08:00:00.000Z', updatedAt: '2024-01-15T08:00:00.000Z' },
  { id: 'res-002', firstName: 'Carlos', lastName: 'Magno', middleName: '', suffix: 'Jr.', birthDate: '1985-08-22',
    gender: 'Male', civilStatus: 'Single', citizenship: 'Filipino', religion: 'Roman Catholic', birthplace: 'Mamburao',
    address: '456 Mabini Street, Purok 2', barangay: 'Barangay 1 (Poblacion)', contactNumber: '09181234567',
    email: '', education: 'High School', occupation: 'Farmer', monthlyIncome: 8000,
    bloodType: 'A+', householdId: 'hh-002', relationToHead: 'Head', photo: null,
    tags: { voter: true, senior: false, pwd: false, fourPs: true, soloPar: false, ip: false },
    precinctNo: 'P-002', createdAt: '2024-02-01T08:00:00.000Z', updatedAt: '2024-02-01T08:00:00.000Z' },
  { id: 'res-003', firstName: 'Lourdes', lastName: 'dela Vega', middleName: 'Santos', suffix: '', birthDate: '1956-11-30',
    gender: 'Female', civilStatus: 'Widowed', citizenship: 'Filipino', religion: 'Roman Catholic', birthplace: 'San Jose',
    address: '789 Luna Street, Purok 3', barangay: 'Balansay', contactNumber: '09191234567',
    email: '', education: 'Elementary', occupation: 'Housewife', monthlyIncome: 3000,
    bloodType: 'B+', householdId: 'hh-003', relationToHead: 'Head', photo: null,
    tags: { voter: true, senior: true, pwd: false, fourPs: true, soloPar: false, ip: false },
    oscaId: 'OSCA-2015-001', pensionStatus: 'Receiving SSSP', createdAt: '2024-02-10T08:00:00.000Z', updatedAt: '2024-02-10T08:00:00.000Z' },
  { id: 'res-004', firstName: 'Jose', lastName: 'Mendoza', middleName: 'Bautista', suffix: '', birthDate: '1998-03-14',
    gender: 'Male', civilStatus: 'Single', citizenship: 'Filipino', religion: 'INC', birthplace: 'Mamburao',
    address: '21 Bonifacio St, Purok 4', barangay: 'Fatima', contactNumber: '09261234567',
    email: 'jose@example.com', education: 'College Level', occupation: 'Jeepney Driver', monthlyIncome: 12000,
    bloodType: 'AB+', householdId: 'hh-002', relationToHead: 'Son', photo: null,
    tags: { voter: false, senior: false, pwd: true, fourPs: false, soloPar: false, ip: false },
    pwdId: 'PWD-2020-044', disabilityType: 'Physical (Right leg)',
    createdAt: '2024-03-01T08:00:00.000Z', updatedAt: '2024-03-01T08:00:00.000Z' },
  { id: 'res-005', firstName: 'Gloria', lastName: 'Bautista', middleName: 'Pedro', suffix: '', birthDate: '1952-07-08',
    gender: 'Female', civilStatus: 'Married', citizenship: 'Filipino', religion: 'Roman Catholic', birthplace: 'Palawan',
    address: '55 Quezon Blvd, Purok 1', barangay: 'Tayamaan', contactNumber: '09331234567',
    email: '', education: 'High School', occupation: 'Vendor', monthlyIncome: 6000,
    bloodType: 'O-', householdId: null, relationToHead: 'Head', photo: null,
    tags: { voter: true, senior: true, pwd: false, fourPs: false, soloPar: true, ip: false },
    oscaId: 'OSCA-2018-019', pensionStatus: 'Not Receiving',
    createdAt: '2024-03-10T08:00:00.000Z', updatedAt: '2024-03-10T08:00:00.000Z' },
  { id: 'res-006', firstName: 'Ramon', lastName: 'Aquino', middleName: 'Lopez', suffix: 'III', birthDate: '1978-12-01',
    gender: 'Male', civilStatus: 'Married', citizenship: 'Filipino', religion: 'Roman Catholic', birthplace: 'Mamburao',
    address: '44 MacArthur Highway, Purok 2', barangay: 'Calawag', contactNumber: '09451234567',
    email: 'ramon@example.com', education: 'Vocational', occupation: 'Carpenter', monthlyIncome: 15000,
    bloodType: 'A-', householdId: 'hh-001', relationToHead: 'Spouse', photo: null,
    tags: { voter: true, senior: false, pwd: false, fourPs: false, soloPar: false, ip: true },
    createdAt: '2024-03-20T08:00:00.000Z', updatedAt: '2024-03-20T08:00:00.000Z' },
  { id: 'res-007', firstName: 'Rosario', lastName: 'Villanueva', middleName: 'Santos', suffix: '', birthDate: '2001-05-19',
    gender: 'Female', civilStatus: 'Single', citizenship: 'Filipino', religion: 'Baptist', birthplace: 'Mamburao',
    address: '10 Gen. Lukban St, Purok 5', barangay: 'Dalahican', contactNumber: '09561234567',
    email: 'rosario@example.com', education: 'College Graduate', occupation: 'Nurse', monthlyIncome: 22000,
    bloodType: 'B-', householdId: null, relationToHead: 'Head', photo: null,
    tags: { voter: true, senior: false, pwd: false, fourPs: false, soloPar: false, ip: false },
    precinctNo: 'P-005', createdAt: '2024-04-01T08:00:00.000Z', updatedAt: '2024-04-01T08:00:00.000Z' },
];

let cases = [
  { id: 'case-001', caseNumber: 'KP-2024-001', complainantId: 'res-001', respondentId: 'res-002',
    caseType: 'Land Dispute', description: 'Property boundary dispute along shared fence line.',
    status: 'Under Mediation', filedDate: '2024-03-01', hearingDate: '2024-04-25',
    hearingTime: '09:00', hearingVenue: 'Barangay Hall Conference Room',
    notes: 'Second mediation session scheduled', barangay: 'Barangay 1 (Poblacion)',
    createdAt: '2024-03-01T08:00:00.000Z', updatedAt: '2024-04-10T08:00:00.000Z' },
  { id: 'case-002', caseNumber: 'KP-2023-014', complainantId: 'res-003', respondentId: 'res-001',
    caseType: 'Noise Complaint', description: 'Excessive noise from late-night gatherings every weekend.',
    status: 'Settled', filedDate: '2023-06-15', hearingDate: '2023-07-01',
    hearingTime: '10:00', hearingVenue: 'Barangay Hall',
    notes: 'Amicably settled. Respondent agreed to observe quiet hours.', barangay: 'Balansay',
    createdAt: '2023-06-15T08:00:00.000Z', updatedAt: '2023-07-01T08:00:00.000Z' },
  { id: 'case-003', caseNumber: 'KP-2024-008', complainantId: 'res-004', respondentId: 'res-006',
    caseType: 'Physical Injury', description: 'Respondent allegedly struck complainant during a verbal altercation.',
    status: 'Filed', filedDate: '2024-04-05', hearingDate: '2024-04-30',
    hearingTime: '14:00', hearingVenue: 'Barangay Hall',
    notes: 'First scheduled hearing', barangay: 'Fatima',
    createdAt: '2024-04-05T08:00:00.000Z', updatedAt: '2024-04-05T08:00:00.000Z' },
];

let certifications = [
  { id: 'cert-001', residentId: 'res-001', certType: 'Barangay Clearance', purpose: 'Employment',
    status: 'Released', orNumber: 'OR-2024-001', issuedBy: 'sec-001', dssDecision: 'Approve',
    issuedAt: '2024-01-20T08:00:00.000Z', barangay: 'Barangay 1 (Poblacion)', createdAt: '2024-01-18T08:00:00.000Z' },
  { id: 'cert-002', residentId: 'res-003', certType: 'Certificate of Indigency', purpose: 'PHILHEALTH',
    status: 'Released', orNumber: 'OR-2024-015', issuedBy: 'sec-001', dssDecision: 'Approve',
    issuedAt: '2024-02-14T08:00:00.000Z', barangay: 'Balansay', createdAt: '2024-02-14T08:00:00.000Z' },
  { id: 'cert-003', residentId: 'res-002', certType: 'Barangay Clearance', purpose: 'Business permit application',
    status: 'On Hold', orNumber: null, issuedBy: 'sec-001', dssDecision: 'Hold',
    issuedAt: null, barangay: 'Barangay 1 (Poblacion)', createdAt: '2024-04-10T08:00:00.000Z' },
];

let legislation = [
  { id: 'leg-001', type: 'Ordinance', number: 'BO-2024-001', title: 'Ordinance Establishing the Anti-Littering Policy',
    description: 'An ordinance prohibiting littering in public places within the barangay and providing penalties therefor.',
    dateEnacted: '2024-01-15', author: 'Kgd. Reyes, A.', status: 'Active', barangay: 'Barangay 1 (Poblacion)', createdAt: '2024-01-15T08:00:00.000Z' },
  { id: 'leg-002', type: 'Resolution', number: 'BR-2024-005', title: 'Resolution Endorsing BFAD Inspection of Food Stalls',
    description: 'A resolution authorizing the barangay captain to coordinate with BFAD for regular inspection of food stalls.',
    dateEnacted: '2024-02-20', author: 'Kgd. Santos, M.', status: 'Active', barangay: 'Barangay 1 (Poblacion)', createdAt: '2024-02-20T08:00:00.000Z' },
  { id: 'leg-003', type: 'Executive Order', number: 'BEO-2024-002', title: 'Executive Order on Curfew for Minors',
    description: 'Executive order imposing a 10PM curfew for minors below 18 years old within barangay jurisdiction.',
    dateEnacted: '2024-03-10', author: 'Brgy. Captain Dela Cruz', status: 'Active', barangay: 'Barangay 1 (Poblacion)', createdAt: '2024-03-10T08:00:00.000Z' },
];

let incidents = [
  { id: 'inc-001', type: 'General Complaint', complainantId: 'res-001', description: 'Neighbor\'s dog is aggressive and unchained.',
    priority: 'Medium', status: 'Open', isVawc: false, barangay: 'Barangay 1 (Poblacion)',
    filedBy: 'sec-001', filedAt: '2024-04-01T09:00:00.000Z', updatedAt: '2024-04-01T09:00:00.000Z' },
  { id: 'inc-002', type: 'VAWC', complainantId: 'res-007', description: '[RESTRICTED — VAWC CASE]',
    priority: 'High', status: 'Under Investigation', isVawc: true, barangay: 'Dalahican',
    filedBy: 'sec-001', filedAt: '2024-04-08T14:00:00.000Z', updatedAt: '2024-04-08T14:00:00.000Z' },
];

let assets = [
  { id: 'ast-001', name: 'Multi-Purpose Hall', type: 'Building', description: 'Main barangay hall used for assemblies and events.',
    condition: 'Good', acquisitionDate: '2010-06-01', estimatedValue: 2500000,
    location: 'Brgy. Hall Compound', barangay: 'Barangay 1 (Poblacion)', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'ast-002', name: 'Barangay Patrol Motorcycle 1', type: 'Vehicle', description: 'Honda XRM used by Tanod patrol team.',
    condition: 'Fair', acquisitionDate: '2018-03-15', estimatedValue: 65000,
    location: 'Barangay Hall Garage', barangay: 'Barangay 1 (Poblacion)', createdAt: '2024-01-01T00:00:00.000Z' },
];

let drrmPlans = [
  { id: 'drrm-001', title: 'Flood Response Plan 2024', type: 'Flood', description: 'Action plan for flood response specific to low-lying areas of the barangay.',
    evacuationSite: 'Mamburao National High School', contactPerson: 'Brgy. Captain dela Cruz',
    contactNumber: '09171234567', lastUpdated: '2024-01-10', barangay: 'Barangay 1 (Poblacion)', createdAt: '2024-01-10T00:00:00.000Z' },
];

let gadPrograms = [
  { id: 'gad-001', title: 'Women\'s Livelihood Program', type: 'Livelihood', description: 'Monthly livelihood training for women in the barangay.',
    budget: 50000, beneficiaryCount: 25, status: 'Active', startDate: '2024-01-01', endDate: '2024-12-31',
    barangay: 'Barangay 1 (Poblacion)', createdAt: '2024-01-01T00:00:00.000Z' },
];

let dssLogs = [];
let syncQueue = [];

const admin = require('firebase-admin');

// Initialize Firebase App
let credential;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // For Cloud Deployment (Railway/Render/etc)
    credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
  } else {
    // For Local Development
    const serviceAccount = require('../../serviceAccountKey.json');
    credential = admin.credential.cert(serviceAccount);
  }
} catch (err) {
  console.warn('[Firebase] Warning: Could not initialize Firebase Credential. Ensure FIREBASE_SERVICE_ACCOUNT env is set or serviceAccountKey.json exists.');
}

if (credential) {
  admin.initializeApp({
    credential: credential,
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://lguss-mamburao-default-rtdb.firebaseio.com"
  });
}

const firestore = admin.firestore();

async function syncToFirebase(collection, record) {
  try {
    const docRef = firestore.collection(collection).doc(record.id);
    await docRef.set({ ...record, collectionType: collection }, { merge: true });
    console.log(`[Firebase] Successfully synced ${record.id} to Firestore collection '${collection}'!`);
  } catch (err) {
    console.error(`[Firebase] Sync Error for ${record.id}:`, err.message);
  }
}

async function deleteFromFirebase(collection, id) {
  try {
    const docRef = firestore.collection(collection).doc(id);
    await docRef.delete();
    console.log(`[Firebase] Successfully removed ${id} from Firestore!`);
  } catch (err) {
    console.error(`[Firebase] Delete Error for ${id}:`, err.message);
  }
}

const db = {
  users, households, residents, cases, certifications,
  legislation, incidents, assets, drrmPlans, gadPrograms,
  dssLogs, syncQueue,

  findById:    (collection, id)     => db[collection].find((r) => r.id === id),
  findByEmail: (email)              => users.find((u) => u.email === email),
  
  insert: (collection, record) => {
    const newRecord = { ...record, id: record.id || uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    db[collection].push(newRecord);
    syncToFirebase(collection, newRecord); // LIVE FIREBASE SYNC
    return newRecord;
  },
  
  update: (collection, id, updates) => {
    const idx = db[collection].findIndex((r) => r.id === id);
    if (idx === -1) return null;
    db[collection][idx] = { ...db[collection][idx], ...updates, updatedAt: new Date().toISOString() };
    syncToFirebase(collection, db[collection][idx]); // LIVE FIREBASE SYNC
    return db[collection][idx];
  },
  
  delete: (collection, id) => {
    const idx = db[collection].findIndex((r) => r.id === id);
    if (idx === -1) return false;
    db[collection].splice(idx, 1);
    deleteFromFirebase(collection, id); // LIVE FIREBASE SYNC
    return true;
  },
};

// INITIAL SEED - Let's seed the mock data into Firestore immediately when server starts
setTimeout(() => {
  console.log('[Firebase] Seeding mock data into live Firestore database...');
  Object.keys(db).forEach(key => {
    if (Array.isArray(db[key])) {
      db[key].forEach(record => syncToFirebase(key, record));
    }
  });
}, 2000);

module.exports = db;
// forced restart for CouchDB seeder
