import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 1. Konfigurasi untuk fase Development (npm run dev)
  server: { 
    host: true,      // Mengekspos ke jaringan lokal (IP LAN)
    port: 5173,
  },

  // 2. Konfigurasi untuk fase Produksi / Preview (npm run preview)
  preview: {
    host: true,      // Mengekspos hasil build ke jaringan lokal
    port: 4173,      // Konsisten menggunakan port default preview
  }
})