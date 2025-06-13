/**
 * Candidate Service
 *
 * This module provides services for candidate management, including fetching,
 * creating, updating, and deleting candidates.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middlewares/error.middleware.js';

const prisma = new PrismaClient();

/**
 * Get all candidates with filtering and pagination
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.status - Filter by candidate status
 * @param {string} options.search - Search by name, email, or skills
 * @returns {Object} Candidates and pagination info
 */
export const getAllCandidates = async ({ page = 1, limit = 10, status, search }) => {
  const skip = (page - 1) * limit;

  // Build where clause for filtering
  const where = {};
  
  // Add status filter if provided
  if (status) {
    where.status = status;
  }

  // Add search filter if provided
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { skills: { has: search } },
    ];
  }

  // Get candidates with pagination and filtering
  const candidates = await prisma.candidateProfile.findMany({
    where,
    skip,
    take: Number(limit),
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Get total count for pagination
  const total = await prisma.candidateProfile.count({ where });

  return {
    candidates,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Get candidate by ID
 * @param {string} id - Candidate ID
 * @returns {Object} Candidate object
 */
export const getCandidateById = async (id) => {
  const candidate = await prisma.candidateProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!candidate) {
    throw new ApiError('Candidate not found', 404);
  }

  return candidate;
};

/**
 * Create a new candidate
 * @param {Object} candidateData - Candidate data
 * @returns {Object} Created candidate object
 */
export const createCandidate = async (candidateData) => {
  // Check if candidate with this email already exists
  const existingCandidate = await prisma.candidateProfile.findFirst({
    where: { email: candidateData.email },
  });

  if (existingCandidate) {
    throw new ApiError('Candidate with this email already exists', 409);
  }

  // Create the candidate
  const candidate = await prisma.candidateProfile.create({
    data: {
      ...candidateData,
      status: candidateData.status || 'NEW',
      skills: candidateData.skills || [],
    },
  });

  return candidate;
};

/**
 * Update candidate
 * @param {string} id - Candidate ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated candidate object
 */
export const updateCandidate = async (id, updateData) => {
  // Check if candidate exists
  const candidate = await prisma.candidateProfile.findUnique({
    where: { id },
  });

  if (!candidate) {
    throw new ApiError('Candidate not found', 404);
  }

  // Check if email is being updated and if it's already in use
  if (updateData.email && updateData.email !== candidate.email) {
    const existingCandidate = await prisma.candidateProfile.findFirst({
      where: { 
        email: updateData.email,
        id: { not: id }
      },
    });

    if (existingCandidate) {
      throw new ApiError('Email already in use by another candidate', 409);
    }
  }

  // Update candidate
  const updatedCandidate = await prisma.candidateProfile.update({
    where: { id },
    data: updateData,
  });

  return updatedCandidate;
};

/**
 * Delete candidate
 * @param {string} id - Candidate ID
 * @returns {boolean} Success status
 */
export const deleteCandidate = async (id) => {
  try {
    await prisma.candidateProfile.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    if (error.code === 'P2025') {
      // Prisma record not found error
      throw new ApiError('Candidate not found', 404);
    }
    throw error;
  }
};

const candidateService = {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
};

export default candidateService;