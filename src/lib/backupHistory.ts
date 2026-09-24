// Historique local des sauvegardes (5 dernières versions) avec restauration.
const KEY = 'allntic_backup_history';
const MAX = 5;
const EXCLUDE = new Set([KEY, 'allntic_pin_hash']);

interface Snapshot { id: string; date: string; data: Record<string, string> }

function read(): Snapshot[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function listBackups() {
  return read().map(({ id, date }) => ({ id, date }));
}

export function saveBackupSnapshot() {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (k.startsWith('allntic_') && !EXCLUDE.has(k)) data[k] = localStorage.getItem(k)!;
  }
  let list = [{ id: crypto.randomUUID(), date: new Date().toISOString(), data }, ...read()].slice(0, MAX);
  // Si l'espace manque, on réduit le nombre de versions conservées
  while (list.length) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); return; } catch { list = list.slice(0, -1); }
  }
}

export function restoreBackup(id: string) {
  const snap = read().find((s) => s.id === id);
  if (!snap) return;
  saveBackupSnapshot();
  Object.entries(snap.data).forEach(([k, v]) => localStorage.setItem(k, v));
}

export function deleteBackup(id: string) {
  localStorage.setItem(KEY, JSON.stringify(read().filter((s) => s.id !== id)));
}

/** Une sauvegarde interne par jour au lancement. */
export function dailySnapshot() {
  const last = read()[0];
  const today = new Date().toISOString().slice(0, 10);
  if (!last || !last.date.startsWith(today)) saveBackupSnapshot();
}
