/**
 * Response Routes
 *
 * This module defines the API routes for managing candidate responses to interview questions.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import * as responseController from '../controllers/response.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/responses/{id}:
 *   get:
 *     summary: Get response by ID
 *     tags: [Responses]
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
 *         description: Response details
 *       404:
 *         description: Response not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.get('/:id', authenticate, authorize(['RECRUITER', 'ADMIN']), responseController.getResponseById);

/**
 * @swagger
 * /api/v1/responses:
 *   post:
 *     summary: Submit a response to an interview question
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - interviewId
 *               - interviewQuestionId
 *               - content
 *             properties:
 *               interviewId:
 *                 type: string
 *               interviewQuestionId:
 *                 type: string
 *               content:
 *                 type: string
 *                 description: The candidate's response text
 *               recordingUrl:
 *                 type: string
 *                 description: URL to audio recording of response
 *     responses:
 *       201:
 *         description: Response submitted successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Interview or question not found
 */
router.post('/', authenticate, responseController.submitResponse);

/**
 * @swagger
 * /api/v1/responses/{id}:
 *   patch:
 *     summary: Update a response (recruiter only)
 *     tags: [Responses]
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
 *               aiAnalysisScore:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 100
 *                 description: AI-generated score (0-100)
 *               aiAnalysisDetails:
 *                 type: object
 *                 description: Detailed AI analysis as JSON
 *               recruiterNotes:
 *                 type: string
 *                 description: Notes from the recruiter
 *               transcriptText:
 *                 type: string
 *                 description: Transcript of the response
 *     responses:
 *       200:
 *         description: Response updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Response not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.patch('/:id', authenticate, authorize(['RECRUITER', 'ADMIN']), responseController.updateResponse);

/**
 * @swagger
 * /api/v1/responses/{id}:
 *   delete:
 *     summary: Delete a response
 *     tags: [Responses]
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
 *         description: Response deleted successfully
 *       404:
 *         description: Response not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.delete('/:id', authenticate, authorize(['RECRUITER', 'ADMIN']), responseController.deleteResponse);

/**
 * @swagger
 * /api/v1/responses/interview/{interviewId}:
 *   get:
 *     summary: Get all responses for an interview
 *     tags: [Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     responses:
 *       200:
 *         description: List of responses for the interview
 *       404:
 *         description: Interview not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.get('/interview/:interviewId', authenticate, authorize(['RECRUITER', 'ADMIN']), responseController.getResponsesByInterviewId);

/**
 * @swagger
 * /api/v1/responses/{id}/analyze:
 *   post:
 *     summary: Analyze a response using AI
 *     tags: [Responses]
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
 *         description: Response analyzed successfully
 *       404:
 *         description: Response not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.post('/:id/analyze', authenticate, authorize(['RECRUITER', 'ADMIN']), responseController.analyzeResponse);

export default router;