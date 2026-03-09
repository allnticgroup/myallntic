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
import { EmployeeDocument, EMPLOYEE_DOCUMENT_TYPE_LABELS, EmployeeDocumentType } from '@/types';

interface EmployeeDocumentFormProps {
  document?: EmployeeDocument;
  employeeId: string;
  onSubmit: (data: Omit<EmployeeDocument, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function EmployeeDocumentForm({ document, employeeId, onSubmit, onCancel }: EmployeeDocumentFormProps) {
  const [nom, setNom] = useState(document?.nom || '');
  const [type, setType] = useState<EmployeeDocumentType>(document?.type || 'contrat');
  const [dateDocument, setDateDocument] = useState(document?.dateDocument || new Date().toISOString().split('T')[0]);
  const [dateExpiration, setDateExpiration] = useState(document?.dateExpiration || '');
  const [notes, setNotes] = useState(document?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      employeeId,
      nom,
      type,
      dateDocument,
      dateExpiration: dateExpiration || undefined,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nom">Nom du document *</Label>
        <Input
          id="nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Ex: Contrat CDI, CNI..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Type de document</Label>
        <Select value={type} onValueChange={(v) => setType(v as EmployeeDocumentType)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(EMPLOYEE_DOCUMENT_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateDocument">Date du document</Label>
          <Input
            id="dateDocument"
            type="date"
            value={dateDocument}
            onChange={(e) => setDateDocument(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateExpiration">Date d'expiration</Label>
          <Input
            id="dateExpiration"
            type="date"
            value={dateExpiration}
            onChange={(e) => setDateExpiration(e.target.value)}
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
