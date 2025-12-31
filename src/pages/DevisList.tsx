import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, Clock, XCircle, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDevis, useProspects } from '@/hooks/useData';
import { DEVIS_OPTION_LABELS, DEVIS_STATUS_LABELS } from '@/types';
import { generateDevisPdf } from '@/lib/generateDevisPdf';

export default function DevisList() {
  const { devisList } = useDevis();
  const { getProspect } = useProspects();

  const sortedDevis = [...devisList].sort(
    (a, b) => new Date(b.dateDevis).getTime() - new Date(a.dateDevis).getTime()
  );

  const totalPending = devisList
    .filter((d) => d.statut === 'envoye')
    .reduce((sum, d) => sum + d.montant, 0);

  const totalAccepted = devisList
    .filter((d) => d.statut === 'accepte')
    .reduce((sum, d) => sum + d.montant, 0);

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title="Devis" subtitle={`${devisList.length} devis`} />

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Summary */}
        {devisList.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Card className="animate-slide-up">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-xs text-muted-foreground">En attente</span>
                </div>
                <p className="font-bold text-lg">
                  {totalPending.toLocaleString('fr-FR')} F
                </p>
              </CardContent>
            </Card>
            <Card className="animate-slide-up">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-xs text-muted-foreground">Acceptés</span>
                </div>
                <p className="font-bold text-lg">
                  {totalAccepted.toLocaleString('fr-FR')} F
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {sortedDevis.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Aucun devis"
            description="Créez un devis depuis la fiche d'un prospect"
          />
        ) : (
          <div className="space-y-3">
            {sortedDevis.map((devis) => {
              const prospect = getProspect(devis.prospectId);
              const StatusIcon =
                devis.statut === 'accepte'
                  ? CheckCircle2
                  : devis.statut === 'refuse'
                  ? XCircle
                  : Clock;
              const statusColor =
                devis.statut === 'accepte'
                  ? 'text-success'
                  : devis.statut === 'refuse'
                  ? 'text-destructive'
                  : 'text-warning';

              return (
                <Card key={devis.id} className="transition-smooth hover:shadow-md hover:border-primary/30 animate-fade-in">
                  <CardContent className="p-4">
                    <Link to={`/prospects/${devis.prospectId}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {prospect?.nomStructure || 'Prospect inconnu'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {DEVIS_OPTION_LABELS[devis.option]}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(devis.dateDevis), 'dd MMMM yyyy', {
                              locale: fr,
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {devis.montant.toLocaleString('fr-FR')} F
                          </p>
                          <div
                            className={`flex items-center gap-1 text-xs mt-1 ${statusColor}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {DEVIS_STATUS_LABELS[devis.statut]}
                          </div>
                          {devis.acompteRecu && (
                            <p className="text-xs text-success mt-1">
                              Acompte: {devis.montantAcompte.toLocaleString('fr-FR')} F
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                    {prospect && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={(e) => {
                          e.preventDefault();
                          generateDevisPdf(devis, prospect);
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger PDF
                      </Button>
                    )}
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
