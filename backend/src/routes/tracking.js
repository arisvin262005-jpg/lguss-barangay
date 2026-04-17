const express = require('express');
const router = express.Router();
const { getAllLocations, updateLocation, addIncident, getIncidents } = require('../controllers/trackingController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/locations', getAllLocations);
router.put('/location', updateLocation);
router.post('/incident', addIncident);
router.get('/incidents', getIncidents);

module.exports = router;
