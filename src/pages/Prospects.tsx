import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { ProspectCard } from '@/components/ProspectCard';
import { StatusFilter } from '@/components/StatusFilter';
import { EmptyState } from '@/components/EmptyState';
import { ProspectForm } from '@/components/forms/ProspectForm';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useProspects } from '@/hooks/useData';
import { ProspectStatus } from '@/types';
import { toast } from 'sonner';

export default function Prospects() {
  const { prospects, addProspect } = useProspects();
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);

  const filteredProspects = prospects.filter(
    (p) => statusFilter === 'all' || p.statut === statusFilter
  );

  const handleAddProspect = (data: Parameters<typeof addProspect>[0]) => {
    addProspect(data);
    setShowForm(false);
    toast.success('Prospect créé avec succès');
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
              <ProspectCard key={prospect.id} prospect={prospect} />
            ))}
          </div>
        )}
      </main>

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
    </div>
  );
}
