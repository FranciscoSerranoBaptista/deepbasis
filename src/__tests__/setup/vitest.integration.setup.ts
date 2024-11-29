// src/__tests__/setup/jest.integration.setup.ts
import { TestContainer } from '../helpers/test-container';
import { TestDatabase } from '../helpers/test-database';
import { beforeAll, afterAll, beforeEach } from 'vitest';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.TEST_TYPE = 'integration';

  // For integration tests, we need both database and container
  await TestDatabase.initialize();
  await TestContainer.getInstance();
});

afterAll(async () => {
  await TestContainer.reset();
  await TestDatabase.cleanup();
});

beforeEach(async () => {
  await TestContainer.truncateTables();
});
