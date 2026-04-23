const { generateHash } = require('../utils/encryption');
const { v4: uuidv4 } = require('uuid');

const db = require('../models/db');

/**
 * Add a new block to the simulated chain
 */
const addBlock = ({ action, recordType, recordId, actor, actorRole, details }) => {
  // Ensure db.blockchain is an array
  if (!Array.isArray(db.blockchain)) db.blockchain = [];

  // Genesis block logic: only add if the chain is truly empty
  if (db.blockchain.length === 0) {
    const genesis = {
      id: 'genesis-block',
      index: 0,
      timestamp: new Date().toISOString(),
      data: { genesis: true, system: 'Barangay Management System' },
      previousHash: '0',
      hash: '0000000000000000000000000000000000000000000000000000000000000000',
    };
    db.blockchain.push(genesis);
    if (db.syncToFirebase) db.syncToFirebase('blockchain', genesis);
  }

  const previousBlock = db.blockchain[db.blockchain.length - 1];
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
  const block = { ...blockData, index: db.blockchain.length, hash };
  
  db.blockchain.push(block);
  
  // Persistence: Sync to Firebase
  if (db.syncToFirebase) db.syncToFirebase('blockchain', block);
  
  return block;
};

const getAuditTrail = (recordId) => {
  const chain = Array.isArray(db.blockchain) ? db.blockchain : [];
  return chain.filter((b) => b.recordId === recordId);
};

const getAllBlocks = () => Array.isArray(db.blockchain) ? db.blockchain : [];

const getRecentBlocks = (n = 10) => {
  const chain = Array.isArray(db.blockchain) ? db.blockchain : [];
  return chain.slice(-n).reverse();
};

const verifyChain = () => {
  const chain = Array.isArray(db.blockchain) ? db.blockchain : [];
  if (chain.length === 0) return { valid: true, blocks: 0 };

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
