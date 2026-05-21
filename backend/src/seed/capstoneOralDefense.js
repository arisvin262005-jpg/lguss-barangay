/**
 * Capstone / Pre-Oral Defense — unified demo dataset
 * Primary demo barangay: Barangay 1 (Poblacion)
 * Admin sees ALL records; Secretary sees the same Brgy 1 subset (role filter).
 */

const DEMO_BRGY = 'Barangay 1 (Poblacion)';
const PW = '$2b$10$nFuqh2ND7ldyaT1tg2d3P.TpuIdzxvKd7/8IG4GtYBOG3472xC.8.'; // password123

const iso = (y, m, d) => new Date(y, m - 1, d).toISOString();

function buildCapstoneDataset() {
  const households = [
    { id: 'hh-b1-001', householdNumber: 'HH-B1-001', address: '12 Rizal St, Purok 1', purok: 'Purok 1', zone: 'Zone A', barangay: DEMO_BRGY, houseType: 'Concrete', toiletFacility: 'Water Sealed', waterSource: 'MCWD', electricity: true, headId: 'res-b1-001', memberCount: 5, createdAt: iso(2023, 1, 10) },
    { id: 'hh-b1-002', householdNumber: 'HH-B1-002', address: '45 Mabini St, Purok 2', purok: 'Purok 2', zone: 'Zone A', barangay: DEMO_BRGY, houseType: 'Semi-Concrete', toiletFacility: 'Water Sealed', waterSource: 'Deep Well', electricity: true, headId: 'res-b1-002', memberCount: 4, createdAt: iso(2023, 2, 5) },
    { id: 'hh-b1-003', householdNumber: 'HH-B1-003', address: '8 Bonifacio St, Purok 3', purok: 'Purok 3', zone: 'Zone B', barangay: DEMO_BRGY, houseType: 'Light Materials', toiletFacility: 'Open Pit', waterSource: 'Deep Well', electricity: false, headId: 'res-b1-006', memberCount: 6, createdAt: iso(2023, 4, 12) },
    { id: 'hh-b1-004', householdNumber: 'HH-B1-004', address: '22 Luna St, Purok 4', purok: 'Purok 4', zone: 'Zone B', barangay: DEMO_BRGY, houseType: 'Wood', toiletFacility: 'Water Sealed', waterSource: 'Spring', electricity: true, headId: 'res-b1-007', memberCount: 3, createdAt: iso(2023, 6, 1) },
    { id: 'hh-b2-001', householdNumber: 'HH-B2-001', address: '3 Quezon Ave', purok: 'Purok 1', zone: 'Zone A', barangay: 'Barangay 2 (Poblacion)', houseType: 'Concrete', toiletFacility: 'Water Sealed', waterSource: 'MCWD', electricity: true, headId: 'res-b2-001', memberCount: 4, createdAt: iso(2023, 3, 8) },
    { id: 'hh-pay-001', householdNumber: 'HH-PAY-001', address: 'Payompon Centro', purok: 'Centro', zone: 'Zone A', barangay: 'Payompon', houseType: 'Semi-Concrete', toiletFacility: 'Water Sealed', waterSource: 'Deep Well', electricity: true, headId: 'res-pay-001', memberCount: 5, createdAt: iso(2023, 5, 20) },
  ];

  const residents = [
    { id: 'res-b1-001', firstName: 'Ana', lastName: 'Ramos', middleName: 'Cruz', birthDate: '1990-05-12', gender: 'Female', civilStatus: 'Married', address: '12 Rizal St, Purok 1', barangay: DEMO_BRGY, contactNumber: '09171234001', occupation: 'Teacher', monthlyIncome: 22000, householdId: 'hh-b1-001', relationToHead: 'Head', tags: { voter: true, senior: false, pwd: false, fourPs: false, soloPar: false, ip: false }, precinctNo: 'P-101', createdAt: iso(2024, 1, 5) },
    { id: 'res-b1-002', firstName: 'Carlos', lastName: 'Magno', birthDate: '1985-08-22', gender: 'Male', civilStatus: 'Married', address: '45 Mabini St, Purok 2', barangay: DEMO_BRGY, contactNumber: '09171234002', occupation: 'Driver', monthlyIncome: 12000, householdId: 'hh-b1-002', relationToHead: 'Head', tags: { voter: true, senior: false, pwd: false, fourPs: true, soloPar: false, ip: false }, precinctNo: 'P-102', createdAt: iso(2024, 1, 8) },
    { id: 'res-b1-003', firstName: 'Lourdes', lastName: 'Santos', birthDate: '1958-03-18', gender: 'Female', civilStatus: 'Widowed', address: '45 Mabini St, Purok 2', barangay: DEMO_BRGY, contactNumber: '09171234003', occupation: 'Vendor', monthlyIncome: 5000, householdId: 'hh-b1-002', relationToHead: 'Mother', tags: { voter: true, senior: true, pwd: false, fourPs: true, soloPar: true, ip: false }, oscaId: 'OSCA-B1-003', createdAt: iso(2024, 1, 10) },
    { id: 'res-b1-004', firstName: 'Jose', lastName: 'Mendoza', birthDate: '1995-11-02', gender: 'Male', civilStatus: 'Single', address: '12 Rizal St, Purok 1', barangay: DEMO_BRGY, contactNumber: '09171234004', occupation: 'Construction Worker', monthlyIncome: 15000, householdId: 'hh-b1-001', relationToHead: 'Son', tags: { voter: true, senior: false, pwd: true, fourPs: false, soloPar: false, ip: false }, pwdId: 'PWD-B1-004', disabilityType: 'Physical — lower limb', createdAt: iso(2024, 2, 1) },
    { id: 'res-b1-005', firstName: 'Ricardo', lastName: 'Dela Cruz', birthDate: '1982-07-30', gender: 'Male', civilStatus: 'Married', address: '18 Aguinaldo St', barangay: DEMO_BRGY, contactNumber: '09171234005', occupation: 'Fisherman', monthlyIncome: 9000, householdId: null, relationToHead: 'Head', tags: { voter: true, senior: false, pwd: false, fourPs: false, soloPar: false, ip: false }, createdAt: iso(2024, 2, 15) },
    { id: 'res-b1-006', firstName: 'Maria', lastName: 'Flores', birthDate: '1988-12-05', gender: 'Female', civilStatus: 'Single', address: '8 Bonifacio St, Purok 3', barangay: DEMO_BRGY, contactNumber: '09171234006', occupation: 'Housekeeper', monthlyIncome: 7000, householdId: 'hh-b1-003', relationToHead: 'Head', tags: { voter: true, senior: false, pwd: false, fourPs: true, soloPar: true, ip: false }, createdAt: iso(2024, 3, 1) },
    { id: 'res-b1-007', firstName: 'Pedro', lastName: 'Garcia', birthDate: '1955-01-20', gender: 'Male', civilStatus: 'Married', address: '22 Luna St, Purok 4', barangay: DEMO_BRGY, contactNumber: '09171234007', occupation: 'Retired', monthlyIncome: 4000, householdId: 'hh-b1-004', relationToHead: 'Head', tags: { voter: true, senior: true, pwd: false, fourPs: false, soloPar: false, ip: false }, oscaId: 'OSCA-B1-007', createdAt: iso(2024, 3, 10) },
    { id: 'res-b1-008', firstName: 'Jenny', lastName: 'Navarro', birthDate: '1992-06-14', gender: 'Female', civilStatus: 'Married', address: '30 Del Pilar St', barangay: DEMO_BRGY, contactNumber: '09171234008', occupation: 'Nurse', monthlyIncome: 28000, householdId: 'hh-b1-001', relationToHead: 'Spouse', tags: { voter: true, senior: false, pwd: false, fourPs: false, soloPar: false, ip: false }, createdAt: iso(2024, 4, 5) },
    { id: 'res-b1-009', firstName: 'Antonio', lastName: 'Reyes', birthDate: '2000-09-09', gender: 'Male', civilStatus: 'Single', address: '8 Bonifacio St, Purok 3', barangay: DEMO_BRGY, contactNumber: '09171234009', occupation: 'Student', monthlyIncome: 0, householdId: 'hh-b1-003', relationToHead: 'Son', tags: { voter: false, senior: false, pwd: false, fourPs: true, soloPar: false, ip: false }, createdAt: iso(2024, 5, 1) },
    { id: 'res-b1-010', firstName: 'Rosa', lastName: 'Villanueva', birthDate: '1975-04-25', gender: 'Female', civilStatus: 'Married', address: '55 MacArthur Hwy', barangay: DEMO_BRGY, contactNumber: '09171234010', occupation: 'Sari-sari Store Owner', monthlyIncome: 11000, householdId: null, relationToHead: 'Head', tags: { voter: true, senior: false, pwd: false, fourPs: false, soloPar: false, ip: true }, createdAt: iso(2024, 6, 12) },
    { id: 'res-b2-001', firstName: 'Elena', lastName: 'Torres', birthDate: '1991-02-11', gender: 'Female', civilStatus: 'Married', address: '3 Quezon Ave', barangay: 'Barangay 2 (Poblacion)', contactNumber: '09181234001', occupation: 'Clerk', monthlyIncome: 18000, householdId: 'hh-b2-001', relationToHead: 'Head', tags: { voter: true, senior: false, pwd: false, fourPs: false, soloPar: false, ip: false }, createdAt: iso(2024, 2, 20) },
    { id: 'res-b2-002', firstName: 'Mark', lastName: 'Bautista', birthDate: '1980-10-08', gender: 'Male', civilStatus: 'Single', address: '14 Burgos St', barangay: 'Barangay 2 (Poblacion)', contactNumber: '09181234002', occupation: 'Mechanic', monthlyIncome: 14000, householdId: null, relationToHead: 'Head', tags: { voter: true, senior: false, pwd: false, fourPs: false, soloPar: false, ip: false }, createdAt: iso(2024, 3, 15) },
    { id: 'res-pay-001', firstName: 'Helen', lastName: 'Castillo', birthDate: '1962-08-03', gender: 'Female', civilStatus: 'Widowed', address: 'Payompon Centro', barangay: 'Payompon', contactNumber: '09191234001', occupation: 'Farmer', monthlyIncome: 6000, householdId: 'hh-pay-001', relationToHead: 'Head', tags: { voter: true, senior: true, pwd: false, fourPs: true, soloPar: true, ip: false }, createdAt: iso(2024, 4, 1) },
    { id: 'res-bal-001', firstName: 'Francisco', lastName: 'Lim', birthDate: '1970-12-12', gender: 'Male', civilStatus: 'Married', address: 'Balansay Proper', barangay: 'Balansay', contactNumber: '09201234001', occupation: 'Fisherman', monthlyIncome: 10000, householdId: null, relationToHead: 'Head', tags: { voter: true, senior: false, pwd: false, fourPs: false, soloPar: false, ip: false }, createdAt: iso(2024, 5, 20) },
  ];

  const cases = [
    { id: 'case-b1-001', caseNumber: 'KP-2025-001', complainantId: 'res-b1-001', respondentId: 'res-b1-005', caseType: 'Land Dispute', description: 'Boundary dispute along shared fence.', status: 'Under Mediation', filedDate: '2025-01-10', hearingDate: '2025-05-15', hearingTime: '09:00', hearingVenue: 'Barangay Hall', barangay: DEMO_BRGY, createdAt: iso(2025, 1, 10) },
    { id: 'case-b1-002', caseNumber: 'KP-2025-002', complainantId: 'res-b1-002', respondentId: 'res-b1-005', caseType: 'Physical Injury', description: 'Altercation after traffic incident.', status: 'Filed', filedDate: '2025-02-05', hearingDate: '2025-05-20', hearingTime: '10:00', hearingVenue: 'Barangay Hall', barangay: DEMO_BRGY, createdAt: iso(2025, 2, 5) },
    { id: 'case-b1-003', caseNumber: 'KP-2024-018', complainantId: 'res-b1-008', respondentId: 'res-b1-005', caseType: 'Oral Defamation', description: 'Repeated verbal harassment in public.', status: 'Settled', filedDate: '2024-08-12', hearingDate: '2024-09-01', hearingTime: '14:00', hearingVenue: 'Barangay Hall', barangay: DEMO_BRGY, createdAt: iso(2024, 8, 12) },
    { id: 'case-b1-004', caseNumber: 'KP-2025-003', complainantId: 'res-b1-006', respondentId: 'res-b1-010', caseType: 'Unjust Vexation', description: 'Neighbor noise and property damage.', status: 'Mediation Scheduled', filedDate: '2025-03-01', hearingDate: '2025-05-25', hearingTime: '13:00', hearingVenue: 'Barangay Hall', barangay: DEMO_BRGY, createdAt: iso(2025, 3, 1) },
    { id: 'case-b1-005', caseNumber: 'KP-2024-022', complainantId: 'res-b1-004', respondentId: 'res-b1-002', caseType: 'Collection of Sum of Money', description: 'Unpaid personal loan.', status: 'Settled', filedDate: '2024-10-20', hearingDate: '2024-11-15', hearingTime: '09:30', hearingVenue: 'Barangay Hall', barangay: DEMO_BRGY, createdAt: iso(2024, 10, 20) },
    { id: 'case-b1-006', caseNumber: 'KP-2025-004', complainantId: 'res-b1-007', respondentId: 'res-b1-005', caseType: 'Ejectment', description: 'Refusal to vacate rented space.', status: 'Escalated to Court', filedDate: '2024-12-01', hearingDate: '2025-01-20', hearingTime: '08:00', hearingVenue: 'Barangay Hall', barangay: DEMO_BRGY, createdAt: iso(2024, 12, 1) },
    { id: 'case-b2-001', caseNumber: 'KP-2025-010', complainantId: 'res-b2-001', respondentId: 'res-b2-002', caseType: 'Threats', description: 'Workplace-related threats.', status: 'Under Mediation', filedDate: '2025-02-18', hearingDate: '2025-05-28', hearingTime: '11:00', hearingVenue: 'Brgy 2 Hall', barangay: 'Barangay 2 (Poblacion)', createdAt: iso(2025, 2, 18) },
    { id: 'case-pay-001', caseNumber: 'KP-2025-015', complainantId: 'res-pay-001', respondentId: 'res-bal-001', caseType: 'Boundary Dispute', description: 'Agricultural lot boundary issue.', status: 'Filed', filedDate: '2025-04-02', hearingDate: '2025-06-01', hearingTime: '09:00', hearingVenue: 'Payompon Hall', barangay: 'Payompon', createdAt: iso(2025, 4, 2) },
  ];

  const certifications = [
    { id: 'cert-b1-001', residentId: 'res-b1-001', certType: 'Barangay Clearance', purpose: 'Employment — DILG Field Office', status: 'Released', orNumber: 'OR-2025-001', issuedBy: 'sec-001', dssDecision: 'Approve', issuedAt: iso(2025, 1, 15), barangay: DEMO_BRGY, createdAt: iso(2025, 1, 14) },
    { id: 'cert-b1-002', residentId: 'res-b1-002', certType: 'Barangay Clearance', purpose: 'Business Permit', status: 'Released', orNumber: 'OR-2025-002', issuedBy: 'sec-001', dssDecision: 'Approve', issuedAt: iso(2025, 2, 10), barangay: DEMO_BRGY, createdAt: iso(2025, 2, 9) },
    { id: 'cert-b1-003', residentId: 'res-b1-003', certType: 'Certificate of Indigency', purpose: 'Medical Assistance', status: 'Released', orNumber: 'OR-2025-003', issuedBy: 'sec-001', dssDecision: 'Approve', issuedAt: iso(2025, 2, 20), barangay: DEMO_BRGY, createdAt: iso(2025, 2, 19) },
    { id: 'cert-b1-004', residentId: 'res-b1-004', certType: 'Barangay Clearance', purpose: 'Job Application', status: 'Released', orNumber: 'OR-2025-004', issuedBy: 'sec-001', dssDecision: 'Approve', issuedAt: iso(2025, 3, 5), barangay: DEMO_BRGY, createdAt: iso(2025, 3, 4) },
    { id: 'cert-b1-005', residentId: 'res-b1-005', certType: 'Barangay Clearance', purpose: 'Police Clearance Supporting', status: 'On Hold', orNumber: null, issuedBy: 'sec-001', dssDecision: 'Hold', issuedAt: null, barangay: DEMO_BRGY, createdAt: iso(2025, 3, 18) },
    { id: 'cert-b1-006', residentId: 'res-b1-006', certType: 'Certificate of Residency', purpose: 'School Enrollment', status: 'Released', orNumber: 'OR-2025-005', issuedBy: 'sec-001', dssDecision: 'Approve', issuedAt: iso(2025, 4, 8), barangay: DEMO_BRGY, createdAt: iso(2025, 4, 7) },
    { id: 'cert-b1-007', residentId: 'res-b1-007', certType: 'Certificate of Indigency', purpose: 'OSCA Benefits', status: 'Released', orNumber: 'OR-2025-006', issuedBy: 'sec-001', dssDecision: 'Approve', issuedAt: iso(2025, 4, 22), barangay: DEMO_BRGY, createdAt: iso(2025, 4, 21) },
    { id: 'cert-b1-008', residentId: 'res-b1-008', certType: 'Barangay Clearance', purpose: 'Travel Abroad', status: 'Pending', orNumber: null, issuedBy: 'sec-001', dssDecision: 'Pending', issuedAt: null, barangay: DEMO_BRGY, createdAt: iso(2025, 5, 1) },
    { id: 'cert-b1-009', residentId: 'res-b1-001', certType: 'Certificate of Good Moral', purpose: 'Scholarship', status: 'Released', orNumber: 'OR-2024-120', issuedBy: 'sec-001', dssDecision: 'Approve', issuedAt: iso(2024, 11, 5), barangay: DEMO_BRGY, createdAt: iso(2024, 11, 4) },
    { id: 'cert-b1-010', residentId: 'res-b1-010', certType: 'Barangay Clearance', purpose: 'Maynilad Application', status: 'Released', orNumber: 'OR-2024-135', issuedBy: 'sec-001', dssDecision: 'Approve', issuedAt: iso(2024, 12, 12), barangay: DEMO_BRGY, createdAt: iso(2024, 12, 11) },
    { id: 'cert-b2-001', residentId: 'res-b2-001', certType: 'Barangay Clearance', purpose: 'Employment', status: 'Released', orNumber: 'OR-B2-2025-01', issuedBy: 'sec-002', dssDecision: 'Approve', issuedAt: iso(2025, 3, 12), barangay: 'Barangay 2 (Poblacion)', createdAt: iso(2025, 3, 11) },
  ];

  const legislation = [
    { id: 'leg-b1-001', type: 'Ordinance', number: 'BO-2025-001', title: 'Anti-Noise Ordinance (Poblacion)', description: 'Regulates excessive noise during night hours.', dateEnacted: '2025-01-20', author: 'Kgd. Reyes', status: 'Active', barangay: DEMO_BRGY, createdAt: iso(2025, 1, 20) },
    { id: 'leg-b1-002', type: 'Resolution', number: 'BR-2025-003', title: 'Youth Skills Training Resolution', description: 'Endorses TESDA skills training for out-of-school youth.', dateEnacted: '2025-03-05', author: 'SK Chair', status: 'Active', barangay: DEMO_BRGY, createdAt: iso(2025, 3, 5) },
    { id: 'leg-b1-003', type: 'Executive Order', number: 'BEO-2025-001', title: 'Curfew for Minors', description: '10PM–4AM curfew for residents below 18.', dateEnacted: '2025-02-01', author: 'Brgy. Captain', status: 'Active', barangay: DEMO_BRGY, createdAt: iso(2025, 2, 1) },
  ];

  const incidents = [
    { id: 'inc-b1-001', type: 'General Complaint', complainantId: 'res-b1-001', description: 'Stray dogs near elementary school.', priority: 'Medium', status: 'Open', isVawc: false, barangay: DEMO_BRGY, filedBy: 'sec-001', filedAt: iso(2025, 4, 1) },
    { id: 'inc-b1-002', type: 'Theft', complainantId: 'res-b1-002', description: 'Reported theft of fishing gear.', priority: 'High', status: 'Under Investigation', isVawc: false, barangay: DEMO_BRGY, filedBy: 'sec-001', filedAt: iso(2025, 4, 10) },
    { id: 'inc-b1-003', type: 'VAWC', complainantId: 'res-b1-006', description: '[RESTRICTED — VAWC CASE]', priority: 'Critical', status: 'Referred to SWDO', isVawc: true, barangay: DEMO_BRGY, filedBy: 'sec-001', filedAt: iso(2025, 3, 22) },
    { id: 'inc-b1-004', type: 'Public Disturbance', complainantId: 'res-b1-008', description: 'Loud sound system past midnight.', priority: 'Low', status: 'Resolved', isVawc: false, barangay: DEMO_BRGY, filedBy: 'sec-001', filedAt: iso(2025, 2, 14) },
    { id: 'inc-b2-001', type: 'Traffic', complainantId: 'res-b2-001', description: 'Illegal parking blocking alley.', priority: 'Medium', status: 'Open', isVawc: false, barangay: 'Barangay 2 (Poblacion)', filedBy: 'sec-002', filedAt: iso(2025, 4, 5) },
    { id: 'inc-pay-001', type: 'Flood Hazard', complainantId: 'res-pay-001', description: 'Creek overflow during heavy rain.', priority: 'High', status: 'Monitoring', isVawc: false, barangay: 'Payompon', filedBy: 'sec-009', filedAt: iso(2025, 5, 2) },
  ];

  const assets = [
    { id: 'ast-b1-001', name: 'Barangay Multi-Purpose Hall', type: 'Building', description: 'Main assembly and KP hearing venue.', condition: 'Good', acquisitionDate: '2010-06-01', estimatedValue: 2800000, location: 'Brgy. Hall Compound', barangay: DEMO_BRGY, createdAt: iso(2024, 1, 1) },
    { id: 'ast-b1-002', name: 'Patrol Motorcycle — Tanod 1', type: 'Vehicle', description: 'Honda XRM patrol unit.', condition: 'Fair', acquisitionDate: '2019-03-15', estimatedValue: 72000, location: 'Garage', barangay: DEMO_BRGY, createdAt: iso(2024, 1, 1) },
    { id: 'ast-b1-003', name: 'Desktop Computer Set (DILG)', type: 'Equipment', description: 'CRPS encoding workstation.', condition: 'Good', acquisitionDate: '2023-08-01', estimatedValue: 45000, location: 'Secretary Office', barangay: DEMO_BRGY, createdAt: iso(2024, 1, 1) },
  ];

  const drrmPlans = [
    { id: 'drrm-b1-001', title: 'Flood Response & Evacuation Plan 2025', type: 'Flood', description: 'Covers Purok 3 low-lying zones.', evacuationSite: 'Mamburao Central School', contactPerson: 'Brgy. Captain', contactNumber: '09170001111', lastUpdated: '2025-01-15', barangay: DEMO_BRGY, createdAt: iso(2025, 1, 15) },
    { id: 'drrm-b1-002', title: 'Fire Response Quick Reference', type: 'Fire', description: 'Fire bucket brigade and contact tree.', evacuationSite: 'Open field — Plaza', contactPerson: 'Tanod Commander', contactNumber: '09170002222', lastUpdated: '2025-02-01', barangay: DEMO_BRGY, createdAt: iso(2025, 2, 1) },
  ];

  const gadPrograms = [
    { id: 'gad-b1-001', title: 'Women\'s Livelihood & Skills Program', type: 'Livelihood', description: 'Soap-making and food processing training.', budget: 75000, beneficiaryCount: 35, status: 'Active', startDate: '2025-01-01', endDate: '2025-12-31', barangay: DEMO_BRGY, createdAt: iso(2025, 1, 1) },
    { id: 'gad-b1-002', title: 'VAWC Survivor Support Referral', type: 'Protection', description: 'Counseling and legal referral with SWDO.', budget: 30000, beneficiaryCount: 8, status: 'Active', startDate: '2025-03-01', endDate: '2025-12-31', barangay: DEMO_BRGY, createdAt: iso(2025, 3, 1) },
  ];

  const dssLogs = [
    { id: 'dss-001', residentId: 'res-b1-005', certType: 'Barangay Clearance', decision: 'Hold', reason: 'Active KP cases as respondent — requires settlement first.', flags: ['REPEAT_RESPONDENT', 'ACTIVE_CASE'], createdAt: iso(2025, 3, 18) },
    { id: 'dss-002', residentId: 'res-b1-001', certType: 'Barangay Clearance', decision: 'Approve', reason: 'No outstanding case record.', flags: [], createdAt: iso(2025, 1, 14) },
    { id: 'dss-003', residentId: 'res-b1-003', certType: 'Certificate of Indigency', decision: 'Approve', reason: 'Senior + 4Ps verified in registry.', flags: ['SENIOR', '4PS'], createdAt: iso(2025, 2, 19) },
  ];

  const extraUsers = [
    { id: 'demo-admin', firstName: 'System', lastName: 'Administrator', email: 'admin@barangay.gov.ph', password: PW, barangay: 'LGU Mamburao', role: 'Admin', isVerified: true, createdAt: iso(2024, 1, 1) },
    { id: 'demo-sec', firstName: 'Barangay', lastName: 'Secretary', email: 'secretary@barangay.gov.ph', password: PW, barangay: DEMO_BRGY, role: 'Secretary', isVerified: true, createdAt: iso(2024, 1, 1) },
  ];

  return {
    users: extraUsers,
    households,
    residents,
    cases,
    certifications,
    legislation,
    incidents,
    assets,
    drrmPlans,
    gadPrograms,
    dssLogs,
  };
}

function mergeUsers(existing, incoming) {
  const byEmail = new Map(existing.map((u) => [(u.email || '').toLowerCase(), u]));
  incoming.forEach((u) => {
    const key = (u.email || '').toLowerCase();
    if (!byEmail.has(key)) {
      existing.push(u);
      byEmail.set(key, u);
    }
  });
  return existing;
}

function applyCapstoneSeed(db, saveFn) {
  const seed = buildCapstoneDataset();
  const collections = [
    'households', 'residents', 'cases', 'certifications', 'legislation',
    'incidents', 'assets', 'drrmPlans', 'gadPrograms', 'dssLogs',
  ];
  collections.forEach((col) => {
    if (Array.isArray(seed[col])) db[col] = seed[col];
  });
  db.users = mergeUsers(db.users || [], seed.users);
  if (typeof saveFn === 'function') saveFn();
  const b1 = db.residents.filter((r) => r.barangay === DEMO_BRGY).length;
  console.log(`[Capstone Seed] ✅ Oral defense demo data loaded (${db.residents.length} residents, ${b1} in ${DEMO_BRGY})`);
}

module.exports = { applyCapstoneSeed, buildCapstoneDataset, DEMO_BRGY };
