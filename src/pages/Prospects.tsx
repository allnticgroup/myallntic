import { useState } from 'react';
import { Plus, Users, Pencil, Trash2, Search } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { ProspectCard } from '@/components/ProspectCard';
import { StatusFilter } from '@/components/StatusFilter';
import { EmptyState } from '@/components/EmptyState';
import { ProspectForm } from '@/components/forms/ProspectForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useProspects, useDevis } from '@/hooks/useData';
import { Prospect, ProspectStatus } from '@/types';
import { toast } from 'sonner';

export default function Prospects() {
  const { prospects, addProspect, updateProspect, deleteProspect } = useProspects();
  const { devisList, deleteDevis } = useDevis();
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [deletingProspect, setDeletingProspect] = useState<Prospect | null>(null);

  const filteredProspects = prospects.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.statut === statusFilter;
    const matchesSearch = p.nomStructure.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nomDecideur.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAddProspect = (data: Parameters<typeof addProspect>[0]) => {
    addProspect(data);
    setShowForm(false);
    toast.success('Prospect créé avec succès');
  };

  const handleUpdateProspect = (data: Parameters<typeof addProspect>[0]) => {
    if (editingProspect) {
      updateProspect(editingProspect.id, data);
      setEditingProspect(null);
      toast.success('Prospect modifié avec succès');
    }
  };

  const handleDeleteProspect = () => {
    if (deletingProspect) {
      // Supprimer aussi les devis associés
      const relatedDevis = devisList.filter(d => d.prospectId === deletingProspect.id);
      relatedDevis.forEach(d => deleteDevis(d.id));
      
      deleteProspect(deletingProspect.id);
      setDeletingProspect(null);
      toast.success('Prospect supprimé avec succès');
    }
  };

  const handleEditClick = (prospect: Prospect, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProspect(prospect);
  };

  const handleDeleteClick = (prospect: Prospect, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingProspect(prospect);
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title="Prospects"
        subtitle={`${prospects.length} contact${prospects.length > 1 ? 's' : ''}`}
        action={
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nouveau
          </Button>
        }
      />

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un prospect..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <StatusFilter selected={statusFilter} onChange={setStatusFilter} />

        {filteredProspects.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aucun prospect"
            description={
              statusFilter === 'all'
                ? 'Créez votre premier prospect pour commencer'
                : 'Aucun prospect avec ce statut'
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredProspects.map((prospect) => (
              <div key={prospect.id} className="relative group">
                <ProspectCard prospect={prospect} />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => handleEditClick(prospect, e)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => handleDeleteClick(prospect, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Formulaire nouveau prospect */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
          <SheetHeader className="mb-4">
            <SheetTitle>Nouveau prospect</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            <ProspectForm
              onSubmit={handleAddProspect}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Formulaire modification prospect */}
      <Sheet open={!!editingProspect} onOpenChange={() => setEditingProspect(null)}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
          <SheetHeader className="mb-4">
            <SheetTitle>Modifier le prospect</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            {editingProspect && (
              <ProspectForm
                prospect={editingProspect}
                onSubmit={handleUpdateProspect}
                onCancel={() => setEditingProspect(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmation suppression */}
      <AlertDialog open={!!deletingProspect} onOpenChange={() => setDeletingProspect(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le prospect ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les devis associés à "{deletingProspect?.nomStructure}" seront également supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProspect} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
