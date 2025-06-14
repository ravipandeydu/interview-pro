/**
 * Candidate Access Service
 *
 * This module provides services for managing candidate access to interviews.
 * It handles token generation, email invitations, and access validation.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import crypto from 'crypto';
import { addDays } from 'date-fns';
import emailService from './email.service.js';
import config from '../config/index.js';
import { NotFoundError, BadRequestError, UnauthorizedError } from '../utils/errors.js';

/**
 * Generate a secure random token for interview access
 * @returns {string} A secure random token
 */
const generateAccessToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create an access token for a candidate to access an interview
 * @param {Object} prisma - Prisma client instance
 * @param {string} interviewId - ID of the interview
 * @param {number} expiresInDays - Number of days until token expires (default: 7)
 * @returns {Promise<Object>} The updated interview with access token
 */
const createInterviewAccessToken = async (prisma, interviewId, expiresInDays = 7) => {
  // Check if interview exists
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { candidate: true }
  });

  if (!interview) {
    throw new NotFoundError('Interview not found');
  }

  // Generate a new access token
  const accessToken = generateAccessToken();
  const accessTokenExpires = addDays(new Date(), expiresInDays);

  // Update the interview with the new token
  const updatedInterview = await prisma.interview.update({
    where: { id: interviewId },
    data: {
      accessToken,
      accessTokenExpires,
    },
    include: { candidate: true }
  });

  return updatedInterview;
};

/**
 * Send an interview invitation email to a candidate
 * @param {Object} prisma - Prisma client instance
 * @param {string} interviewId - ID of the interview
 * @returns {Promise<Object>} The updated interview with invitation sent timestamp
 */
const sendInterviewInvitation = async (prisma, interviewId) => {
  // Get interview with access token
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { candidate: true }
  });

  if (!interview) {
    throw new NotFoundError('Interview not found');
  }

  if (!interview.accessToken) {
    throw new BadRequestError('Interview does not have an access token');
  }

  // Create the interview access URL
  const interviewAccessUrl = `${config.frontend.url}/interview/access/${interview.accessToken}`;

  // Send the email
  await emailService.sendEmail({
    to: interview.candidate.email,
    subject: `Interview Invitation: ${interview.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Interview Invitation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6e8efb 0%, #a777e3 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Interview Invitation</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
          <h2 style="color: #333; margin-top: 0;">Hello ${interview.candidate.fullName},</h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            You have been invited to participate in an interview titled <strong>${interview.title}</strong>.
          </p>
          
          <div style="background: #e9f7fe; padding: 15px; border-radius: 6px; border-left: 4px solid #3498db; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #3498db;">Interview Details:</h3>
            <p><strong>Date:</strong> ${new Date(interview.scheduledDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(interview.scheduledDate).toLocaleTimeString()}</p>
            <p><strong>Duration:</strong> ${interview.duration} minutes</p>
            ${interview.description ? `<p><strong>Description:</strong> ${interview.description}</p>` : ''}
          </div>
          
          <p style="font-size: 16px;">
            Please click the button below to access your interview. This link is unique to you and will expire on ${new Date(interview.accessTokenExpires).toLocaleDateString()}.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${interviewAccessUrl}" style="display: inline-block; background: #6e8efb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Access Interview</a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you have any questions, please contact the recruiter directly.
          </p>
          
          <p style="font-size: 12px; color: #666; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <span style="word-break: break-all; color: #007bff;">${interviewAccessUrl}</span>
          </p>
        </div>
      </body>
      </html>
    `,
  });

  // Update the interview with the invitation sent timestamp
  const updatedInterview = await prisma.interview.update({
    where: { id: interviewId },
    data: {
      invitationSentAt: new Date(),
    },
  });

  return updatedInterview;
};

/**
 * Validate an interview access token and get the interview
 * @param {Object} prisma - Prisma client instance
 * @param {string} accessToken - The access token to validate
 * @returns {Promise<Object>} The interview if token is valid
 */
const validateAccessToken = async (prisma, accessToken) => {
  if (!accessToken) {
    throw new UnauthorizedError('Access token is required');
  }

  // Find the interview with the given access token
  const interview = await prisma.interview.findUnique({
    where: { accessToken },
    include: {
      candidate: true,
      questions: {
        include: {
          question: true,
          response: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  if (!interview) {
    throw new UnauthorizedError('Invalid access token');
  }

  // Check if token has expired
  if (interview.accessTokenExpires && new Date() > new Date(interview.accessTokenExpires)) {
    throw new UnauthorizedError('Access token has expired');
  }

  return interview;
};

/**
 * Update the interview status when a candidate starts the interview
 * @param {Object} prisma - Prisma client instance
 * @param {string} accessToken - The access token
 * @returns {Promise<Object>} The updated interview
 */
const startCandidateInterview = async (prisma, accessToken) => {
  // Validate the access token first
  const interview = await validateAccessToken(prisma, accessToken);

  // Update the interview status and start time if not already started
  if (!interview.candidateStartedAt) {
    return await prisma.interview.update({
      where: { id: interview.id },
      data: {
        status: 'IN_PROGRESS',
        candidateStartedAt: new Date(),
      },
    });
  }

  return interview;
};

/**
 * Update the interview status when a candidate completes the interview
 * @param {Object} prisma - Prisma client instance
 * @param {string} accessToken - The access token
 * @returns {Promise<Object>} The updated interview
 */
const completeCandidateInterview = async (prisma, accessToken) => {
  // Validate the access token first
  const interview = await validateAccessToken(prisma, accessToken);

  // Update the interview status and completion time
  return await prisma.interview.update({
    where: { id: interview.id },
    data: {
      status: 'COMPLETED',
      candidateCompletedAt: new Date(),
    },
  });
};

export default {
  createInterviewAccessToken,
  sendInterviewInvitation,
  validateAccessToken,
  startCandidateInterview,
  completeCandidateInterview,
};