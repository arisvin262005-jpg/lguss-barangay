const crypto = require('crypto');
const CryptoJS = require('crypto-js');

const SECRET_KEY = process.env.AES_SECRET_KEY || '32_char_aes_key_change_this_now!';

/**
 * Encrypt sensitive string data using AES-256
 */
const encrypt = (text) => {
  if (!text) return text;
  return CryptoJS.AES.encrypt(String(text), SECRET_KEY).toString();
};

/**
 * Decrypt AES-256 encrypted string
 */
const decrypt = (ciphertext) => {
  if (!ciphertext) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return ciphertext;
  }
};

/**
 * Generate SHA-256 hash for blockchain entries
 */
const generateHash = (data) => {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

module.exports = { encrypt, decrypt, generateHash };
