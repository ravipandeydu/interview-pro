/**
 * Candidate Resume Controller
 *
 * This module handles HTTP requests related to candidate resume uploads.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { sendSuccess } from '../utils/response.js';

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
export const uploadResume = async (req, res, next) => {
  try {
    const { candidateResumeService } = req.container.cradle;
    const { id } = req.params;
    
    // Check if file exists in request
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded',
      });
    }
    
    const { buffer, originalname, mimetype } = req.file;
    
    const result = await candidateResumeService.uploadCandidateResume(
      id,
      buffer,
      originalname,
      mimetype
    );
    
    sendSuccess(res, 200, 'Resume uploaded successfully', result);
  } catch (error) {
    next(error);
  }
};

export default {
  uploadResume,
};