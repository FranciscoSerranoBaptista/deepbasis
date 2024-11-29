// src/modules/features/user/user.service.ts
import { Lifetime } from 'awilix';
import { Service } from '../../../common/decorators/service.decorator';
import {
  HttpError,
  ValidationError
} from '../../../common/utils/error-handler';
import { hashPassword } from '../../../common/utils/helpers';
import { User, CreateUserDTO, UpdateUserDTO } from './user.types';
import { UserRepositoryService } from './user.repository.service';
import { ILogger } from '../../core/logger/logger.interface';

@Service({ name: 'userService', lifetime: Lifetime.SCOPED })
export class UserService {
  constructor(
    private readonly userRepository: UserRepositoryService,
    private readonly logger: ILogger
  ) {
    this.logger = logger.child({ context: UserService.name });
  }

  async createUser(dto: CreateUserDTO): Promise<User> {
    this.logger.debug('Creating new user', { email: dto.email });

    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ValidationError('Email is already in use.');
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash
    });

    this.logger.info('User created successfully', { userId: user.id });
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    this.logger.debug('Fetching user by ID', { userId: id });
    return this.userRepository.findById(id);
  }

  async updateUser(id: string, dto: UpdateUserDTO): Promise<User> {
    this.logger.debug('Updating user', { userId: id });

    const updateData: Partial<User> = {};

    if (dto.name) {
      updateData.name = dto.name;
    }

    if (dto.email) {
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ValidationError('Email is already in use.');
      }
      updateData.email = dto.email;
    }

    if (dto.password) {
      updateData.passwordHash = await hashPassword(dto.password);
    }

    try {
      const updatedUser = await this.userRepository.update(id, updateData);
      this.logger.info('User updated successfully', { userId: id });
      return updatedUser;
    } catch (error) {
      if (
        error instanceof ValidationError &&
        error.message === 'User not found'
      ) {
        throw new HttpError(404, 'User not found');
      }
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    this.logger.debug('Deleting user', { userId: id });

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    await this.userRepository.delete(id);
    this.logger.info('User deleted successfully', { userId: id });
  }

  async listUsers(): Promise<User[]> {
    this.logger.debug('Listing all users');
    return this.userRepository.findAll();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    this.logger.debug('Finding user by email', { email });
    return this.userRepository.findByEmail(email);
  }
}
