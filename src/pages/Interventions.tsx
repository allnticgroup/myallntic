import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, CheckCircle2, Clock, Calendar, User } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useInterventions, useProspects, useEmployees } from '@/hooks/useData';
import { INTERVENTION_TYPE_LABELS, InterventionStatus } from '@/types';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'a_faire' | 'fait';

export default function Interventions() {
  const { interventions, updateIntervention } = useInterventions();
  const { getProspect } = useProspects();
  const [filter, setFilter] = useState<FilterType>('a_faire');

  const filteredInterventions = interventions
    .filter((i) => filter === 'all' || i.statut === filter)
    .sort((a, b) => new Date(a.datePrevue).getTime() - new Date(b.datePrevue).getTime());

  const todoCount = interventions.filter((i) => i.statut === 'a_faire').length;
  const doneCount = interventions.filter((i) => i.statut === 'fait').length;

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

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title="Interventions"
        subtitle={`${todoCount} à faire • ${doneCount} terminées`}
      />

      <main className="p-4 space-y-4 max-w-lg mx-auto">
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

                        {intervention.notes && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {intervention.notes}
                          </p>
                        )}
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
