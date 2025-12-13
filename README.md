<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/14ywHtM3B9Q7Hu8NDSj5OKJbsB2FNM5zx

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. ## 🛠️ Configuração do Ambiente

Este projeto utiliza variáveis de ambiente para conectar com serviços externos (API e Banco de Dados).

1.  **Copie o exemplo:**
    Crie um arquivo `.env` na raiz do projeto (ou `.env.development` para desenvolvimento local).

2.  **Defina as variáveis obrigatórias:**
    Adicione as seguintes chaves ao seu arquivo:

    ```properties
    # URL do Backend (API)
    VITE_API_URL=http://localhost:3001
    ```

> **Nota:** Sem essas variáveis, a aplicação não iniciará corretamente.
3. Run the app:
   `npm run dev`
