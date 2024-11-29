// src/config/environments/test.ts

export default {
  app: {
    port: 3002,
    env: 'test',
    name: 'DeepBasis-Test'
  },
  logger: {
    level: 'debug',
    format: 'json'
  },
  database: {
    host: 'localhost',
    port: 5432,
    username: 'deepdialogue_test_user', // 'dbuser',
    password: 'DLtswBB24mvwDCtYqlPipA==', // 'dbpassword',
    dbName: 'deepdialogue_test'
  }
  // Add or override test-specific configurations
};
