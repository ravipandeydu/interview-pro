/**
 * Role-based Authorization Middleware
 *
 * This middleware provides role-based access control for protected routes.
 * It leverages the authentication system to verify user roles against required permissions.
 */

import { ApiError } from './error.middleware.js';

/**
 * Middleware to authorize access based on user roles
 * @param {...string} roles - Allowed roles for the route
 * @returns {Function} Express middleware function
 */
export const authorize = (roles) => {
  return (req, res, next) => {
    // Check if user exists (should be set by authentication middleware)
    if (!req.user) {
      return next(new ApiError('Authentication required', 401));
    }
    
    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return next(new ApiError('You do not have permission to perform this action', 403));
    }

    next();
  };
};