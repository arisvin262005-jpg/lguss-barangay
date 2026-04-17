const express = require('express');
const router = express.Router();
const { getAll, getById, checkDSS, create, updateStatus, getDSSLogs } = require('../controllers/certificationController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticate);
router.get('/', getAll);
router.get('/dss-logs', getDSSLogs);
router.get('/:id', getById);
router.post('/dss-check', authorize(ROLES.ADMIN, ROLES.SECRETARY), checkDSS);
router.post('/', authorize(ROLES.ADMIN, ROLES.SECRETARY), create);
router.patch('/:id/status', authorize(ROLES.ADMIN, ROLES.SECRETARY), updateStatus);

module.exports = router;
