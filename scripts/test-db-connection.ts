// test-db-connection.ts

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DatabaseSchemaService } from '../src/modules/infrastructure/database/database.schema.service';

async function testDatabaseConnection() {
  const config = {
    host: 'localhost',
    port: 5432,
    user: 'deepdialogue_test_user', // Replace with your test database username
    password: 'DLtswBB24mvwDCtYqlPipA==', // Replace with your test database password
    database: 'deepdialogue_test' // Replace with your test database name
  };

  const pool = new Pool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database
  });

  try {
    // Test the connection
    await pool.query('SELECT 1');
    console.log('Database connected successfully');

    // Initialize Drizzle ORM with the schema
    const schemaService = new DatabaseSchemaService();
    const db = drizzle(pool, {
      schema: schemaService.schemas
    });

    // Optionally, you can run a simple query using Drizzle ORM
    const usersTable = schemaService.getSchema('users');
    const result = await db.select().from(usersTable).limit(1);
    console.log('Query result:', result);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();
