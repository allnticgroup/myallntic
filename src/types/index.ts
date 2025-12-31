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

export interface Devis {
  id: string;
  prospectId: string;
  dateDevis: string;
  option: DevisOption;
  montant: number;
  statut: DevisStatus;
  acompteRecu: boolean;
  montantAcompte: number;
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
