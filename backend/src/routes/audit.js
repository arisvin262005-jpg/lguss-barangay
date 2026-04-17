const express = require('express');
const router = express.Router();
const { getByRecord, getAll, verify } = require('../controllers/auditController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/verify', verify);
router.get('/', getAll);
router.get('/:recordId', getByRecord);

module.exports = router;
