/**
 * Candidate Controller
 *
 * This module handles HTTP requests related to candidate management.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { sendSuccess, sendPaginated } from '../utils/response.js';

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
export const getAllCandidates = async (req, res, next) => {
  try {
    const { candidateService } = req.scope;
    const { page = 1, limit = 10, status, search } = req.query;
    
    const result = await candidateService.getAllCandidates({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
      search
    });
    
    sendPaginated(
      res,
      200,
      'Candidates retrieved successfully',
      result.candidates,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  } catch (error) {
    next(error);
  }
};

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
export const getCandidateById = async (req, res, next) => {
  try {
    const { candidateService } = req.scope;
    const candidate = await candidateService.getCandidateById(req.params.id);
    sendSuccess(res, 200, 'Candidate retrieved successfully', candidate);
  } catch (error) {
    next(error);
  }
};

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
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               resumeUrl:
 *                 type: string
 *               linkedInUrl:
 *                 type: string
 *               githubUrl:
 *                 type: string
 *               portfolioUrl:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               experienceYears:
 *                 type: integer
 *               currentPosition:
 *                 type: string
 *               currentCompany:
 *                 type: string
 *               educationLevel:
 *                 type: string
 *               educationField:
 *                 type: string
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [NEW, CONTACTED, INTERVIEW_SCHEDULED, IN_PROCESS, OFFER_SENT, HIRED, REJECTED, ON_HOLD]
 *                 default: NEW
 *     responses:
 *       201:
 *         description: Candidate created successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
export const createCandidate = async (req, res, next) => {
  try {
    const { candidateService } = req.scope;
    const userId = req.user.id; // Get the current user's ID from the JWT
    const candidateData = { ...req.body, userId };
    
    const candidate = await candidateService.createCandidate(candidateData);
    sendSuccess(res, 201, 'Candidate created successfully', candidate);
  } catch (error) {
    next(error);
  }
};

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
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               resumeUrl:
 *                 type: string
 *               linkedInUrl:
 *                 type: string
 *               githubUrl:
 *                 type: string
 *               portfolioUrl:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               experienceYears:
 *                 type: integer
 *               currentPosition:
 *                 type: string
 *               currentCompany:
 *                 type: string
 *               educationLevel:
 *                 type: string
 *               educationField:
 *                 type: string
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [NEW, CONTACTED, INTERVIEW_SCHEDULED, IN_PROCESS, OFFER_SENT, HIRED, REJECTED, ON_HOLD]
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
export const updateCandidate = async (req, res, next) => {
  try {
    const { candidateService } = req.scope;
    const { id } = req.params;
    const updateData = req.body;
    
    const candidate = await candidateService.updateCandidate(id, updateData);
    sendSuccess(res, 200, 'Candidate updated successfully', candidate);
  } catch (error) {
    next(error);
  }
};

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
export const deleteCandidate = async (req, res, next) => {
  try {
    const { candidateService } = req.scope;
    await candidateService.deleteCandidate(req.params.id);
    sendSuccess(res, 200, 'Candidate deleted successfully');
  } catch (error) {
    next(error);
  }
};

export default {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate
};