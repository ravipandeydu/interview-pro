/**
 * Server Entry Point
 * 
 * This is the main entry point for the application. It reads environment variables,
 * connects to the database, and starts the Express server.
 * 
 * @author Auto-generated
 * @date ${new Date().toISOString().split('T')[0]}
 */

import { createServer } from 'http';
import app from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';
import prisma from './config/database.js';
import socketService from './services/socket.service.js';

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}`);
  logger.error(err.stack);
  process.exit(1);
});

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = socketService.initializeSocketIO(server);

// Connect to database - Prisma automatically connects when imported
try {
  logger.info('Database connection established');
} catch (error) {
  logger.error(`Error connecting to database: ${error.message}`);
  process.exit(1);
}

// Start server
const PORT = config.port || 4000;
server.listen(PORT, () => {
  logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api/docs`);
  logger.info(`Socket.IO server initialized and running`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(`${err.name}: ${err.message}`);
  logger.error(err.stack);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});