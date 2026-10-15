import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  root: '.',
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    proxy: {
      '/api/v1/chat': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api/v1/gis/buffer-analysis': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api/v1/gis/risk-zoning': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api/v1/analytics': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        'index': resolve(__dirname, 'index.html'),
        'app': resolve(__dirname, 'app.html'),
        'badapatra': resolve(__dirname, 'badapatra.html'),
        'one-pager': resolve(__dirname, 'one-pager.html'),
        'public-report': resolve(__dirname, 'public-report.html'),
        'super-admin': resolve(__dirname, 'super-admin.html'),
      }
    }
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '/api/v1')
  }
})
