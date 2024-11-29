// src/__tests__/integration/auth/auth.controller.integration.test.ts

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { App } from '../../../app';
import { TestContainer } from '../../helpers/test-container';
import { Application } from 'express';
import { Server } from '../../../server';

describe('AuthController Integration Tests', () => {
  let app: App;
  let server: Application;

  beforeAll(async () => {
    app = new App();
    await app.start();
    const container = await TestContainer.getInstance();
    server = container.resolve<Server>('server').app;
  });

  afterAll(async () => {
    await app.stop();
    await TestContainer.reset();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(server).post('/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should not register a user with an existing email', async () => {
      await request(server).post('/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      const response = await request(server).post('/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'message',
        'Email is already in use.'
      );
    });
  });

  describe('POST /auth/login', () => {
    it('should login an existing user', async () => {
      await request(server).post('/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      const response = await request(server).post('/auth/login').send({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should not login with incorrect password', async () => {
      await request(server).post('/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      const response = await request(server).post('/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'message',
        'Invalid email or password.'
      );
    });
  });

  describe('POST /auth/refresh-token', () => {
    it('should refresh tokens', async () => {
      const registerResponse = await request(server)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      const response = await request(server).post('/auth/refresh-token').send({
        refreshToken: registerResponse.body.refreshToken
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should not refresh tokens with invalid refresh token', async () => {
      const response = await request(server).post('/auth/refresh-token').send({
        refreshToken: 'invalid-refresh-token'
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid refresh token.');
    });
  });
});
