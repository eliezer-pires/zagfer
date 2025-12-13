import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * CONFIGURAÇÃO DO VITE
 * 
 * O VITE CARREGA AUTOMATICAMENTE OS ARQUIVOS .env CORRETOS:
 * 
 * QUANDO VOCÊ USA: npm run dev
 * - Vite entra em modo DESENVOLVIMENTO (DEV = true)
 * - Carrega automaticamente: .env + .env.development
 * - As variáveis dentro de .env.development sobrescrevem as de .env
 * 
 * QUANDO VOCÊ USA: npm run build
 * - Vite entra em modo PRODUÇÃO (PROD = true)
 * - Carrega automaticamente: .env + .env.production
 * - As variáveis dentro de .env.production sobrescrevem as de .env
 * 
 * EXEMPLO REAL:
 * .env.development → VITE_API_URL=http://localhost:3000
 * .env.production  → VITE_API_URL=https://api.seusite.com
 * 
 * Isso significa:
 * - npm run dev   → Frontend conecta no servidor local (localhost:3000)
 * - npm run build → Frontend conecta no servidor real (api.seusite.com)
 * 
 * BANCO DE DADOS DO SERVIDOR:
 * - npm run dev   → Usa server/prisma/dev.db (desenvolvimento)
 * - npm run build → Usa server/prisma/prod.db + Carrega dados de data/initialData.ts
 * 
 * VOCÊ NÃO PRECISA FAZER NADA! Vite faz isso automaticamente.
 */

export default defineConfig({
  plugins: [react()],
  base: './', // Necessário para Electron (caminhos relativos)
  server: {
    port: 3000,
    open: false
  }
});