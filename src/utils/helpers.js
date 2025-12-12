const config = require('../config/config');

/**
 * Calculate pagination metadata
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} totalItems - Total number of items
 * @returns {object} Pagination metadata
 */
const calculatePagination = (page, limit, totalItems) => {
  const currentPage = Math.max(1, parseInt(page) || config.PAGINATION.DEFAULT_PAGE);
  const itemsPerPage = Math.min(
    Math.max(1, parseInt(limit) || config.PAGINATION.DEFAULT_LIMIT),
    config.PAGINATION.MAX_LIMIT
  );
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const skip = (currentPage - 1) * itemsPerPage;
  
  return {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    skip,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
};

/**
 * Parse and validate sort parameters
 * @param {string} sortString - Sort string (e.g., '-createdAt,title')
 * @param {array} allowedFields - Array of allowed sort fields
 * @returns {object} Mongoose sort object
 */
const parseSort = (sortString, allowedFields = []) => {
  if (!sortString) return { createdAt: -1 }; // Default sort
  
  const sortObj = {};
  const sortFields = sortString.split(',');
  
  sortFields.forEach(field => {
    let sortField = field.trim();
    let sortOrder = 1;
    
    if (sortField.startsWith('-')) {
      sortOrder = -1;
      sortField = sortField.substring(1);
    }
    
    // Only allow sorting on specified fields
    if (allowedFields.length === 0 || allowedFields.includes(sortField)) {
      sortObj[sortField] = sortOrder;
    }
  });
  
  return Object.keys(sortObj).length > 0 ? sortObj : { createdAt: -1 };
};

/**
 * Parse filter parameters
 * @param {object} query - Request query object
 * @param {array} allowedFilters - Array of allowed filter fields
 * @returns {object} MongoDB filter object
 */
const parseFilters = (query, allowedFilters = []) => {
  const filters = {};
  
  allowedFilters.forEach(field => {
    if (query[field]) {
      if (field === 'publishedYear') {
        // Handle year range filtering
        if (query[`${field}_gte`]) filters[field] = { ...filters[field], $gte: parseInt(query[`${field}_gte`]) };
        if (query[`${field}_lte`]) filters[field] = { ...filters[field], $lte: parseInt(query[`${field}_lte`]) };
        if (query[field] && !query[`${field}_gte`] && !query[`${field}_lte`]) {
          filters[field] = parseInt(query[field]);
        }
      } else if (field === 'price') {
        // Handle price range filtering
        if (query[`${field}_gte`]) filters[field] = { ...filters[field], $gte: parseFloat(query[`${field}_gte`]) };
        if (query[`${field}_lte`]) filters[field] = { ...filters[field], $lte: parseFloat(query[`${field}_lte`]) };
        if (query[field] && !query[`${field}_gte`] && !query[`${field}_lte`]) {
          filters[field] = parseFloat(query[field]);
        }
      } else {
        // Exact match for other fields
        filters[field] = query[field];
      }
    }
  });
  
  return filters;
};

/**
 * Build search query for text search
 * @param {string} searchTerm - Search term
 * @returns {object} MongoDB search query
 */
const buildSearchQuery = (searchTerm) => {
  if (!searchTerm) return {};
  
  return {
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { author: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { isbn: { $regex: searchTerm, $options: 'i' } }
    ]
  };
};

/**
 * Sanitize string input to prevent injection attacks
 * @param {string} str - Input string
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Remove potential NoSQL injection patterns
  return str.replace(/[{}$]/g, '');
};

/**
 * Generate random string for testing or temporary IDs
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
const isEmpty = (value) => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

module.exports = {
  calculatePagination,
  parseSort,
  parseFilters,
  buildSearchQuery,
  sanitizeString,
  generateRandomString,
  deepClone,
  isEmpty,
};