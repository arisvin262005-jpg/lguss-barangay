const express = require('express');
const router = express.Router();
const { getDashboardStats, getMonthlyCertReport, getCaseSummary, getResidentMasterlist, getSyncReport, getTimeSavedReport, getDuplicateCaseReport } = require('../controllers/reportsController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/dashboard-stats', getDashboardStats);
router.get('/certifications', getMonthlyCertReport);
router.get('/cases', getCaseSummary);
router.get('/residents', getResidentMasterlist);
router.get('/sync', getSyncReport);
router.get('/time-saved', getTimeSavedReport);
router.get('/duplicates', getDuplicateCaseReport);

module.exports = router;
