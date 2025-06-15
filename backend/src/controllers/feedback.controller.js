/**
 * Feedback Controller
 *
 * This module handles HTTP requests related to feedback generation for interview responses.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { sendSuccess } from '../utils/response.js';

/**
 * Generate feedback for a specific response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const generateFeedbackForResponse = async (req, res, next) => {
  try {
    const { feedbackService } = req.container.cradle;
    const { id } = req.params;
    
    const feedback = await feedbackService.generateFeedbackForResponse(id);
    sendSuccess(res, 200, 'Feedback generated successfully', feedback);
  } catch (error) {
    next(error);
  }
};

/**
 * Generate comprehensive feedback for an entire interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const generateInterviewFeedback = async (req, res, next) => {
  try {
    const { feedbackService } = req.container.cradle;
    const { id } = req.params;
    
    const feedback = await feedbackService.generateInterviewFeedback(id);
    sendSuccess(res, 200, 'Interview feedback generated successfully', feedback);
  } catch (error) {
    next(error);
  }
};

/**
 * Generate feedback with customized template
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const generateCustomFeedback = async (req, res, next) => {
  try {
    const { feedbackService } = req.container.cradle;
    const { id } = req.params;
    const templateOptions = req.body;
    
    const feedback = await feedbackService.generateCustomFeedback(id, templateOptions);
    sendSuccess(res, 200, 'Custom feedback generated successfully', feedback);
  } catch (error) {
    next(error);
  }
};

export default {
  generateFeedbackForResponse,
  generateInterviewFeedback,
  generateCustomFeedback
};