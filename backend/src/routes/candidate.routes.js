/**
 * Candidate Routes
 * 
 * This module defines the routes for candidate management endpoints.
 * 
 * @author AI-generated
 * @date 2023-11-15
 */

import express from 'express';
import validate from '../middlewares/validation.middleware.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { candidateSchemas } from '../utils/validator.js';
import {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} from '../controllers/candidate.controller.js';
import { uploadResume } from '../controllers/candidate-resume.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Candidates
 *   description: Candidate management endpoints
 */

// All routes below this middleware require authentication
router.use(protect);

// All candidate routes require recruiter or admin role
router.use(restrictTo('RECRUITER', 'ADMIN'));

/**
 * @swagger
 * /api/v1/candidates:
 *   get:
 *     summary: Get all candidates with filtering and pagination
 *     tags: [Candidates]
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
 *           enum: [NEW, CONTACTED, INTERVIEW_SCHEDULED, IN_PROCESS, OFFER_SENT, HIRED, REJECTED, ON_HOLD]
 *         description: Filter by candidate status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, or skills
 *     responses:
 *       200:
 *         description: List of candidates
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.get('/', getAllCandidates);

/**
 * @swagger
 * /api/v1/candidates/{id}:
 *   get:
 *     summary: Get candidate by ID
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: Candidate details
 *       404:
 *         description: Candidate not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.get('/:id', getCandidateById);

/**
 * @swagger
 * /api/v1/candidates:
 *   post:
 *     summary: Create a new candidate
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CandidateInput'
 *     responses:
 *       201:
 *         description: Candidate created successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.post('/', validate(candidateSchemas.createCandidate), createCandidate);

/**
 * @swagger
 * /api/v1/candidates/{id}:
 *   patch:
 *     summary: Update candidate
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Candidate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CandidateUpdateInput'
 *     responses:
 *       200:
 *         description: Candidate updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Candidate not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.patch('/:id', validate(candidateSchemas.updateCandidate), updateCandidate);

/**
 * @swagger
 * /api/v1/candidates/{id}:
 *   delete:
 *     summary: Delete candidate
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: Candidate deleted successfully
 *       404:
 *         description: Candidate not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.delete('/:id', deleteCandidate);

/**
 * @swagger
 * /api/v1/candidates/{id}/resume:
 *   post:
 *     summary: Upload candidate resume
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Candidate ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resume
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: Resume file (PDF only, max 5MB)
 *     responses:
 *       200:
 *         description: Resume uploaded successfully
 *       400:
 *         description: Invalid input or file type
 *       404:
 *         description: Candidate not found
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.post('/:id/resume', uploadSingle('resume'), uploadResume);

export default router;