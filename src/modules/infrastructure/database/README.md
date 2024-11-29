# Drizzle ORM in DeepBasis

This project uses Drizzle ORM for database schema management and type-safe database interactions. Drizzle helps define your schema in TypeScript, generate migrations, and provides type-safe query building.

## Initial Setup

1. **Install Drizzle Kit:**

   ```bash
   npm install drizzle-kit @drizzle/driver-postgresql
   yarn add drizzle-kit @drizzle/driver-postgresql
   ```

2. **Database Connection:**

   * **Development:** Ensure you have a PostgreSQL database running locally (or a development database). Create a `.env` file in the root of your project and add the connection details:

     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_USERNAME=<your_db_username>
     DB_PASSWORD=<your_db_password>
     DB_NAME=deepbasis_dev
     ```

     Also, ensure the `src/config/environments/development.ts` file has matching configuration.

   * **Production:**  Configure your production database credentials through your deployment environment or secrets management system. Ensure `src/config/environments/production.ts` reflects the necessary environment variables or your secrets retrieval mechanism.

   * **Testing:** For Jest tests, create `src/__tests__/setup/test.env` and `src/__tests__/config/test-config.ts` with appropriate credentials for your test database.  Ensure the test database name is distinct from your development or production databases.  `test.env` should have:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_USERNAME=<your_test_db_username>
     DB_PASSWORD=<your_test_db_password>
     DB_NAME=deepbasis_test
     ```
     and this should be reflected in the test config as well.


   * **Drizzle Config:** Configure the database URL in `drizzle.config.ts`. Use environment variables for flexibility:
      ```typescript
      // drizzle.config.ts
      import { defineConfig } from 'drizzle-kit';
      import * as dotenv from 'dotenv';

      dotenv.config();

      const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

      // Construct URL based on environment (adjust for your needs):

      // For use with pgbouncer
      const DATABASE_URL = `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?pgbouncer=true`;
      // For direct connection (e.g., local development or testing)
      const DIRECT_URL = `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

      export default defineConfig({
        dialect: 'postgresql',
        schema: './src/modules/infrastructure/database/migrations/*.ts',
        out: './drizzle',
        dbCredentials: {
            url: DIRECT_URL || DATABASE_URL  // Prioritize direct connection for local/test. Falls back to pgbouncer URL if DIRECT_URL isn't defined
        },
        verbose: true,
        strict: true
      });
      ```

3. **Initial Schema Generation and Migration:**

   * **Create an Initial Migration:**
      ```bash
      npx drizzle-kit generate:migration initial_schema
      ```

      This creates a new file (e.g., `0000_initial_schema.ts`) in `src/modules/infrastructure/database/migrations`. Define your initial database schema here. Example:

      ```typescript
      // src/modules/infrastructure/database/migrations/0000_initial_schema.ts
      import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

      export const users = pgTable('users', {
        id: uuid('id').defaultRandom().primaryKey(),
        name: varchar('name', { length: 100 }).notNull(),
        email: varchar('email', { length: 150 }).notNull().unique(),
      });

      export const usersRelations = {}; // Remove if no relationships are defined
      ```

   * **Apply the Migration:**
     ```bash
     npx drizzle-kit migrate
     ```
     This creates the tables in your database according to your migration file.

   * **Generate TypeScript Types:**
     ```bash
     npx drizzle-kit generate
     ```
     This generates TypeScript types and schema definitions in the `drizzle` directory. These types are used for type-safe database queries.



## Subsequent Schema Changes

1. **Create a New Migration:** For any schema changes (adding columns, tables, etc.), create a new migration file:

   ```bash
   npx drizzle-kit generate:migration add_last_name_to_users
   ```

   Example Migration (Adding a 'last_name' column to the `users` table):

   ```typescript
   // src/modules/infrastructure/database/migrations/XXXX_add_last_name_to_users.ts
   import { pgTable, varchar, alterTable } from 'drizzle-orm/pg-core';

   export const users = alterTable('users', (table) => ({
       lastName: table.varchar('last_name', { length: 100 }),
   }));

   export const usersRelations = {};  // Remove if no relationships are defined
   ```

2. **Apply the Migration:**

   ```bash
   npx drizzle-kit migrate
   ```

3. **Regenerate Types:**

   ```bash
   npx drizzle-kit generate
   ```

## Important Notes

* **Drizzle Introspection:** Drizzle uses introspection to generate the schema.  Ensure your database connection is configured correctly in `drizzle.config.ts`.
* **Never edit `drizzle/schema.ts` directly!** This file is auto-generated.  Make all schema changes using migrations.
* **Migration Order:** Migrations are applied in the order of their filenames (numerical prefixes).
* **Transactions:** Drizzle automatically wraps migrations in transactions, ensuring data consistency.

This detailed guide covers the complete workflow for managing your database schema with Drizzle, from initial setup to making ongoing changes.  It addresses the connection string and configuration more comprehensively.  Remember to consult the [Drizzle ORM documentation](https://orm.drizzle.team/) for more advanced topics.
