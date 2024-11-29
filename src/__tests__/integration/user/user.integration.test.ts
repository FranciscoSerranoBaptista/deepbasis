import request from 'supertest';
import { App } from '../../../app';
import { TestContainer } from '../../helpers/test-container';
import { DatabaseService } from '../../../modules/infrastructure/database/database.service';
import { UserService } from '../../../modules/features/user/user.service';
import { AuthService } from '../../../modules/features/auth/auth.service';
import { Application } from 'express';
import { Server } from '../../../server';

describe('User Integration Tests', () => {
  let app: App;
  let server: Application;
  let databaseService: DatabaseService;
  let userService: UserService;
  let authService: AuthService;
  let authToken: string;

  beforeAll(async () => {
    app = new App();
    await app.start();
    const container = await TestContainer.getInstance();

    server = container.resolve<Server>('server').app;
    databaseService = container.resolve('databaseService');
    userService = container.resolve('userService');
    authService = container.resolve('authService');
  });

  afterAll(async () => {
    await app.stop();
    await TestContainer.reset();
  });

  beforeEach(async () => {
    await TestContainer.resetDatabase();

    // Create a test user and get auth token for protected routes
    const { accessToken } = await authService.register({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'AdminPass123!'
    });
    authToken = accessToken;
  });

  describe('User CRUD Operations', () => {
    it('should perform complete user lifecycle operations', async () => {
      // Create new user
      const createResponse = await request(server)
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123!'
        });

      expect(createResponse.status).toBe(201);
      const userId = createResponse.body.id;

      // Get user details
      const getResponse = await request(server)
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toMatchObject({
        id: userId,
        name: 'John Doe',
        email: 'john@example.com'
      });

      // Update user
      const updateResponse = await request(server)
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'John Updated'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.name).toBe('John Updated');

      // Delete user
      const deleteResponse = await request(server)
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(204);

      // Verify deletion
      const verifyResponse = await request(server)
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(verifyResponse.status).toBe(404);
    });

    it('should list all users with pagination', async () => {
      // Create multiple users
      const userCreationPromises = Array.from({ length: 5 }, (_, i) =>
        userService.createUser({
          name: `User ${i}`,
          email: `user${i}@example.com`,
          password: 'Password123!'
        })
      );

      await Promise.all(userCreationPromises);

      // Get users list
      const response = await request(server)
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 3 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
    });
  });

  describe('Authorization & Access Control', () => {
    it('should require authentication for protected routes', async () => {
      const response = await request(server).get('/users');
      expect(response.status).toBe(401);
    });

    it('should handle invalid authentication tokens', async () => {
      const response = await request(server)
        .get('/users')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should prevent users from updating other users', async () => {
      // Create two users
      const user1 = await userService.createUser({
        name: 'User One',
        email: 'user1@example.com',
        password: 'Password123!'
      });

      const user2Auth = await authService.login({
        email: 'user1@example.com',
        password: 'Password123!'
      });

      // Attempt to update admin user with user2's token
      const response = await request(server)
        .put(`/users/${user1.id}`)
        .set('Authorization', `Bearer ${user2Auth.accessToken}`)
        .send({
          name: 'Hacked Name'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Force database disconnection
      await databaseService.disconnect();

      const response = await request(server)
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');

      // Reconnect for cleanup
      await databaseService.connect();
    });

    it('should handle validation errors properly', async () => {
      const response = await request(server)
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '', // Invalid empty name
          email: 'invalid-email',
          password: 'short'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle concurrent operations correctly', async () => {
      // Attempt to create multiple users with the same email concurrently
      const promises = Array.from({ length: 5 }, () =>
        request(server)
          .post('/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'Concurrent User',
            email: 'concurrent@example.com',
            password: 'Password123!'
          })
      );

      const results = await Promise.all(promises);
      const successfulCreations = results.filter((r) => r.status === 201);
      expect(successfulCreations.length).toBe(1);
    });
  });
});
