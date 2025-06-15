/**
 * Combined Authentication Middleware
 *
 * This middleware provides authentication using either JWT or candidate access tokens.
 * It first attempts to authenticate using JWT, and if that fails, it tries to authenticate
 * using the candidate access token from the URL parameter.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import passport from 'passport';
import { ApiError } from './error.middleware.js';

/**
 * Middleware to authenticate using either JWT or candidate access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const combinedAuthenticate = (req, res, next) => {
  // First try JWT authentication
  passport.authenticate('jwt', { session: false }, async (err, user, info) => {
    if (user) {
      // JWT authentication successful
      req.user = user;
      return next();
    }

    // JWT authentication failed, try candidate access token
    try {
      // Check if we have an accessToken parameter
      const accessToken = req.params.accessToken;
      
      if (!accessToken) {
        // No access token provided, authentication failed
        return next(new ApiError('Unauthorized: Authentication required', 401));
      }

      // Validate the access token
      const { candidateAccessService } = req.container.cradle;
      const interview = await candidateAccessService.validateAccessToken(
        req.container.cradle.prisma,
        accessToken
      );

      // Set interview and candidate info in the request object
      req.interview = interview;
      req.candidate = interview.candidate;
      req.isCandidate = true; // Flag to indicate this is a candidate access

      return next();
    } catch (error) {
      // Both authentication methods failed
      return next(new ApiError('Unauthorized: Invalid or expired token', 401));
    }
  })(req, res, next);
};

/**
 * Middleware to check if the user has permission to access the interview notes
 * This ensures that either:
 * 1. The user is authenticated via JWT and has appropriate permissions
 * 2. The user is a candidate with a valid access token for the specific interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const checkInterviewAccess = (req, res, next) => {
  try {
    const interviewId = req.params.interviewId;

    // If user is authenticated via JWT, they can access any interview
    if (req.user) {
      return next();
    }

    // If user is a candidate with a valid access token
    if (req.isCandidate && req.interview) {
      // If there's no interviewId in the params (e.g., for note creation endpoints),
      // we can proceed since the candidate is already authenticated with a valid token
      if (!interviewId) {
        return next();
      }
      
      // If there is an interviewId, check if it matches the candidate's interview
      if (req.interview.id === interviewId) {
        return next();
      }
    }

    // Access denied
    return next(new ApiError('You do not have permission to access this resource', 403));
  } catch (error) {
    return next(error);
  }
};

export default {
  combinedAuthenticate,
  checkInterviewAccess
};