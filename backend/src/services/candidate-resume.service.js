/**
 * Candidate Resume Service
 *
 * This module provides services for handling candidate resume uploads.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middlewares/error.middleware.js';
import { uploadToR2, generateUniqueFileName } from './cloudflare-r2.service.js';

const prisma = new PrismaClient();

/**
 * Upload candidate resume
 * @param {string} candidateId - Candidate ID
 * @param {Buffer} fileBuffer - Resume file buffer
 * @param {string} originalFilename - Original filename
 * @param {string} mimeType - File MIME type
 * @returns {Object} Updated candidate with resume URL
 */
export const uploadCandidateResume = async (candidateId, fileBuffer, originalFilename, mimeType) => {
  // Check if candidate exists
  const candidate = await prisma.candidateProfile.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) {
    throw new ApiError('Candidate not found', 404);
  }

  // Validate file type
  if (mimeType !== 'application/pdf') {
    throw new ApiError('Only PDF files are allowed for resumes', 400);
  }

  try {
    // Generate unique filename
    const fileName = generateUniqueFileName(candidateId, originalFilename);
    
    // Upload to R2
    const resumeUrl = await uploadToR2(fileBuffer, fileName, mimeType, 'resumes');
    
    // Update candidate with resume URL
    const updatedCandidate = await prisma.candidateProfile.update({
      where: { id: candidateId },
      data: { resumeUrl },
    });

    return {
      resumeUrl,
      candidate: updatedCandidate
    };
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw new ApiError('Failed to upload resume', 500);
  }
};

const candidateResumeService = {
  uploadCandidateResume,
};

export default candidateResumeService;