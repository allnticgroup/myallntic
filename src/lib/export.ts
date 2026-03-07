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

export function validateImportData(data: unknown): data is ImportData {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  
  if (!obj.data || typeof obj.data !== 'object') return false;
  const dataObj = obj.data as Record<string, unknown>;
  
  return (
    Array.isArray(dataObj.prospects) &&
    Array.isArray(dataObj.devis) &&
    Array.isArray(dataObj.interventions)
  );
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
