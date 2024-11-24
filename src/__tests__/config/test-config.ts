// src/__tests__/config/test-config.ts
import { AppConfig } from '../../config/config.schema';

const testConfig: AppConfig = {
  app: {
    port: 3002,
    env: 'test',
    name: 'DeepDialogue-Test'
  },
  database: {
    host: 'localhost',
    port: 5432,
    username: 'deepdialogue_test_user',
    password: 'VFXlk87OvdA++rESd7W+Og==',
    dbName: 'deepdialogue_test'
  },
  logger: {
    level: 'error',
    format: 'json'
  },
  cache: {
    host: 'localhost',
    port: 6379
  },
  auth: {
    jwtSecret: 'test-secret-key'
  }
};

export default testConfig;
