import express from 'express';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';

/**
 * INICIALIZAÇÃO DO SERVIDOR BACKEND
 * 
 * FLUXO DE DADOS DEPENDENDO DO AMBIENTE:
 * 
 * DESENVOLVIMENTO (npm run dev):
 * - Usa banco de dados: server/prisma/dev.db
 * - Dados são gerenciados manualmente pelo usuário
 * - Pode criar/editar/deletar ferramentas livremente
 * 
 * PRODUÇÃO (npm run build):
 * - Usa banco de dados: server/prisma/prod.db
 * - Carrega dados iniciais de: data/initialData.ts
 * - Usuários receberão sempre os dados originais ao instalar
 */

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

// Verificar qual ambiente estamos rodando
const isProduction = process.env.NODE_ENV === 'production';
const useInitialData = process.env.USE_INITIAL_DATA === 'true';

app.use(cors());
app.use(bodyParser.json());

/**
 * FUNÇÃO: Carregar Dados Iniciais
 * 
 * Quando em PRODUÇÃO, executa uma única vez ao iniciar o servidor
 * e popula o banco com os dados de initialData.ts
 */
const loadInitialData = async () => {
    try {
        // Verificar se já existem dados no banco
        const toolCount = await prisma.tool.count();
        const userCount = await prisma.user.count();
        
        if (toolCount === 0 && userCount === 0 && useInitialData) {
            console.log('📦 Carregando dados iniciais em produção...');
            
            // Importa os dados de initialData.ts
            const { INITIAL_TOOLS, INITIAL_USERS } = await import('../../data/initialData');
            
            // Inserir ferramentas iniciais
            await prisma.tool.createMany({ data: INITIAL_TOOLS });
            console.log(`✅ ${INITIAL_TOOLS.length} ferramentas carregadas`);
            
            // Inserir usuários iniciais
            await prisma.user.createMany({ data: INITIAL_USERS });
            console.log(`✅ ${INITIAL_USERS.length} usuários carregados`);
        } else if (useInitialData) {
            console.log('ℹ️  Banco de dados já contém dados. Pulando carregamento inicial.');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar dados iniciais:', error);
        // Não parar o servidor se houver erro, apenas alertar
    }
};

// Executar carregamento de dados ao iniciar (se em produção)
loadInitialData();



// --- Tools Endpoints ---

app.get('/tools', async (req, res) => {
    try {
        const tools = await prisma.tool.findMany();
        res.json(tools);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch tools' });
    }
});

app.post('/tools', async (req, res) => {
    try {
        const tool = req.body;
        if (Array.isArray(tool)) {
            const count = await prisma.tool.createMany({ data: tool });
            res.json(count);
        } else {
            const newTool = await prisma.tool.create({ data: tool });
            res.json(newTool);
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create tool' });
    }
});

app.put('/tools/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updated = await prisma.tool.update({ where: { id }, data });
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update tool' });
    }
});

app.delete('/tools/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.tool.delete({ where: { id } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete tool' });
    }
});

// Helper for bulk status update
app.post('/tools/update-status', async (req, res) => {
    try {
        const { ids, status } = req.body; // ids: string[], status: string
        const result = await prisma.tool.updateMany({
            where: { id: { in: ids } },
            data: { status }
        });
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update tool statuses' });
    }
});


// --- Users Endpoints ---

app.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.post('/users', async (req, res) => {
    try {
        const user = req.body;
        if (Array.isArray(user)) {
            const count = await prisma.user.createMany({ data: user });
            res.json(count);
        } else {
            const newUser = await prisma.user.create({ data: user });
            res.json(newUser);
        }
    } catch (e) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updated = await prisma.user.update({ where: { id }, data });
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

app.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});


// --- History Endpoints ---

app.get('/history', async (req, res) => {
    try {
        const history = await prisma.historyRecord.findMany({
            orderBy: { timestamp: 'desc' }
        });
        // Parse toolIds back to array
        const parsedHistory = history.map((h: any) => {
            let toolIds = [];
            try {
                toolIds = JSON.parse(h.toolIds);
            } catch (e) {
                console.error('Failed to parse toolIds', h.toolIds);
            }
            return { ...h, toolIds };
        });
        res.json(parsedHistory);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

app.post('/history', async (req, res) => {
    try {
        const record = req.body;
        const dataToSave = {
            ...record,
            toolIds: JSON.stringify(record.toolIds)
        };
        const newRecord = await prisma.historyRecord.create({ data: dataToSave });

        // Return with parsed toolIds (though client probably knows what it sent)
        res.json({ ...newRecord, toolIds: record.toolIds });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create history record' });
    }
});

app.put('/history/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        if (updates.toolIds) {
            updates.toolIds = JSON.stringify(updates.toolIds);
        }
        const updated = await prisma.historyRecord.update({ where: { id }, data: updates });
        res.json({ ...updated, toolIds: JSON.parse(updated.toolIds) });
    } catch (e) {
        res.status(500).json({ error: 'Failed to update history record' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});

// --- Servindo o Frontend (Arquivos Estáticos) ---

// Serve os arquivos estáticos da pasta build do React (dist)
// O diretório 'dist' está dois níveis acima da pasta 'src' atual
const frontendPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendPath));

// Para qualquer rota não tratada pela API, retorna o index.html do React
// Isso garante que o roteamento no lado do cliente (Client-side routing) funcione corretamente
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});
