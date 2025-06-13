/**
 * User Tests
 * 
 * This module contains tests for user-related functionality.
 * 
 * @author Auto-generated
 * @date ${new Date().toISOString().split('T')[0]}
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/user.model.js';

describe('User API', () => {
  let userToken;
  let adminToken;
  let userId;
  let adminId;

  // Set up test users
  beforeAll(async () => {
    // Create a regular user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send(global.testUser);
    
    userToken = userRes.body.data.token;
    userId = userRes.body.data.user._id;

    // Create an admin user
    const admin = new User({
      name: global.testAdmin.name,
      email: global.testAdmin.email,
      password: global.testAdmin.password,
      passwordConfirm: global.testAdmin.passwordConfirm,
      role: 'admin',
    });

    await admin.save();
    adminId = admin._id;

    // Login as admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: global.testAdmin.email,
        password: global.testAdmin.password,
      });
    
    adminToken = adminRes.body.data.token;
  });

  // Test user profile
  describe('User Profile', () => {
    it('should get current user profile', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('_id', userId);
      expect(res.body.data).toHaveProperty('name', global.testUser.name);
      expect(res.body.data).toHaveProperty('email', global.testUser.email);
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should update user profile', async () => {
      const updatedName = 'Updated Name';
      
      const res = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: updatedName,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('name', updatedName);
    });

    it('should not update profile with existing email', async () => {
      const res = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: global.testAdmin.email,
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.status).toBe('error');
    });
  });

  // Test admin user management
  describe('Admin User Management', () => {
    it('should get all users as admin', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should not get all users as regular user', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.status).toBe('error');
    });

    it('should get user by ID as admin', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('_id', userId);
    });

    it('should update user as admin', async () => {
      const updatedName = 'Admin Updated Name';
      
      const res = await request(app)
        .patch(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: updatedName,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('name', updatedName);
    });

    it('should not update user with invalid ID', async () => {
      const res = await request(app)
        .patch('/api/users/invalidid')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });

  // Clean up after tests
  afterAll(async () => {
    if (userId) {
      await User.findByIdAndDelete(userId);
    }
    if (adminId) {
      await User.findByIdAndDelete(adminId);
    }
  });
});