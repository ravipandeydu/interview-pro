/**
 * Candidate Access Routes
 *
 * This module defines routes for candidate access to interviews.
 * These routes are public and do not require authentication.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import express from 'express';
import candidateAccessController from '../controllers/candidate-access.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/candidate-access/{interviewId}/send-invitation:
 *   post:
 *     summary: Generate and send an interview access link to a candidate
 *     tags: [Candidate Access]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiresInDays:
 *                 type: integer
 *                 description: Number of days until the access token expires
 *                 default: 7
 *     responses:
 *       200:
 *         description: Interview invitation sent successfully
 *       404:
 *         description: Interview not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.post('/:interviewId/send-invitation', authenticate, authorize(['RECRUITER', 'ADMIN']), candidateAccessController.generateAndSendAccessLink);

/**
 * @swagger
 * /api/v1/candidate-access/interview/{accessToken}:
 *   get:
 *     summary: Get interview details using an access token
 *     tags: [Candidate Access]
 *     parameters:
 *       - in: path
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview access token
 *     responses:
 *       200:
 *         description: Interview retrieved successfully
 *       401:
 *         description: Invalid or expired access token
 */
router.get('/interview/:accessToken', candidateAccessController.getInterviewByAccessToken);

/**
 * @swagger
 * /api/v1/candidate-access/interview/{accessToken}/start:
 *   post:
 *     summary: Start an interview as a candidate
 *     tags: [Candidate Access]
 *     parameters:
 *       - in: path
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview access token
 *     responses:
 *       200:
 *         description: Interview started successfully
 *       401:
 *         description: Invalid or expired access token
 */
router.post('/interview/:accessToken/start', candidateAccessController.startInterview);

/**
 * @swagger
 * /api/v1/candidate-access/interview/{accessToken}/questions/{questionId}/response:
 *   post:
 *     summary: Submit a response to an interview question
 *     tags: [Candidate Access]
 *     parameters:
 *       - in: path
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview access token
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: The candidate's response to the question
 *     responses:
 *       200:
 *         description: Response submitted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid or expired access token
 */
router.post('/interview/:accessToken/questions/:questionId/response', candidateAccessController.submitResponse);

/**
 * @swagger
 * /api/v1/candidate-access/interview/{accessToken}/complete:
 *   post:
 *     summary: Complete an interview as a candidate
 *     tags: [Candidate Access]
 *     parameters:
 *       - in: path
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview access token
 *     responses:
 *       200:
 *         description: Interview completed successfully
 *       401:
 *         description: Invalid or expired access token
 */
router.post('/interview/:accessToken/complete', candidateAccessController.completeInterview);

export default router;