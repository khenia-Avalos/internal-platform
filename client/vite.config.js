import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  base: '/', // ← Asegurar que la base es correcta
  server: {
    proxy: {
      "/api": {
        target: 'https://el-exito-internal-platform.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    port: 3000,
    strictPort: true,
  }
})