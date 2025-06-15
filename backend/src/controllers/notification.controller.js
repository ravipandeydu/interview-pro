/**
 * Notification Controller
 *
 * This module provides controllers for handling real-time notifications
 * using Socket.IO for the recruitment platform.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { ApiError } from '../middlewares/error.middleware.js';
import logger from '../utils/logger.js';

/**
 * Send a notification to a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export async function sendUserNotification(req, res, next) {
  try {
    const { userId } = req.params;
    const { title, message, type } = req.body;
    
    // Get the socketService from the container
    const { socketService } = req.container;
    
    // Create notification object
    const notification = {
      title,
      message,
      type,
      timestamp: new Date(),
      read: false
    };
    
    // Send notification via Socket.IO
    socketService.sendUserNotification(userId, notification);
    
    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'Notification sent successfully',
      data: { notification }
    });
  } catch (error) {
    logger.error(`Error sending notification: ${error.message}`);
    next(new ApiError('Failed to send notification', 500));
  }
}

/**
 * Send a notification to users with specific roles
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export async function sendRoleNotification(req, res, next) {
  try {
    const { roles } = req.body;
    const { title, message, type } = req.body;
    
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return next(new ApiError('Roles must be a non-empty array', 400));
    }
    
    // Get the socketService from the container
    const { socketService } = req.container;
    
    // Create notification object
    const notification = {
      title,
      message,
      type,
      timestamp: new Date(),
      read: false
    };
    
    // Send notification via Socket.IO
    socketService.sendRoleNotification(roles, notification);
    
    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'Notification sent successfully',
      data: { notification, sentTo: roles }
    });
  } catch (error) {
    logger.error(`Error sending role notification: ${error.message}`);
    next(new ApiError('Failed to send notification', 500));
  }
}

/**
 * Broadcast a notification to all connected users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export async function broadcastNotification(req, res, next) {
  try {
    const { title, message, type } = req.body;
    
    // Get the socketService from the container
    const { socketService } = req.container;
    
    // Create notification object
    const notification = {
      title,
      message,
      type,
      timestamp: new Date(),
      read: false
    };
    
    // Get Socket.IO instance
    const io = socketService.getIO();
    
    // Broadcast to all connected clients
    io.emit('notification', notification);
    
    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'Broadcast notification sent successfully',
      data: { notification }
    });
  } catch (error) {
    logger.error(`Error broadcasting notification: ${error.message}`);
    next(new ApiError('Failed to broadcast notification', 500));
  }
}

export default {
  sendUserNotification,
  sendRoleNotification,
  broadcastNotification
};