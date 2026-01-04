import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Purchase, PURCHASE_STATUS_LABELS } from '@/types';

interface PurchaseFormProps {
  supplierId: string;
  initialData?: Purchase;
  onSubmit: (data: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function PurchaseForm({ supplierId, initialData, onSubmit, onCancel }: PurchaseFormProps) {
  const [formData, setFormData] = useState({
    reference: initialData?.reference || '',
    description: initialData?.description || '',
    montant: initialData?.montant || 0,
    datePurchase: initialData?.datePurchase || new Date().toISOString().split('T')[0],
    dateReception: initialData?.dateReception || null,
    statut: initialData?.statut || ('commande' as Purchase['statut']),
    notes: initialData?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      supplierId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reference">Référence commande *</Label>
        <Input
          id="reference"
          value={formData.reference}
          onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
          placeholder="Ex: CMD-2024-001"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Détail de la commande..."
          rows={2}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="montant">Montant (FCFA) *</Label>
          <Input
            id="montant"
            type="number"
            min="0"
            value={formData.montant}
            onChange={(e) => setFormData({ ...formData, montant: Number(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="statut">Statut *</Label>
          <Select
            value={formData.statut}
            onValueChange={(value: Purchase['statut']) =>
              setFormData({ ...formData, statut: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PURCHASE_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="datePurchase">Date de commande *</Label>
          <Input
            id="datePurchase"
            type="date"
            value={formData.datePurchase}
            onChange={(e) => setFormData({ ...formData, datePurchase: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateReception">Date de réception</Label>
          <Input
            id="dateReception"
            type="date"
            value={formData.dateReception || ''}
            onChange={(e) => setFormData({ ...formData, dateReception: e.target.value || null })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Notes supplémentaires..."
          rows={2}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" className="flex-1">
          {initialData ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
}
