const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, getStats } = require('../controllers/residentController');
const { authenticate, authorize, ownBarangayOnly } = require('../middleware/auth');
const { residentValidation, handleValidation } = require('../middleware/sanitize');
const { ROLES } = require('../config/constants');

router.use(authenticate);
router.get('/', ownBarangayOnly, getAll);
router.get('/stats', getStats);
router.get('/:id', getById);
router.post('/', authorize(ROLES.ADMIN, ROLES.SECRETARY), residentValidation, handleValidation, create);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.SECRETARY), residentValidation, handleValidation, update);
router.delete('/:id', authorize(ROLES.ADMIN), remove);

module.exports = router;
