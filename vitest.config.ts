import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Support tests at root level and in tests/ or src/
    include: ['**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'packages/**/node_modules'],
    environment: 'node',
    // Make globals available if desired (optional)
    // globals: true,
  },
});
