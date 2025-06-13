/**
 * Question Controller
 *
 * This module handles HTTP requests related to interview questions management.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { sendSuccess, sendPaginated } from '../utils/response.js';

/**
 * Get all questions with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getAllQuestions = async (req, res, next) => {
  try {
    const { questionService } = req.scope;
    const { page = 1, limit = 10, category, difficulty, search, isActive } = req.query;
    
    const result = await questionService.getAllQuestions({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      category,
      difficulty,
      search,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
    
    sendPaginated(
      res,
      200,
      'Questions retrieved successfully',
      result.questions,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get question by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getQuestionById = async (req, res, next) => {
  try {
    const { questionService } = req.scope;
    const question = await questionService.getQuestionById(req.params.id);
    sendSuccess(res, 200, 'Question retrieved successfully', question);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new question
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const createQuestion = async (req, res, next) => {
  try {
    const { questionService } = req.scope;
    const createdById = req.user.id; // Get the current user's ID from the JWT
    const questionData = { ...req.body, createdById };
    
    const question = await questionService.createQuestion(questionData);
    sendSuccess(res, 201, 'Question created successfully', question);
  } catch (error) {
    next(error);
  }
};

/**
 * Update question
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const updateQuestion = async (req, res, next) => {
  try {
    const { questionService } = req.scope;
    const { id } = req.params;
    const updateData = req.body;
    
    const question = await questionService.updateQuestion(id, updateData);
    sendSuccess(res, 200, 'Question updated successfully', question);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete question
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const deleteQuestion = async (req, res, next) => {
  try {
    const { questionService } = req.scope;
    await questionService.deleteQuestion(req.params.id);
    sendSuccess(res, 200, 'Question deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Generate interview questions using AI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const generateQuestions = async (req, res, next) => {
  try {
    const { questionService, aiService } = req.scope;
    const { jobTitle, skills, categories, count = 5 } = req.body;
    const createdById = req.user.id;
    
    // Generate questions using AI
    const generatedQuestions = await aiService.generateInterviewQuestions({
      jobTitle,
      skills,
      categories,
      count: parseInt(count, 10),
    });
    
    // Save the generated questions to the database
    const savedQuestions = await Promise.all(
      generatedQuestions.map(q => questionService.createQuestion({
        ...q,
        createdById,
      }))
    );
    
    sendSuccess(res, 200, 'Questions generated successfully', savedQuestions);
  } catch (error) {
    next(error);
  }
};

export default {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  generateQuestions
};