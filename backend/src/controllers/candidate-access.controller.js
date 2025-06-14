/**
 * Candidate Access Controller
 *
 * This module handles HTTP requests related to candidate access to interviews.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { sendSuccess } from '../utils/response.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';

/**
 * Generate and send an interview access link to a candidate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const generateAndSendAccessLink = async (req, res, next) => {
  try {
    const { candidateAccessService } = req.container.cradle;
    const { interviewId } = req.params;
    const { expiresInDays } = req.body;

    // Create access token
    const interview = await candidateAccessService.createInterviewAccessToken(
      req.container.cradle.prisma,
      interviewId,
      expiresInDays
    );

    // Send invitation email
    await candidateAccessService.sendInterviewInvitation(
      req.container.cradle.prisma,
      interviewId
    );

    sendSuccess(res, 200, 'Interview invitation sent successfully', {
      interviewId: interview.id,
      candidateEmail: interview.candidate.email,
      invitationSentAt: interview.invitationSentAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get interview details using an access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getInterviewByAccessToken = async (req, res, next) => {
  try {
    const { candidateAccessService } = req.container.cradle;
    const { accessToken } = req.params;

    // Validate access token and get interview
    const interview = await candidateAccessService.validateAccessToken(
      req.container.cradle.prisma,
      accessToken
    );

    // Prepare the response data (exclude sensitive information)
    const responseData = {
      id: interview.id,
      title: interview.title,
      description: interview.description,
      scheduledDate: interview.scheduledDate,
      duration: interview.duration,
      status: interview.status,
      candidate: {
        id: interview.candidate.id,
        fullName: interview.candidate.fullName,
      },
      questions: interview.questions.map(iq => ({
        id: iq.id,
        order: iq.order,
        customInstructions: iq.customInstructions,
        question: {
          id: iq.question.id,
          content: iq.question.content,
          category: iq.question.category,
          difficulty: iq.question.difficulty,
        },
        response: iq.response ? {
          id: iq.response.id,
          content: iq.response.content,
        } : null,
      })),
    };

    sendSuccess(res, 200, 'Interview retrieved successfully', responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * Start an interview as a candidate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const startInterview = async (req, res, next) => {
  try {
    const { candidateAccessService } = req.container.cradle;
    const { accessToken } = req.params;

    // Start the interview
    const interview = await candidateAccessService.startCandidateInterview(
      req.container.cradle.prisma,
      accessToken
    );

    sendSuccess(res, 200, 'Interview started successfully', {
      interviewId: interview.id,
      status: interview.status,
      startedAt: interview.candidateStartedAt,
    });
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
    const { candidateAccessService, responseService } = req.container.cradle;
    const { accessToken, questionId } = req.params;
    const { content } = req.body;

    if (!content) {
      throw new BadRequestError('Response content is required');
    }

    // Validate access token first
    const interview = await candidateAccessService.validateAccessToken(
      req.container.cradle.prisma,
      accessToken
    );

    // Find the interview question
    const interviewQuestion = interview.questions.find(iq => iq.id === questionId);
    if (!interviewQuestion) {
      throw new BadRequestError('Question not found in this interview');
    }

    // Create or update the response
    const response = await responseService.createOrUpdateResponse(
      req.container.cradle.prisma,
      {
        interviewId: interview.id,
        interviewQuestionId: questionId,
        content,
      }
    );

    sendSuccess(res, 200, 'Response submitted successfully', response);
  } catch (error) {
    next(error);
  }
};

/**
 * Complete an interview as a candidate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const completeInterview = async (req, res, next) => {
  try {
    const { candidateAccessService } = req.container.cradle;
    const { accessToken } = req.params;

    // Complete the interview
    const interview = await candidateAccessService.completeCandidateInterview(
      req.container.cradle.prisma,
      accessToken
    );

    sendSuccess(res, 200, 'Interview completed successfully', {
      interviewId: interview.id,
      status: interview.status,
      completedAt: interview.candidateCompletedAt,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  generateAndSendAccessLink,
  getInterviewByAccessToken,
  startInterview,
  submitResponse,
  completeInterview,
};