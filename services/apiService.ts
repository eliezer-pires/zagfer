import { FrontendConfig } from '../src/config/Frontend'; // Ajuste o caminho conforme necessário

const API_URL = FrontendConfig.api.baseUrl;

export const apiService = {
    async getTools() {
        try {
            const res = await fetch(`${API_URL}/tools`);
            if (!res.ok) throw new Error('Failed to fetch tools');
            return await res.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    async addTool(tool: any) {
        const res = await fetch(`${API_URL}/tools`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tool)
        });
        return res.json();
    },
    async bulkAddTools(tools: any[]) {
        const res = await fetch(`${API_URL}/tools`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tools)
        });
        return res.json();
    },
    async updateTool(tool: any) {
        const res = await fetch(`${API_URL}/tools/${tool.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tool)
        });
        return res.json();
    },
    async deleteTool(id: string) {
        await fetch(`${API_URL}/tools/${id}`, { method: 'DELETE' });
    },
    async updateToolStatus(ids: string[], status: string) {
        await fetch(`${API_URL}/tools/update-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids, status })
        });
    },

    async getUsers() {
        try {
            const res = await fetch(`${API_URL}/users`);
            if (!res.ok) throw new Error('Failed to fetch users');
            return await res.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    async addUser(user: any) {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        return res.json();
    },
    async updateUser(user: any) {
        const res = await fetch(`${API_URL}/users/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        return res.json();
    },
    async deleteUser(id: string) {
        await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
    },

    async getHistory() {
        try {
            const res = await fetch(`${API_URL}/history`);
            if (!res.ok) throw new Error('Failed to fetch history');
            return await res.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    async addHistory(record: any) {
        const res = await fetch(`${API_URL}/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
        });
        return res.json();
    },
    async updateHistory(id: string, updates: any) {
        const res = await fetch(`${API_URL}/history/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return res.json();
    }
};
