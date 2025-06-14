/**
 * Custom Error Classes
 *
 * This module provides custom error classes for the application.
 * These classes extend the base Error class to provide more specific error types.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

/**
 * Base class for API errors
 */
export class ApiError extends Error {
  /**
   * Create an API error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {boolean} isOperational - Whether the error is operational or programming
   */
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for resource not found (404)
 */
export class NotFoundError extends ApiError {
  /**
   * Create a not found error
   * @param {string} message - Error message
   */
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Error for bad requests (400)
 */
export class BadRequestError extends ApiError {
  /**
   * Create a bad request error
   * @param {string} message - Error message
   */
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

/**
 * Error for unauthorized access (401)
 */
export class UnauthorizedError extends ApiError {
  /**
   * Create an unauthorized error
   * @param {string} message - Error message
   */
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Error for forbidden access (403)
 */
export class ForbiddenError extends ApiError {
  /**
   * Create a forbidden error
   * @param {string} message - Error message
   */
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * Error for conflict (409)
 */
export class ConflictError extends ApiError {
  /**
   * Create a conflict error
   * @param {string} message - Error message
   */
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

/**
 * Error for validation failures (422)
 */
export class ValidationError extends ApiError {
  /**
   * Create a validation error
   * @param {string} message - Error message
   */
  constructor(message = 'Validation failed') {
    super(message, 422);
  }
}

/**
 * Error for internal server errors (500)
 */
export class InternalServerError extends ApiError {
  /**
   * Create an internal server error
   * @param {string} message - Error message
   */
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}