// src/__tests__/config/setup-test-env.ts
import * as dotenv from 'dotenv';
import * as path from 'path';

export function setupTestEnv(): void {
  // First try to load from test.env
  const testEnvPath = path.resolve(__dirname, 'test.env');
  dotenv.config({ path: testEnvPath });

  // Then try to load from .env.test in project root (for CI/CD)
  const ciEnvPath = path.resolve(process.cwd(), '.env.test');
  dotenv.config({ path: ciEnvPath });

  // Set test-specific env variables
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
}
