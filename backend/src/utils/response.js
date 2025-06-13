/**
 * Response Utility
 *
 * This module provides utility functions for standardizing API responses.
 *
 * @author Auto-generated
 * @date ${new Date().toISOString().split('T')[0]}
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response data
 */
export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    status: 'success',
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {*} errors - Error details
 */
export const sendError = (res, statusCode = 400, message = 'Error', errors = null) => {
  const response = {
    status: 'error',
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

/**
 * Send a paginated response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Array} data - Response data array
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 */
export const sendPaginated = (
  res,
  statusCode = 200,
  message = 'Success',
  data = [],
  page = 1,
  limit = 10,
  total = 0,
) => {
  const totalPages = Math.ceil(total / limit) || 1;

  res.status(statusCode).json({
    status: 'success',
    message,
    data,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages,
    },
  });
};
