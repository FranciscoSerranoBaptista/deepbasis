import { AuthService } from '@app/modules/features/auth/auth.service';
import {
  LoginDTO,
  RefreshTokenDTO,
  RegisterDTO
} from '@app/modules/features/auth/auth.types';
import { UserService } from '@app/modules/features/user/user.service';
import { User } from '@app/modules/features/user/user.types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ValidationError } from '../../../common/utils/error-handler';
import * as helpers from '../../../common/utils/helpers';
import { ConfigService } from '../../../config/config.service';

// Mock the helpers module
vi.mock('../../../common/utils/helpers', () => ({
  comparePasswords: vi.fn(),
  generateJWT: vi.fn(),
  verifyJWT: vi.fn()
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserService: UserService;
  let mockConfigService: ConfigService;
  const mockJwtSecret = 'test-secret';

  // Sample user data
  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: 'hashedPassword123',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock UserService
    mockUserService = {
      createUser: vi.fn(),
      findUserByEmail: vi.fn(),
      getUserById: vi.fn()
    } as unknown as UserService;

    // Mock ConfigService
    mockConfigService = {
      get: vi.fn().mockReturnValue(mockJwtSecret)
    } as unknown as ConfigService;

    // Initialize AuthService
    authService = new AuthService(mockUserService, mockConfigService);

    // Mock JWT related functions with default implementations
    vi.mocked(helpers.generateJWT).mockImplementation(
      (payload, secret, expiresIn) => `mock-token-${expiresIn}`
    );
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      const registerDto: RegisterDTO = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      mockUserService.createUser = vi.fn().mockResolvedValue(mockUser);

      // Act
      const result = await authService.register(registerDto);

      // Assert
      expect(mockUserService.createUser).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        accessToken: 'mock-token-15m',
        refreshToken: 'mock-token-7d'
      });
      expect(helpers.generateJWT).toHaveBeenCalledTimes(2);
    });

    it('should propagate errors from user service', async () => {
      // Arrange
      const registerDto: RegisterDTO = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      const error = new Error('Database error');
      mockUserService.createUser = vi.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(authService.register(registerDto)).rejects.toThrow(error);
    });
  });

  describe('login', () => {
    const loginDto: LoginDTO = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should successfully login a user with valid credentials', async () => {
      // Arrange
      mockUserService.findUserByEmail = vi.fn().mockResolvedValue(mockUser);
      vi.mocked(helpers.comparePasswords).mockResolvedValue(true);

      // Act
      const result = await authService.login(loginDto);

      // Assert
      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(
        loginDto.email
      );
      expect(helpers.comparePasswords).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.passwordHash
      );
      expect(result).toEqual({
        accessToken: 'mock-token-15m',
        refreshToken: 'mock-token-7d'
      });
    });

    it('should throw ValidationError when user is not found', async () => {
      // Arrange
      mockUserService.findUserByEmail = vi.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        new ValidationError('Invalid email or password.')
      );
    });

    it('should throw ValidationError when password is invalid', async () => {
      // Arrange
      mockUserService.findUserByEmail = vi.fn().mockResolvedValue(mockUser);
      vi.mocked(helpers.comparePasswords).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        new ValidationError('Invalid email or password.')
      );
    });
  });

  describe('refreshToken', () => {
    const refreshTokenDto: RefreshTokenDTO = {
      refreshToken: 'valid-refresh-token'
    };

    it('should successfully refresh tokens with valid refresh token', async () => {
      // Arrange
      const decodedPayload = { userId: mockUser.id };
      vi.mocked(helpers.verifyJWT).mockReturnValue(decodedPayload);
      mockUserService.getUserById = vi.fn().mockResolvedValue(mockUser);

      // Act
      const result = await authService.refreshToken(refreshTokenDto);

      // Assert
      expect(helpers.verifyJWT).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
        mockJwtSecret
      );
      expect(mockUserService.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        accessToken: 'mock-token-15m',
        refreshToken: 'mock-token-7d'
      });
    });

    it('should throw ValidationError when refresh token is invalid', async () => {
      // Arrange
      vi.mocked(helpers.verifyJWT).mockReturnValue(null);

      // Act & Assert
      await expect(authService.refreshToken(refreshTokenDto)).rejects.toThrow(
        new ValidationError('Invalid refresh token.')
      );
    });

    it('should throw ValidationError when user is not found', async () => {
      // Arrange
      vi.mocked(helpers.verifyJWT).mockReturnValue({
        userId: 'non-existent-id'
      });
      mockUserService.getUserById = vi.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshToken(refreshTokenDto)).rejects.toThrow(
        new ValidationError('User not found.')
      );
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      // Act
      const result = authService['generateTokens'](mockUser);

      // Assert
      expect(helpers.generateJWT).toHaveBeenCalledTimes(2);
      expect(helpers.generateJWT).toHaveBeenCalledWith(
        { userId: mockUser.id },
        mockJwtSecret,
        '15m'
      );
      expect(helpers.generateJWT).toHaveBeenCalledWith(
        { userId: mockUser.id },
        mockJwtSecret,
        '7d'
      );
      expect(result).toEqual({
        accessToken: 'mock-token-15m',
        refreshToken: 'mock-token-7d'
      });
    });
  });
});
