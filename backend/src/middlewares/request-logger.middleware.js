/**
 * Request Logger Middleware
 * 
 * This middleware logs HTTP requests including method, URL, status, and response time.
 * 
 * @author Auto-generated
 * @date ${new Date().toISOString().split('T')[0]}
 */

import logger from '../utils/logger.js';

/**
 * Middleware to log HTTP requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestLogger = (req, res, next) => {
  // Get start time
  const start = Date.now();
  
  // Log request
  logger.info(`${req.method} ${req.originalUrl}`);
  
  // Log request body in development, but sanitize sensitive information
  if (process.env.NODE_ENV === 'development' && req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    
    // Sanitize sensitive fields
    if (sanitizedBody.password) sanitizedBody.password = '********';
    if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '********';
    if (sanitizedBody.currentPassword) sanitizedBody.currentPassword = '********';
    if (sanitizedBody.newPassword) sanitizedBody.newPassword = '********';
    if (sanitizedBody.token) sanitizedBody.token = '********';
    
    logger.debug(`Request body: ${JSON.stringify(sanitizedBody)}`);
  }
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel](
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });
  
  next();
};

export default requestLogger;