/**
 * Plagiarism Detection Controller
 *
 * This module provides controllers for plagiarism detection endpoints.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { asyncHandler } from '../middlewares/async.middleware.js';
import plagiarismService from '../services/plagiarism.service.js';
import responseService from '../services/response.service.js';
import { ApiError } from '../middlewares/error.middleware.js';

/**
 * @desc    Detect plagiarism in a submission
 * @route   POST /api/plagiarism/detect/:submissionId
 * @access  Private (Admin, Interviewer)
 */
export const detectPlagiarism = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  
  // Check if submission exists
  const submission = await responseService.getResponseById(submissionId);
  if (!submission) {
    throw new ApiError('Submission not found', 404);
  }
  
  // Detect plagiarism
  const plagiarismReport = await plagiarismService.detectPlagiarism(submissionId);
  
  res.status(200).json({
    success: true,
    data: plagiarismReport,
  });
});

/**
 * @desc    Get plagiarism report for a submission
 * @route   GET /api/plagiarism/report/:submissionId
 * @access  Private (Admin, Interviewer)
 */
export const getPlagiarismReport = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  
  // Check if submission exists
  const submission = await responseService.getResponseById(submissionId);
  if (!submission) {
    throw new ApiError('Submission not found', 404);
  }
  
  // Get plagiarism report
  const plagiarismReport = await plagiarismService.getPlagiarismReport(submissionId);
  
  res.status(200).json({
    success: true,
    data: plagiarismReport,
  });
});

const plagiarismController = {
  detectPlagiarism,
  getPlagiarismReport,
};

export default plagiarismController;