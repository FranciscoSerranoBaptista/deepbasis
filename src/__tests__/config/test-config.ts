// src/__tests__/config/test-config.ts

import { AppConfig } from '../../config/config.schema';

const testConfig: AppConfig = {
  app: {
    port: 3002,
    env: 'test',
    name: 'DeepBasis-Test'
  },
  database: {
    host: 'localhost',
    port: 5432,
    username: process.env.TEST_DB_USER || 'deepdialogue_test_user',
    password: process.env.TEST_DB_PASSWORD || 'test_password',
    dbName: process.env.TEST_DB_NAME || 'deepdialogue_test'
  },
  logger: {
    level: 'error', // Use error level in tests to reduce noise
    format: 'json'
  },
  cache: {
    host: 'localhost',
    port: 6379
  },
  auth: {
    jwtSecret: 'test-jwt-secret-key'
  }
};

export default testConfig;
