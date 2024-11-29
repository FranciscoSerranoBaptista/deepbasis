// src/__tests__/integration/auth/auth.integration.test.ts

import { AwilixContainer } from 'awilix';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from '../../../modules/features/auth/auth.service';
import { DatabaseService } from '../../../modules/infrastructure/database/database.service';
import { TestContainer } from '../../helpers/test-container';

describe('AuthService (Integration)', () => {
  let container: AwilixContainer;
  let authService: AuthService;
  let databaseService: DatabaseService;

  beforeAll(async () => {
    process.env.TEST_TYPE = 'integration';
    container = await TestContainer.getInstance();
    authService = container.resolve('authService');
    databaseService = container.resolve('databaseService');
  });

  beforeEach(async () => {
    await TestContainer.resetDatabase();
  });

  afterAll(async () => {
    await TestContainer.reset();
  });

  describe('register and login flow', () => {
    it('should register and then login successfully', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const registerResult = await authService.register(registerDto);
      expect(registerResult).toHaveProperty('accessToken');
      expect(registerResult).toHaveProperty('refreshToken');

      const loginResult = await authService.login({
        email: registerDto.email,
        password: registerDto.password
      });

      expect(loginResult).toHaveProperty('accessToken');
      expect(loginResult).toHaveProperty('refreshToken');
    });

    it('should prevent duplicate email registration', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      await authService.register(registerDto);

      await expect(authService.register(registerDto)).rejects.toThrow();
    });
  });
});
