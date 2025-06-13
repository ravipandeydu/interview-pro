// src/config/database.js
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
}

prisma.$on('error', (e) => {
  logger.error(`Prisma Error: ${e.message}`);
});

process.on('SIGINT', async () => {
  try {
    await prisma.$disconnect();
    logger.info('Prisma disconnected due to app termination');
    process.exit(0);
  } catch (error) {
    logger.error(`Error disconnecting Prisma: ${error}`);
    process.exit(1);
  }
});

export default prisma;
