import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5001',
      '/predict': 'http://localhost:5001',
      '/suggest_treatment': 'http://localhost:5001',
      '/health': 'http://localhost:5001'
    }
  }
})