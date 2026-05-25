import { useMemo, useState } from 'react';
import { AlertTriangle, Target, Smartphone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
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
    nomDecideur: client?.nomDecideur || '',
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
      nomDecideur: p.nomDecideur || prev.nomDecideur,
      telephone: p.telephone || prev.telephone,
      notes: p.notes || prev.notes,
      prospectId: p.id,
    }));
  };

  const contactsSupported = typeof navigator !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window;

  const handlePickContact = async () => {
    try {
      const nav = navigator as any;
      if (!nav.contacts?.select) {
        toast({ title: 'Non supporté', description: "Votre appareil ou navigateur ne permet pas l'accès aux contacts. Utilisez Chrome sur Android.", variant: 'destructive' });
        return;
      }
      const props = ['name', 'tel', 'email', 'address'];
      const supported: string[] = await nav.contacts.getProperties?.() || props;
      const wanted = props.filter((p) => supported.includes(p));
      const contacts = await nav.contacts.select(wanted, { multiple: false });
      if (!contacts || contacts.length === 0) return;
      const c = contacts[0];
      const name = Array.isArray(c.name) ? c.name[0] : c.name;
      const tel = Array.isArray(c.tel) ? c.tel[0] : c.tel;
      const email = Array.isArray(c.email) ? c.email[0] : c.email;
      const addr = Array.isArray(c.address) ? c.address[0] : c.address;
      const addrStr = addr ? [addr.addressLine?.join(' '), addr.city, addr.country].filter(Boolean).join(', ') : '';
      setFormData((prev) => ({
        ...prev,
        nomDecideur: name || prev.nomDecideur,
        nom: prev.nom || name || '',
        telephone: tel || prev.telephone,
        email: email || prev.email,
        adresse: addrStr || prev.adresse,
        ville: addr?.city || prev.ville,
      }));
      toast({ title: 'Contact importé', description: name || 'Informations récupérées.' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err?.message || "Impossible d'accéder aux contacts.", variant: 'destructive' });
    }
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

  // Prospects non encore liés à un client
  const availableProspects = prospects.filter(
    (p) => !p.clientId || (client && p.clientId === client.id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!client && contactsSupported && (
        <Button type="button" variant="outline" onClick={handlePickContact} className="w-full gap-2">
          <Smartphone className="h-4 w-4" />
          Importer depuis mes contacts
        </Button>
      )}

      {!client && availableProspects.length > 0 && (
        <div className="space-y-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <Label className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-primary" />
            Pré-remplir depuis un prospect existant
          </Label>
          <Select value={formData.prospectId || ''} onValueChange={handlePickProspect}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un prospect..." />
            </SelectTrigger>
            <SelectContent>
              {availableProspects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nomStructure}{p.nomDecideur ? ` — ${p.nomDecideur}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {duplicates.length > 0 && (
        <Alert className="bg-warning/10 border-warning/30">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-sm">
            Doublon potentiel ({duplicates[0].reason}) : <strong>{duplicates[0].client.nom}</strong> ({duplicates[0].client.code})
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="nom">Nom de la structure *</Label>
        <Input id="nom" value={formData.nom} maxLength={120} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} placeholder="Ex: Société ABC" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nomDecideur">Nom du décideur *</Label>
        <Input id="nomDecideur" value={formData.nomDecideur} maxLength={120} onChange={(e) => setFormData({ ...formData, nomDecideur: e.target.value })} placeholder="Ex: M. Kouassi" required />
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
