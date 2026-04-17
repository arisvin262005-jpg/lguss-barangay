const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/drrmGadController');
const { authenticate } = require('../middleware/auth');
router.use(authenticate);
// DRRM
router.get('/plans',        ctrl.getPlans);
router.post('/plans',       ctrl.createPlan);
router.put('/plans/:id',    ctrl.updatePlan);
// GAD
router.get('/programs',     ctrl.getPrograms);
router.post('/programs',    ctrl.createProgram);
router.put('/programs/:id', ctrl.updateProgram);
module.exports = router;
