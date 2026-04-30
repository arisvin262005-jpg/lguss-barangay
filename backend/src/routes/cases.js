const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, updateStatus, getResidentCases, getCrossBarangayCaseHistory } = require('../controllers/caseController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticate);
router.get('/', getAll);
router.get('/resident/:residentId', getResidentCases);

// Cross-barangay case history — no AI, pure identity matching across all barangays
router.get('/cross-check/:residentId', getCrossBarangayCaseHistory);

router.get('/:id', getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.SECRETARY), create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.SECRETARY), update);
router.patch('/:id/status', authorize(ROLES.ADMIN, ROLES.SECRETARY), updateStatus);

module.exports = router;
