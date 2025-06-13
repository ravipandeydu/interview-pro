/**
 * Authentication Middleware
 *
 * This middleware protects routes by verifying JWT tokens and checking user roles.
 * Enhanced with passport-jwt and role-based access control.
 */

import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { ApiError } from './error.middleware.js';
import config from '../config/index.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Configure JWT strategy for Passport
 */
export const configureJwtStrategy = () => {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwtSecret,
  };

  passport.use(
    new JwtStrategy(options, async (jwtPayload, done) => {
      try {
        // Find the user by id from JWT payload
        const user = await prisma.user.findUnique({
          where: { id: jwtPayload.id },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isEmailVerified: true,
          },
        });

        if (!user) {
          return done(null, false);
        }

        // Check if token was issued before password change
        if (jwtPayload.iat && user.passwordChangedAt) {
          const passwordChangedTime = parseInt(
            user.passwordChangedAt.getTime() / 1000,
            10
          );
          if (jwtPayload.iat < passwordChangedTime) {
            return done(null, false);
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    })
  );
};

/**
 * Middleware to protect routes that require authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const protect = async (req, res, next) => {
  try {
    // 1) Get token from Authorization header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError('You are not logged in. Please log in to get access.', 401));
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, config.jwtSecret);

    // 3) Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return next(new ApiError('The user belonging to this token no longer exists.', 401));
    }

    // 4) Check if user changed password after the token was issued
    if (user.passwordChangedAt && new Date(user.passwordChangedAt).getTime() / 1000 > decoded.iat) {
      return next(new ApiError('User recently changed password. Please log in again.', 401));
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to authenticate using passport-jwt
 */
export const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new ApiError('Unauthorized: Invalid or expired token', 401));
    }
    req.user = user;
    return next();
  })(req, res, next);
};

/**
 * Middleware to restrict access to specific roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware function
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return next(new ApiError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

/**
 * Middleware to check if user is verified
 */
export const requireVerified = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return next(new ApiError('Email verification required to access this resource', 403));
  }
  return next();
};

/**
 * Middleware to check if user owns the resource or is an admin
 * @param {Function} getResourceUserId - Function to extract owner ID from request
 */
export const requireOwnership = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      // Admins bypass ownership check
      if (req.user.role === 'ADMIN') {
        return next();
      }

      const resourceUserId = await getResourceUserId(req);
      
      if (!resourceUserId || resourceUserId !== req.user.id) {
        return next(new ApiError('You do not have permission to access this resource', 403));
      }
      
      return next();
    } catch (error) {
      return next(error);
    }
  };
};
