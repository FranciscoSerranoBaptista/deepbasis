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
  }
  // Add or override test-specific configurations
};
