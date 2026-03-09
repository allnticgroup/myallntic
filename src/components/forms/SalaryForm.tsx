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
import { Salary, SALARY_TYPE_LABELS, SalaryType, PAYMENT_MODE_LABELS } from '@/types';

interface SalaryFormProps {
  salary?: Salary;
  employeeId: string;
  onSubmit: (data: Omit<Salary, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function SalaryForm({ salary, employeeId, onSubmit, onCancel }: SalaryFormProps) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const [montant, setMontant] = useState(salary?.montant?.toString() || '');
  const [type, setType] = useState<SalaryType>(salary?.type || 'salaire');
  const [periode, setPeriode] = useState(salary?.periode || currentMonth);
  const [datePaiement, setDatePaiement] = useState(salary?.datePaiement || new Date().toISOString().split('T')[0]);
  const [modePaiement, setModePaiement] = useState<Salary['modePaiement']>(salary?.modePaiement || 'especes');
  const [notes, setNotes] = useState(salary?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      employeeId,
      montant: parseFloat(montant) || 0,
      type,
      periode,
      datePaiement,
      modePaiement,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="montant">Montant (FCFA) *</Label>
        <Input
          id="montant"
          type="number"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          placeholder="150000"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as SalaryType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(SALARY_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Mode de paiement</Label>
          <Select value={modePaiement} onValueChange={(v) => setModePaiement(v as Salary['modePaiement'])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="periode">Période</Label>
          <Input
            id="periode"
            type="month"
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="datePaiement">Date de paiement</Label>
          <Input
            id="datePaiement"
            type="date"
            value={datePaiement}
            onChange={(e) => setDatePaiement(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Notes optionnelles..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" className="flex-1">
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
