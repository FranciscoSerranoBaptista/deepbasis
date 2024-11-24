// src/__tests__/setup/jest.setup.ts
import { TestContainer } from '../helpers/test-container';

beforeAll(async () => {
  const container = TestContainer.getInstance();
  const configService = container.resolve('configService');
  await configService.initialize();

  const dbService = container.resolve('databaseService');
  await dbService.connect();
});

afterAll(async () => {
  const container = TestContainer.getInstance();
  const dbService = container.resolve('databaseService');
  await dbService.disconnect();
  TestContainer.reset();
});

beforeEach(async () => {
  await TestContainer.resetDatabase();
});
