// Sauvegarde automatique des données au lancement de l'application.
// Télécharge un fichier JSON complet (toutes les clés allntic_*) une fois par jour,
// au premier lancement de la journée. Met aussi à jour 'lastExportDate'
// pour désactiver le rappel de sauvegarde du tableau de bord.
import { getAllData } from './export';
import { toast } from 'sonner';

const LAST_AUTO_BACKUP_KEY = 'allntic_last_auto_backup_date';

const PREVIEW_HOSTS = [
  'lovableproject.com',
  'lovableproject-dev.com',
  'beta.lovable.dev',
];

function isInsideIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function isPreviewHost(hostname: string): boolean {
  return (
    hostname.startsWith('id-preview--') ||
    hostname.startsWith('preview--') ||
    PREVIEW_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))
  );
}

export function runAutoBackupOnLaunch(): void {
  try {
    // Pas de téléchargement automatique dans l'aperçu/iframe (développement)
    if (isInsideIframe() || isPreviewHost(window.location.hostname)) return;

    const today = new Date().toISOString().split('T')[0];
    if (localStorage.getItem(LAST_AUTO_BACKUP_KEY) === today) return;

    // Dump complet de toutes les données locales de l'application
    const fullBackup: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('allntic_') || key === LAST_AUTO_BACKUP_KEY) continue;
      const raw = localStorage.getItem(key);
      try {
        fullBackup[key] = raw ? JSON.parse(raw) : null;
      } catch {
        fullBackup[key] = raw;
      }
    }

    // Structure standard (prospects/devis/interventions) pour rester compatible
    // avec l'outil de restauration + dump complet des modules ERP.
    const payload = { ...getAllData(), fullBackup };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `allntic-backup-auto-${today}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    localStorage.setItem(LAST_AUTO_BACKUP_KEY, today);
    localStorage.setItem('lastExportDate', new Date().toISOString());
    toast.success('Sauvegarde automatique téléchargée', {
      description: `allntic-backup-auto-${today}.json`,
    });
  } catch (error) {
    console.error('Sauvegarde automatique échouée', error);
  }
}
