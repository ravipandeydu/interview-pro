/**
 * Dependency Injection Container using Awilix
 * This file sets up the DI container for the application
 */

import { createContainer, asClass, asFunction, asValue } from 'awilix';
import { PrismaClient } from '@prisma/client';

// Import services
import * as authService from './services/auth.service.js';
import * as userService from './services/user.service.js';
import * as aiService from './services/ai.service.js';
import * as candidateService from './services/candidate.service.js';
import interviewService from './services/interview.service.js';
import * as questionService from './services/question.service.js';
import * as responseService from './services/response.service.js';
import emailService from './services/email.service.js';
import cloudflareR2Service from './services/cloudflare-r2.service.js';
import socketService from './services/socket.service.js';

// Import controllers
import * as authController from './controllers/auth.controller.js';
import * as userController from './controllers/user.controller.js';
import * as aiController from './controllers/ai.controller.js';
import * as candidateController from './controllers/candidate.controller.js';
import * as notificationController from './controllers/notification.controller.js';
import * as interviewController from './controllers/interview.controller.js';
import * as questionController from './controllers/question.controller.js';
import * as responseController from './controllers/response.controller.js';

// Import middlewares
import * as authMiddleware from './middlewares/auth.middleware.js';

// Import utils
import logger from './utils/logger.js';
import * as responseUtil from './utils/response.js';

// Create the container
const container = createContainer();

// Register core components
container.register({
  // Core
  prisma: asValue(new PrismaClient()),
  logger: asValue(logger),
  responseUtil: asValue(responseUtil),
  
  // Services
  authService: asValue(authService),
  userService: asValue(userService),
  aiService: asValue(aiService),
  emailService: asValue(emailService),
  cloudflareR2Service: asValue(cloudflareR2Service),
  candidateService: asValue(candidateService),
  interviewService: asValue(interviewService),
  questionService: asValue(questionService),
  responseService: asValue(responseService),
  socketService: asValue(socketService),
  
  // Controllers
  authController: asValue(authController),
  userController: asValue(userController),
  aiController: asValue(aiController),
  candidateController: asValue(candidateController),
  notificationController: asValue(notificationController),
  interviewController: asValue(interviewController),
  questionController: asValue(questionController),
  responseController: asValue(responseController),
  
  // Middlewares
  authMiddleware: asValue(authMiddleware),
});

export default container;