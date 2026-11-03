import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração pronta para GitHub Codespaces e ambiente local:
// O proxy redireciona todas as chamadas /api para o backend NestJS na porta 3000
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://127.0.0.1:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
