import * as dotenv from 'dotenv';
import * as path from 'path';

export function setupTestEnv(): void {
  const envFile = process.env.CI ? '.env.ci' : 'test.env';
  const testEnvPath = path.resolve(__dirname, envFile);
  dotenv.config({ path: testEnvPath });

  const ciEnvPath = path.resolve(process.cwd(), '.env.test');
  dotenv.config({ path: ciEnvPath });

  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
}
