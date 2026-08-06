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
  clientId?: string; // lien vers le client lié (après conversion)
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
  objet: string;
  option: DevisOption;
  montant: number;
  lignes: DevisLigne[];
  statut: DevisStatus;
  acompteRecu: boolean;
  montantAcompte: number;
  mainDoeuvre: number;
  stockDeduit: boolean;
  entrepriseNom: string;
  entrepriseAdresse: string;
  entrepriseTelephone: string;
  entrepriseEmail: string;
  entrepriseSite: string;
  createdAt: string;
  updatedAt: string;
}

export interface Intervention {
  id: string;
  prospectId: string;
  employeeId?: string; // Employé assigné à l'intervention
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
  modele?: string;
  categorie: MaterialCategory;
  prixUnitaire: number;
  unite: string;
  description: string;
  photo?: string; // Base64 JPEG compressée
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
  projectId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceSource = 'devis' | 'vente';

export interface Invoice {
  id: string;
  numero: string;
  devisId: string; // empty string when source = 'vente'
  prospectId: string; // empty string when source = 'vente'
  venteId?: string;
  clientId?: string;
  source?: InvoiceSource;
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

// Types pour les fournisseurs
export type SupplierCategory = 'materiel' | 'services' | 'logistique' | 'autre';

export interface Supplier {
  id: string;
  nom: string;
  contact: string;
  telephone: string;
  email: string;
  adresse: string;
  categorie: SupplierCategory;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  supplierId: string;
  materialId: string | null;
  quantite: number;
  reference: string;
  description: string;
  montant: number;
  datePurchase: string;
  dateReception: string | null;
  statut: 'commande' | 'livree' | 'annulee';
  stockUpdated: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const SUPPLIER_CATEGORY_LABELS: Record<SupplierCategory, string> = {
  materiel: 'Matériel',
  services: 'Services',
  logistique: 'Logistique',
  autre: 'Autre',
};

export const PURCHASE_STATUS_LABELS: Record<Purchase['statut'], string> = {
  commande: 'Commandé',
  livree: 'Livrée',
  annulee: 'Annulée',
};

// Types pour les employés
export type EmployeeRole = 'technicien' | 'commercial' | 'administratif' | 'manager' | 'autre';
export type EmployeeStatus = 'actif' | 'inactif';
export type ContractType = 'cdi' | 'cdd' | 'stage' | 'freelance' | 'interim' | 'autre';

export interface Employee {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  poste: string;
  role: EmployeeRole;
  statut: EmployeeStatus;
  dateEmbauche: string;
  notes: string;
  // Nouveaux champs
  photo?: string; // Base64 de la photo de profil
  adresse: string;
  ville: string;
  typeContrat: ContractType;
  salaireBase: number;
  dateFinContrat?: string;
  photoIdentite?: string; // Base64 de la pièce d'identité
  cvData?: string; // Base64 du CV
  cvFileName?: string;
  numeroSecuriteSociale?: string;
  contactUrgence?: string;
  telephoneUrgence?: string;
  createdAt: string;
  updatedAt: string;
}

export const EMPLOYEE_ROLE_LABELS: Record<EmployeeRole, string> = {
  technicien: 'Technicien',
  commercial: 'Commercial',
  administratif: 'Administratif',
  manager: 'Manager',
  autre: 'Autre',
};

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  actif: 'Actif',
  inactif: 'Inactif',
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  cdi: 'CDI',
  cdd: 'CDD',
  stage: 'Stage',
  freelance: 'Freelance',
  interim: 'Intérim',
  autre: 'Autre',
};

// Types pour les salaires
export type SalaryType = 'salaire' | 'prime' | 'avance' | 'remboursement' | 'autre';

export interface Salary {
  id: string;
  employeeId: string;
  montant: number;
  type: SalaryType;
  periode: string; // Format: "2024-03" pour mars 2024
  datePaiement: string;
  modePaiement: 'especes' | 'virement' | 'cheque' | 'mobile_money';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const SALARY_TYPE_LABELS: Record<SalaryType, string> = {
  salaire: 'Salaire',
  prime: 'Prime',
  avance: 'Avance',
  remboursement: 'Remboursement',
  autre: 'Autre',
};

// Types pour les documents employés
export type EmployeeDocumentType = 'contrat' | 'piece_identite' | 'diplome' | 'attestation' | 'autre';

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  nom: string;
  type: EmployeeDocumentType;
  dateDocument: string;
  dateExpiration?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const EMPLOYEE_DOCUMENT_TYPE_LABELS: Record<EmployeeDocumentType, string> = {
  contrat: 'Contrat',
  piece_identite: 'Pièce d\'identité',
  diplome: 'Diplôme',
  attestation: 'Attestation',
  autre: 'Autre',
};

// Types pour les paramètres entreprise
export interface CompanySettings {
  nom: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  siteWeb: string;
  logo?: string; // Base64
  numeroFiscal?: string;
  tauxTVA: number; // en pourcentage, 0 = pas de TVA
  services: string[];
  // Paiements mobiles - liens / numéros marchand
  waveLink?: string; // ex: https://pay.wave.com/m/XXXX/c/xof (peut contenir {amount})
  orangeMoneyLink?: string; // ex: code marchand ou USSD #144*82*XXXXX#
  ibanBancaire?: string; // RIB / IBAN pour virement
  banqueNom?: string;
}


// Types pour l'audit log
export type AuditAction = 'create' | 'update' | 'delete';
export type AuditEntity = 'prospect' | 'devis' | 'intervention' | 'material' | 'payment' | 'expense' | 'invoice' | 'supplier' | 'purchase' | 'employee' | 'salary' | 'employee_document' | 'company_settings';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  entityLabel: string;
  timestamp: string;
  details?: string;
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
};

export const AUDIT_ENTITY_LABELS: Record<AuditEntity, string> = {
  prospect: 'Prospect',
  devis: 'Devis',
  intervention: 'Intervention',
  material: 'Matériel',
  payment: 'Paiement',
  expense: 'Dépense',
  invoice: 'Facture',
  supplier: 'Fournisseur',
  purchase: 'Achat',
  employee: 'Employé',
  salary: 'Salaire',
  employee_document: 'Document employé',
  company_settings: 'Paramètres entreprise',
};
