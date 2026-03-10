import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client, Project, ProjectStatus, PROJECT_STATUS_LABELS } from '@/types/erp';

interface ProjectFormProps {
  project?: Project;
  clients: Client[];
  onSubmit: (data: Omit<Project, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function ProjectForm({ project, clients, onSubmit, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    nom: project?.nom || '',
    clientId: project?.clientId || '',
    description: project?.description || '',
    statut: project?.statut || ('en_cours' as ProjectStatus),
    dateDebut: project?.dateDebut || new Date().toISOString().split('T')[0],
    dateFin: project?.dateFin || '',
    budget: project?.budget || 0,
    depenses: project?.depenses || 0,
    notes: project?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      clientId: formData.clientId || undefined,
      dateFin: formData.dateFin || undefined,
      taches: project?.taches || [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Nom du projet *</Label>
        <Input value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label>Client (optionnel)</Label>
        <Select value={formData.clientId} onValueChange={(v) => setFormData({ ...formData, clientId: v })}>
          <SelectTrigger><SelectValue placeholder="Aucun client" /></SelectTrigger>
          <SelectContent>
            {clients.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={formData.statut} onValueChange={(v: ProjectStatus) => setFormData({ ...formData, statut: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(PROJECT_STATUS_LABELS).map(([k, l]) => (
                <SelectItem key={k} value={k}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Budget (FCFA)</Label>
          <Input type="number" min={0} value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date début</Label>
          <Input type="date" value={formData.dateDebut} onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Date fin</Label>
          <Input type="date" value={formData.dateFin} onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
        <Button type="submit" className="flex-1">{project ? 'Modifier' : 'Créer'}</Button>
      </div>
    </form>
  );
}
