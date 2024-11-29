import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, Router } from 'express';
import { AuthController } from '@app/modules/features/auth/auth.controller';
import { AuthService } from '@app/modules/features/auth/auth.service';
import { ILogger } from '@app/modules/core/logger/logger.interface';
import {
  ValidationError,
  HttpError,
  ApplicationError
} from '../../../common/utils/error-handler';

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: AuthService;
  let mockLogger: ILogger;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: any;
  let responseStatus: any;

  beforeEach(() => {
    // Mock AuthService
    mockAuthService = {
      register: vi.fn(),
      login: vi.fn(),
      refreshToken: vi.fn()
    } as unknown as AuthService;

    // Mock Logger
    mockLogger = {
      child: vi.fn().mockReturnThis(),
      info: vi.fn(),
      error: vi.fn()
    } as unknown as ILogger;

    // Mock Response
    responseJson = vi.fn().mockReturnThis();
    responseStatus = vi.fn().mockReturnThis();
    mockResponse = {
      json: responseJson,
      status: responseStatus
    } as Partial<Response>;

    // Initialize controller
    authController = new AuthController(mockAuthService, mockLogger);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      const registerDto = { email: 'test@test.com', password: 'password123' };
      const expectedTokens = {
        accessToken: 'token123',
        refreshToken: 'refresh123'
      };
      mockRequest = {
        body: registerDto,
        headers: { 'x-request-id': 'test-id' }
      };
      mockAuthService.register = vi.fn().mockResolvedValue(expectedTokens);

      // Act
      await authController['register'](
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith(expectedTokens);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should handle validation error during registration', async () => {
      // Arrange
      const error = new ValidationError('Invalid input');
      mockAuthService.register = vi.fn().mockRejectedValue(error);
      mockRequest = {
        body: {},
        headers: { 'x-request-id': 'test-id' }
      };

      // Act
      await authController['register'](
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ message: error.message });
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      // Arrange
      const loginDto = { email: 'test@test.com', password: 'password123' };
      const expectedTokens = {
        accessToken: 'token123',
        refreshToken: 'refresh123'
      };
      mockRequest = {
        body: loginDto,
        headers: { 'x-request-id': 'test-id' }
      };
      mockAuthService.login = vi.fn().mockResolvedValue(expectedTokens);

      // Act
      await authController['login'](
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(responseJson).toHaveBeenCalledWith(expectedTokens);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should handle HTTP error during login', async () => {
      // Arrange
      const error = new HttpError(401, 'Invalid credentials');
      mockAuthService.login = vi.fn().mockRejectedValue(error);
      mockRequest = {
        body: {},
        headers: { 'x-request-id': 'test-id' }
      };

      // Act
      await authController['login'](
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(responseStatus).toHaveBeenCalledWith(401);
      expect(responseJson).toHaveBeenCalledWith({ message: error.message });
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      // Arrange
      const refreshDto = { refreshToken: 'refresh123' };
      const expectedTokens = {
        accessToken: 'newToken123',
        refreshToken: 'newRefresh123'
      };
      mockRequest = {
        body: refreshDto,
        headers: { 'x-request-id': 'test-id' }
      };
      mockAuthService.refreshToken = vi.fn().mockResolvedValue(expectedTokens);

      // Act
      await authController['refreshToken'](
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshDto);
      expect(responseJson).toHaveBeenCalledWith(expectedTokens);
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });
  });

  describe('getRequestId', () => {
    it('should return request ID from headers', () => {
      // Arrange
      mockRequest = {
        headers: { 'x-request-id': 'test-id' }
      };

      // Act
      const result = authController['getRequestId'](mockRequest as Request);

      // Assert
      expect(result).toBe('test-id');
    });

    it('should handle array of request IDs', () => {
      // Arrange
      mockRequest = {
        headers: { 'x-request-id': ['test-id-1', 'test-id-2'] }
      };

      // Act
      const result = authController['getRequestId'](mockRequest as Request);

      // Assert
      expect(result).toBe('test-id-1');
    });

    it('should return empty string when no request ID is present', () => {
      // Arrange
      mockRequest = {
        headers: {}
      };

      // Act
      const result = authController['getRequestId'](mockRequest as Request);

      // Assert
      expect(result).toBe('');
    });
  });

  describe('handleError', () => {
    it('should handle different types of errors appropriately', () => {
      const requestId = 'test-id';
      const testCases = [
        { error: new ValidationError('Invalid input'), expectedStatus: 400 },
        { error: new HttpError(401, 'Unauthorized'), expectedStatus: 401 },
        { error: new ApplicationError('App error'), expectedStatus: 500 },
        { error: new Error('Generic error'), expectedStatus: 500 },
        { error: 'Unknown error', expectedStatus: 500 }
      ];

      testCases.forEach(({ error, expectedStatus }) => {
        // Act
        authController['handleError'](
          mockResponse as Response,
          error,
          requestId
        );

        // Assert
        expect(responseStatus).toHaveBeenCalledWith(expectedStatus);
        expect(mockLogger.error).toHaveBeenCalled();
      });
    });
  });
});
