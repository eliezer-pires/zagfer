# Guia de Implantação em Servidor Linux (On-Premises)

Este guia detalha o passo a passo para configurar e rodar o aplicativo ZAGFER (Zagfer App) em um servidor Linux.
O aplicativo consiste em um Frontend (React/Vite) e um Backend (Node.js/Express/Prisma/SQLite).

## Pré-requisitos

O servidor deve ter acesso à internet para baixar pacotes iniciais.
Comandos testados em **Ubuntu/Debian**, mas adaptáveis para outras distribuições.

### 1. Atualizar o sistema e instalar dependências básicas

```bash
# Atualiza a lista de pacotes do sistema
sudo apt update

# Instala o curl (ferramenta para fazer download de arquivos via terminal)
sudo apt install -y curl
```

### 2. Instalar o Node.js

Utilizaremos o NVM (Node Version Manager) para instalar o Node.js, pois é mais flexível e evita versões desatualizadas dos repositórios padrão.

```bash
# Baixa e executa o script de instalação do NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Recarrega o arquivo de configuração do usuário para reconhecer o comando nvm imediatamente
source ~/.bashrc

# Instala a versão LTS (Long Term Support) mais recente do Node.js
nvm install --lts

# Verifica se o node e o npm foram instalados corretamente
node -v
npm -v
```

---

## Instalação e Configuração do Projeto

Supondo que você tenha os arquivos do projeto em mãos (via git clone ou upload de zip). Vamos considerar que o projeto está na pasta `~/zagfer`.

### 3. Instalar Dependências do Projeto

O projeto tem dependências na raiz (Frontend) e na pasta `server` (Backend).

```bash
# Navega até a pasta do projeto
cd ~/zagfer

# Instala as dependências do Frontend (e ferramentas de build)
# O comando 'install' lê o package.json e baixa tudo necessário para a pasta node_modules
npm install

# Navega para a pasta do servidor
cd server

# Instala as dependências do Backend (Express, Prisma, etc.)
npm install

# Volta para a raiz do projeto
cd ..
```

### 4. Configurar o Banco de Dados

O projeto usa SQLite, então o banco será um arquivo local (`dev.db`).

```bash
# Gera o cliente do Prisma (ferramenta que conecta o código ao banco de dados) -> Cria os arquivos baseados no schema.prisma
npx prisma generate --schema=./server/prisma/schema.prisma

# Cria as tabelas no banco de dados SQLite (baseado no schema)
npx prisma db push --schema=./server/prisma/schema.prisma
```

### 5. Compilar o Frontend (Build)

Para produção, não rodamos o `vite` em modo dev. Geramos arquivos estáticos (HTML, CSS, JS) otimizados.

```bash
# Executa o script de build definido no package.json (tsc && vite build)
# Isso criará uma pasta 'dist' na raiz com o site pronto para produção
npm run build
```

---

## Execução em Produção

Para manter o servidor rodando mesmo se o terminal fechar ou o servidor reiniciar, usaremos o **PM2** (Process Manager).

### 6. Instalar e Configurar o PM2

```bash
# Instala o PM2 globalmente no sistema
npm install -g pm2

# Inicia o servidor usando o PM2
# --name "zagfer-app": Nomeia o processo para fácil identificação
# server/src/index.ts: O arquivo principal do servidor
# --interpreter ts-node: Como é TypeScript, usamos o ts-node para rodar diretamente (ou o node se fosse compilado)
pm2 start server/src/index.ts --name "zagfer-app" --interpreter ./node_modules/.bin/ts-node

# Salva a lista de processos atuais para serem restaurados na reinicialização
pm2 save

# Configura o script de inicialização do sistema (Systemd, etc.) para rodar o PM2 no boot
# Execute a linha que este comando retornar no terminal!
pm2 startup
```

### 7. Comandos Úteis do PM2

```bash
# Ver status da aplicação (online/offline, uso de CPU/RAM)
pm2 status

# Ver logs (console.log) da aplicação em tempo real
pm2 logs zagfer-app

# Reiniciar a aplicação
pm2 restart zagfer-app

# Parar a aplicação
pm2 stop zagfer-app
```

---

## Acesso

O servidor estará rodando na porta **3001** (conforme configurado no `server/src/index.ts`).

- Se você estiver na mesma rede: `http://IP_DO_SERVIDOR:3001`
- Certifique-se de que o Firewall do Linux (ex: UFW) permita tráfego nessa porta.

**Liberando a porta no Firewall (exemplo com o UFW):**
```bash
# Permite conexões na porta 3001
sudo ufw allow 3001/tcp
```
