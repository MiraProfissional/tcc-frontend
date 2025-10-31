import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'all',
      '192.168.1.108',
      'localhost',
      '127.0.0.1',
    ],
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
  },
})
