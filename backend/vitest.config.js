// Vitest config para backend Node (ESM)
// - Habilita cobertura via V8 e gera relatórios em lcov/cobertura
// - Adiciona reporter JUnit para exportar XML consumível pelo GitHub Actions
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Dois reporters: padrão + JUnit (salvo em reports/junit.xml)
    reporters: [
      'default',
      ['junit', { outputFile: 'reports/junit.xml' }]
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'cobertura'],
      reportsDirectory: 'coverage'
    }
  }
})
