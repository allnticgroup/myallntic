import { Prospect, Devis, STATUS_LABELS, STRUCTURE_LABELS, BESOIN_LABELS, DEVIS_OPTION_LABELS, DEVIS_STATUS_LABELS } from '@/types';
import { z } from 'zod';

export function exportToJson(data: object, filename: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCsv(data: string[][], filename: string) {
  const csvContent = data.map(row => 
    row.map(cell => {
      const escaped = String(cell).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(';')
  ).join('\n');
  
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportProspectsToCsv(prospects: Prospect[]) {
  const headers = ['Nom Structure', 'Décideur', 'Téléphone', 'Type', 'Besoin', 'Statut', 'Notes', 'Créé le'];
  const rows = prospects.map(p => [
    p.nomStructure,
    p.nomDecideur,
    p.telephone,
    STRUCTURE_LABELS[p.typeStructure],
    BESOIN_LABELS[p.besoinPrincipal],
    STATUS_LABELS[p.statut],
    p.notes,
    new Date(p.createdAt).toLocaleDateString('fr-FR')
  ]);
  
  const date = new Date().toISOString().split('T')[0];
  exportToCsv([headers, ...rows], `prospects-${date}.csv`);
}

export function exportDevisToCsv(devisList: Devis[], getProspectName: (id: string) => string) {
  const headers = ['Client', 'Date', 'Option', 'Montant', 'Statut', 'Acompte reçu', 'Montant acompte'];
  const rows = devisList.map(d => [
    getProspectName(d.prospectId),
    new Date(d.dateDevis).toLocaleDateString('fr-FR'),
    DEVIS_OPTION_LABELS[d.option],
    d.montant.toLocaleString('fr-FR') + ' F',
    DEVIS_STATUS_LABELS[d.statut],
    d.acompteRecu ? 'Oui' : 'Non',
    d.montantAcompte.toLocaleString('fr-FR') + ' F'
  ]);
  
  const date = new Date().toISOString().split('T')[0];
  exportToCsv([headers, ...rows], `devis-${date}.csv`);
}

export function getAllData() {
  const prospects = localStorage.getItem('allntic_prospects');
  const devis = localStorage.getItem('allntic_devis');
  const interventions = localStorage.getItem('allntic_interventions');

  return {
    exportDate: new Date().toISOString(),
    version: '1.0',
    data: {
      prospects: prospects ? JSON.parse(prospects) : [],
      devis: devis ? JSON.parse(devis) : [],
      interventions: interventions ? JSON.parse(interventions) : [],
    },
  };
}

export function generateExportFilename() {
  const date = new Date();
  const formatted = date.toISOString().split('T')[0];
  return `allntic-backup-${formatted}.json`;
}

export interface ImportData {
  exportDate?: string;
  version?: string;
  data: {
    prospects: unknown[];
    devis: unknown[];
    interventions: unknown[];
  };
}

// Zod schemas for import validation
const prospectSchema = z.object({
  id: z.string().min(1),
  nomStructure: z.string().min(1).max(200),
  nomDecideur: z.string().max(200).default(''),
  telephone: z.string().max(50).default(''),
  typeStructure: z.enum(['PME', 'ONG', 'Ecole', 'Commerce', 'Autre']),
  besoinPrincipal: z.enum(['Reseau', 'Videosurveillance', 'Controle_acces', 'Maintenance']),
  statut: z.enum(['prospect', 'audit_prevu', 'audit_realise', 'devis_envoye', 'signe', 'refuse']),
  notes: z.string().max(5000).default(''),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const devisLigneSchema = z.object({
  materialId: z.string(),
  nom: z.string().max(500),
  reference: z.string().max(200).default(''),
  categorie: z.enum(['camera', 'cable', 'enregistreur', 'accessoire', 'reseau', 'autre']),
  quantite: z.number().min(0),
  prixUnitaire: z.number().min(0),
  total: z.number().min(0),
});

const devisSchema = z.object({
  id: z.string().min(1),
  prospectId: z.string().min(1),
  dateDevis: z.string(),
  objet: z.string().max(500).default(''),
  option: z.enum(['Essentiel', 'Pro_Maintenance']),
  montant: z.number().min(0),
  lignes: z.array(devisLigneSchema).default([]),
  statut: z.enum(['envoye', 'accepte', 'refuse']),
  acompteRecu: z.boolean().default(false),
  montantAcompte: z.number().min(0).default(0),
  mainDoeuvre: z.number().min(0).default(0),
  stockDeduit: z.boolean().default(false),
  entrepriseNom: z.string().max(200).default(''),
  entrepriseAdresse: z.string().max(500).default(''),
  entrepriseTelephone: z.string().max(50).default(''),
  entrepriseEmail: z.string().max(200).default(''),
  entrepriseSite: z.string().max(200).default(''),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const interventionSchema = z.object({
  id: z.string().min(1),
  prospectId: z.string().min(1),
  type: z.enum(['Installation', 'Maintenance']),
  datePrevue: z.string(),
  statut: z.enum(['a_faire', 'fait']),
  notes: z.string().max(5000).default(''),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const importDataSchema = z.object({
  exportDate: z.string().optional(),
  version: z.string().optional(),
  data: z.object({
    prospects: z.array(z.unknown()),
    devis: z.array(z.unknown()),
    interventions: z.array(z.unknown()),
  }),
});

export function validateImportData(data: unknown): data is ImportData {
  const result = importDataSchema.safeParse(data);
  return result.success;
}

/**
 * Validates and filters individual items, returning only valid ones.
 */
export function sanitizeImportData(data: ImportData): {
  sanitized: ImportData;
  skipped: { prospects: number; devis: number; interventions: number };
} {
  const validProspects: unknown[] = [];
  const validDevis: unknown[] = [];
  const validInterventions: unknown[] = [];
  let skippedP = 0, skippedD = 0, skippedI = 0;

  for (const item of data.data.prospects) {
    const r = prospectSchema.safeParse(item);
    if (r.success) validProspects.push(r.data);
    else skippedP++;
  }
  for (const item of data.data.devis) {
    const r = devisSchema.safeParse(item);
    if (r.success) validDevis.push(r.data);
    else skippedD++;
  }
  for (const item of data.data.interventions) {
    const r = interventionSchema.safeParse(item);
    if (r.success) validInterventions.push(r.data);
    else skippedI++;
  }

  return {
    sanitized: {
      ...data,
      data: { prospects: validProspects, devis: validDevis, interventions: validInterventions },
    },
    skipped: { prospects: skippedP, devis: skippedD, interventions: skippedI },
  };
}

export function importData(
  data: ImportData, 
  mode: 'replace' | 'merge' = 'replace'
): { success: boolean; counts: { prospects: number; devis: number; interventions: number } } {
  try {
    if (mode === 'replace') {
      localStorage.setItem('allntic_prospects', JSON.stringify(data.data.prospects));
      localStorage.setItem('allntic_devis', JSON.stringify(data.data.devis));
      localStorage.setItem('allntic_interventions', JSON.stringify(data.data.interventions));
      
      return {
        success: true,
        counts: {
          prospects: data.data.prospects.length,
          devis: data.data.devis.length,
          interventions: data.data.interventions.length,
        },
      };
    } else {
      // Merge mode: add new items, skip duplicates by ID
      const existingProspects = JSON.parse(localStorage.getItem('allntic_prospects') || '[]');
      const existingDevis = JSON.parse(localStorage.getItem('allntic_devis') || '[]');
      const existingInterventions = JSON.parse(localStorage.getItem('allntic_interventions') || '[]');

      const existingProspectIds = new Set(existingProspects.map((p: { id: string }) => p.id));
      const existingDevisIds = new Set(existingDevis.map((d: { id: string }) => d.id));
      const existingInterventionIds = new Set(existingInterventions.map((i: { id: string }) => i.id));

      const newProspects = (data.data.prospects as { id: string }[]).filter(p => !existingProspectIds.has(p.id));
      const newDevis = (data.data.devis as { id: string }[]).filter(d => !existingDevisIds.has(d.id));
      const newInterventions = (data.data.interventions as { id: string }[]).filter(i => !existingInterventionIds.has(i.id));

      localStorage.setItem('allntic_prospects', JSON.stringify([...existingProspects, ...newProspects]));
      localStorage.setItem('allntic_devis', JSON.stringify([...existingDevis, ...newDevis]));
      localStorage.setItem('allntic_interventions', JSON.stringify([...existingInterventions, ...newInterventions]));

      return {
        success: true,
        counts: {
          prospects: newProspects.length,
          devis: newDevis.length,
          interventions: newInterventions.length,
        },
      };
    }
  } catch {
    return {
      success: false,
      counts: { prospects: 0, devis: 0, interventions: 0 },
    };
  }
}

export function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        resolve(data);
      } catch {
        reject(new Error('Fichier JSON invalide'));
      }
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsText(file);
  });
}
