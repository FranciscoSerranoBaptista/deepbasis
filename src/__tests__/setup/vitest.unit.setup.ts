// src/__tests__/setup/jest.unit.setup.ts
import { afterAll, beforeAll } from 'vitest';
import { TestContainer } from '../helpers/test-container';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.TEST_TYPE = 'unit';
  await TestContainer.getInstance(); // Only initializes core services, no DB
});

afterAll(async () => {
  await TestContainer.reset();
});
