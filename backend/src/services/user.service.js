/**
 * User Service
 *
 * This module provides services for user management, including fetching,
 * updating, and deleting users.
 *
 * @author Auto-generated
 * @date ${new Date().toISOString().split('T')[0]}
 */

import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middlewares/error.middleware.js';
import { uploadToR2, deleteFromR2, generateUniqueFileName } from './cloudflare-r2.service.js';

const prisma = new PrismaClient();

/**
 * Get all users with pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Users and pagination info
 */
export const getAllUsers = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Get users with pagination
  const users = await prisma.user.findMany({
    skip,
    take: Number(limit),
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatar: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Get total count for pagination
  const total = await prisma.user.count();

  return {
    users,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Object} User object
 */
export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatar: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  return user;
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated user object
 */
export const updateUser = async (userId, updateData) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  // Check if email is being updated and if it's already in use
  if (updateData.email && updateData.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: updateData.email },
    });

    if (existingUser) {
      throw new ApiError('Email already in use', 409);
    }
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatar: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {boolean} Success status
 */
export const deleteUser = async (userId) => {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    return true;
  } catch (error) {
    if (error.code === 'P2025') {
      // Prisma record not found error
      throw new ApiError('User not found', 404);
    }
    throw error;
  }
};

/**
 * Get current user profile
 * @param {string} userId - User ID
 * @returns {Object} User object
 */
export const getProfile = async (userId) => {
  return await getUserById(userId);
};

/**
 * Update current user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated user object
 */
export const updateProfile = async (userId, updateData) => {
  // Only allow updating certain fields
  const allowedUpdates = ['name', 'email', 'bio'];
  const filteredData = Object.keys(updateData)
    .filter((key) => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = updateData[key];
      return obj;
    }, {});

  return await updateUser(userId, filteredData);
};

/**
 * Upload user avatar
 * @param {string} userId - User ID
 * @param {Object} file - Uploaded file object
 * @returns {string} Avatar URL
 */
export const uploadAvatar = async (userId, file) => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new ApiError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.', 400);
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new ApiError('File too large. Maximum size is 5MB.', 400);
    }

    // Get current user to delete old avatar if exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Generate unique filename
    const fileName = generateUniqueFileName(userId, file.originalname);

    // Upload to Cloudflare R2
    const avatarUrl = await uploadToR2(file.buffer, fileName, file.mimetype, 'avatars');

    // Delete old avatar if exists
    if (user.avatar) {
      await deleteFromR2(user.avatar);
    }

    // Update user with new avatar URL
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    return avatarUrl;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to upload avatar', 500);
  }
};

/**
 * Delete user avatar
 * @param {string} userId - User ID
 * @returns {boolean} Success status
 */
export const deleteAvatar = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    if (user.avatar) {
      // Delete file from Cloudflare R2
      await deleteFromR2(user.avatar);

      // Remove avatar URL from user
      await prisma.user.update({
        where: { id: userId },
        data: { avatar: null },
      });
    }

    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to delete avatar', 500);
  }
};

/**
 * Search users by name or email
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Users and pagination info
 */
export const searchUsers = async (query = '', page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const searchQuery = query.trim();

  // Get users with pagination and search filter
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { email: { contains: searchQuery, mode: 'insensitive' } },
      ],
    },
    skip,
    take: Number(limit),
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      bio: true,
      avatar: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Get total count for pagination
  const total = await prisma.user.count({
    where: {
      OR: [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { email: { contains: searchQuery, mode: 'insensitive' } },
      ],
    },
  });

  return {
    users,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const userService = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  searchUsers,
};

export default userService;
