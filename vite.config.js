import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import ghPages from 'vite-plugin-gh-pages';

// https://vite.dev/config/
export default defineConfig({
  base: '/stiloz/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    allowedHosts: ['4bc9-103-83-216-194.ngrok-free.app'],
  },
})
