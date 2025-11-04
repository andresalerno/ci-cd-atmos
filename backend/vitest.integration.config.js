import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // Integration tests: use the *.integration.test.js / *.integration.test.ts suffix
    include: ['src/**/*.integration.test.{js,ts}', 'test/integration/**/*.test.{js,ts}'],
    // integration tests often interact with mocks/IO; run in-band
    threads: false,
    testTimeout: 10000,
    // Add JUnit reporter for CI consumption (optional)
    reporters: ['default', ['junit', { outputFile: 'coverage/junit-integration.xml' }]],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'cobertura'],
      reportsDirectory: 'coverage/integration'
    }
  }
})