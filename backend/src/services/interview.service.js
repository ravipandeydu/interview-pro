/**
 * Interview Service
 *
 * This module provides services for interview management, including fetching,
 * creating, updating, and deleting interviews.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middlewares/error.middleware.js';

const prisma = new PrismaClient();

/**
 * Get all interviews with filtering and pagination
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.status - Filter by interview status
 * @param {string} options.candidateId - Filter by candidate ID
 * @param {string} options.search - Search by title or description
 * @returns {Object} Interviews and pagination info
 */
export const getAllInterviews = async ({ page = 1, limit = 10, status, candidateId, search }) => {
  const skip = (page - 1) * limit;

  // Build where clause for filtering
  const where = {};
  
  // Add status filter if provided
  if (status) {
    where.status = status;
  }

  // Add candidateId filter if provided
  if (candidateId) {
    where.candidateId = candidateId;
  }

  // Add search filter if provided
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Get interviews with pagination and filtering
  const interviews = await prisma.interview.findMany({
    where,
    skip,
    take: Number(limit),
    orderBy: {
      scheduledDate: 'asc',
    },
    include: {
      candidate: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      recruiter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      questions: {
        include: {
          question: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  // Get total count for pagination
  const total = await prisma.interview.count({ where });

  return {
    interviews,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Get interview by ID
 * @param {string} id - Interview ID
 * @returns {Object} Interview object
 */
export const getInterviewById = async (id) => {
  const interview = await prisma.interview.findUnique({
    where: { id },
    include: {
      candidate: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          skills: true,
          experienceYears: true,
          currentPosition: true,
          currentCompany: true,
        },
      },
      recruiter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      questions: {
        include: {
          question: true,
          response: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
      responses: true,
    },
  });

  if (!interview) {
    throw new ApiError('Interview not found', 404);
  }

  return interview;
};

/**
 * Create a new interview
 * @param {Object} interviewData - Interview data
 * @returns {Object} Created interview object
 */
export const createInterview = async (interviewData) => {
  // Check if candidate exists
  const candidate = await prisma.candidateProfile.findUnique({
    where: { id: interviewData.candidateId },
  });

  if (!candidate) {
    throw new ApiError('Candidate not found', 404);
  }

  // Extract questions from the interview data
  const { questions, ...interviewDetails } = interviewData;

  // Create the interview in a transaction
  return await prisma.$transaction(async (prisma) => {
    // Create the interview
    const interview = await prisma.interview.create({
      data: {
        ...interviewDetails,
        status: interviewDetails.status || 'SCHEDULED',
      },
    });

    // Add questions if provided
    if (questions && questions.length > 0) {
      // Validate that all questions exist
      const questionIds = questions.map(q => q.questionId);
      const existingQuestions = await prisma.question.findMany({
        where: {
          id: { in: questionIds },
        },
      });

      if (existingQuestions.length !== questionIds.length) {
        throw new ApiError('One or more questions not found', 404);
      }

      // Create interview questions
      await Promise.all(
        questions.map((q, index) =>
          prisma.interviewQuestion.create({
            data: {
              interviewId: interview.id,
              questionId: q.questionId,
              order: q.order || index + 1,
              customInstructions: q.customInstructions,
            },
          })
        )
      );
    }

    // Return the created interview with related data
    return await prisma.interview.findUnique({
      where: { id: interview.id },
      include: {
        candidate: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        recruiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        questions: {
          include: {
            question: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  });
};

/**
 * Update interview
 * @param {string} id - Interview ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated interview object
 */
export const updateInterview = async (id, updateData) => {
  // Check if interview exists
  const interview = await prisma.interview.findUnique({
    where: { id },
  });

  if (!interview) {
    throw new ApiError('Interview not found', 404);
  }

  // Update interview
  const updatedInterview = await prisma.interview.update({
    where: { id },
    data: updateData,
    include: {
      candidate: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      recruiter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      questions: {
        include: {
          question: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  return updatedInterview;
};

/**
 * Delete interview
 * @param {string} id - Interview ID
 * @returns {boolean} Success status
 */
export const deleteInterview = async (id) => {
  try {
    // Delete all related interview questions and responses first
    await prisma.$transaction(async (prisma) => {
      // Get all interview question IDs
      const interviewQuestions = await prisma.interviewQuestion.findMany({
        where: { interviewId: id },
        select: { id: true },
      });
      
      const interviewQuestionIds = interviewQuestions.map(q => q.id);
      
      // Delete responses associated with these questions
      if (interviewQuestionIds.length > 0) {
        await prisma.response.deleteMany({
          where: {
            interviewQuestionId: { in: interviewQuestionIds },
          },
        });
      }
      
      // Delete interview questions
      await prisma.interviewQuestion.deleteMany({
        where: { interviewId: id },
      });
      
      // Delete the interview
      await prisma.interview.delete({
        where: { id },
      });
    });

    return true;
  } catch (error) {
    if (error.code === 'P2025') {
      // Prisma record not found error
      throw new ApiError('Interview not found', 404);
    }
    throw error;
  }
};

/**
 * Add questions to an interview
 * @param {string} id - Interview ID
 * @param {Array} questions - Array of question objects with questionId, order, and customInstructions
 * @returns {Object} Updated interview object
 */
export const addQuestionsToInterview = async (id, questions) => {
  // Check if interview exists
  const interview = await prisma.interview.findUnique({
    where: { id },
    include: {
      questions: true,
    },
  });

  if (!interview) {
    throw new ApiError('Interview not found', 404);
  }

  // Validate that all questions exist
  const questionIds = questions.map(q => q.questionId);
  const existingQuestions = await prisma.question.findMany({
    where: {
      id: { in: questionIds },
    },
  });

  if (existingQuestions.length !== questionIds.length) {
    throw new ApiError('One or more questions not found', 404);
  }

  // Check for duplicate questions
  const existingQuestionIds = interview.questions.map(q => q.questionId);
  const duplicateQuestions = questionIds.filter(id => existingQuestionIds.includes(id));

  if (duplicateQuestions.length > 0) {
    throw new ApiError('One or more questions are already added to this interview', 400);
  }

  // Add questions to the interview
  await Promise.all(
    questions.map((q, index) =>
      prisma.interviewQuestion.create({
        data: {
          interviewId: id,
          questionId: q.questionId,
          order: q.order || existingQuestionIds.length + index + 1,
          customInstructions: q.customInstructions,
        },
      })
    )
  );

  // Return the updated interview
  return await prisma.interview.findUnique({
    where: { id },
    include: {
      candidate: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      recruiter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      questions: {
        include: {
          question: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });
};

/**
 * Remove a question from an interview
 * @param {string} id - Interview ID
 * @param {string} questionId - Question ID
 * @returns {boolean} Success status
 */
export const removeQuestionFromInterview = async (id, questionId) => {
  // Check if interview exists
  const interview = await prisma.interview.findUnique({
    where: { id },
  });

  if (!interview) {
    throw new ApiError('Interview not found', 404);
  }

  // Find the interview question
  const interviewQuestion = await prisma.interviewQuestion.findFirst({
    where: {
      interviewId: id,
      questionId,
    },
  });

  if (!interviewQuestion) {
    throw new ApiError('Question not found in this interview', 404);
  }

  // Delete any responses associated with this question
  await prisma.$transaction(async (prisma) => {
    await prisma.response.deleteMany({
      where: {
        interviewQuestionId: interviewQuestion.id,
      },
    });

    // Delete the interview question
    await prisma.interviewQuestion.delete({
      where: {
        id: interviewQuestion.id,
      },
    });
  });

  return true;
};

const interviewService = {
  getAllInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
  addQuestionsToInterview,
  removeQuestionFromInterview,
};

export default interviewService;