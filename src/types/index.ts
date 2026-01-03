export type ProspectStatus = 
  | 'prospect'
  | 'audit_prevu'
  | 'audit_realise'
  | 'devis_envoye'
  | 'signe'
  | 'refuse';

export type StructureType = 'PME' | 'ONG' | 'Ecole' | 'Commerce' | 'Autre';

export type BesoinType = 'Reseau' | 'Videosurveillance' | 'Controle_acces' | 'Maintenance';

export type DevisOption = 'Essentiel' | 'Pro_Maintenance';

export type DevisStatus = 'envoye' | 'accepte' | 'refuse';

export type InterventionType = 'Installation' | 'Maintenance';

export type InterventionStatus = 'a_faire' | 'fait';

export interface Prospect {
  id: string;
  nomStructure: string;
  nomDecideur: string;
  telephone: string;
  typeStructure: StructureType;
  besoinPrincipal: BesoinType;
  statut: ProspectStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DevisLigne {
  materialId: string;
  nom: string;
  reference: string;
  categorie: MaterialCategory;
  quantite: number;
  prixUnitaire: number;
  total: number;
}

export interface Devis {
  id: string;
  prospectId: string;
  dateDevis: string;
  option: DevisOption;
  montant: number;
  lignes: DevisLigne[];
  statut: DevisStatus;
  acompteRecu: boolean;
  montantAcompte: number;
  stockDeduit: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Intervention {
  id: string;
  prospectId: string;
  type: InterventionType;
  datePrevue: string;
  statut: InterventionStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_LABELS: Record<ProspectStatus, string> = {
  prospect: 'Prospect',
  audit_prevu: 'Audit prévu',
  audit_realise: 'Audit réalisé',
  devis_envoye: 'Devis envoyé',
  signe: 'Signé',
  refuse: 'Refusé',
};

export const STRUCTURE_LABELS: Record<StructureType, string> = {
  PME: 'PME',
  ONG: 'ONG',
  Ecole: 'École',
  Commerce: 'Commerce',
  Autre: 'Autre',
};

export const BESOIN_LABELS: Record<BesoinType, string> = {
  Reseau: 'Réseau',
  Videosurveillance: 'Vidéosurveillance',
  Controle_acces: 'Contrôle d\'accès',
  Maintenance: 'Maintenance',
};

export const DEVIS_OPTION_LABELS: Record<DevisOption, string> = {
  Essentiel: 'Essentiel',
  Pro_Maintenance: 'Pro + Maintenance',
};

export const DEVIS_STATUS_LABELS: Record<DevisStatus, string> = {
  envoye: 'Envoyé',
  accepte: 'Accepté',
  refuse: 'Refusé',
};

export const INTERVENTION_TYPE_LABELS: Record<InterventionType, string> = {
  Installation: 'Installation',
  Maintenance: 'Maintenance',
};

export const INTERVENTION_STATUS_LABELS: Record<InterventionStatus, string> = {
  a_faire: 'À faire',
  fait: 'Fait',
};

// Types pour les matériels/matériaux
export type MaterialCategory = 'camera' | 'cable' | 'enregistreur' | 'accessoire' | 'reseau' | 'autre';

export interface Material {
  id: string;
  nom: string;
  reference: string;
  categorie: MaterialCategory;
  prixUnitaire: number;
  unite: string;
  description: string;
  stockQuantite: number;
  stockMinimum: number;
  createdAt: string;
  updatedAt: string;
}

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  camera: 'Caméra',
  cable: 'Câble',
  enregistreur: 'Enregistreur',
  accessoire: 'Accessoire',
  reseau: 'Réseau',
  autre: 'Autre',
};

// Types pour les finances
export type PaymentStatus = 'pending' | 'received' | 'partial';
export type ExpenseCategory = 'materiel' | 'transport' | 'personnel' | 'marketing' | 'autre';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface Payment {
  id: string;
  devisId: string;
  prospectId: string;
  montant: number;
  datePaiement: string;
  modePaiement: 'especes' | 'virement' | 'cheque' | 'mobile_money';
  reference: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  libelle: string;
  montant: number;
  categorie: ExpenseCategory;
  dateDepense: string;
  fournisseur: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  numero: string;
  devisId: string;
  prospectId: string;
  montantHT: number;
  montantTTC: number;
  dateEmission: string;
  dateEcheance: string;
  statut: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'En attente',
  received: 'Reçu',
  partial: 'Partiel',
};

export const PAYMENT_MODE_LABELS: Record<Payment['modePaiement'], string> = {
  especes: 'Espèces',
  virement: 'Virement',
  cheque: 'Chèque',
  mobile_money: 'Mobile Money',
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  materiel: 'Matériel',
  transport: 'Transport',
  personnel: 'Personnel',
  marketing: 'Marketing',
  autre: 'Autre',
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  overdue: 'En retard',
};
