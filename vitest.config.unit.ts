// vitest.config.unit.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: 'unit',
    include: ['src/__tests__/unit/**/*.test.ts'],
    setupFiles: ['src/__tests__/setup/vitest.unit.setup.ts'],
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/unit',
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/__tests__/**',
        '**/interfaces/**',
        // Exclude integration-specific code from unit test coverage
        '**/infrastructure/database/**'
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
