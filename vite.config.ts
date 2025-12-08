import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Necessário para Electron (caminhos relativos)
  server: {
    port: 3000,
    open: false
  }
});