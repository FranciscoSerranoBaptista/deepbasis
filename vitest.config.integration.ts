// vitest.config.integration.ts

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: 'integration',
    include: ['src/__tests__/integration/**/*.test.ts'],
    setupFiles: ['src/__tests__/setup/vitest.integration.setup.ts'],
    environment: 'node',
    testTimeout: 30000, // Longer timeout for DB operations
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/integration',
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/__tests__/**',
        '**/interfaces/**'
      ]
    },
    alias: {
      '@app': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@config': path.resolve(__dirname, './src/config'),
      '@common': path.resolve(__dirname, './src/common')
    }
  }
});
