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
import { Employee, EMPLOYEE_ROLE_LABELS, EmployeeRole, EmployeeStatus } from '@/types';

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const [nom, setNom] = useState(employee?.nom || '');
  const [prenom, setPrenom] = useState(employee?.prenom || '');
  const [telephone, setTelephone] = useState(employee?.telephone || '');
  const [email, setEmail] = useState(employee?.email || '');
  const [poste, setPoste] = useState(employee?.poste || '');
  const [role, setRole] = useState<EmployeeRole>(employee?.role || 'technicien');
  const [statut, setStatut] = useState<EmployeeStatus>(employee?.statut || 'actif');
  const [dateEmbauche, setDateEmbauche] = useState(employee?.dateEmbauche || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(employee?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nom, prenom, telephone, email, poste, role, statut, dateEmbauche, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nom">Nom *</Label>
          <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prenom">Prénom *</Label>
          <Input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="telephone">Téléphone</Label>
        <Input id="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="poste">Poste</Label>
        <Input id="poste" value={poste} onChange={(e) => setPoste(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Rôle</Label>
          <Select value={role} onValueChange={(v) => setRole(v as EmployeeRole)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(EMPLOYEE_ROLE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={statut} onValueChange={(v) => setStatut(v as EmployeeStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateEmbauche">Date d'embauche</Label>
        <Input id="dateEmbauche" type="date" value={dateEmbauche} onChange={(e) => setDateEmbauche(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" className="flex-1">Enregistrer</Button>
      </div>
    </form>
  );
}
