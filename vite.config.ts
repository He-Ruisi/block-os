import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ocr': {
        target: 'https://lao3t2m4beyceb6c.aistudio-app.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ocr/, ''),
        secure: false,
      },
    },
  },
})
