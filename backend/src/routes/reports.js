const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getMonthlyCertReport, getCaseSummary,
  getResidentMasterlist, getSyncReport, getTimeSavedReport, getDuplicateCaseReport,
  // Predictive Forecasting
  getServiceDemandForecast, getDemographicTrendsForecast, getIncidentHotspotForecast,
  getHealthRiskForecast, getCalamityVulnerabilityForecast,
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

// ── Predictive Forecasting Routes ──
router.get('/forecast/service-demand',         getServiceDemandForecast);
router.get('/forecast/demographic-trends',     getDemographicTrendsForecast);
router.get('/forecast/incident-hotspots',      getIncidentHotspotForecast);
router.get('/forecast/health-risk',            getHealthRiskForecast);
router.get('/forecast/calamity-vulnerability', getCalamityVulnerabilityForecast);

module.exports = router;
