import { useState, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client, Vente, VenteLigne } from '@/types/erp';
import { Material } from '@/types';

interface VenteFormProps {
  vente?: Vente;
  clients: Client[];
  materials: Material[];
  onSubmit: (data: Omit<Vente, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function VenteForm({ vente, clients, materials, onSubmit, onCancel }: VenteFormProps) {
  const [clientId, setClientId] = useState(vente?.clientId || '');
  const [lignes, setLignes] = useState<VenteLigne[]>(vente?.lignes || []);
  const [remise, setRemise] = useState(vente?.remise || 0);
  const [notes, setNotes] = useState(vente?.notes || '');

  const sousTotal = useMemo(() => lignes.reduce((s, l) => s + l.total, 0), [lignes]);
  const montantRemise = useMemo(() => sousTotal * remise / 100, [sousTotal, remise]);
  const total = useMemo(() => sousTotal - montantRemise, [sousTotal, montantRemise]);

  const addLigne = () => {
    setLignes([...lignes, { materialId: '', nom: '', quantite: 1, prixUnitaire: 0, total: 0 }]);
  };

  const updateLigne = (index: number, updates: Partial<VenteLigne>) => {
    setLignes(prev => prev.map((l, i) => {
      if (i !== index) return l;
      const updated = { ...l, ...updates };
      updated.total = updated.quantite * updated.prixUnitaire;
      return updated;
    }));
  };

  const selectMaterial = (index: number, materialId: string) => {
    const mat = materials.find(m => m.id === materialId);
    if (mat) {
      updateLigne(index, { materialId, nom: mat.nom, prixUnitaire: mat.prixUnitaire });
    }
  };

  const removeLigne = (index: number) => {
    setLignes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      clientId,
      dateVente: vente?.dateVente || new Date().toISOString().split('T')[0],
      lignes,
      sousTotal,
      remise,
      montantRemise,
      total,
      statut: vente?.statut || 'brouillon',
      notes,
      stockDeduit: vente?.stockDeduit || false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Client *</Label>
        <Select value={clientId} onValueChange={setClientId}>
          <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
          <SelectContent>
            {clients.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.nom} ({c.code})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Produits</Label>
          <Button type="button" variant="outline" size="sm" onClick={addLigne}>
            <Plus className="h-4 w-4 mr-1" />Ajouter
          </Button>
        </div>
        {lignes.map((ligne, i) => (
          <div key={i} className="p-3 border rounded-lg space-y-2 bg-muted/30">
            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={ligne.materialId} onValueChange={(v) => selectMaterial(i, v)}>
                  <SelectTrigger><SelectValue placeholder="Produit" /></SelectTrigger>
                  <SelectContent>
                    {materials.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.nom} (Stock: {m.stockQuantite})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeLigne(i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Qté</Label>
                <Input type="number" min={1} value={ligne.quantite} onChange={(e) => updateLigne(i, { quantite: Number(e.target.value) })} />
              </div>
              <div>
                <Label className="text-xs">Prix unit.</Label>
                <Input type="number" min={0} value={ligne.prixUnitaire} onChange={(e) => updateLigne(i, { prixUnitaire: Number(e.target.value) })} />
              </div>
              <div>
                <Label className="text-xs">Total</Label>
                <Input value={ligne.total.toLocaleString('fr-FR')} readOnly className="bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Remise (%)</Label>
          <Input type="number" min={0} max={100} value={remise} onChange={(e) => setRemise(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label>Total</Label>
          <div className="text-xl font-bold text-primary pt-2">{total.toLocaleString('fr-FR')} F</div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" className="flex-1" disabled={!clientId || lignes.length === 0}>
          {vente ? 'Modifier' : 'Créer la vente'}
        </Button>
      </div>
    </form>
  );
}
