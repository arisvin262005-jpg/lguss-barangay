const express = require('express');
const router = express.Router();
const { getAll, getById, create, updateStatus, getResidentCases } = require('../controllers/caseController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticate);
router.get('/', getAll);
router.get('/resident/:residentId', getResidentCases);
router.get('/:id', getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.SECRETARY), create);
router.patch('/:id/status', authorize(ROLES.ADMIN, ROLES.SECRETARY), updateStatus);

module.exports = router;
