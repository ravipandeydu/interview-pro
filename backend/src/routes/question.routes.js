/**
 * Question Routes
 *
 * This module defines the API routes for managing interview questions.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import * as questionController from '../controllers/question.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/questions:
 *   get:
 *     summary: Get all questions with filtering and pagination
 *     tags: [Questions]
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [TECHNICAL, BEHAVIORAL, SITUATIONAL, EXPERIENCE, CULTURAL_FIT, PROBLEM_SOLVING]
 *         description: Filter by question category
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [EASY, MEDIUM, HARD, EXPERT]
 *         description: Filter by question difficulty
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by content or tags
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of questions
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.get('/', authenticate, authorize(['RECRUITER', 'ADMIN']), questionController.getAllQuestions);

/**
 * @swagger
 * /api/v1/questions/{id}:
 *   get:
 *     summary: Get question by ID
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question details
 *       404:
 *         description: Question not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.get('/:id', authenticate, authorize(['RECRUITER', 'ADMIN']), questionController.getQuestionById);

/**
 * @swagger
 * /api/v1/questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - category
 *             properties:
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [TECHNICAL, BEHAVIORAL, SITUATIONAL, EXPERIENCE, CULTURAL_FIT, PROBLEM_SOLVING]
 *               difficulty:
 *                 type: string
 *                 enum: [EASY, MEDIUM, HARD, EXPERT]
 *                 default: MEDIUM
 *               expectedAnswer:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Question created successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.post('/', authenticate, authorize(['RECRUITER', 'ADMIN']), questionController.createQuestion);

/**
 * @swagger
 * /api/v1/questions/{id}:
 *   patch:
 *     summary: Update question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [TECHNICAL, BEHAVIORAL, SITUATIONAL, EXPERIENCE, CULTURAL_FIT, PROBLEM_SOLVING]
 *               difficulty:
 *                 type: string
 *                 enum: [EASY, MEDIUM, HARD, EXPERT]
 *               expectedAnswer:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Question not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.patch('/:id', authenticate, authorize(['RECRUITER', 'ADMIN']), questionController.updateQuestion);

/**
 * @swagger
 * /api/v1/questions/{id}:
 *   delete:
 *     summary: Delete question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       404:
 *         description: Question not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.delete('/:id', authenticate, authorize(['RECRUITER', 'ADMIN']), questionController.deleteQuestion);

/**
 * @swagger
 * /api/v1/questions/generate:
 *   post:
 *     summary: Generate interview questions using AI
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobTitle
 *               - skills
 *             properties:
 *               jobTitle:
 *                 type: string
 *                 description: The job title for which to generate questions
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of skills required for the job
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [TECHNICAL, BEHAVIORAL, SITUATIONAL, EXPERIENCE, CULTURAL_FIT, PROBLEM_SOLVING]
 *                 description: Categories of questions to generate
 *               count:
 *                 type: integer
 *                 default: 5
 *                 description: Number of questions to generate
 *     responses:
 *       200:
 *         description: Questions generated successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.post('/generate', authenticate, authorize(['RECRUITER', 'ADMIN']), questionController.generateQuestions);

export default router;