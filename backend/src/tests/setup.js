/**
 * Jest Test Setup
 * 
 * This file runs before Jest tests to set up the testing environment.
 * 
 * @author Auto-generated
 * @date ${new Date().toISOString().split('T')[0]}
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Set up global variables for testing
global.testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Password123!',
  passwordConfirm: 'Password123!',
};

global.testAdmin = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'Password123!',
  passwordConfirm: 'Password123!',
  role: 'admin',
};

// Create in-memory MongoDB server
let mongoServer;

// Connect to the in-memory database before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
  
  // Set environment variables for testing
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.JWT_COOKIE_EXPIRES_IN = '1';
  process.env.NODE_ENV = 'test';
});

// Clear all collections between tests
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Disconnect and close the in-memory database after all tests
afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});