// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

const DATABASE_URL = `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?pgbouncer=true`;
const DIRECT_URL = `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/modules/infrastructure/database/migrations/*.ts', // Source of our migrations
  out: './drizzle', // Where schema and new migrations will be generated
  dbCredentials: {
    url: DIRECT_URL || DATABASE_URL
  },
  verbose: true,
  strict: true
});
