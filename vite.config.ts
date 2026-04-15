import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0', // 允许局域网访问
    port: 5173,
    proxy: {
      '/api/ocr': {
        target: 'https://lao3t2m4beyceb6c.aistudio-app.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ocr/, ''),
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 添加必要的请求头，模拟真实浏览器请求
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            proxyReq.setHeader('Accept', 'application/json, text/plain, */*')
            proxyReq.setHeader('Accept-Language', 'zh-CN,zh;q=0.9,en;q=0.8')
            proxyReq.setHeader('Origin', 'https://lao3t2m4beyceb6c.aistudio-app.com')
            proxyReq.setHeader('Referer', 'https://lao3t2m4beyceb6c.aistudio-app.com/')
            
            console.log('[Vite Proxy] Forwarding request to:', proxyReq.path)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('[Vite Proxy] Response status:', proxyRes.statusCode)
          })
          proxy.on('error', (err, req, res) => {
            console.error('[Vite Proxy] Error:', err.message)
          })
        },
      },
    },
  },
})
