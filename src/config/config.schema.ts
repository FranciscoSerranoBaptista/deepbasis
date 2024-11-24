// src/config/config.schema.ts

import { z } from 'zod';

export const ConfigSchema = z.object({
  app: z.object({
    port: z.number().default(3000),
    env: z.enum(['development', 'production', 'test']).default('development'),
    name: z.string().default('DeepBasis')
  }),
  database: z.object({
    host: z.string(),
    port: z.number().default(5432),
    username: z.string(),
    password: z.string(),
    dbName: z.string()
  }),
  logger: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error', 'fatal']).default('info'),
    format: z.enum(['json', 'text']).default('json')
  }),
  cache: z.object({
    host: z.string().default('localhost'),
    port: z.number().default(6379)
  }),
  // Add other configurations as needed
  auth: z.object({
    jwtSecret: z.string().min(1, 'JWT secret is required')
  })
});

export type AppConfig = z.infer<typeof ConfigSchema>;
