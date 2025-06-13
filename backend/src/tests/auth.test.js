/**
 * Authentication Tests
 * 
 * This module contains tests for authentication-related functionality.
 * 
 * @author Auto-generated
 * @date ${new Date().toISOString().split('T')[0]}
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/user.model.js';

describe('Authentication API', () => {
  let token;
  let userId;

  // Test user registration
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(global.testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('_id');
      expect(res.body.data.user).toHaveProperty('name', global.testUser.name);
      expect(res.body.data.user).toHaveProperty('email', global.testUser.email);
      expect(res.body.data.user).not.toHaveProperty('password');

      // Save user ID for later tests
      userId = res.body.data.user._id;
    });

    it('should not register a user with an existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(global.testUser);

      expect(res.statusCode).toBe(409);
      expect(res.body.status).toBe('error');
    });

    it('should not register a user with invalid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'invalid-email',
          password: '123',
          passwordConfirm: '456',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });

  // Test user login
  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: global.testUser.email,
          password: global.testUser.password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('_id');

      // Save token for protected route tests
      token = res.body.data.token;
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: global.testUser.email,
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });

  // Test forgot password
  describe('POST /api/auth/forgot-password', () => {
    it('should send a password reset email for existing user', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: global.testUser.email,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
    });

    it('should return 404 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe('error');
    });
  });

  // Test protected routes
  describe('Protected Routes', () => {
    it('should access protected route with valid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
    });

    it('should not access protected route without token', async () => {
      const res = await request(app).get('/api/users/profile');

      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
    });

    it('should not access protected route with invalid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });

  // Test update password
  describe('PATCH /api/auth/update-password', () => {
    it('should update password with valid credentials', async () => {
      const res = await request(app)
        .patch('/api/auth/update-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: global.testUser.password,
          password: 'NewPassword123!',
          passwordConfirm: 'NewPassword123!',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
    });

    it('should not update password with incorrect current password', async () => {
      const res = await request(app)
        .patch('/api/auth/update-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          password: 'NewPassword123!',
          passwordConfirm: 'NewPassword123!',
        });

      expect(res.statusCode).toBe(401);
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