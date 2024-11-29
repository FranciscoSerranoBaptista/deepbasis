// src/modules/infrastructure/database/database.interface.ts
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
// import { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

export type DrizzleDB = PostgresJsDatabase<Record<string, unknown>>;

export interface IDatabaseService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getDb(): DrizzleDB;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface FindOptions {
  where?: Record<string, unknown>;
  take?: number;
  skip?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface IRepository<T> {
  find(options?: FindOptions): Promise<T[]>;
  findOne(id: string): Promise<T | null>;
  create(entity: Partial<T>): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
