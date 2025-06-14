/**
 * Interview Routes
 *
 * This module defines the API routes for interview management.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import * as interviewController from '../controllers/interview.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/interviews:
 *   get:
 *     summary: Get all interviews with filtering and pagination
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW]
 *         description: Filter by interview status
 *       - in: query
 *         name: candidateId
 *         schema:
 *           type: string
 *         description: Filter by candidate ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or description
 *     responses:
 *       200:
 *         description: List of interviews
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.get('/', authenticate, authorize(['RECRUITER', 'ADMIN']), interviewController.getAllInterviews);

/**
 * @swagger
 * /api/v1/interviews/{id}:
 *   get:
 *     summary: Get interview by ID
 *     tags: [Interviews]
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
 *         description: Interview details
 *       404:
 *         description: Interview not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.get('/:id', authenticate, authorize(['RECRUITER', 'ADMIN']), interviewController.getInterviewById);

/**
 * @swagger
 * /api/v1/interviews:
 *   post:
 *     summary: Create a new interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - candidateId
 *               - scheduledDate
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               candidateId:
 *                 type: string
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW]
 *                 default: SCHEDULED
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - questionId
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     order:
 *                       type: integer
 *                     customInstructions:
 *                       type: string
 *     responses:
 *       201:
 *         description: Interview created successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.post('/', authenticate, authorize(['RECRUITER', 'ADMIN']), interviewController.createInterview);

/**
 * @swagger
 * /api/v1/interviews/{id}:
 *   patch:
 *     summary: Update interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW]
 *               feedbackSummary:
 *                 type: string
 *               recordingUrl:
 *                 type: string
 *               transcriptUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Interview updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Interview not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.patch('/:id', authenticate, authorize(['RECRUITER', 'ADMIN']), interviewController.updateInterview);

/**
 * @swagger
 * /api/v1/interviews/{id}:
 *   delete:
 *     summary: Delete interview
 *     tags: [Interviews]
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
 *         description: Interview deleted successfully
 *       404:
 *         description: Interview not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.delete('/:id', authenticate, authorize(['RECRUITER', 'ADMIN']), interviewController.deleteInterview);

/**
 * @swagger
 * /api/v1/interviews/{id}/questions:
 *   post:
 *     summary: Add questions to an interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questions
 *             properties:
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - questionId
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     order:
 *                       type: integer
 *                     customInstructions:
 *                       type: string
 *     responses:
 *       200:
 *         description: Questions added successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Interview not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.post('/:id/questions', authenticate, authorize(['RECRUITER', 'ADMIN']), interviewController.addQuestionsToInterview);

/**
 * @swagger
 * /api/v1/interviews/{id}/questions/{questionId}:
 *   delete:
 *     summary: Remove a question from an interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Interview ID
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question removed successfully
 *       404:
 *         description: Interview or question not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.delete('/:id/questions/:questionId', authenticate, authorize(['RECRUITER', 'ADMIN']), interviewController.removeQuestionFromInterview);

/**
 * @swagger
 * /api/v1/interviews/{id}/join:
 *   post:
 *     summary: Join an interview session
 *     tags: [Interviews]
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
 *         description: Successfully joined the interview
 *       404:
 *         description: Interview not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.post('/:id/join', authenticate, authorize(['RECRUITER', 'ADMIN']), interviewController.joinInterview);

export default router;