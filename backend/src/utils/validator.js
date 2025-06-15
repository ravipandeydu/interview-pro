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

  /**
   * Validation schema for searching users
   */
  searchUsers: Joi.object({
    q: Joi.string().allow('').default('').messages({
      'string.base': 'Search query must be a string',
    }),
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1',
    }),
    limit: Joi.number().integer().min(1).max(100).default(20).messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
  }),
};

// Candidate validation schemas
export const candidateSchemas = {
  /**
   * Validation schema for creating a candidate
   */
  createCandidate: Joi.object({
    fullName: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 100 characters',
      'any.required': 'Full name is required',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    phone: Joi.string().allow('', null),
    resumeUrl: Joi.string().uri().allow('', null).messages({
      'string.uri': 'Resume URL must be a valid URL',
    }),
    linkedInUrl: Joi.string().uri().allow('', null).messages({
      'string.uri': 'LinkedIn URL must be a valid URL',
    }),
    githubUrl: Joi.string().uri().allow('', null).messages({
      'string.uri': 'GitHub URL must be a valid URL',
    }),
    portfolioUrl: Joi.string().uri().allow('', null).messages({
      'string.uri': 'Portfolio URL must be a valid URL',
    }),
    skills: Joi.array().items(Joi.string()),
    experienceYears: Joi.number().integer().min(0).allow(null),
    currentPosition: Joi.string().allow('', null),
    currentCompany: Joi.string().allow('', null),
    educationLevel: Joi.string().allow('', null),
    educationField: Joi.string().allow('', null),
    notes: Joi.string().max(1000).allow('', null).messages({
      'string.max': 'Notes cannot exceed 1000 characters',
    }),
    status: Joi.string().valid(
      'NEW',
      'CONTACTED',
      'INTERVIEW_SCHEDULED',
      'IN_PROCESS',
      'OFFER_SENT',
      'HIRED',
      'REJECTED',
      'ON_HOLD'
    ).default('NEW'),
  }),

  /**
   * Validation schema for updating a candidate
   */
  updateCandidate: Joi.object({
    fullName: Joi.string().min(2).max(100).messages({
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 100 characters',
    }),
    email: Joi.string().email().messages({
      'string.email': 'Please provide a valid email address',
    }),
    phone: Joi.string().allow('', null),
    resumeUrl: Joi.string().uri().allow('', null).messages({
      'string.uri': 'Resume URL must be a valid URL',
    }),
    linkedInUrl: Joi.string().uri().allow('', null).messages({
      'string.uri': 'LinkedIn URL must be a valid URL',
    }),
    githubUrl: Joi.string().uri().allow('', null).messages({
      'string.uri': 'GitHub URL must be a valid URL',
    }),
    portfolioUrl: Joi.string().uri().allow('', null).messages({
      'string.uri': 'Portfolio URL must be a valid URL',
    }),
    skills: Joi.array().items(Joi.string()),
    experienceYears: Joi.number().integer().min(0).allow(null),
    currentPosition: Joi.string().allow('', null),
    currentCompany: Joi.string().allow('', null),
    educationLevel: Joi.string().allow('', null),
    educationField: Joi.string().allow('', null),
    notes: Joi.string().max(1000).allow('', null).messages({
      'string.max': 'Notes cannot exceed 1000 characters',
    }),
    status: Joi.string().valid(
      'NEW',
      'CONTACTED',
      'INTERVIEW_SCHEDULED',
      'IN_PROCESS',
      'OFFER_SENT',
      'HIRED',
      'REJECTED',
      'ON_HOLD'
    ),
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

// Notification validation schemas
export const notificationSchemas = {
  sendNotification: Joi.object({
    title: Joi.string().required().trim().min(3).max(100)
      .messages({
        'string.base': 'Title must be a string',
        'string.empty': 'Title is required',
        'string.min': 'Title must be at least {#limit} characters long',
        'string.max': 'Title cannot exceed {#limit} characters',
        'any.required': 'Title is required'
      }),
    message: Joi.string().required().trim().min(5).max(500)
      .messages({
        'string.base': 'Message must be a string',
        'string.empty': 'Message is required',
        'string.min': 'Message must be at least {#limit} characters long',
        'string.max': 'Message cannot exceed {#limit} characters',
        'any.required': 'Message is required'
      }),
    type: Joi.string().required().valid('info', 'success', 'warning', 'error')
      .messages({
        'string.base': 'Type must be a string',
        'string.empty': 'Type is required',
        'any.only': 'Type must be one of: info, success, warning, error',
        'any.required': 'Type is required'
      })
  }),
  
  sendRoleNotification: Joi.object({
    roles: Joi.array().items(Joi.string().valid('ADMIN', 'RECRUITER', 'USER')).min(1).required()
      .messages({
        'array.base': 'Roles must be an array',
        'array.min': 'At least one role must be specified',
        'any.required': 'Roles are required',
        'array.includesRequiredUnknowns': 'Roles must be valid'
      }),
    title: Joi.string().required().trim().min(3).max(100)
      .messages({
        'string.base': 'Title must be a string',
        'string.empty': 'Title is required',
        'string.min': 'Title must be at least {#limit} characters long',
        'string.max': 'Title cannot exceed {#limit} characters',
        'any.required': 'Title is required'
      }),
    message: Joi.string().required().trim().min(5).max(500)
      .messages({
        'string.base': 'Message must be a string',
        'string.empty': 'Message is required',
        'string.min': 'Message must be at least {#limit} characters long',
        'string.max': 'Message cannot exceed {#limit} characters',
        'any.required': 'Message is required'
      }),
    type: Joi.string().required().valid('info', 'success', 'warning', 'error')
      .messages({
        'string.base': 'Type must be a string',
        'string.empty': 'Type is required',
        'any.only': 'Type must be one of: info, success, warning, error',
        'any.required': 'Type is required'
      })
  })
};

// Export all schemas
export default {
  authSchemas: {
    register: userSchemas.register,
    login: userSchemas.login,
    forgotPassword: userSchemas.forgotPassword,
    resetPassword: userSchemas.resetPassword,
    updatePassword: userSchemas.updatePassword,
  },
  userSchemas,
  aiSchemas,
  candidateSchemas,
  notificationSchemas
};
