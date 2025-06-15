/**
 * Plagiarism Detection Routes
 *
 * This module defines routes for plagiarism detection endpoints.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

                                                                   import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import plagiarismController from '../controllers/plagiarism.controller.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Plagiarism detection routes
router
  .route('/detect/:submissionId')
  .post(authorize('admin', 'interviewer'), plagiarismController.detectPlagiarism);

router
  .route('/report/:submissionId')
  .get(authorize('admin', 'interviewer'), plagiarismController.getPlagiarismReport);

export default router;