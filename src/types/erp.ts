// ===== Client Types =====
export interface Client {
  id: string;
  code: string; // CL001
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
  ville: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ===== Vente (Sale) Types =====
export interface VenteLigne {
  materialId: string;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  total: number;
}

export type VenteStatus = 'brouillon' | 'validee' | 'annulee';

export interface Vente {
  id: string;
  code: string; // V0001
  clientId: string;
  projectId?: string;
  dateVente: string;
  lignes: VenteLigne[];
  sousTotal: number;
  remise: number; // percentage
  montantRemise: number;
  total: number;
  statut: VenteStatus;
  notes: string;
  stockDeduit: boolean;
  createdAt: string;
  updatedAt: string;
}

export const VENTE_STATUS_LABELS: Record<VenteStatus, string> = {
  brouillon: 'Brouillon',
  validee: 'Validée',
  annulee: 'Annulée',
};

// ===== Stock Movement Types =====
export type StockMovementType = 'entree' | 'sortie' | 'inventaire';

export interface StockMovement {
  id: string;
  materialId: string;
  type: StockMovementType;
  quantite: number;
  quantiteAvant: number;
  quantiteApres: number;
  reference: string; // e.g. "Vente V0001", "Achat fournisseur"
  notes: string;
  createdAt: string;
}

export const STOCK_MOVEMENT_LABELS: Record<StockMovementType, string> = {
  entree: 'Entrée',
  sortie: 'Sortie',
  inventaire: 'Inventaire',
};

// ===== Project Types =====
export type ProjectStatus = 'en_cours' | 'termine' | 'en_pause' | 'annule';
export type TaskStatus = 'a_faire' | 'en_cours' | 'fait';
export type TaskPriority = 'basse' | 'normale' | 'haute' | 'urgente';

export interface ProjectTask {
  id: string;
  titre: string;
  statut: TaskStatus;
  priorite: TaskPriority;
  dateEcheance?: string;
  assigneId?: string; // employeeId
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  code: string; // PJ001
  nom: string;
  clientId?: string;
  description: string;
  statut: ProjectStatus;
  dateDebut: string;
  dateFin?: string;
  budget: number;
  depenses: number;
  taches: ProjectTask[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  en_cours: 'En cours',
  termine: 'Terminé',
  en_pause: 'En pause',
  annule: 'Annulé',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  fait: 'Fait',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  basse: 'Basse',
  normale: 'Normale',
  haute: 'Haute',
  urgente: 'Urgente',
};
