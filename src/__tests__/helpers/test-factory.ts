// src/__tests__/helpers/test-factory.ts
import { DeepPartial } from 'typeorm';
import { User } from '../../modules/features/user/user.entity';
import { DatabaseService } from '../../modules/infrastructure/database/database.service';
import { container } from './test-container';
import { hashPassword } from '../../common/utils/helpers';

export class TestFactory {
  private static dbService =
    container.resolve<DatabaseService>('databaseService');

  static async createUser(override: DeepPartial<User> = {}): Promise<User> {
    const passwordHash = await hashPassword('password123');
    const defaultUser = {
      name: 'Test User',
      email: `test.${Date.now()}@example.com`,
      passwordHash
    };

    const userRepo = TestFactory.dbService.getRepository(User);
    return userRepo.create({ ...defaultUser, ...override });
  }
}
