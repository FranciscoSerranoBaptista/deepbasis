// src/modules/features/user/user.service.ts

import { Lifetime } from 'awilix';
import { Service } from '../../../common/decorators/service.decorator';
import {
  HttpError,
  ValidationError
} from '../../../common/utils/error-handler';
import { hashPassword } from '../../../common/utils/helpers';
import { User } from './user.entity';
import UserRepository from './user.repository';
import { CreateUserDTO, UpdateUserDTO } from './user.types';

interface InternalUpdateUserDTO extends Omit<UpdateUserDTO, 'password'> {
  passwordHash?: string;
}

@Service({ name: 'userService', lifetime: Lifetime.SCOPED })
export class UserService {
  constructor(public userRepository: UserRepository) {}

  async createUser(dto: CreateUserDTO): Promise<User> {
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

    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne(id);
  }

  async updateUser(id: string, dto: UpdateUserDTO): Promise<User> {
    const internalDto: InternalUpdateUserDTO = { ...dto };
    if (dto.password) {
      internalDto.passwordHash = await hashPassword(dto.password);
      delete (internalDto as any).password;
    }
    const updatedUser = await this.userRepository.update(id, internalDto);
    if (!updatedUser) {
      throw new HttpError(404, 'User not found');
    }
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }
    await this.userRepository.delete(id);
  }

  async listUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}
