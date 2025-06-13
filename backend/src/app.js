/**
 * Express App Setup
 *
 * This file configures the Express application with middleware, routes, and error handling.
 * Enhanced with dependency injection using Awilix.
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import passport from 'passport';
import { scopePerRequest } from 'awilix-express';
import container from './container.js';

import config from './config/index.js';
import logger from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import requestLogger from './middlewares/request-logger.middleware.js';
import { configureJwtStrategy } from './middlewares/auth.middleware.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import aiRoutes from './routes/ai.routes.js';
import routes from './routes/index.js';

// Initialize Express app
const app = express();

// Configure dependency injection container
app.use(scopePerRequest(container));

// Initialize Passport and configure JWT strategy
app.use(passport.initialize());
configureJwtStrategy();

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// Body parser middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Request logger
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: 'Too many requests from this IP, please try again later.',
});

// Apply rate limiting to all routes
app.use(limiter);

// Stricter rate limits for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// API routes with dependency injection
app.use('/api/v1', routes);

// Apply rate limiter to auth routes
app.use('/api/auth', authLimiter);
app.use('/api/v1/auth', authLimiter);

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Node.js Starter API',
      version: '1.0.0',
      description: 'API documentation for Node.js Starter',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Handle 404 errors
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
