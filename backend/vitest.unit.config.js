import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // Unit tests: any normal *.test.js / *.test.ts files except integration tests
    include: ['src/**/*.test.{js,ts}'],
    exclude: ['src/**/*.integration.test.{js,ts}'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'cobertura'],
      reportsDirectory: 'coverage/unit'
    }
  }
})