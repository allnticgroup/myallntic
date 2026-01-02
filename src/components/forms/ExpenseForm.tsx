import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Expense, ExpenseCategory, EXPENSE_CATEGORY_LABELS } from '@/types';

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function ExpenseForm({ expense, onSubmit, onCancel }: ExpenseFormProps) {
  const [libelle, setLibelle] = useState(expense?.libelle || '');
  const [montant, setMontant] = useState(expense?.montant?.toString() || '');
  const [categorie, setCategorie] = useState<ExpenseCategory>(expense?.categorie || 'materiel');
  const [dateDepense, setDateDepense] = useState(expense?.dateDepense || new Date().toISOString().split('T')[0]);
  const [fournisseur, setFournisseur] = useState(expense?.fournisseur || '');
  const [notes, setNotes] = useState(expense?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      libelle: libelle.trim(),
      montant: parseFloat(montant) || 0,
      categorie,
      dateDepense,
      fournisseur: fournisseur.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Libellé *</Label>
        <Input
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
          placeholder="Description de la dépense..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Montant (FCFA) *</Label>
          <Input
            type="number"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            placeholder="0"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Date *</Label>
          <Input
            type="date"
            value={dateDepense}
            onChange={(e) => setDateDepense(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Catégorie</Label>
        <Select value={categorie} onValueChange={(v) => setCategorie(v as ExpenseCategory)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Fournisseur</Label>
        <Input
          value={fournisseur}
          onChange={(e) => setFournisseur(e.target.value)}
          placeholder="Nom du fournisseur..."
        />
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes additionnelles..."
          rows={2}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" className="flex-1">
          {expense ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
}
