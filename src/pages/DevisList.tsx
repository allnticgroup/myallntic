import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, Clock, XCircle, Download, Pencil, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useDevis, useProspects } from '@/hooks/useData';
import { Devis, DEVIS_OPTION_LABELS, DEVIS_STATUS_LABELS } from '@/types';
import { generateDevisPdf } from '@/lib/generateDevisPdf';
import { DevisForm } from '@/components/forms/DevisForm';
import { DevisPreview } from '@/components/DevisPreview';
import { toast } from 'sonner';

export default function DevisList() {
  const { devisList, updateDevis, deleteDevis } = useDevis();
  const { getProspect } = useProspects();
  const [editingDevis, setEditingDevis] = useState<Devis | null>(null);
  const [deletingDevis, setDeletingDevis] = useState<Devis | null>(null);
  const [previewingDevis, setPreviewingDevis] = useState<Devis | null>(null);

  const sortedDevis = [...devisList].sort(
    (a, b) => new Date(b.dateDevis).getTime() - new Date(a.dateDevis).getTime()
  );

  const totalPending = devisList
    .filter((d) => d.statut === 'envoye')
    .reduce((sum, d) => sum + d.montant, 0);

  const totalAccepted = devisList
    .filter((d) => d.statut === 'accepte')
    .reduce((sum, d) => sum + d.montant, 0);

  const handleUpdateDevis = (data: Omit<Devis, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingDevis) {
      updateDevis(editingDevis.id, data);
      setEditingDevis(null);
      toast.success('Devis modifié avec succès');
    }
  };

  const handleDeleteDevis = () => {
    if (deletingDevis) {
      deleteDevis(deletingDevis.id);
      setDeletingDevis(null);
      toast.success('Devis supprimé avec succès');
    }
  };

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
                    <div className="flex gap-2 mt-3">
                      {prospect && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.preventDefault();
                            setPreviewingDevis(devis);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Aperçu
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setEditingDevis(devis);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setDeletingDevis(devis);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Formulaire modification devis */}
      <Sheet open={!!editingDevis} onOpenChange={() => setEditingDevis(null)}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
          <SheetHeader className="mb-4">
            <SheetTitle>Modifier le devis</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            {editingDevis && (
              <DevisForm
                prospectId={editingDevis.prospectId}
                devis={editingDevis}
                onSubmit={handleUpdateDevis}
                onCancel={() => setEditingDevis(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmation suppression */}
      <AlertDialog open={!!deletingDevis} onOpenChange={() => setDeletingDevis(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le devis ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le devis de {deletingDevis?.montant.toLocaleString('fr-FR')} F sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDevis} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Aperçu du devis */}
      <Dialog open={!!previewingDevis} onOpenChange={() => setPreviewingDevis(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Aperçu du devis</DialogTitle>
          </DialogHeader>
          {previewingDevis && getProspect(previewingDevis.prospectId) && (
            <DevisPreview 
              devis={previewingDevis} 
              prospect={getProspect(previewingDevis.prospectId)!} 
            />
          )}
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPreviewingDevis(null);
                setEditingDevis(previewingDevis);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button
              onClick={async () => {
                if (previewingDevis) {
                  const prospect = getProspect(previewingDevis.prospectId);
                  if (prospect) {
                    await generateDevisPdf(previewingDevis, prospect);
                    setPreviewingDevis(null);
                  }
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
