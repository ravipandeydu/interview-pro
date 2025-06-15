/**
 * Feedback Routes
 *
 * This module defines the API routes for feedback generation.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import * as feedbackController from '../controllers/feedback.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/feedback/responses/{id}:
 *   post:
 *     summary: Generate feedback for a specific response
 *     description: Generates AI-powered feedback for a candidate's response
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Response ID
 *     responses:
 *       200:
 *         description: Feedback generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Feedback generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     responseId:
 *                       type: string
 *                     score:
 *                       type: number
 *                     feedback:
 *                       type: object
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized
 *       404:
 *         description: Response not found
 *       500:
 *         description: Server error
 */
router.post('/responses/:id', authenticate, authorize(['ADMIN', 'RECRUITER']), feedbackController.generateFeedbackForResponse);

/**
 * @swagger
 * /api/v1/feedback/interviews/{id}:
 *   post:
 *     summary: Generate comprehensive feedback for an entire interview
 *     description: Generates AI-powered feedback for all responses in an interview
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     responses:
 *       200:
 *         description: Interview feedback generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Interview feedback generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     interviewId:
 *                       type: string
 *                     overallScore:
 *                       type: number
 *                     categoryScores:
 *                       type: object
 *                     strengths:
 *                       type: array
 *                       items:
 *                         type: string
 *                     weaknesses:
 *                       type: array
 *                       items:
 *                         type: string
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     recommendation:
 *                       type: string
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized
 *       404:
 *         description: Interview not found
 *       500:
 *         description: Server error
 */
router.post('/interviews/:id', authenticate, authorize(['ADMIN', 'RECRUITER']), feedbackController.generateInterviewFeedback);

/**
 * @swagger
 * /api/v1/feedback/responses/{id}/custom:
 *   post:
 *     summary: Generate custom feedback for a response
 *     description: Generates feedback for a response using a customizable template
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Response ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               includeHeader:
 *                 type: boolean
 *                 default: true
 *               customHeader:
 *                 type: string
 *               includeScore:
 *                 type: boolean
 *                 default: true
 *               includeDetailedAnalysis:
 *                 type: boolean
 *                 default: true
 *               includeStrengths:
 *                 type: boolean
 *                 default: true
 *               includeWeaknesses:
 *                 type: boolean
 *                 default: true
 *               includeSuggestions:
 *                 type: boolean
 *                 default: true
 *               includeCodeQualityMetrics:
 *                 type: boolean
 *                 default: true
 *               includeCodeQualityDetails:
 *                 type: boolean
 *                 default: true
 *               includeFooter:
 *                 type: boolean
 *                 default: true
 *               customFooter:
 *                 type: string
 *     responses:
 *       200:
 *         description: Custom feedback generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Custom feedback generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     responseId:
 *                       type: string
 *                     customFeedback:
 *                       type: object
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User not authorized
 *       404:
 *         description: Response not found
 *       500:
 *         description: Server error
 */
router.post('/responses/:id/custom', authenticate, authorize(['ADMIN', 'RECRUITER']), feedbackController.generateCustomFeedback);

export default router;