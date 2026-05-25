import { useMemo, useState } from 'react';
import { AlertTriangle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client } from '@/types/erp';
import { useClients } from '@/hooks/useErpData';
import { useProspects } from '@/hooks/useData';

interface ClientFormProps {
  client?: Client;
  onSubmit: (data: Omit<Client, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase();

export function ClientForm({ client, onSubmit, onCancel }: ClientFormProps) {
  const { clients } = useClients();
  const { prospects } = useProspects();
  const [formData, setFormData] = useState({
    nom: client?.nom || '',
    telephone: client?.telephone || '',
    email: client?.email || '',
    adresse: client?.adresse || '',
    ville: client?.ville || '',
    notes: client?.notes || '',
    prospectId: client?.prospectId,
  });

  const handlePickProspect = (prospectId: string) => {
    const p = prospects.find((x) => x.id === prospectId);
    if (!p) return;
    setFormData((prev) => ({
      ...prev,
      nom: p.nomStructure,
      telephone: p.telephone || prev.telephone,
      notes: p.notes || prev.notes,
      prospectId: p.id,
    }));
  };


  const duplicates = useMemo(() => {
    const list: { client: Client; reason: string }[] = [];
    const phone = normalize(formData.telephone);
    const email = normalize(formData.email);
    const nom = normalize(formData.nom);
    clients.forEach(c => {
      if (client && c.id === client.id) return;
      if (phone && normalize(c.telephone) === phone) list.push({ client: c, reason: 'téléphone' });
      else if (email && normalize(c.email) === email) list.push({ client: c, reason: 'email' });
      else if (nom && normalize(c.nom) === nom) list.push({ client: c, reason: 'nom' });
    });
    return list;
  }, [clients, client, formData.telephone, formData.email, formData.nom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {duplicates.length > 0 && (
        <Alert className="bg-warning/10 border-warning/30">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm">
            Doublon potentiel ({duplicates[0].reason}) : <strong>{duplicates[0].client.nom}</strong> ({duplicates[0].client.code})
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="nom">Nom du client *</Label>
        <Input id="nom" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} placeholder="Ex: Entreprise ABC" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="telephone">Téléphone</Label>
          <Input id="telephone" type="tel" value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} placeholder="+225 07 XX XX XX" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@exemple.com" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="adresse">Adresse</Label>
          <Input id="adresse" value={formData.adresse} onChange={(e) => setFormData({ ...formData, adresse: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ville">Ville</Label>
          <Input id="ville" value={formData.ville} onChange={(e) => setFormData({ ...formData, ville: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" className="flex-1">{client ? 'Modifier' : 'Créer'}</Button>
      </div>
    </form>
  );
}
