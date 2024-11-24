// src/modules/features/user/user.repository.ts

import { Lifetime } from 'awilix';
import { Service } from '../../../common/decorators/service.decorator';
import {
  HttpError,
  ValidationError
} from '../../../common/utils/error-handler';
import {
  IDatabaseService,
  IRepository,
  FindOptions
} from '../../infrastructure/database/database.interface';
import { User } from './user.entity';

@Service({ name: 'userRepository', lifetime: Lifetime.SCOPED })
export default class UserRepository implements IRepository<User> {
  // Changed to default export
  private repository: IRepository<User>;

  constructor(databaseService: IDatabaseService) {
    this.repository = databaseService.getRepository(User);
  }

  /**
   * Finds multiple users based on provided options.
   * @param options Optional search criteria and pagination settings.
   * @returns A promise that resolves to an array of users.
   */
  async find(options?: FindOptions): Promise<User[]> {
    return this.repository.find(options);
  }

  /**
   * Finds a single user by their unique identifier.
   * @param id The unique identifier of the user.
   * @returns A promise that resolves to the user if found, otherwise null.
   */
  async findOne(id: string): Promise<User | null> {
    return this.repository.findOne(id);
  }

  /**
   * Finds a user by their email address.
   * @param email The email address of the user.
   * @returns A promise that resolves to the user if found, otherwise null.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.repository
      .find({ where: { email } })
      .then((users) => users[0] || null);
  }

  /**
   * Creates a new user with the provided data.
   * @param userData The partial user data to create a new user.
   * @returns A promise that resolves to the newly created user.
   */
  async create(userData: Partial<User>): Promise<User> {
    try {
      return this.repository.create(userData);
    } catch (error) {
      throw new ValidationError('Failed to create user');
    }
  }

  /**
   * Updates an existing user with the provided data.
   * @param id The unique identifier of the user to update.
   * @param userData The partial user data to update the user.
   * @returns A promise that resolves to the updated user.
   */
  async update(id: string, userData: Partial<User>): Promise<User> {
    try {
      await this.repository.update(id, userData);
      const updated = await this.findOne(id);
      if (!updated) {
        throw new HttpError(404, 'User not found after update');
      }
      return updated;
    } catch (error) {
      throw new ValidationError('Failed to update user');
    }
  }

  /**
   * Deletes a user by their unique identifier.
   * @param id The unique identifier of the user to delete.
   * @returns A promise that resolves when the user is deleted.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      throw new ValidationError('Failed to delete user');
    }
  }
}
