// src/__tests__/helpers/test-database.ts
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import testConfig from '../config/test-config';
import format from 'pg-format';

export class TestDatabase {
  private static pool: Pool;

  static async initialize(): Promise<void> {
    if (process.env.TEST_TYPE !== 'integration') {
      return;
    }

    this.pool = new Pool({
      host: testConfig.database.host,
      port: testConfig.database.port,
      user: testConfig.database.username,
      password: testConfig.database.password,
      database: testConfig.database.dbName
    });

    try {
      await this.pool.query('SELECT 1');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to connect to test database: ${errorMessage}`);
    }
  }

  static async cleanup(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }

  static async truncateAllTables(): Promise<void> {
    if (!this.pool) return;

    try {
      await this.pool.query('BEGIN');

      // Get all tables
      const result = await this.pool.query(`
          SELECT tablename FROM pg_tables
          WHERE schemaname = 'public'
        `);

      // Truncate each table
      for (const row of result.rows) {
        const query = format('TRUNCATE TABLE %I CASCADE', row.tablename);
        await this.pool.query(query);
      }

      await this.pool.query('COMMIT');
    } catch (error) {
      await this.pool.query('ROLLBACK');
      throw error;
    }
  }
}
