import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Devis,
  DevisOption,
  DevisStatus,
  DEVIS_OPTION_LABELS,
  DEVIS_STATUS_LABELS,
} from '@/types';

interface DevisFormProps {
  prospectId: string;
  devis?: Devis;
  onSubmit: (data: Omit<Devis, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function DevisForm({ prospectId, devis, onSubmit, onCancel }: DevisFormProps) {
  const [formData, setFormData] = useState({
    prospectId,
    dateDevis: devis?.dateDevis || new Date().toISOString().split('T')[0],
    option: devis?.option || ('Essentiel' as DevisOption),
    montant: devis?.montant || 0,
    statut: devis?.statut || ('envoye' as DevisStatus),
    acompteRecu: devis?.acompteRecu || false,
    montantAcompte: devis?.montantAcompte || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dateDevis">Date du devis</Label>
        <Input
          id="dateDevis"
          type="date"
          value={formData.dateDevis}
          onChange={(e) => setFormData({ ...formData, dateDevis: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Option</Label>
        <Select
          value={formData.option}
          onValueChange={(value: DevisOption) =>
            setFormData({ ...formData, option: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DEVIS_OPTION_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="montant">Montant (FCFA)</Label>
        <Input
          id="montant"
          type="number"
          value={formData.montant || ''}
          onChange={(e) =>
            setFormData({ ...formData, montant: parseInt(e.target.value) || 0 })
          }
          placeholder="Ex: 500000"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Statut</Label>
        <Select
          value={formData.statut}
          onValueChange={(value: DevisStatus) =>
            setFormData({ ...formData, statut: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DEVIS_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between py-2">
        <Label htmlFor="acompteRecu" className="cursor-pointer">
          Acompte reçu
        </Label>
        <Switch
          id="acompteRecu"
          checked={formData.acompteRecu}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, acompteRecu: checked })
          }
        />
      </div>

      {formData.acompteRecu && (
        <div className="space-y-2 animate-slide-up">
          <Label htmlFor="montantAcompte">Montant de l'acompte (FCFA)</Label>
          <Input
            id="montantAcompte"
            type="number"
            value={formData.montantAcompte || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                montantAcompte: parseInt(e.target.value) || 0,
              })
            }
            placeholder="Ex: 100000"
          />
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" className="flex-1">
          {devis ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}
