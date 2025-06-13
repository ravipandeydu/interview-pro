/**
 * Prisma Client Configuration
 *
 * This module initializes and exports the Prisma client for database operations.
 * It sets up a singleton instance of the client to be used throughout the application.
 *
 * @author Auto-generated
 * @date ${new Date().toISOString().split('T')[0]}
 */

import { PrismaClient } from '@prisma/client';

// Create a singleton instance of the Prisma client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle connection events
prisma.$on('beforeExit', async () => {
  console.log('Prisma Client is shutting down');
});

export default prisma;