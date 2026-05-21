/**
 * Pre-seed GET cache for offline / demo login so Admin & Secretary see the same capstone sample data.
 */
const CACHE_KEY = 'lguss_get_cache';
const DEMO_BRGY = 'Barangay 1 (Poblacion)';

const brgySuffix = (user) =>
  user?.barangay ? `_${user.barangay.replace(/\s+/g, '_')}` : '';

const loadCache = () => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); }
  catch { return {}; }
};

const saveCache = (cache) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch {}
};

const setEntry = (cache, url, user, data) => {
  cache[url + brgySuffix(user)] = { data, ts: Date.now() };
};

/** Sample payloads aligned with backend capstone seed (Barangay 1 focus) */
function buildPayloads(isAdmin) {
  const residents = [
    { id: 'res-b1-001', firstName: 'Ana', lastName: 'Ramos', barangay: DEMO_BRGY, birthDate: '1990-05-12', gender: 'Female', civilStatus: 'Married', tags: { voter: true, senior: false, pwd: false, fourPs: false } },
    { id: 'res-b1-002', firstName: 'Carlos', lastName: 'Magno', barangay: DEMO_BRGY, birthDate: '1985-08-22', gender: 'Male', civilStatus: 'Married', tags: { voter: true, fourPs: true } },
    { id: 'res-b1-003', firstName: 'Lourdes', lastName: 'Santos', barangay: DEMO_BRGY, birthDate: '1958-03-18', gender: 'Female', civilStatus: 'Widowed', tags: { voter: true, senior: true, fourPs: true, soloPar: true } },
    { id: 'res-b1-004', firstName: 'Jose', lastName: 'Mendoza', barangay: DEMO_BRGY, birthDate: '1995-11-02', gender: 'Male', civilStatus: 'Single', tags: { pwd: true } },
    { id: 'res-b1-005', firstName: 'Ricardo', lastName: 'Dela Cruz', barangay: DEMO_BRGY, birthDate: '1982-07-30', gender: 'Male', civilStatus: 'Married', tags: { voter: true } },
    { id: 'res-b1-006', firstName: 'Maria', lastName: 'Flores', barangay: DEMO_BRGY, birthDate: '1988-12-05', gender: 'Female', civilStatus: 'Single', tags: { fourPs: true, soloPar: true } },
    { id: 'res-b1-007', firstName: 'Pedro', lastName: 'Garcia', barangay: DEMO_BRGY, birthDate: '1955-01-20', gender: 'Male', civilStatus: 'Married', tags: { senior: true } },
    { id: 'res-b1-008', firstName: 'Jenny', lastName: 'Navarro', barangay: DEMO_BRGY, birthDate: '1992-06-14', gender: 'Female', civilStatus: 'Married', tags: { voter: true } },
  ];
  const extraResidents = isAdmin ? [
    { id: 'res-b2-001', firstName: 'Elena', lastName: 'Torres', barangay: 'Barangay 2 (Poblacion)', birthDate: '1991-02-11', gender: 'Female', civilStatus: 'Married', tags: { voter: true } },
    { id: 'res-pay-001', firstName: 'Helen', lastName: 'Castillo', barangay: 'Payompon', birthDate: '1962-08-03', gender: 'Female', civilStatus: 'Widowed', tags: { senior: true, fourPs: true } },
  ] : [];

  const allResidents = [...residents, ...extraResidents];

  const cases = [
    { id: 'case-b1-001', caseNumber: 'KP-2025-001', complainantId: 'res-b1-001', respondentId: 'res-b1-005', caseType: 'Land Dispute', status: 'Under Mediation', barangay: DEMO_BRGY, filedDate: '2025-01-10' },
    { id: 'case-b1-002', caseNumber: 'KP-2025-002', complainantId: 'res-b1-002', respondentId: 'res-b1-005', caseType: 'Physical Injury', status: 'Filed', barangay: DEMO_BRGY, filedDate: '2025-02-05' },
    { id: 'case-b1-003', caseNumber: 'KP-2024-018', complainantId: 'res-b1-008', respondentId: 'res-b1-005', caseType: 'Oral Defamation', status: 'Settled', barangay: DEMO_BRGY, filedDate: '2024-08-12' },
    { id: 'case-b1-004', caseNumber: 'KP-2025-003', complainantId: 'res-b1-006', respondentId: 'res-b1-010', caseType: 'Unjust Vexation', status: 'Mediation Scheduled', barangay: DEMO_BRGY, filedDate: '2025-03-01' },
    ...(isAdmin ? [{ id: 'case-b2-001', caseNumber: 'KP-2025-010', caseType: 'Threats', status: 'Under Mediation', barangay: 'Barangay 2 (Poblacion)', filedDate: '2025-02-18' }] : []),
  ];

  const certs = [
    { id: 'cert-b1-001', residentId: 'res-b1-001', residentName: 'Ana Ramos', certType: 'Barangay Clearance', purpose: 'Employment', status: 'Released', barangay: DEMO_BRGY, issuedAt: '2025-01-15T00:00:00.000Z' },
    { id: 'cert-b1-002', residentId: 'res-b1-002', residentName: 'Carlos Magno', certType: 'Barangay Clearance', purpose: 'Business Permit', status: 'Released', barangay: DEMO_BRGY, issuedAt: '2025-02-10T00:00:00.000Z' },
    { id: 'cert-b1-003', residentId: 'res-b1-003', residentName: 'Lourdes Santos', certType: 'Certificate of Indigency', purpose: 'Medical', status: 'Released', barangay: DEMO_BRGY, issuedAt: '2025-02-20T00:00:00.000Z' },
    { id: 'cert-b1-005', residentId: 'res-b1-005', residentName: 'Ricardo Dela Cruz', certType: 'Barangay Clearance', purpose: 'Police Clearance', status: 'On Hold', barangay: DEMO_BRGY, issuedAt: null },
    { id: 'cert-b1-008', residentId: 'res-b1-008', residentName: 'Jenny Navarro', certType: 'Barangay Clearance', purpose: 'Travel', status: 'Pending', barangay: DEMO_BRGY, issuedAt: null },
  ];

  const households = [
    { id: 'hh-b1-001', householdNumber: 'HH-B1-001', address: '12 Rizal St', barangay: DEMO_BRGY, memberCount: 5, houseType: 'Concrete', electricity: true },
    { id: 'hh-b1-002', householdNumber: 'HH-B1-002', address: '45 Mabini St', barangay: DEMO_BRGY, memberCount: 4, houseType: 'Semi-Concrete', electricity: true },
    { id: 'hh-b1-003', householdNumber: 'HH-B1-003', address: '8 Bonifacio St', barangay: DEMO_BRGY, memberCount: 6, houseType: 'Light Materials', electricity: false },
  ];

  const dashboardStats = {
    residents: allResidents.length,
    households: isAdmin ? households.length + 2 : households.length,
    certifications: certs.length,
    pendingCerts: certs.filter((c) => c.status === 'Pending' || c.status === 'On Hold').length,
    certReleased: certs.filter((c) => c.status === 'Released').length,
    certThisMonth: 2,
    activeCases: cases.filter((c) => !['Settled', 'Dismissed'].includes(c.status)).length,
    totalCases: cases.length,
    syncSuccessRate: 100,
    pendingSync: 0,
    repeatOffenders: 1,
    caseStatus: [
      { name: 'Filed', value: cases.filter((c) => c.status === 'Filed').length },
      { name: 'Mediation', value: cases.filter((c) => ['Under Mediation', 'Mediation Scheduled'].includes(c.status)).length },
      { name: 'Settled', value: cases.filter((c) => c.status === 'Settled').length },
      { name: 'Escalated', value: 0 },
      { name: 'Dismissed', value: 0 },
    ],
    ageDistribution: [
      { group: '0-17', count: 1 }, { group: '18-35', count: 4 }, { group: '36-59', count: 2 }, { group: '60+', count: 2 },
    ],
    certsByMonth: [
      { month: 'Jan', count: 1 }, { month: 'Feb', count: 2 }, { month: 'Mar', count: 1 }, { month: 'Apr', count: 1 }, { month: 'May', count: 1 },
    ],
    recentActivity: [
      { id: 1, type: 'certification', action: 'CERT_ISSUED — Barangay Clearance', user: 'secretary@barangay.gov.ph', time: 'Today' },
      { id: 2, type: 'case', action: 'CASE_FILED — KP-2025-002', user: 'secretary@barangay.gov.ph', time: 'Yesterday' },
    ],
  };

  return {
    residents: { data: allResidents },
    cases: { data: cases },
    certifications: { data: certs },
    households: { data: households },
    dashboardStats,
    reports: {
      certs: { data: certs },
      cases: { summary: { Filed: 1, Mediation: 2, Settled: 1, Escalated: 0, Dismissed: 0 } },
      residents: { data: allResidents },
      time: { timeSavedPercent: 82.2, avgSystemProcessingMins: 8, avgManualProcessingMins: 45, totalHoursSaved: 6.2, certificationsIssued: certs.length },
      dups: { duplicateReductionRate: 67.3, repeatInvolvedParties: 1, totalResidents: allResidents.length },
    },
    ai: {
      repeatOffenders: {
        summary: { total: 1, highRisk: 1, moderate: 0, low: 0, totalCasesAnalyzed: cases.length },
        repeatOffenders: [{ displayName: 'Ricardo D***', barangay: DEMO_BRGY, totalCases: 3, activeCases: 2, riskLevel: 'HIGH' }],
        topCaseTypes: [{ type: 'Land Dispute', count: 1 }, { type: 'Physical Injury', count: 1 }],
        peakMonth: { month: 'Jan', count: 2 },
        insight: 'May 1 na repeat respondent sa Brgy 1 — nangangailangan ng mediation follow-up.',
      },
      serviceDemand: {
        peakMonths: [{ month: 'Feb', count: 2 }],
        topCertType: { type: 'Barangay Clearance', count: 4 },
        monthData: [
          { month: 'Jan', count: 1, demand: 'NORMAL' }, { month: 'Feb', count: 2, demand: 'HIGH' },
          { month: 'Mar', count: 1, demand: 'NORMAL' }, { month: 'Apr', count: 1, demand: 'NORMAL' },
          { month: 'May', count: 1, demand: 'NORMAL' },
        ],
        recommendation: 'Magdagdag ng encoding staff tuwing Pebrero — peak demand month.',
      },
      demographic: {
        current: { total: residents.length, ageGroups: { '0-17': 1, '18-35': 3, '36-59': 2, '60+': 2 }, senior: 2, pwd: 1, fourPs: 3, soloPar: 2, voter: 7 },
        projected3yr: { '0-17': 1, '18-35': 3, '36-59': 2, '60+': 3 },
        sectorGrowth: [{ sector: 'Senior Citizens', current: 2, projected: 3, growthPct: 9 }],
        insight: 'Tataas ang senior population — maglaan ng pondo para sa OSCA programs.',
      },
      hotspot: {
        zones: [
          { barangay: DEMO_BRGY, riskLevel: 'HIGH', riskScore: 12, incidentCount: 3, population: residents.length },
          { barangay: 'Barangay 2 (Poblacion)', riskLevel: 'MODERATE', riskScore: 6, incidentCount: 1, population: 2 },
          { barangay: 'Payompon', riskLevel: 'MODERATE', riskScore: 5, incidentCount: 1, population: 1 },
        ],
        topRiskZone: { barangay: DEMO_BRGY, riskScore: 12, incidentCount: 3 },
        insight: 'Brgy 1 may pinakamataas na incident score — dagdagan ang tanod visibility.',
      },
      health: {
        summary: { highRisk: 2, moderateRisk: 2 },
        outbreakRisk: { level: 'MODERATE', type: 'Dengue', season: 'Rainy Season' },
        highRiskResidents: [
          { name: 'Lourdes S.', factors: ['Senior', '4Ps'] },
          { name: 'Jose M.', factors: ['PWD'] },
        ],
        insight: '2 high-risk residents — priority for health outreach.',
      },
      calamity: {
        summary: { priority1: 1, priority2: 1, priority3: 1 },
        households: [
          { householdNumber: 'HH-B1-003', address: '8 Bonifacio St', priority: 'PRIORITY 1', flags: ['No electricity', 'Light materials'] },
          { householdNumber: 'HH-B1-002', address: '45 Mabini St', priority: 'PRIORITY 2', flags: ['Senior member'] },
        ],
        insight: '3 vulnerable households identified for evacuation planning.',
      },
    },
  };
}

export function seedOfflineDemoCache(user) {
  if (!user) return;
  const cache = loadCache();
  const isAdmin = user.role === 'Admin';
  const p = buildPayloads(isAdmin);

  setEntry(cache, '/residents', user, p.residents);
  setEntry(cache, '/cases', user, p.cases);
  setEntry(cache, '/certifications', user, p.certifications);
  setEntry(cache, '/households', user, p.households);
  setEntry(cache, '/reports/dashboard-stats', user, p.dashboardStats);
  setEntry(cache, '/reports/sync', user, { successRate: 98.2, cached: 24, pending: 0 });
  setEntry(cache, '/reports/certifications', user, p.reports.certs);
  setEntry(cache, '/reports/cases', user, p.reports.cases);
  setEntry(cache, '/reports/residents', user, p.reports.residents);
  setEntry(cache, '/reports/time-saved', user, p.reports.time);
  setEntry(cache, '/reports/duplicates', user, p.reports.dups);
  setEntry(cache, '/reports/forecast/repeat-offenders', user, p.ai.repeatOffenders);
  setEntry(cache, '/reports/forecast/service-demand', user, p.ai.serviceDemand);
  setEntry(cache, '/reports/forecast/demographic-trends', user, p.ai.demographic);
  setEntry(cache, '/reports/forecast/incident-hotspots', user, p.ai.hotspot);
  setEntry(cache, '/reports/forecast/health-risk', user, p.ai.health);
  setEntry(cache, '/reports/forecast/calamity-vulnerability', user, p.ai.calamity);

  saveCache(cache);
}
