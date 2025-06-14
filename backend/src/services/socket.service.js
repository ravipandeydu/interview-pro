/**
 * Socket.IO Service
 *
 * This module provides real-time communication services using Socket.IO.
 * It handles socket connections, events, and rooms for features like real-time
 * notifications, chat, and interview collaboration.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { Server } from 'socket.io';
import logger from '../utils/logger.js';
import config from '../config/index.js';
import jwt from 'jsonwebtoken';

let io;

// Store connected users
const connectedUsers = new Map();

// Store active video rooms
const activeRooms = new Map();

/**
 * Initialize Socket.IO server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} Socket.IO server instance
 */
export function initializeSocketIO(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  logger.info(`Socket.IO initializing with CORS origin: ${config.corsOrigin}`);

  // Middleware for authentication
  io.use(authenticateSocket);

  // Connection event
  io.on('connection', handleConnection);

  logger.info('Socket.IO initialized successfully');
  return io;
}

/**
 * Socket authentication middleware
 * @param {Object} socket - Socket instance
 * @param {Function} next - Next function
 */
function authenticateSocket(socket, next) {
  logger.info(`Socket authentication attempt from ${socket.id}`);
  logger.debug('Socket handshake data:', JSON.stringify(socket.handshake, null, 2));
  
  const token = socket.handshake.auth.token;
  
  if (!token) {
    logger.error('Socket authentication error: Token not provided');
    return next(new Error('Authentication error: Token not provided'));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    socket.user = decoded;
    logger.info(`Socket authenticated for user: ${decoded.id}, role: ${decoded.role}`);
    next();
  } catch (error) {
    logger.error(`Socket authentication error: ${error.message}`);
    next(new Error('Authentication error: Invalid token'));
  }
}

/**
 * Handle new socket connections
 * @param {Object} socket - Socket instance
 */
function handleConnection(socket) {
  const userId = socket.user.id;
  const userRole = socket.user.role;
  
  logger.info(`User connected: ${userId} with role: ${userRole}, socket ID: ${socket.id}`);
  logger.info(`Socket handshake query: ${JSON.stringify(socket.handshake.query)}`);
  logger.info(`Socket handshake auth: ${JSON.stringify(socket.handshake.auth)}`);

  // Store user connection
  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, new Set());
  }
  connectedUsers.get(userId).add(socket.id);

  // Join user to their personal room
  socket.join(`user:${userId}`);
  
  // Join user to their role room
  if (userRole) {
    socket.join(`role:${userRole}`);
  }

  // Handle candidate events
  setupCandidateEvents(socket);

  // Handle interview events
  setupInterviewEvents(socket);

  // Handle chat events
  setupChatEvents(socket);
  
  // Handle WebRTC events
  setupWebRTCEvents(socket);

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${userId}`);
    
    // Remove socket from connected users
    const userSockets = connectedUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        connectedUsers.delete(userId);
      }
    }
    
    // Handle WebRTC cleanup
    cleanupUserRooms(socket);
  });
}

/**
 * Setup candidate-related socket events
 * @param {Object} socket - Socket instance
 */
function setupCandidateEvents(socket) {
  // Listen for candidate status updates
  socket.on('candidate:statusUpdate', async (data) => {
    try {
      const { candidateId, status } = data;
      
      // Broadcast to relevant users (e.g., recruiters)
      socket.to('role:recruiter').to('role:admin').emit('candidate:statusUpdated', {
        candidateId,
        status,
        updatedBy: socket.user.id,
        timestamp: new Date().toISOString()
      });
      
      logger.info(`Candidate status updated: ${candidateId} -> ${status}`);
    } catch (error) {
      logger.error(`Error in candidate:statusUpdate: ${error.message}`);
    }
  });
}

/**
 * Setup interview-related socket events
 * @param {Object} socket - Socket instance
 */
function setupInterviewEvents(socket) {
  // Join interview room
  socket.on('interview:join', (interviewId) => {
    socket.join(`interview:${interviewId}`);
    
    // Notify others in the room
    socket.to(`interview:${interviewId}`).emit('interview:userJoined', {
      userId: socket.user.id,
      userName: socket.user.name,
      role: socket.user.role,
      timestamp: new Date().toISOString()
    });
    
    logger.info(`User ${socket.user.id} joined interview: ${interviewId}`);
  });
  
  // Leave interview room
  socket.on('interview:leave', (interviewId) => {
    socket.leave(`interview:${interviewId}`);
    
    // Notify others in the room
    socket.to(`interview:${interviewId}`).emit('interview:userLeft', {
      userId: socket.user.id,
      timestamp: new Date().toISOString()
    });
    
    logger.info(`User ${socket.user.id} left interview: ${interviewId}`);
  });
  
  // Code changes during interview
  socket.on('interview:codeUpdate', (data) => {
    const { interviewId, code, language } = data;
    
    // Broadcast to others in the interview
    socket.to(`interview:${interviewId}`).emit('interview:codeUpdated', {
      code,
      language,
      userId: socket.user.id,
      timestamp: new Date().toISOString()
    });
  });
}

/**
 * Setup chat-related socket events
 * @param {Object} socket - Socket instance
 */
function setupChatEvents(socket) {
  // Send message to interview chat
  socket.on('chat:sendMessage', (data) => {
    const { interviewId, message } = data;
    
    // Broadcast to interview room
    io.to(`interview:${interviewId}`).emit('chat:newMessage', {
      message,
      sender: {
        id: socket.user.id,
        name: socket.user.name,
        role: socket.user.role
      },
      timestamp: new Date().toISOString()
    });
  });
}

/**
 * Setup WebRTC-related socket events for video chat
 * @param {Object} socket - Socket instance
 */
function setupWebRTCEvents(socket) {
  // Join a video room (typically an interview room)
  socket.on('webrtc:joinRoom', (roomId) => {
    const roomName = `webrtc:${roomId}`;
    socket.join(roomName);
    
    // Keep track of users in rooms
    if (!activeRooms.has(roomName)) {
      activeRooms.set(roomName, new Set());
    }
    activeRooms.get(roomName).add(socket.id);
    
    // Get all users in the room
    const usersInRoom = Array.from(activeRooms.get(roomName))
      .filter(id => id !== socket.id);
    
    // Emit event with all users in the room
    socket.emit('webrtc:usersInRoom', usersInRoom);
    
    // Notify other users that someone joined
    socket.to(roomName).emit('webrtc:userJoined', socket.id);
    
    logger.info(`User ${socket.user.id} joined WebRTC room: ${roomId}`);
  });
  
  // Leave a video room
  socket.on('webrtc:leaveRoom', (roomId) => {
    const roomName = `webrtc:${roomId}`;
    leaveWebRTCRoom(socket, roomName);
  });
  
  // WebRTC signaling: sending an offer
  socket.on('webrtc:offer', (data) => {
    const { target, offer } = data;
    socket.to(target).emit('webrtc:offer', {
      offer,
      from: socket.id
    });
    logger.debug(`WebRTC offer sent from ${socket.id} to ${target}`);
  });
  
  // WebRTC signaling: sending an answer
  socket.on('webrtc:answer', (data) => {
    const { target, answer } = data;
    socket.to(target).emit('webrtc:answer', {
      answer,
      from: socket.id
    });
    logger.debug(`WebRTC answer sent from ${socket.id} to ${target}`);
  });
  
  // WebRTC signaling: sending ICE candidates
  socket.on('webrtc:iceCandidate', (data) => {
    const { target, candidate } = data;
    socket.to(target).emit('webrtc:iceCandidate', {
      candidate,
      from: socket.id
    });
    logger.debug(`WebRTC ICE candidate sent from ${socket.id} to ${target}`);
  });
  
  // Screen sharing status update
  socket.on('webrtc:screenShare', (data) => {
    const { roomId, isSharing } = data;
    const roomName = `webrtc:${roomId}`;
    
    // Notify others in the room about screen sharing status
    socket.to(roomName).emit('webrtc:screenShareUpdate', {
      userId: socket.id,
      isSharing
    });
    
    logger.info(`User ${socket.user.id} ${isSharing ? 'started' : 'stopped'} screen sharing in room: ${roomId}`);
  });
}

/**
 * Helper function to leave a WebRTC room
 * @param {Object} socket - Socket instance
 * @param {string} roomName - Room name
 */
function leaveWebRTCRoom(socket, roomName) {
  socket.leave(roomName);
  
  // Remove user from active room
  if (activeRooms.has(roomName)) {
    activeRooms.get(roomName).delete(socket.id);
    
    // If room is empty, remove it
    if (activeRooms.get(roomName).size === 0) {
      activeRooms.delete(roomName);
    } else {
      // Notify others that user left
      socket.to(roomName).emit('webrtc:userLeft', socket.id);
    }
  }
  
  const roomId = roomName.replace('webrtc:', '');
  logger.info(`User ${socket.user.id} left WebRTC room: ${roomId}`);
}

/**
 * Clean up user's WebRTC rooms on disconnect
 * @param {Object} socket - Socket instance
 */
function cleanupUserRooms(socket) {
  // Find all rooms this socket is in
  activeRooms.forEach((users, roomName) => {
    if (users.has(socket.id)) {
      leaveWebRTCRoom(socket, roomName);
    }
  });
}

/**
 * Send notification to specific user
 * @param {string} userId - User ID
 * @param {Object} notification - Notification object
 */
export function sendUserNotification(userId, notification) {
  if (io) {
    io.to(`user:${userId}`).emit('notification:new', {
      ...notification,
      timestamp: new Date().toISOString()
    });
    logger.info(`Notification sent to user: ${userId}`);
    return true;
  }
  return false;
}

/**
 * Send notification to users with specific role
 * @param {string} role - User role
 * @param {Object} notification - Notification object
 */
export function sendRoleNotification(role, notification) {
  if (io) {
    io.to(`role:${role}`).emit('notification:new', {
      ...notification,
      timestamp: new Date().toISOString()
    });
    logger.info(`Notification sent to role: ${role}`);
    return true;
  }
  return false;
}

/**
 * Broadcast notification to all connected users
 * @param {Object} notification - Notification object
 */
export function broadcastNotification(notification) {
  if (io) {
    io.emit('notification:new', {
      ...notification,
      timestamp: new Date().toISOString()
    });
    logger.info('Notification broadcasted to all users');
    return true;
  }
  return false;
}

/**
 * Check if user is online
 * @param {string} userId - User ID
 * @returns {boolean} True if user is online
 */
export function isUserOnline(userId) {
  return connectedUsers.has(userId) && connectedUsers.get(userId).size > 0;
}

/**
 * Get online users count
 * @returns {number} Number of online users
 */
export function getOnlineUsersCount() {
  return connectedUsers.size;
}

const socketService = {
  initializeSocketIO,
  sendUserNotification,
  sendRoleNotification,
  broadcastNotification,
  isUserOnline,
  getOnlineUsersCount
};

export default socketService;