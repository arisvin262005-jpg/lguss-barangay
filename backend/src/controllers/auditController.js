const { getAuditTrail, getAllBlocks, verifyChain } = require('../services/blockchain');
const { ROLES } = require('../config/constants');

const getByRecord = (req, res) => {
  const trail = getAuditTrail(req.params.recordId);
  res.json({ data: trail, total: trail.length });
};

const getAll = (req, res) => {
  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ error: 'Only Admin can view full audit trail' });
  }
  const blocks = getAllBlocks();
  res.json({ data: blocks, total: blocks.length });
};

const verify = (req, res) => {
  const result = verifyChain();
  res.json(result);
};

module.exports = { getByRecord, getAll, verify };
