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
import * as emailService from './services/email.service.js';
import * as cloudflareR2Service from './services/cloudflare-r2.service.js';

// Import controllers
import * as authController from './controllers/auth.controller.js';
import * as userController from './controllers/user.controller.js';
import * as aiController from './controllers/ai.controller.js';

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
  
  // Controllers
  authController: asValue(authController),
  userController: asValue(userController),
  aiController: asValue(aiController),
  
  // Middlewares
  authMiddleware: asValue(authMiddleware),
});

export default container;