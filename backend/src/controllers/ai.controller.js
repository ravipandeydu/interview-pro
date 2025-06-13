/**
 * AI Controller
 * 
 * This module handles HTTP requests related to AI features.
 * 
 * @author Auto-generated
 * @date ${new Date().toISOString().split('T')[0]}
 */

import aiService from '../services/ai.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

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
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 description: Natural language question about the database
 *                 example: "How many users registered last week?"
 *     responses:
 *       200:
 *         description: AI response to the question
 *       400:
 *         description: Invalid input
 *       500:
 *         description: AI service error
 */
export const chatWithDatabase = async (req, res, next) => {
  try {
    const { question } = req.body;
    const result = await aiService.chatWithDatabase(question);
    sendSuccess(res, 200, 'Query processed successfully', result);
  } catch (error) {
    next(error);
  }
};

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
export const getDataSummary = async (req, res, next) => {
  try {
    const { collectionName } = req.params;
    const { timeframe = 'month' } = req.query;
    const result = await aiService.generateDataSummary(collectionName, timeframe);
    sendSuccess(res, 200, 'Summary generated successfully', result);
  } catch (error) {
    next(error);
  }
};

const aiController = {
  chatWithDatabase,
  getDataSummary,
};

export default aiController;