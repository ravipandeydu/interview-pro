/**
 * Question Service
 *
 * This module provides services for managing interview questions.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middlewares/error.middleware.js';

const prisma = new PrismaClient();

/**
 * Get all questions with filtering and pagination
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.category - Filter by question category
 * @param {string} options.difficulty - Filter by question difficulty
 * @param {string} options.search - Search by content or tags
 * @param {boolean} options.isActive - Filter by active status
 * @returns {Object} Questions and pagination info
 */
export const getAllQuestions = async ({ page = 1, limit = 10, category, difficulty, search, isActive }) => {
  const skip = (page - 1) * limit;

  // Build where clause for filtering
  const where = {};
  
  // Add category filter if provided
  if (category) {
    where.category = category;
  }

  // Add difficulty filter if provided
  if (difficulty) {
    where.difficulty = difficulty;
  }

  // Add isActive filter if provided
  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  // Add search filter if provided
  if (search) {
    where.OR = [
      { content: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
    ];
  }

  // Get questions with pagination and filtering
  const questions = await prisma.question.findMany({
    where,
    skip,
    take: Number(limit),
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Get total count for pagination
  const total = await prisma.question.count({ where });

  return {
    questions,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Get question by ID
 * @param {string} id - Question ID
 * @returns {Object} Question object
 */
export const getQuestionById = async (id) => {
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!question) {
    throw new ApiError('Question not found', 404);
  }

  return question;
};

/**
 * Create a new question
 * @param {Object} questionData - Question data
 * @returns {Object} Created question object
 */
export const createQuestion = async (questionData) => {
  // Create the question
  const question = await prisma.question.create({
    data: {
      content: questionData.content,
      category: questionData.category,
      difficulty: questionData.difficulty || 'MEDIUM',
      expectedAnswer: questionData.expectedAnswer,
      tags: questionData.tags || [],
      isActive: questionData.isActive !== undefined ? questionData.isActive : true,
      createdById: questionData.createdById,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return question;
};

/**
 * Update question
 * @param {string} id - Question ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated question object
 */
export const updateQuestion = async (id, updateData) => {
  // Check if question exists
  const question = await prisma.question.findUnique({
    where: { id },
  });

  if (!question) {
    throw new ApiError('Question not found', 404);
  }

  // Update question
  const updatedQuestion = await prisma.question.update({
    where: { id },
    data: updateData,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedQuestion;
};

/**
 * Delete question
 * @param {string} id - Question ID
 * @returns {boolean} Success status
 */
export const deleteQuestion = async (id) => {
  try {
    // Check if the question is used in any interviews
    const interviewQuestions = await prisma.interviewQuestion.findMany({
      where: { questionId: id },
    });

    if (interviewQuestions.length > 0) {
      // Instead of deleting, mark as inactive
      await prisma.question.update({
        where: { id },
        data: { isActive: false },
      });
      return true;
    }

    // If not used in any interviews, delete the question
    await prisma.question.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    if (error.code === 'P2025') {
      // Prisma record not found error
      throw new ApiError('Question not found', 404);
    }
    throw error;
  }
};

const questionService = {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};

export default questionService;