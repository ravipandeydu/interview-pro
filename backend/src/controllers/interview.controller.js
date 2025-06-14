/**
 * Interview Controller
 *
 * This module handles HTTP requests related to interview management.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { sendSuccess, sendPaginated } from '../utils/response.js';

/**
 * Get all interviews with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getAllInterviews = async (req, res, next) => {
  try {
    console.log('req.container:', req.container);
    const { interviewService } = req.container.cradle;
    const { page = 1, limit = 10, status, candidateId, search } = req.query;
    
    const result = await interviewService.getAllInterviews({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
      candidateId,
      search
    });
    
    sendPaginated(
      res,
      200,
      'Interviews retrieved successfully',
      result.interviews,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get interview by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getInterviewById = async (req, res, next) => {
  try {
    const { interviewService } = req.container.cradle;
    const interview = await interviewService.getInterviewById(req.params.id);
    sendSuccess(res, 200, 'Interview retrieved successfully', interview);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const createInterview = async (req, res, next) => {
  try {
    console.log('req.container:', req.container); // Debug log
    const { interviewService } = req.container.cradle;
    const recruiterId = req.user.id; // Get the current user's ID from the JWT
    const interviewData = { ...req.body, recruiterId };
    
    const interview = await interviewService.createInterview(interviewData);
    sendSuccess(res, 201, 'Interview created successfully', interview);
  } catch (error) {
    next(error);
  }
};

/**
 * Update interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const updateInterview = async (req, res, next) => {
  try {
    const { interviewService } = req.container.cradle;
    const { id } = req.params;
    const updateData = req.body;
    
    const interview = await interviewService.updateInterview(id, updateData);
    sendSuccess(res, 200, 'Interview updated successfully', interview);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const deleteInterview = async (req, res, next) => {
  try {
    const { interviewService } = req.container.cradle;
    await interviewService.deleteInterview(req.params.id);
    sendSuccess(res, 200, 'Interview deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add questions to an interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const addQuestionsToInterview = async (req, res, next) => {
  try {
    const { interviewService } = req.container.cradle;
    const { id } = req.params;
    const { questions } = req.body;
    
    const interview = await interviewService.addQuestionsToInterview(id, questions);
    sendSuccess(res, 200, 'Questions added successfully', interview);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a question from an interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const removeQuestionFromInterview = async (req, res, next) => {
  try {
    const { interviewService } = req.container.cradle;
    const { id, questionId } = req.params;
    
    await interviewService.removeQuestionFromInterview(id, questionId);
    sendSuccess(res, 200, 'Question removed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Join an interview session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const joinInterview = async (req, res, next) => {
  try {
    const { interviewService } = req.container.cradle;
    const { id } = req.params;
    const userId = req.user.id;
    
    // Get the interview details
    const interview = await interviewService.getInterviewById(id);
    
    // Update the interview status to IN_PROGRESS if it's currently SCHEDULED
    if (interview.status === 'SCHEDULED') {
      await interviewService.updateInterview(id, { status: 'IN_PROGRESS' });
    }
    
    // Return the interview data and a token for video chat
    // In a real implementation, you might generate a token for video service here
    sendSuccess(res, 200, 'Successfully joined the interview', {
      interview,
      token: id // Using interview ID as token for simplicity
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
  addQuestionsToInterview,
  removeQuestionFromInterview,
  joinInterview
};