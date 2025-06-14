/**
 * Y.js WebSocket Server Service
 *
 * This module provides a WebSocket server for Y.js real-time collaboration.
 * It handles document synchronization for collaborative editing features.
 */

import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import logger from '../utils/logger.js';
import config from '../config/index.js';
import jwt from 'jsonwebtoken';

// Map to store active Y.js documents
const documents = new Map();

// Map to store active connections
const connections = new Map();

/**
 * Initialize the Y.js WebSocket server
 * @param {Object} httpServer - HTTP server instance
 * @returns {WebSocketServer} WebSocket server instance
 */
function initializeYjsWebSocketServer(httpServer) {
  const wss = new WebSocketServer({ noServer: true });
  
  // Handle upgrade requests
  httpServer.on('upgrade', (request, socket, head) => {
    // Check if the request is for the Y.js WebSocket server
    const url = new URL(request.url, `http://${request.headers.host}`);
    const pathname = url.pathname;
    
    // Only handle requests for the Y.js WebSocket server
    if (pathname.startsWith('/yjs')) {
      // Extract token from query parameters
      const token = url.searchParams.get('token');
      
      // Authenticate the connection
      authenticateConnection(token, (err, user) => {
        if (err) {
          logger.error(`WebSocket authentication error: ${err.message}`);
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
          return;
        }
        
        // Upgrade the connection
        wss.handleUpgrade(request, socket, head, (ws) => {
          // Store user information with the connection
          ws.user = user;
          
          // Emit connection event
          wss.emit('connection', ws, request);
        });
      });
    }
  });
  
  // Handle WebSocket connections
  wss.on('connection', (ws, req) => {
    // Extract document name from URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const docName = url.pathname.slice(5); // Remove '/yjs/' prefix
    
    // Get or create Y.js document
    let doc = documents.get(docName);
    if (!doc) {
      doc = new Y.Doc();
      documents.set(docName, doc);
      logger.info(`Created new Y.js document: ${docName}`);
    }
    
    // Store connection information
    const userId = ws.user.id;
    if (!connections.has(userId)) {
      connections.set(userId, new Set());
    }
    connections.get(userId).add(ws);
    
    // Set up message handling
    ws.on('message', (message) => {
      // Process Y.js protocol messages
      try {
        // Broadcast message to all clients in the same document
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocketServer.OPEN) {
            const clientUrl = new URL(client.req.url, `http://${client.req.headers.host}`);
            const clientDocName = clientUrl.pathname.slice(5);
            
            if (clientDocName === docName) {
              client.send(message);
            }
          }
        });
      } catch (error) {
        logger.error(`Error processing WebSocket message: ${error.message}`);
      }
    });
    
    // Handle close event
    ws.on('close', () => {
      // Remove connection from tracking
      if (connections.has(userId)) {
        connections.get(userId).delete(ws);
        if (connections.get(userId).size === 0) {
          connections.delete(userId);
        }
      }
      
      logger.info(`Y.js WebSocket connection closed for user: ${userId}`);
    });
    
    logger.info(`Y.js WebSocket connection established for user: ${userId} on document: ${docName}`);
  });
  
  logger.info('Y.js WebSocket server initialized successfully');
  return wss;
}

/**
 * Authenticate a WebSocket connection using JWT
 * @param {string} token - JWT token
 * @param {Function} callback - Callback function
 */
function authenticateConnection(token, callback) {
  if (!token) {
    return callback(new Error('Authentication token not provided'));
  }
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    callback(null, decoded);
  } catch (error) {
    callback(error);
  }
}

export default initializeYjsWebSocketServer;