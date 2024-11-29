// src/modules/features/user/user.repository.service.ts

import { Lifetime } from 'awilix';
import { eq } from 'drizzle-orm';
import { Service } from '../../../common/decorators/service.decorator';
import { ValidationError } from '../../../common/utils/error-handler';
import type { UsersTable } from '../../infrastructure/database/database.schema.service';
import { DatabaseSchemaService } from '../../infrastructure/database/database.schema.service';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { RepositoryBaseService } from '../../infrastructure/database/repository.base.service';
import { User } from './user.types';

@Service({ name: 'userRepositoryService', lifetime: Lifetime.SCOPED })
export class UserRepositoryService extends RepositoryBaseService<UsersTable> {
  protected readonly table;

  constructor(
    databaseService: DatabaseService,
    private readonly schemaService: DatabaseSchemaService
  ) {
    super(databaseService);
    this.table = this.schemaService.getSchema('users');
  }

  async findByEmail(email: string): Promise<User | null> {
    const results = await this.getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.email, email))
      .limit(1);

    return results[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const results = await this.getDb()
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    return results[0] || null;
  }

  async findAll(): Promise<User[]> {
    return this.getDb().select().from(this.table);
  }

  async create(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<User> {
    try {
      const [user] = await this.getDb()
        .insert(this.table)
        .values(data)
        .returning();

      return user;
    } catch (error) {
      throw new ValidationError('Failed to create user');
    }
  }

  async update(
    id: string,
    data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<User> {
    try {
      const [user] = await this.getDb()
        .update(this.table)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(this.table.id, id))
        .returning();

      if (!user) {
        throw new ValidationError('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Failed to update user');
    }
  }

  async delete(id: string): Promise<void> {
    await this.getDb().delete(this.table).where(eq(this.table.id, id));
  }
}
