import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    base: env.VITE_BASE || '/',
    server: {
      proxy: {
        '/api': 'http://localhost:5001',
        '/predict': 'http://localhost:5001',
        '/suggest_treatment': 'http://localhost:5001',
        '/health': 'http://localhost:5001'
      }
    }
  }
})