import { ILogger } from '@app/modules/core/logger/logger.interface';
import { UserController } from '@app/modules/features/user/user.controller';
import { UserRepositoryService } from '@app/modules/features/user/user.repository.service';
import { UserService } from '@app/modules/features/user/user.service';
import {
  CreateUserDTO,
  UpdateUserDTO,
  User
} from '@app/modules/features/user/user.types';
import { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
const mockUserRepository = {
  findByEmail: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
} as unknown as UserRepositoryService;

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  child: vi.fn().mockReturnThis()
} as unknown as ILogger;

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: UserRepositoryService & {
    // Type the mock to include the real methods AND the mock methods
    findByEmail: ReturnType<typeof vi.fn>; // Use ReturnType for better type inference
    findById: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let mockLogger: ILogger;

  beforeEach(() => {
    // Mock UserRepository with more specific typing and correct mock setup
    mockUserRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    } as unknown as UserRepositoryService & {
      // Assert the combined type after initial creation
      findByEmail: ReturnType<typeof vi.fn>;
      findById: ReturnType<typeof vi.fn>;
      findAll: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };

    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      child: vi.fn().mockReturnThis()
    } as unknown as ILogger; // Type assertion

    userService = new UserService(mockUserRepository, mockLogger); // Initialize userService HERE
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new user', async () => {
    const dto: CreateUserDTO = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password'
    };
    const user: User = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(user);

    const result = await userService.createUser(dto);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      name: dto.name,
      email: dto.email,
      passwordHash: expect.any(String)
    });
    expect(result).toEqual(user);
    expect(mockLogger.info).toHaveBeenCalledWith('User created successfully', {
      userId: user.id
    });
  });

  it('should throw an error if email is already in use', async () => {
    const dto: CreateUserDTO = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password'
    };
    const existingUser: User = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUserRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(userService.createUser(dto)).rejects.toThrow(
      'Email is already in use.'
    );
  });

  it('should fetch a user by ID', async () => {
    const user: User = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUserRepository.findById.mockResolvedValue(user);

    const result = await userService.getUserById('1');

    expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual(user);
  });

  it('should update a user', async () => {
    const dto: UpdateUserDTO = { name: 'John Doe Updated' };
    const user: User = {
      id: '1',
      name: 'John Doe Updated',
      email: 'john@example.com',
      passwordHash: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUserRepository.update.mockResolvedValue(user);

    const result = await userService.updateUser('1', dto);

    expect(mockUserRepository.update).toHaveBeenCalledWith('1', {
      name: dto.name
    });
    expect(result).toEqual(user);
    expect(mockLogger.info).toHaveBeenCalledWith('User updated successfully', {
      userId: '1'
    });
  });

  it('should delete a user', async () => {
    const user: User = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUserRepository.findById.mockResolvedValue(user);

    await userService.deleteUser('1');

    expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
    expect(mockUserRepository.delete).toHaveBeenCalledWith('1');
    expect(mockLogger.info).toHaveBeenCalledWith('User deleted successfully', {
      userId: '1'
    });
  });

  it('should throw an error if user not found when deleting', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(userService.deleteUser('1')).rejects.toThrow('User not found');
  });

  it('should list all users', async () => {
    const users: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    mockUserRepository.findAll.mockResolvedValue(users);

    const result = await userService.listUsers();

    expect(mockUserRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual(users);
  });
});
