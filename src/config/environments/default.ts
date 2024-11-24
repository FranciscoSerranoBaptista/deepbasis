// src/config/environments/default.ts

export default {
  app: {
    port: 3000,
    env: 'development',
    name: 'DeepBasis'
  },
  database: {
    host: 'localhost',
    port: 5432,
    username: 'dbuser',
    password: 'dbpassword',
    dbName: 'deepdialogue_db'
  },
  logger: {
    level: 'info',
    format: 'json'
  },
  cache: {
    host: 'localhost',
    port: 6379
  },
  auth: {
    jwtSecret: 'your-secret-key'
  }
};
