/**
 * API Routes Index
 * 
 * This module consolidates all API routes and exports them as a single router.
 * Enhanced with dependency injection support.
 */

import express from 'express';
import { createController } from 'awilix-express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import aiRoutes from './ai.routes.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     RegisterInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - passwordConfirm
 *       properties:
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: Password123!
 *         passwordConfirm:
 *           type: string
 *           format: password
 *           example: Password123!
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: Password123!
 *     ForgotPasswordInput:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *     ResetPasswordInput:
 *       type: object
 *       required:
 *         - password
 *         - passwordConfirm
 *       properties:
 *         password:
 *           type: string
 *           format: password
 *           example: NewPassword123!
 *         passwordConfirm:
 *           type: string
 *           format: password
 *           example: NewPassword123!
 *     UpdatePasswordInput:
 *       type: object
 *       required:
 *         - currentPassword
 *         - password
 *         - passwordConfirm
 *       properties:
 *         currentPassword:
 *           type: string
 *           format: password
 *           example: Password123!
 *         password:
 *           type: string
 *           format: password
 *           example: NewPassword123!
 *         passwordConfirm:
 *           type: string
 *           format: password
 *           example: NewPassword123!
 *     UpdateProfileInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: John Updated
 *         email:
 *           type: string
 *           format: email
 *           example: john.updated@example.com
 *     ChatInput:
 *       type: object
 *       required:
 *         - question
 *       properties:
 *         question:
 *           type: string
 *           example: How many users registered last week?
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 60d0fe4f5311236168a109ca
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           example: john@example.com
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           example: user
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: Something went wrong
 */

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/ai', aiRoutes);

export default router;