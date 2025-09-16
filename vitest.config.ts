process.env.ROLLUP_DISABLE_NATIVE = '1';

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    coverage: {
      reporter: ['text', 'lcov'],
      exclude: ['tests/**/*']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      obsidian: path.resolve(__dirname, 'tests/mocks/obsidian.ts')
    }
  }
});
