// src/utils/user.utils.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';

export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const generateAuthToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const changedPasswordAfter = (user, JWTTimestamp) => {
  if (user.passwordChangedAt) {
    const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

export const createPasswordResetToken = async (prisma, userId) => {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token
  const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set expiration (10 minutes)
  const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetToken,
      passwordResetExpires,
    },
  });

  return resetToken;
};
