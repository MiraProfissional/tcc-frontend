import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
    ],
    server: {
      allowedHosts: [
        'all',
        env.VITE_SERVER_HOST || 'localhost',
        'localhost',
        '127.0.0.1',
      ],
      host: '0.0.0.0',
      port: 5173,
      strictPort: false,
    },
  }
})
