/**
 * Application constants for Queue Management System
 */

// Average service time per customer (in minutes)
// Used for calculating estimated wait time
const AVERAGE_SERVICE_TIME = 5;

// Token display prefix (e.g., "A-001")
const TOKEN_PREFIX = "A";

/**
 * Generate display number from token number
 * @param {Number} tokenNumber - The numeric token number
 * @param {String} prefix - Optional prefix override (default: "A")
 * @returns {String} - Formatted display number like "A-001"
 */
const generateDisplayNumber = (tokenNumber, prefix = TOKEN_PREFIX) => {
  const paddedNumber = String(tokenNumber).padStart(3, "0");
  return `${prefix}-${paddedNumber}`;
};

/**
 * Calculate estimated wait time based on position
 * @param {Number} position - Position in queue (1-based)
 * @returns {Number} - Estimated wait time in minutes
 */
const calculateWaitTime = (position) => {
  // Position 1 means you're next, so wait time is 0
  // Position 2 means 1 person ahead of you
  const peopleAhead = Math.max(0, position - 1);
  return peopleAhead * AVERAGE_SERVICE_TIME;
};

module.exports = {
  AVERAGE_SERVICE_TIME,
  TOKEN_PREFIX,
  generateDisplayNumber,
  calculateWaitTime,
};
