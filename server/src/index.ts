import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
