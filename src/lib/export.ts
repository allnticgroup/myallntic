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
