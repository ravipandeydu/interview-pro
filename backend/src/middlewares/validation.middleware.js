/**
 * Validation Middleware
 * 
 * This middleware validates request data using Joi schemas.
 * 
 * @author Auto-generated
 * @date ${new Date().toISOString().split('T')[0]}
 */

import { ApiError } from './error.middleware.js';

/**
 * Create a validation middleware using a Joi schema
 * @param {Object} schema - Joi schema for validation
 * @param {string} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false, // Include all errors
      allowUnknown: true, // Ignore unknown props
      stripUnknown: true, // Remove unknown props
    });
    
    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      return next(new ApiError(message, 400));
    }
    
    next();
  };
};

export default validate;