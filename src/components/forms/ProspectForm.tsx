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
  Prospect,
  ProspectStatus,
  StructureType,
  BesoinType,
  STATUS_LABELS,
  STRUCTURE_LABELS,
  BESOIN_LABELS,
} from '@/types';

interface ProspectFormProps {
  prospect?: Prospect;
  onSubmit: (data: Omit<Prospect, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function ProspectForm({ prospect, onSubmit, onCancel }: ProspectFormProps) {
  const [formData, setFormData] = useState({
    nomStructure: prospect?.nomStructure || '',
    nomDecideur: prospect?.nomDecideur || '',
    telephone: prospect?.telephone || '',
    typeStructure: prospect?.typeStructure || ('PME' as StructureType),
    besoinPrincipal: prospect?.besoinPrincipal || ('Reseau' as BesoinType),
    statut: prospect?.statut || ('prospect' as ProspectStatus),
    notes: prospect?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nomStructure">Nom de la structure *</Label>
        <Input
          id="nomStructure"
          value={formData.nomStructure}
          onChange={(e) => setFormData({ ...formData, nomStructure: e.target.value })}
          placeholder="Ex: Société ABC"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nomDecideur">Nom du décideur *</Label>
        <Input
          id="nomDecideur"
          value={formData.nomDecideur}
          onChange={(e) => setFormData({ ...formData, nomDecideur: e.target.value })}
          placeholder="Ex: M. Kouassi"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telephone">Téléphone / WhatsApp</Label>
        <Input
          id="telephone"
          type="tel"
          value={formData.telephone}
          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          placeholder="Ex: +225 07 XX XX XX"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type de structure</Label>
          <Select
            value={formData.typeStructure}
            onValueChange={(value: StructureType) =>
              setFormData({ ...formData, typeStructure: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STRUCTURE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Besoin principal</Label>
          <Select
            value={formData.besoinPrincipal}
            onValueChange={(value: BesoinType) =>
              setFormData({ ...formData, besoinPrincipal: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BESOIN_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Statut</Label>
        <Select
          value={formData.statut}
          onValueChange={(value: ProspectStatus) =>
            setFormData({ ...formData, statut: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
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
          placeholder="Notes libres..."
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" className="flex-1">
          {prospect ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}
