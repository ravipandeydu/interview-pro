/**
 * Collaborative Code Service
 *
 * This module provides services for managing collaborative code during interviews.
 */

import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middlewares/error.middleware.js';

const prisma = new PrismaClient();

/**
 * Get collaborative code for an interview
 * @param {string} interviewId - Interview ID
 * @returns {Object} Collaborative code object
 */
export const getCollaborativeCode = async (interviewId) => {
  // Check if interview exists
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });

  if (!interview) {
    throw new ApiError('Interview not found', 404);
  }

  // Get or create collaborative code
  let code = await prisma.collaborativeCode.findUnique({
    where: { interviewId },
  });

  // If code doesn't exist, create it
  if (!code) {
    code = await prisma.collaborativeCode.create({
      data: {
        interviewId,
        code: '',
        language: 'javascript',
      },
    });
  }

  // Get active users (this would typically come from a real-time system)
  // For now, we'll just return the recruiter and candidate as active users
  const activeUsers = await getActiveUsers(interviewId);

  return {
    ...code,
    activeUsers,
  };
};

/**
 * Update collaborative code for an interview
 * @param {string} interviewId - Interview ID
 * @param {Object} codeData - Code data to update
 * @returns {Object} Updated collaborative code object
 */
export const updateCollaborativeCode = async (interviewId, codeData) => {
  // Check if interview exists
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });

  if (!interview) {
    throw new ApiError('Interview not found', 404);
  }

  // Get or create collaborative code
  let code = await prisma.collaborativeCode.findUnique({
    where: { interviewId },
  });

  // If code doesn't exist, create it
  if (!code) {
    code = await prisma.collaborativeCode.create({
      data: {
        interviewId,
        code: codeData.code || '',
        language: codeData.language || 'javascript',
      },
    });
  } else {
    // Update existing code
    code = await prisma.collaborativeCode.update({
      where: { interviewId },
      data: {
        code: codeData.code !== undefined ? codeData.code : code.code,
        language: codeData.language || code.language,
        updatedAt: new Date(),
      },
    });
  }

  // Get active users (this would typically come from a real-time system)
  const activeUsers = await getActiveUsers(interviewId);

  return {
    ...code,
    activeUsers,
  };
};

/**
 * Get active users for an interview
 * This is a placeholder function that would typically be replaced with
 * actual user presence tracking in a real-time system
 * 
 * @param {string} interviewId - Interview ID
 * @returns {Array} Array of active users
 */
async function getActiveUsers(interviewId) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      recruiter: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      candidate: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!interview) {
    return [];
  }

  // Return recruiter and candidate as active users
  return [
    {
      id: interview.recruiter.id,
      name: interview.recruiter.name,
      email: interview.recruiter.email,
      avatar: interview.recruiter.avatar,
      role: 'RECRUITER',
    },
    {
      id: interview.candidate.id,
      name: interview.candidate.fullName,
      email: interview.candidate.email,
      role: 'CANDIDATE',
    },
  ];
}