export const baseTestConfig = {
  test: {
    environment: 'node',
    globals: true,
    include: ['**/__tests__/**/*.test.ts'],
    exclude: ['**/dist/**', '**/node_modules/**'],
    reporters: ['default'],
    coverage: {
      provider: 'c8',
      all: true,
      reportsDirectory: './coverage',
      reporter: ['text', 'html'],
      exclude: ['**/dist/**', '**/__tests__/**', '**/types/**'],
    },
  },
} as const;