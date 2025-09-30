import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Config Vite + Vitest
// - Adiciona seção de testes com reporter JUnit e cobertura v8
// - Cobertura exporta formatos text/lcov/cobertura para o Actions coletar
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  test: {
    // Reporter padrão; JUnit removido para evitar dependência externa
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'cobertura'],
      reportsDirectory: 'coverage'
    }
  }
})
