/**
 * Collaborative Code Controller
 *
 * This module provides controllers for managing collaborative code during interviews.
 */

import { sendSuccess } from '../utils/response.js';

/**
 * Get collaborative code for an interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getCollaborativeCode = async (req, res, next) => {
  try {
    const { collaborativeCodeService } = req.container.cradle;
    const { interviewId } = req.params;
    
    const code = await collaborativeCodeService.getCollaborativeCode(interviewId);
    sendSuccess(res, 200, 'Collaborative code retrieved successfully', code);
  } catch (error) {
    next(error);
  }
};

/**
 * Update collaborative code for an interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const updateCollaborativeCode = async (req, res, next) => {
  try {
    const { collaborativeCodeService } = req.container.cradle;
    const { interviewId } = req.params;
    const { code, language } = req.body;
    
    const updatedCode = await collaborativeCodeService.updateCollaborativeCode(interviewId, { code, language });
    sendSuccess(res, 200, 'Collaborative code updated successfully', updatedCode);
  } catch (error) {
    next(error);
  }
};