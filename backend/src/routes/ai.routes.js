/**
 * AI Routes
 * 
 * This module defines the routes for AI-related endpoints.
 * 
 * @author Auto-generated
 * @date ${new Date().toISOString().split('T')[0]}
 */

import express from 'express';
import validate from '../middlewares/validation.middleware.js';
import { protect } from '../middlewares/auth.middleware.js';
import { aiSchemas } from '../utils/validator.js';
import {
  chatWithDatabase,
  getDataSummary,
} from '../controllers/ai.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI-powered database interaction endpoints
 */

// All routes below this middleware require authentication
router.use(protect);

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat with database using natural language
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatInput'
 *     responses:
 *       200:
 *         description: AI response to the question
 *       400:
 *         description: Invalid input
 *       500:
 *         description: AI service error
 */
router.post('/chat', validate(aiSchemas.chat), chatWithDatabase);

/**
 * @swagger
 * /api/ai/summary/{collectionName}:
 *   get:
 *     summary: Get intelligent data summary for a collection
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: collectionName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the collection to summarize
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: Timeframe for the summary
 *     responses:
 *       200:
 *         description: Collection summary
 *       404:
 *         description: Collection not found
 *       500:
 *         description: AI service error
 */
router.get('/summary/:collectionName', validate(aiSchemas.summary), getDataSummary);

export default router;