/**
 * Validator Utility
 *
 * This module defines Joi validation schemas for various API requests.
 *
 * @author Auto-generated
 * @date ${new Date().toISOString().split('T')[0]}
 */

import Joi from 'joi';

// User validation schemas
export const userSchemas = {
  /**
   * Validation schema for email only
   */
  email: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  }),

  /**
   * Validation schema for user registration
   */
  register: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string()
      .min(8)
      .required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required',
      }),
    role: Joi.string().valid('USER', 'ADMIN').default('USER'),
  }),

  /**
   * Validation schema for user login
   */
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),

  /**
   * Validation schema for password reset request
   */
  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  }),

  /**
   * Validation schema for password reset
   */
  resetPassword: Joi.object({
    // token: Joi.string().required().messages({
    //   'any.required': 'Reset token is required',
    // }),
    password: Joi.string()
      .min(8)
      .required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required',
      }),
  }),

  /**
   * Validation schema for updating user profile
   */
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
    }),
    email: Joi.string().email().messages({
      'string.email': 'Please provide a valid email address',
    }),
    bio: Joi.string().max(500).allow('', null).messages({
      'string.max': 'Bio cannot exceed 500 characters',
    }),
  }),

  /**
   * Validation schema for updating password
   */
  updatePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required',
    }),
    newPassword: Joi.string()
      .min(8)
      .required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'New password is required',
      }),
  }),
};

// AI validation schemas
export const aiSchemas = {
  /**
   * Validation schema for chat with database
   */
  chat: Joi.object({
    question: Joi.string().min(3).max(500).required().messages({
      'string.min': 'Question must be at least 3 characters long',
      'string.max': 'Question cannot exceed 500 characters',
      'any.required': 'Question is required',
    }),
  }),

  /**
   * Validation schema for data summary
   */
  summary: Joi.object({
    collectionName: Joi.string().required().messages({
      'any.required': 'Collection name is required',
    }),
    timeframe: Joi.string().valid('day', 'week', 'month', 'year').default('month'),
  }),
};
