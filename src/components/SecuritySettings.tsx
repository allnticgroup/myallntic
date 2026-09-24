import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PIN_KEY, hashPin } from './PinLock';
import { listBackups, restoreBackup, saveBackupSnapshot, deleteBackup } from '@/lib/backupHistory';

export function SecuritySettings() {
  const [pin, setPin] = useState('');
  const [hasPin, setHasPin] = useState(!!localStorage.getItem(PIN_KEY));
  const [backups, setBackups] = useState(listBackups());

  const savePin = async () => {
    if (!/^\d{4,8}$/.test(pin)) return toast.error('Le code doit contenir 4 à 8 chiffres');
    localStorage.setItem(PIN_KEY, await hashPin(pin));
    sessionStorage.setItem('allntic_unlocked', '1');
    setHasPin(true); setPin('');
    toast.success('Code PIN activé');
  };

  return (
    <>
      <Card><CardHeader><CardTitle>Code PIN</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">{hasPin ? 'Un code PIN protège l\'ouverture de l\'application.' : 'Aucun code PIN.'}</p>
          <Input type="password" inputMode="numeric" placeholder="Nouveau code (4-8 chiffres)" value={pin} onChange={(e) => setPin(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={savePin}>{hasPin ? 'Changer' : 'Activer'}</Button>
            {hasPin && <Button variant="outline" onClick={() => { localStorage.removeItem(PIN_KEY); setHasPin(false); toast.success('Code PIN désactivé'); }}>Désactiver</Button>}
          </div>
        </CardContent></Card>

      <Card><CardHeader><CardTitle>Historique des sauvegardes</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" onClick={() => { saveBackupSnapshot(); setBackups(listBackups()); toast.success('Sauvegarde créée'); }}>Créer une sauvegarde maintenant</Button>
          {backups.length === 0 && <p className="text-sm text-muted-foreground">Aucune sauvegarde interne.</p>}
          {backups.map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-2 text-sm border-b border-border py-2">
              <span>{new Date(b.date).toLocaleString('fr-FR')}</span>
              <div className="flex gap-1">
                <Button size="sm" onClick={() => { if (confirm('Restaurer cette sauvegarde ? Les données actuelles seront remplacées.')) { restoreBackup(b.id); window.location.reload(); } }}>Restaurer</Button>
                <Button size="sm" variant="ghost" onClick={() => { deleteBackup(b.id); setBackups(listBackups()); }}>Suppr.</Button>
              </div>
            </div>
          ))}
        </CardContent></Card>
    </>
  );
}
