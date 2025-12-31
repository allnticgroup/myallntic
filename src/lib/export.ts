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

export function importData(data: ImportData): { success: boolean; counts: { prospects: number; devis: number; interventions: number } } {
  try {
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
