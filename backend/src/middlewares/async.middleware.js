/**
 * Async Handler Middleware
 *
 * This middleware wraps async route handlers to catch errors and pass them to the error middleware.
 * It eliminates the need for try-catch blocks in every controller function.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

/**
 * Wraps an async function to catch errors and pass them to the next middleware
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};