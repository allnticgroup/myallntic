import { useLocalStorage } from './useLocalStorage';
import { Client, Vente, StockMovement, Project, ProjectTask } from '@/types/erp';

// ===== ID Generation =====
function generateCode(prefix: string, items: { code: string }[]): string {
  const maxNum = items.reduce((max, item) => {
    const num = parseInt(item.code.replace(prefix, ''), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  const padLen = prefix === 'V' ? 4 : 3;
  return `${prefix}${String(maxNum + 1).padStart(padLen, '0')}`;
}

// ===== Clients =====
export function useClients() {
  const [clients, setClients] = useLocalStorage<Client[]>('allntic_clients', []);

  const addClient = (client: Omit<Client, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newClient: Client = {
      ...client,
      id: crypto.randomUUID(),
      code: generateCode('CL', clients),
      createdAt: now,
      updatedAt: now,
    };
    setClients((prev) => [...prev, newClient]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      )
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const getClient = (id: string) => clients.find((c) => c.id === id);

  return { clients, addClient, updateClient, deleteClient, getClient };
}

// ===== Ventes =====
export function useVentes() {
  const [ventes, setVentes] = useLocalStorage<Vente[]>('allntic_ventes', []);

  const addVente = (vente: Omit<Vente, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newVente: Vente = {
      ...vente,
      id: crypto.randomUUID(),
      code: generateCode('V', ventes),
      createdAt: now,
      updatedAt: now,
    };
    setVentes((prev) => [...prev, newVente]);
    return newVente;
  };

  const updateVente = (id: string, updates: Partial<Vente>) => {
    setVentes((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v
      )
    );
  };

  const deleteVente = (id: string) => {
    setVentes((prev) => prev.filter((v) => v.id !== id));
  };

  const getVentesForClient = (clientId: string) =>
    ventes.filter((v) => v.clientId === clientId);

  return { ventes, addVente, updateVente, deleteVente, getVentesForClient };
}

// ===== Stock Movements =====
export function useStockMovements() {
  const [movements, setMovements] = useLocalStorage<StockMovement[]>('allntic_stock_movements', []);

  const addMovement = (movement: Omit<StockMovement, 'id' | 'createdAt'>) => {
    const newMovement: StockMovement = {
      ...movement,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setMovements((prev) => [newMovement, ...prev]);
    return newMovement;
  };

  const getMovementsForMaterial = (materialId: string) =>
    movements.filter((m) => m.materialId === materialId);

  return { movements, addMovement, getMovementsForMaterial };
}

// ===== Projects =====
export function useProjects() {
  const [projects, setProjects] = useLocalStorage<Project[]>('allntic_projects', []);

  const addProject = (project: Omit<Project, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      code: generateCode('PJ', projects),
      createdAt: now,
      updatedAt: now,
    };
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const getProject = (id: string) => projects.find((p) => p.id === id);

  const addTask = (projectId: string, task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTask: ProjectTask = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, taches: [...p.taches, newTask], updatedAt: now }
          : p
      )
    );
    return newTask;
  };

  const updateTask = (projectId: string, taskId: string, updates: Partial<ProjectTask>) => {
    const now = new Date().toISOString();
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              taches: p.taches.map((t) =>
                t.id === taskId ? { ...t, ...updates, updatedAt: now } : t
              ),
              updatedAt: now,
            }
          : p
      )
    );
  };

  const deleteTask = (projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, taches: p.taches.filter((t) => t.id !== taskId), updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  return { projects, addProject, updateProject, deleteProject, getProject, addTask, updateTask, deleteTask };
}
