import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tool, User, HistoryRecord, ToolStatus } from '../types';
import { INITIAL_TOOLS, INITIAL_USERS } from '../data/initialData';
import { apiService } from '../services/apiService';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentUser: User | null;
  login: (matricula: string) => Promise<boolean>;
  logout: () => void;

  tools: Tool[];
  users: User[];
  history: HistoryRecord[];
  isLoading: boolean;

  addTool: (tool: Tool) => void;
  bulkAddTools: (tools: Tool[]) => void;
  updateTool: (tool: Tool) => void;
  deleteTool: (id: string) => void;
  updateToolStatus: (toolIds: string[], status: ToolStatus) => void;

  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;

  addHistoryRecord: (record: Omit<HistoryRecord, 'id'>) => void;
  updateHistoryRecord: (id: string, updates: Partial<HistoryRecord>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper para carregar dados do LocalStorage com fallback
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  const storedItem = localStorage.getItem(key);
  if (!storedItem) return fallback;

  try {
    return JSON.parse(storedItem);
  } catch (error) {
    if (typeof fallback === 'string') {
      return storedItem as unknown as T;
    }
    console.error(`Erro ao carregar ${key} do LocalStorage:`, error);
    return fallback;
  }
};

export const AppProvider = ({ children }: { children?: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    loadFromStorage('zagfer_theme', 'light')
  );

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de Dados
  const [tools, setTools] = useState<Tool[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // Inicialização de Dados (Local Backend ou LocalStorage)
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);

      try {
        console.log("ZAGFER: Conectando ao Servidor Local...");

        // Tenta carregar do backend local
        const [toolsData, usersData, historyData] = await Promise.all([
          apiService.getTools(),
          apiService.getUsers(),
          apiService.getHistory()
        ]);

        // Ferramentas
        if (toolsData && toolsData.length > 0) {
          setTools(toolsData);
        } else {
          // Se banco vazio, usar inicial e salvar no backend
          console.log("Banco de ferramentas vazio. Inicializando...");
          setTools(INITIAL_TOOLS);
          await apiService.bulkAddTools(INITIAL_TOOLS).catch(err => console.error("Falha ao inicializar ferramentas no backend", err));
        }

        // Usuários
        if (usersData && usersData.length > 0) {
          setUsers(usersData);
        } else {
          setUsers(INITIAL_USERS);
          await apiService.addUser(INITIAL_USERS[0]); // Exemplo: Adiciona o primeiro ou trata array na API
          // Nota: apiService.addUser espera um objeto. Se INITIAL_USERS é array, precisamos loopar ou usar endpoint bulk se criamos.
          // O endpoint backend /users suporta array (bulk) no código que fiz: if (Array.isArray(user)) ...
          await apiService.addUser(INITIAL_USERS);
        }

        // Histórico
        if (historyData) setHistory(historyData);

      } catch (error) {
        console.error("Erro ao conectar Servidor Local:", error);
        console.log("ZAGFER: Usando LocalStorage (Fallback)");
        loadLocalData();
      }

      setIsLoading(false);
    };

    const loadLocalData = () => {
      setTools(loadFromStorage('zagfer_tools', INITIAL_TOOLS));
      setUsers(loadFromStorage('zagfer_users', INITIAL_USERS));
      setHistory(loadFromStorage('zagfer_history', []));
    };

    initData();
  }, []);

  // Efeitos de Persistência LOCAL (Sempre salva no local como backup/cache)
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('zagfer_theme', JSON.stringify(theme));
  }, [theme]);

  // Mantemos o backup no localStorage caso o server caia
  useEffect(() => {
    if (!isLoading) localStorage.setItem('zagfer_tools', JSON.stringify(tools));
  }, [tools, isLoading]);

  useEffect(() => {
    if (!isLoading) localStorage.setItem('zagfer_users', JSON.stringify(users));
  }, [users, isLoading]);

  useEffect(() => {
    if (!isLoading) localStorage.setItem('zagfer_history', JSON.stringify(history));
  }, [history, isLoading]);


  // --- ACTIONS (CRUD com Backend Local) ---

  const addTool = async (tool: Tool) => {
    // Optimistic Update
    setTools(prev => [...prev, tool]);
    // Backend Update
    await apiService.addTool(tool).catch(e => console.error("Erro ao salvar tool no backend", e));
  };

  const bulkAddTools = async (newTools: Tool[]) => {
    setTools(prev => [...prev, ...newTools]);
    await apiService.bulkAddTools(newTools).catch(e => console.error("Erro ao salvar tools no backend", e));
  };

  const updateTool = async (updatedTool: Tool) => {
    setTools(prev => prev.map(t => t.id === updatedTool.id ? updatedTool : t));
    await apiService.updateTool(updatedTool).catch(e => console.error("Erro ao atualizar tool no backend", e));
  };

  const deleteTool = async (id: string) => {
    setTools(prev => prev.filter(t => t.id !== id));
    await apiService.deleteTool(id).catch(e => console.error("Erro ao deletar tool no backend", e));
  };

  const updateToolStatus = async (toolIds: string[], status: ToolStatus) => {
    setTools(prevTools => prevTools.map(t =>
      toolIds.includes(t.id) ? { ...t, status } : t
    ));
    await apiService.updateToolStatus(toolIds, status).catch(e => console.error("Erro ao atualizar status no backend", e));
  };

  const addUser = async (user: User) => {
    setUsers(prev => [...prev, user]);
    await apiService.addUser(user).catch(e => console.error("Erro ao salvar user no backend", e));
  };

  const updateUser = async (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    await apiService.updateUser(updatedUser).catch(e => console.error("Erro ao atualizar user no backend", e));
  };

  const deleteUser = async (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    await apiService.deleteUser(id).catch(e => console.error("Erro ao deletar user no backend", e));
  };

  const addHistoryRecord = async (recordData: Omit<HistoryRecord, 'id'>) => {
    const newRecord = { ...recordData, id: Math.random().toString(36).substr(2, 9) };
    setHistory(prev => [newRecord, ...prev]);

    await apiService.addHistory(newRecord).catch(e => console.error("Erro ao salvar historico no backend", e));
  };

  const updateHistoryRecord = async (id: string, updates: Partial<HistoryRecord>) => {
    setHistory(prev => prev.map(record =>
      record.id === id ? { ...record, ...updates } : record
    ));
    await apiService.updateHistory(id, updates).catch(e => console.error("Erro ao atualizar historico no backend", e));
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const login = async (matricula: string) => {
    const user = users.find(u => u.matricula === matricula && u.active);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      currentUser, login, logout,
      tools, users, history, isLoading,
      addTool, bulkAddTools, updateTool, deleteTool, updateToolStatus,
      addUser, updateUser, deleteUser,
      addHistoryRecord, updateHistoryRecord
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};