import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/social-app/',
  plugins: [react(), tailwindcss()],
  server: {
    open: true
  }
})