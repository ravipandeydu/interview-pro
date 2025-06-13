/**
 * AI Tests
 * 
 * This module contains tests for AI-related functionality.
 * 
 * @author Auto-generated
 * @date ${new Date().toISOString().split('T')[0]}
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/user.model.js';
import * as aiService from '../services/ai.service.js';

// Mock the AI service functions
jest.mock('../services/ai.service.js', () => ({
  chatWithDatabase: jest.fn(),
  generateDataSummary: jest.fn(),
}));

describe('AI API', () => {
  let token;
  let userId;

  // Set up test user
  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(global.testUser);
    
    token = res.body.data.token;
    userId = res.body.data.user._id;
  });

  // Test chat with database
  describe('POST /api/ai/chat', () => {
    it('should process a natural language query', async () => {
      // Mock the AI service response
      aiService.chatWithDatabase.mockResolvedValue({
        answer: 'There were 5 users registered last week.',
        metadata: {
          query: { createdAt: { $gte: '2023-01-01', $lte: '2023-01-07' } },
          collection: 'users',
          count: 5,
        },
      });

      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          question: 'How many users registered last week?',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('answer');
      expect(res.body.data).toHaveProperty('metadata');
      expect(aiService.chatWithDatabase).toHaveBeenCalledWith('How many users registered last week?');
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });

    it('should handle AI service errors', async () => {
      // Mock the AI service to throw an error
      aiService.chatWithDatabase.mockRejectedValue(new Error('AI service error'));

      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          question: 'How many users registered last week?',
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe('error');
    });
  });

  // Test data summary
  describe('GET /api/ai/summary/:collectionName', () => {
    it('should generate a data summary for a collection', async () => {
      // Mock the AI service response
      aiService.generateDataSummary.mockResolvedValue({
        summary: 'The users collection has 10 documents. Most recent user registered today.',
        stats: {
          total: 10,
          recent: 3,
          timeframe: 'month',
        },
      });

      const res = await request(app)
        .get('/api/ai/summary/users')
        .set('Authorization', `Bearer ${token}`)
        .query({ timeframe: 'month' });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data).toHaveProperty('stats');
      expect(aiService.generateDataSummary).toHaveBeenCalledWith('users', 'month');
    });

    it('should handle invalid collection names', async () => {
      // Mock the AI service to throw an error for invalid collection
      aiService.generateDataSummary.mockRejectedValue(new Error('Collection not found'));

      const res = await request(app)
        .get('/api/ai/summary/invalid_collection')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe('error');
    });
  });

  // Clean up after tests
  afterAll(async () => {
    if (userId) {
      await User.findByIdAndDelete(userId);
    }
  });
});