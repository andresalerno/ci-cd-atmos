import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simples; plugin react será omitido se não disponível.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})

