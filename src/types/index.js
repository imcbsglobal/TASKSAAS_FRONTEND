// Type definitions for future TypeScript migration
// These JSDoc comments can help with IntelliSense in VS Code

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} username - Username
 * @property {string} email - User email
 * @property {'admin'|'user'} role - User role
 */

/**
 * @typedef {Object} Location
 * @property {number} latitude - Latitude coordinate
 * @property {number} longitude - Longitude coordinate
 * @property {string} [address] - Human readable address
 */

/**
 * @typedef {Object} PunchRecord
 * @property {string} id - Record ID
 * @property {string} userId - User ID
 * @property {Location} location - Punch location
 * @property {Date} timestamp - Punch timestamp
 * @property {'in'|'out'} type - Punch type
 */

/**
 * @typedef {Object} FinanceRecord
 * @property {string} id - Record ID
 * @property {number} amount - Transaction amount
 * @property {string} description - Transaction description
 * @property {Date} date - Transaction date
 * @property {'debit'|'credit'} type - Transaction type
 */

export {};
