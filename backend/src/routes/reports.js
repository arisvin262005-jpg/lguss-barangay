const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getMonthlyCertReport, getCaseSummary,
  getResidentMasterlist, getSyncReport, getTimeSavedReport, getDuplicateCaseReport,
  getBarangayCaseRoster,
  getServiceDemandForecast, getDemographicTrendsForecast, getIncidentHotspotForecast,
  getHealthRiskForecast, getCalamityVulnerabilityForecast,
  getRepeatOffenderAnalysis,
} = require('../controllers/reportsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/dashboard-stats', getDashboardStats);
router.get('/certifications', getMonthlyCertReport);
router.get('/cases', getCaseSummary);
router.get('/residents', getResidentMasterlist);
router.get('/sync', getSyncReport);
router.get('/time-saved', getTimeSavedReport);
router.get('/duplicates', getDuplicateCaseReport);

// System-wide Barangay Case Roster with Risk Scoring
router.get('/barangay-case-roster', getBarangayCaseRoster);

// Statistical Forecasting — Rule-Based Decision Support System (DSS)
router.get('/forecast/service-demand',         getServiceDemandForecast);
router.get('/forecast/demographic-trends',     getDemographicTrendsForecast);
router.get('/forecast/incident-hotspots',      getIncidentHotspotForecast);
router.get('/forecast/health-risk',            getHealthRiskForecast);
router.get('/forecast/calamity-vulnerability', getCalamityVulnerabilityForecast);

// Pattern Detection — Repeat Offender Analysis (Panel Requirement)
router.get('/forecast/repeat-offenders',       getRepeatOffenderAnalysis);

module.exports = router;

