import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'  // ← AÑADE ESTA LÍNEA

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],  // ← AÑADE tailwindcss() aquí
})