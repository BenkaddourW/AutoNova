// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert' // 1. IMPORTEZ le plugin

// https://vitejs.dev/config/
export default defineConfig({
  // 2. CONFIGUREZ LE SERVEUR
  server: { 
    https: true // Activez simplement le HTTPS
  },
  plugins: [
    react(), 
    mkcert() // 3. AJOUTEZ le plugin à la liste
  ],
})