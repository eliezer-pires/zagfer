@echo off
cd /d "%~dp0"
echo ==========================================
echo      INICIANDO SISTEMA ZAGFER (Desktop)
echo ==========================================
echo.

:: 1. Verifica se o Node.js esta instalado
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] O Node.js nao foi encontrado.
    echo Baixe e instale em: https://nodejs.org/
    pause
    exit
)

:: 2. Instala dependencias do Frontend
if not exist "node_modules" (
    echo [SETUP] Instalando dependencias do Frontend...
    call npm install
)

:: 3. Instala dependencias do Backend e DB
if not exist "server\node_modules" (
    echo [SETUP] Instalando dependencias do Backend...
    cd server
    call npm install
    echo [SETUP] Configurando Banco de Dados...
    call npx prisma db push
    cd ..
)

:: 4. Garante que o build existe
if not exist "dist" (
    echo [BUILD] Criando versao executavel do sistema...
    call npm run build
)

:: 5. Inicia o App Electron (O Servidor Backend é gerido pelo Electron agora)
echo Iniciando Aplicativo...
call npm run electron