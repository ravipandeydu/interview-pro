// src/services/auth.service.js

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import config from '../config/index.js';
import { ApiError } from '../middlewares/error.middleware.js';
import emailService from './email.service.js';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Generate JWT for a user
 * @param {Object} user - Prisma user object
 * @returns {string}
 */
function generateAuthToken(user) {
  if (!config.jwtSecret) {
    throw new Error('JWT secret not configured');
  }
  return jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Compare plaintext vs. hashed password
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

/**
 * Register a new user
 * @param {Object} userData - { name, email, password, role? }
 * @returns {{ user: Object, token: string }}
 */
export async function register(userData) {
  const email = userData.email.toLowerCase();

  // 1) Dup check
  const existing = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  });
  if (existing) {
    throw new ApiError('Email already registered', 400);
  }

  // 2) Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  // 3) Create user + add verification token
  let user;
  try {
    // Convert role string to enum value if provided
    let roleValue = Role.USER; // Default role
    if (userData.role) {
      // Make sure the role is a valid enum value
      if (Object.values(Role).includes(userData.role)) {
        roleValue = userData.role;
      } else {
        logger.warn(`Invalid role provided: ${userData.role}, using default USER role`);
      }
    }

    user = await prisma.user.create({
      data: {
        name: userData.name,
        email,
        password: hashedPassword,
        role: roleValue, // Use the enum value
        isEmailVerified: false, // ensure default false in schema
      },
    });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: tokenHash,
        emailVerificationExpires: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });

    // attach for email step
    user._rawVerificationToken = rawToken;
  } catch (err) {
    logger.error('Prisma error during registration', { err });
    throw new ApiError('Registration failed', 500);
  }

  // 4) Generate auth token
  let authToken;
  try {
    authToken = generateAuthToken(user);
  } catch (err) {
    logger.error('JWT generation failed', { err });
    throw new ApiError('Registration failed', 500);
  }

  // 5) Send verification email (non-fatal)
  // try {
  const url = `${config.frontend.url}/verify-email?token=${user._rawVerificationToken}`;
  console.log('Verification URL:', url);
  const res = await emailService.sendEmailVerification(user.email, {
    name: user.name,
    verificationURL: url,
  });
  console.log('Email sent:', res);
  // } catch (err) {
  //   logger.warn('Verification email send failed', { err });
  // }

  // 6) Return safe user
  /* eslint-disable no-unused-vars */
  const { password, emailVerificationToken, emailVerificationExpires, ...publicUser } = user;
  /* eslint-enable no-unused-vars */

  return { user: publicUser, token: authToken };
}

/**
 * Login a user
 * @param {string} email
 * @param {string} password
 * @returns {{ user: Object, token: string }}
 */
export async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError('Invalid email or password', 401);
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    throw new ApiError('Invalid email or password', 401);
  }

  if (!user.isEmailVerified) {
    throw new ApiError('Please verify your email before logging in', 401);
  }

  const token = generateAuthToken(user);
  const { password: _, ...publicUser } = user;
  return { user: publicUser, token };
}

/**
 * Send a password-reset email
 * @param {string} email
 * @returns {{ message: string }}
 */
export async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: tokenHash,
      passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  try {
    const resetUrl = `${config.frontend.url}/reset-password?token=${rawToken}`;
    await emailService.sendPasswordReset(user.email, {
      name: user.name,
      resetURL: resetUrl,
    });
    return { message: 'Password reset email sent' };
  } catch (err) {
    // rollback token on failure
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });
    logger.error('Password reset email failed', { err });
    throw new ApiError('Failed to send password reset email', 500);
  }
}

/**
 * Reset password via token
 * @param {string} token
 * @param {string} newPassword
 * @returns {{ message: string }}
 */
export async function resetPassword(token, newPassword) {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hash,
      passwordResetExpires: { gt: new Date() },
    },
  });
  if (!user) {
    throw new ApiError('Invalid or expired token', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const pwd = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password,
      passwordResetToken: null,
      passwordResetExpires: null,
      passwordChangedAt: new Date(),
    },
  });

  return { message: 'Password reset successful' };
}

/**
 * Update password when logged in
 * @param {number} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {{ message: string }}
 */
export async function updatePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  const valid = await comparePassword(currentPassword, user.password);
  if (!valid) {
    throw new ApiError('Current password is incorrect', 401);
  }

  const salt = await bcrypt.genSalt(10);
  const pwd = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: pwd,
      passwordChangedAt: new Date(),
    },
  });

  return { message: 'Password updated successfully' };
}

/**
 * Verify email via token
 * @param {string} token
 * @returns {{ message: string }}
 */
export async function verifyEmail(token) {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: hash,
      emailVerificationExpires: { gt: new Date() },
    },
  });
  if (!user) {
    throw new ApiError('Invalid or expired token', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });

  try {
    await emailService.sendWelcome(user.email, {
      name: user.name,
      loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
    });
  } catch (err) {
    logger.warn('Welcome email failed', { err });
  }

  return { message: 'Email verified successfully' };
}

/**
 * Resend verification email
 * @param {string} email
 * @returns {{ message: string }}
 */
export async function resendVerificationEmail(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  if (user.isEmailVerified) {
    throw new ApiError('Email already verified', 400);
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: tokenHash,
      emailVerificationExpires: new Date(Date.now() + 24 * 3600 * 1000),
    },
  });

  try {
    const url = `${config.frontend.url}/verify-email?token=${rawToken}`;
    await emailService.sendEmailVerification(user.email, {
      name: user.name,
      verificationURL: url,
    });
    return { message: 'Verification email sent' };
  } catch (err) {
    logger.error('Resend verification email failed', { err });
    throw new ApiError('Failed to send verification email', 500);
  }
}

export default {
  register,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
  resendVerificationEmail,
};
