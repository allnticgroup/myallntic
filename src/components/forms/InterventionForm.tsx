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
import {
  Intervention,
  InterventionType,
  InterventionStatus,
  INTERVENTION_TYPE_LABELS,
  INTERVENTION_STATUS_LABELS,
} from '@/types';

interface InterventionFormProps {
  prospectId: string;
  intervention?: Intervention;
  onSubmit: (data: Omit<Intervention, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function InterventionForm({
  prospectId,
  intervention,
  onSubmit,
  onCancel,
}: InterventionFormProps) {
  const [formData, setFormData] = useState({
    prospectId,
    type: intervention?.type || ('Installation' as InterventionType),
    datePrevue: intervention?.datePrevue || new Date().toISOString().split('T')[0],
    statut: intervention?.statut || ('a_faire' as InterventionStatus),
    notes: intervention?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Type d'intervention</Label>
        <Select
          value={formData.type}
          onValueChange={(value: InterventionType) =>
            setFormData({ ...formData, type: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(INTERVENTION_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="datePrevue">Date prévue</Label>
        <Input
          id="datePrevue"
          type="date"
          value={formData.datePrevue}
          onChange={(e) => setFormData({ ...formData, datePrevue: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Statut</Label>
        <Select
          value={formData.statut}
          onValueChange={(value: InterventionStatus) =>
            setFormData({ ...formData, statut: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(INTERVENTION_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Notes sur l'intervention..."
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" className="flex-1">
          {intervention ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}
