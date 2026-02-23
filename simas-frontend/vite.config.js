import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // pakai jika ingin mengakses/testing halaman lewat wifi
  server: { 
    host: true,      // WAJIB
    port: 5173
  }
})
