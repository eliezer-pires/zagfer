const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let serverProcess;

function startServer() {
    const serverPath = path.join(__dirname, '../server');
    console.log('Iniciando servidor local em:', serverPath);

    // Inicia o servidor como um processo filho
    // Utiliza 'npm run start' que chama 'ts-node src/index.ts'
    serverProcess = spawn('npm', ['run', 'start'], {
        cwd: serverPath,
        shell: true,
        stdio: 'ignore' // Silencia a saída para não abrir janelas extras
    });

    serverProcess.on('error', (err) => {
        console.error('Falha ao iniciar servidor:', err);
    });
}

function stopServer() {
    if (serverProcess) {
        console.log('Encerrando servidor local...');
        // Tenta matar o processo de forma limpa
        // No Windows, matar o shell pode não matar o filho, mas para 'npm run' geralmente funciona o kill basico ou tree-kill se precisar
        serverProcess.kill();
        serverProcess = null;
    }
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, '../assets/logo.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false
        },
        autoHideMenuBar: true
    });

    win.loadFile(path.join(__dirname, '../dist/index.html'));

    win.webContents.on('before-input-event', (event, input) => {
        if (input.control && input.shift && input.key.toLowerCase() === 'i') {
            event.preventDefault();
        }
        if (input.key === 'F12') {
            event.preventDefault();
        }
    });
}

app.whenReady().then(() => {
    startServer(); // Inicia o Backend junto com o App
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('will-quit', () => {
    stopServer(); // Garante o encerramento do servidor
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
