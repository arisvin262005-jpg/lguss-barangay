#!/usr/bin/env node
/** Writes capstone seed into backend/data/local_db.json */
const fs = require('fs');
const path = require('path');
const { buildCapstoneDataset } = require('../src/seed/capstoneOralDefense');

const PW = '$2b$10$nFuqh2ND7ldyaT1tg2d3P.TpuIdzxvKd7/8IG4GtYBOG3472xC.8.';
const seed = buildCapstoneDataset();

const users = [
  { id: 'admin-001', firstName: 'CRPS', lastName: 'Administrator', email: 'admin@mamburao.gov.ph', password: PW, barangay: 'LGU Mamburao', role: 'Admin', isVerified: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'demo-admin', firstName: 'System', lastName: 'Administrator', email: 'admin@barangay.gov.ph', password: PW, barangay: 'LGU Mamburao', role: 'Admin', isVerified: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'demo-sec', firstName: 'Barangay', lastName: 'Secretary', email: 'secretary@barangay.gov.ph', password: PW, barangay: 'Barangay 1 (Poblacion)', role: 'Secretary', isVerified: true, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'sec-001', firstName: 'Monica', lastName: 'Robles', email: 'brgy1@mamburao.gov.ph', password: PW, barangay: 'Barangay 1 (Poblacion)', role: 'Secretary', isVerified: true, createdAt: '2024-01-01T00:00:00.000Z' },
  ...seed.users.filter((u) => !['admin@barangay.gov.ph', 'secretary@barangay.gov.ph'].includes(u.email)),
];

const out = {
  users,
  households: seed.households,
  residents: seed.residents,
  cases: seed.cases,
  certifications: seed.certifications,
  legislation: seed.legislation,
  incidents: seed.incidents,
  assets: seed.assets,
  drrmPlans: seed.drrmPlans,
  gadPrograms: seed.gadPrograms,
  blockchain: [],
};

const target = path.join(__dirname, '../data/local_db.json');
fs.writeFileSync(target, JSON.stringify(out, null, 2));
console.log('Wrote', target, `(${seed.residents.length} residents)`);
