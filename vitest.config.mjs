import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.spec.js'],
    coverage: {
      include: ['src/**/*.js'],
      reporter: ['text', 'lcov', 'clover'],
    },
  },
});
