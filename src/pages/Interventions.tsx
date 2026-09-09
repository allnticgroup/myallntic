import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, CheckCircle2, Calendar, User, Pencil, Trash2, Bell, BellRing, AlertTriangle } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
import { InterventionForm } from '@/components/forms/InterventionForm';
import { useInterventions, useProspects, useEmployees } from '@/hooks/useData';
import { useAuditLog } from '@/hooks/useAuditLog';
import { INTERVENTION_TYPE_LABELS, Intervention, InterventionStatus } from '@/types';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'a_faire' | 'fait';

export default function Interventions() {
  const { interventions, updateIntervention, deleteIntervention } = useInterventions();
  const { getProspect } = useProspects();
  const { getEmployee } = useEmployees();
  const { addEntry } = useAuditLog();
  const [filter, setFilter] = useState<FilterType>('a_faire');
  const [editing, setEditing] = useState<Intervention | null>(null);
  const [toDelete, setToDelete] = useState<Intervention | null>(null);
  const [notifPermission, setNotifPermission] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const filteredInterventions = interventions
    .filter((i) => filter === 'all' || i.statut === filter)
    .sort((a, b) => new Date(a.datePrevue).getTime() - new Date(b.datePrevue).getTime());

  const todoCount = interventions.filter((i) => i.statut === 'a_faire').length;
  const doneCount = interventions.filter((i) => i.statut === 'fait').length;

  const rappels = interventions.filter((i) => {
    if (i.statut !== 'a_faire') return false;
    const d = new Date(i.datePrevue);
    return isToday(d) || isTomorrow(d) || isPast(d);
  });
  const enRetard = rappels.filter((i) => isPast(new Date(i.datePrevue)) && !isToday(new Date(i.datePrevue)));

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return 'Demain';
    return format(date, 'EEEE dd MMMM', { locale: fr });
  };

  const toggleStatus = (id: string, currentStatus: InterventionStatus) => {
    updateIntervention(id, {
      statut: currentStatus === 'fait' ? 'a_faire' : 'fait',
    });
  };

  const handleEdit = (data: Omit<Intervention, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editing) return;
    updateIntervention(editing.id, data);
    addEntry('update', 'intervention', editing.id, INTERVENTION_TYPE_LABELS[data.type]);
    setEditing(null);
    toast.success('Intervention modifiée');
  };

  const handleDelete = () => {
    if (!toDelete) return;
    deleteIntervention(toDelete.id);
    addEntry('delete', 'intervention', toDelete.id, INTERVENTION_TYPE_LABELS[toDelete.type]);
    setToDelete(null);
    toast.success('Intervention supprimée');
  };

  const enableNotifications = async () => {
    if (typeof Notification === 'undefined') {
      toast.error("Les notifications ne sont pas disponibles sur cet appareil");
      return;
    }
    if (window.top !== window.self) {
      toast.info("Ouvrez l'application dans un onglet à part pour activer les rappels");
      return;
    }
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      toast.success('Rappels activés');
      new Notification('ALLNTIC', { body: 'Les rappels d\u2019interventions sont activés.' });
    } else {
      toast.error('Rappels refusés');
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title="Interventions"
        subtitle={`${todoCount} à faire • ${doneCount} terminées`}
        action={
          <Button variant="ghost" size="icon" onClick={enableNotifications} title="Activer les rappels">
            {notifPermission === 'granted' ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          </Button>
        }
      />

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        {rappels.length > 0 && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-foreground">
                  {rappels.length} intervention{rappels.length > 1 ? 's' : ''} à réaliser
                </p>
                <p className="text-muted-foreground">
                  {enRetard.length > 0 ? `${enRetard.length} en retard • ` : ''}
                  échéances d'aujourd'hui et de demain incluses
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'a_faire' as FilterType, label: 'À faire', count: todoCount },
            { key: 'fait' as FilterType, label: 'Terminées', count: doneCount },
            { key: 'all' as FilterType, label: 'Toutes', count: interventions.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-smooth',
                filter === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {filteredInterventions.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title={filter === 'a_faire' ? 'Rien à faire' : 'Aucune intervention'}
            description={
              filter === 'a_faire'
                ? 'Toutes les interventions sont terminées'
                : 'Planifiez une intervention depuis la fiche d\'un prospect'
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredInterventions.map((intervention) => {
              const prospect = getProspect(intervention.prospectId);
              const employee = intervention.employeeId ? getEmployee(intervention.employeeId) : null;
              const date = new Date(intervention.datePrevue);
              const isOverdue = isPast(date) && intervention.statut === 'a_faire';

              return (
                <Card
                  key={intervention.id}
                  className={cn(
                    'transition-smooth animate-fade-in',
                    intervention.statut === 'fait' && 'opacity-60'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleStatus(intervention.id, intervention.statut)}
                        className={cn(
                          'mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-smooth',
                          intervention.statut === 'fait'
                            ? 'bg-success border-success text-success-foreground'
                            : 'border-muted-foreground hover:border-primary'
                        )}
                      >
                        {intervention.statut === 'fait' && (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </button>

                      <Link
                        to={`/prospects/${intervention.prospectId}`}
                        className="flex-1 min-w-0"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3
                              className={cn(
                                'font-semibold text-foreground',
                                intervention.statut === 'fait' && 'line-through'
                              )}
                            >
                              {prospect?.nomStructure || 'Prospect inconnu'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {INTERVENTION_TYPE_LABELS[intervention.type]}
                            </p>
                          </div>
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full shrink-0',
                              intervention.type === 'Installation'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-accent/10 text-accent'
                            )}
                          >
                            {intervention.type}
                          </span>
                        </div>

                        <div
                          className={cn(
                            'flex items-center gap-1.5 mt-2 text-xs',
                            isOverdue ? 'text-destructive' : 'text-muted-foreground'
                          )}
                        >
                          <Calendar className="h-3 w-3" />
                          {getDateLabel(intervention.datePrevue)}
                          {isOverdue && ' (en retard)'}
                        </div>

                        {employee && (
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {employee.prenom} {employee.nom}
                          </div>
                        )}

                        {intervention.notes && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {intervention.notes}
                          </p>
                        )}
                      </Link>

                      <div className="flex flex-col gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(intervention)} title="Modifier">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setToDelete(intervention)} title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
          <SheetHeader className="mb-4">
            <SheetTitle>Modifier l'intervention</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            {editing && (
              <InterventionForm
                prospectId={editing.prospectId}
                intervention={editing}
                onSubmit={handleEdit}
                onCancel={() => setEditing(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette intervention ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est définitive.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
