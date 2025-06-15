/**
 * User Controller
 * 
 * This module handles HTTP requests related to user management.
 * 
 * @author Auto-generated
 * @date ${new Date().toISOString().split('T')[0]}
 */

import userService from '../services/user.service.js';
import { ApiError } from '../middlewares/error.middleware.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden - requires admin role
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await userService.getAllUsers(page, limit);
    
    sendPaginated(
      res,
      200,
      'Users retrieved successfully',
      result.users,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden - requires admin role
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    sendSuccess(res, 200, 'User retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden - requires admin role
 */
export const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    sendSuccess(res, 200, 'User updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden - requires admin role
 */
export const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    sendSuccess(res, 200, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user.id);
    sendSuccess(res, 200, 'Profile retrieved successfully', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/profile:
 *   patch:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       409:
 *         description: Email already in use
 */
export const updateProfile = async (req, res, next) => {
  try {
    const updatedProfile = await userService.updateProfile(req.user.id, req.body);
    sendSuccess(res, 200, 'Profile updated successfully', updatedProfile);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/me/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     avatarUrl:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const uploadAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      throw new ApiError('No file uploaded', 400);
    }

    const avatarUrl = await userService.uploadAvatar(userId, file);

    res.status(200).json({
      success: true,
      data: { avatarUrl },
      message: 'Avatar uploaded successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/me/avatar:
 *   delete:
 *     summary: Delete user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
 */
export const deleteAvatar = async (req, res, next) => {
  try {
    await userService.deleteAvatar(req.user.id);
    sendSuccess(res, 200, 'Avatar deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users by name or email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query (name or email)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of users matching the search criteria
 */
export const searchUsers = async (req, res, next) => {
  try {
    const { q = '', page = 1, limit = 20 } = req.query;
    const result = await userService.searchUsers(q, page, limit);
    
    sendPaginated(
      res,
      200,
      'Users retrieved successfully',
      result.users,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  } catch (error) {
    next(error);
  }
};

const userController = {
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

export default userController;