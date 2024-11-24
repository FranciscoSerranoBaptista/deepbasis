// src/config/environments/production.ts

export default {
  app: {
    port: 8000,
    env: 'production',
    name: 'DeepBasis'
  },
  logger: {
    level: 'error',
    format: 'json'
  }
  // Add or override production-specific configurations
};
