// src/__tests__/setup/jest.setup.ts
import { afterAll, beforeAll, beforeEach } from 'vitest';
import { setupTestEnv } from '../config/setup-test-env';
import { TestContainer } from '../helpers/test-container';
import { TestDatabase } from '../helpers/test-database';

// Setup test environment before all tests
setupTestEnv();

beforeAll(async () => {
  // Initialize test database
  await TestDatabase.initialize();
  // Initialize test container
  await TestContainer.getInstance();
});

afterAll(async () => {
  await TestContainer.reset();
  await TestDatabase.cleanup();
});

beforeEach(async () => {
  if (process.env.TEST_TYPE === 'integration') {
    await TestDatabase.truncateAllTables();
  }
});
