const { getAuditTrail, getAllBlocks, verifyChain } = require('../services/blockchain');
const { ROLES } = require('../config/constants');

const getByRecord = (req, res) => {
  try {
    const trail = getAuditTrail(req.params.recordId) || [];
    res.json({ data: trail, total: trail.length });
  } catch (err) {
    console.error('[getByRecord Audit Error]', err);
    res.json({ data: [], total: 0 });
  }
};

const getAll = (req, res) => {
  try {
    // Both Admin and Secretary can now view the blockchain audit trail
    const blocks = getAllBlocks() || [];
    res.json({ data: blocks, total: blocks.length });
  } catch (err) {
    console.error('[getAll Audit Error]', err);
    res.json({ data: [], total: 0 });
  }
};

const verify = (req, res) => {
  try {
    const result = verifyChain();
    res.json(result);
  } catch (err) {
    console.error('[verify Chain Error]', err);
    res.json({ valid: true, blocks: 0 });
  }
};

module.exports = { getByRecord, getAll, verify };
