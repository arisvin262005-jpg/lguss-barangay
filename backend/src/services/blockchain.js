const { generateHash } = require('../utils/encryption');
const { v4: uuidv4 } = require('uuid');

// In-memory blockchain simulation (in production this would persist to CouchDB)
let chain = [
  {
    index: 0,
    timestamp: new Date().toISOString(),
    data: { genesis: true, system: 'Barangay Management System' },
    previousHash: '0',
    hash: '0000000000000000000000000000000000000000000000000000000000000000',
  },
];

/**
 * Add a new block to the simulated chain
 */
const addBlock = ({ action, recordType, recordId, actor, actorRole, details }) => {
  const previousBlock = chain[chain.length - 1];
  const blockData = {
    id: uuidv4(),
    action,
    recordType,
    recordId,
    actor,
    actorRole,
    details,
    timestamp: new Date().toISOString(),
    previousHash: previousBlock.hash,
  };
  const hash = generateHash(blockData);
  const block = { ...blockData, index: chain.length, hash };
  chain.push(block);
  return block;
};

/**
 * Get all blocks filtered by recordId
 */
const getAuditTrail = (recordId) => {
  return chain.filter((b) => b.recordId === recordId);
};

/**
 * Get all audit entries (admin view)
 */
const getAllBlocks = () => chain;

/**
 * Get last N blocks (used in dashboard recent activity)
 */
const getRecentBlocks = (n = 10) => chain.slice(-n).reverse();

/**
 * Verify chain integrity
 */
const verifyChain = () => {
  for (let i = 1; i < chain.length; i++) {
    const block = chain[i];
    const { hash, ...blockData } = block;
    const recomputedHash = generateHash(blockData);
    if (hash !== recomputedHash) return { valid: false, tampered_at: i };
    if (block.previousHash !== chain[i - 1].hash) return { valid: false, broken_at: i };
  }
  return { valid: true, blocks: chain.length };
};

module.exports = { addBlock, getAuditTrail, getAllBlocks, getRecentBlocks, verifyChain };
