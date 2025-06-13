/**
 * Response Controller
 *
 * This module handles HTTP requests related to candidate responses to interview questions.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { sendSuccess, sendPaginated } from '../utils/response.js';

/**
 * Get response by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getResponseById = async (req, res, next) => {
  try {
    const { responseService } = req.scope;
    const response = await responseService.getResponseById(req.params.id);
    sendSuccess(res, 200, 'Response retrieved successfully', response);
  } catch (error) {
    next(error);
  }
};

/**
 * Submit a response to an interview question
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const submitResponse = async (req, res, next) => {
  try {
    const { responseService } = req.scope;
    const responseData = req.body;
    
    const response = await responseService.submitResponse(responseData);
    sendSuccess(res, 201, 'Response submitted successfully', response);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a response (recruiter only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const updateResponse = async (req, res, next) => {
  try {
    const { responseService } = req.scope;
    const { id } = req.params;
    const updateData = req.body;
    
    const response = await responseService.updateResponse(id, updateData);
    sendSuccess(res, 200, 'Response updated successfully', response);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const deleteResponse = async (req, res, next) => {
  try {
    const { responseService } = req.scope;
    await responseService.deleteResponse(req.params.id);
    sendSuccess(res, 200, 'Response deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all responses for an interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getResponsesByInterviewId = async (req, res, next) => {
  try {
    const { responseService } = req.scope;
    const { interviewId } = req.params;
    
    const responses = await responseService.getResponsesByInterviewId(interviewId);
    sendSuccess(res, 200, 'Responses retrieved successfully', responses);
  } catch (error) {
    next(error);
  }
};

/**
 * Analyze a response using AI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const analyzeResponse = async (req, res, next) => {
  try {
    const { responseService, aiService } = req.scope;
    const { id } = req.params;
    
    // Get the response
    const response = await responseService.getResponseById(id);
    
    // Get the question associated with this response
    const interviewQuestion = response.interviewQuestion;
    const question = interviewQuestion.question;
    
    // Analyze the response using AI
    const analysis = await aiService.analyzeInterviewResponse({
      questionContent: question.content,
      questionCategory: question.category,
      questionDifficulty: question.difficulty,
      expectedAnswer: question.expectedAnswer,
      responseContent: response.content,
      transcriptText: response.transcriptText || response.content,
    });
    
    // Update the response with AI analysis
    const updatedResponse = await responseService.updateResponse(id, {
      aiAnalysisScore: analysis.score,
      aiAnalysisDetails: analysis.details,
    });
    
    sendSuccess(res, 200, 'Response analyzed successfully', updatedResponse);
  } catch (error) {
    next(error);
  }
};

export default {
  getResponseById,
  submitResponse,
  updateResponse,
  deleteResponse,
  getResponsesByInterviewId,
  analyzeResponse
};