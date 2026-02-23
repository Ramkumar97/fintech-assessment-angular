import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.spec.ts'],
    exclude: ['node_modules', 'dist', '.angular'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.spec.ts',
        '**/*.config.ts',
        '**/main.ts',
        '**/index.ts',
        '**/*.d.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@shell': resolve(__dirname, './apps/shell/src'),
      '@mfe-summary': resolve(__dirname, './apps/mfe-summary/src'),
      '@mfe-transaction': resolve(__dirname, './apps/mfe-transaction/src'),
      '@mfe-common': resolve(__dirname, './apps/mfe-common/src'),
      '@shared': resolve(__dirname, './libs/shared/src')
    }
  }
});

