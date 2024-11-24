// src/modules/infrastructure/database/database.interface.ts

import { DeepPartial, ObjectLiteral, EntityTarget } from 'typeorm';

export interface IDatabaseService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): IRepository<T>;
}

export interface IRepository<T extends ObjectLiteral> {
  find(options?: FindOptions): Promise<T[]>;
  findOne(id: string): Promise<T | null>;
  create(entity: DeepPartial<T>): Promise<T>;
  update(id: string, entity: DeepPartial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface FindOptions {
  where?: Record<string, unknown>;
  relations?: string[];
  order?: Record<string, 'ASC' | 'DESC'>;
  skip?: number;
  take?: number;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  dbName: string;
}
