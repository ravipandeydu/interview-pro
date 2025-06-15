/**
 * Response Service
 *
 * This module provides services for managing candidate responses to interview questions.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middlewares/error.middleware.js';

const prisma = new PrismaClient();

/**
 * Get response by ID
 * @param {string} id - Response ID
 * @returns {Object} Response object
 */
export const getResponseById = async (id) => {
  const response = await prisma.response.findUnique({
    where: { id },
    include: {
      interview: {
        select: {
          id: true,
          title: true,
          candidateId: true,
          recruiterId: true,
        },
      },
      interviewQuestion: {
        include: {
          question: true,
        },
      },
    },
  });

  if (!response) {
    throw new ApiError('Response not found', 404);
  }

  return response;
};

/**
 * Submit a response to an interview question
 * @param {Object} responseData - Response data
 * @returns {Object} Created response object
 */
export const submitResponse = async (responseData) => {
  // Check if interview exists
  const interview = await prisma.interview.findUnique({
    where: { id: responseData.interviewId },
  });

  if (!interview) {
    throw new ApiError('Interview not found', 404);
  }

  // Check if interview question exists
  const interviewQuestion = await prisma.interviewQuestion.findUnique({
    where: { id: responseData.interviewQuestionId },
    include: {
      response: true,
    },
  });

  if (!interviewQuestion) {
    throw new ApiError('Interview question not found', 404);
  }

  // Check if the interview question belongs to the specified interview
  if (interviewQuestion.interviewId !== responseData.interviewId) {
    throw new ApiError('Interview question does not belong to the specified interview', 400);
  }

  // Check if a response already exists for this question
  if (interviewQuestion.response) {
    throw new ApiError('A response already exists for this question', 409);
  }

  // Create the response
  const response = await prisma.response.create({
    data: {
      content: responseData.content,
      recordingUrl: responseData.recordingUrl,
      interviewId: responseData.interviewId,
      interviewQuestionId: responseData.interviewQuestionId,
    },
    include: {
      interview: {
        select: {
          id: true,
          title: true,
        },
      },
      interviewQuestion: {
        include: {
          question: true,
        },
      },
    },
  });

  return response;
};

/**
 * Create a new response or update an existing one
 * @param {Object} prisma - Prisma client instance
 * @param {Object} responseData - Response data
 * @returns {Object} Created or updated response object
 */
export const createOrUpdateResponse = async (prismaClient, responseData) => {
  const { interviewId, interviewQuestionId, content, recordingUrl } = responseData;
  
  // Check if interview exists
  const interview = await prismaClient.interview.findUnique({
    where: { id: interviewId },
  });

  if (!interview) {
    throw new ApiError('Interview not found', 404);
  }

  // Check if interview question exists
  const interviewQuestion = await prismaClient.interviewQuestion.findUnique({
    where: { id: interviewQuestionId },
    include: {
      response: true,
    },
  });

  if (!interviewQuestion) {
    throw new ApiError('Interview question not found', 404);
  }

  // Check if the interview question belongs to the specified interview
  if (interviewQuestion.interviewId !== interviewId) {
    throw new ApiError('Interview question does not belong to the specified interview', 400);
  }

  // If a response already exists, update it; otherwise, create a new one
  if (interviewQuestion.response) {
    // Update existing response
    return await prismaClient.response.update({
      where: { id: interviewQuestion.response.id },
      data: {
        content,
        recordingUrl,
      },
      include: {
        interview: {
          select: {
            id: true,
            title: true,
          },
        },
        interviewQuestion: {
          include: {
            question: true,
          },
        },
      },
    });
  } else {
    // Create new response
    return await prismaClient.response.create({
      data: {
        content,
        recordingUrl,
        interviewId,
        interviewQuestionId,
      },
      include: {
        interview: {
          select: {
            id: true,
            title: true,
          },
        },
        interviewQuestion: {
          include: {
            question: true,
          },
        },
      },
    });
  }
};

/**
 * Update a response
 * @param {string} id - Response ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated response object
 */
export const updateResponse = async (id, updateData) => {
  // Check if response exists
  const response = await prisma.response.findUnique({
    where: { id },
  });

  if (!response) {
    throw new ApiError('Response not found', 404);
  }

  // Update response
  const updatedResponse = await prisma.response.update({
    where: { id },
    data: updateData,
    include: {
      interview: {
        select: {
          id: true,
          title: true,
        },
      },
      interviewQuestion: {
        include: {
          question: true,
        },
      },
    },
  });

  return updatedResponse;
};

/**
 * Delete a response
 * @param {string} id - Response ID
 * @returns {boolean} Success status
 */
export const deleteResponse = async (id) => {
  try {
    await prisma.response.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    if (error.code === 'P2025') {
      // Prisma record not found error
      throw new ApiError('Response not found', 404);
    }
    throw error;
  }
};

/**
 * Get all responses for an interview
 * @param {string} interviewId - Interview ID
 * @returns {Array} Array of response objects
 */
export const getResponsesByInterviewId = async (interviewId) => {
  // Check if interview exists
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });

  if (!interview) {
    throw new ApiError('Interview not found', 404);
  }

  // Get all responses for the interview
  const responses = await prisma.response.findMany({
    where: { interviewId },
    include: {
      interviewQuestion: {
        include: {
          question: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return responses;
};

const responseService = {
  getResponseById,
  submitResponse,
  createOrUpdateResponse,
  updateResponse,
  deleteResponse,
  getResponsesByInterviewId,
};

export default responseService;