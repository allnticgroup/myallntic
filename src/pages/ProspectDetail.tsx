import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Phone,
  MessageCircle,
  Building2,
  Target,
  Edit,
  Trash2,
  Plus,
  FileText,
  Wrench,
  CheckCircle2,
  Clock,
  UserCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { ProspectForm } from '@/components/forms/ProspectForm';
import { DevisForm } from '@/components/forms/DevisForm';
import { InterventionForm } from '@/components/forms/InterventionForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProspects, useDevis, useInterventions, useMaterials } from '@/hooks/useData';
import { useClients } from '@/hooks/useErpData';
import { useProspectClientSync } from '@/hooks/useProspectClientSync';
import {
  ProspectStatus,
  DevisStatus,
  STATUS_LABELS,
  STRUCTURE_LABELS,
  BESOIN_LABELS,
  DEVIS_OPTION_LABELS,
  DEVIS_STATUS_LABELS,
  INTERVENTION_TYPE_LABELS,
  INTERVENTION_STATUS_LABELS,
} from '@/types';
import { toast } from 'sonner';

type FormType = 'prospect' | 'devis' | 'intervention' | null;

export default function ProspectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProspect, updateProspect, deleteProspect } = useProspects();
  const { getDevisForProspect, addDevis, updateDevis, deleteDevis, devisList: allDevis } = useDevis();
  const {
    getInterventionsForProspect,
    addIntervention,
    updateIntervention,
    deleteIntervention,
  } = useInterventions();
  const { deductStockForDevis, restoreStockForDevis } = useMaterials();
  const { clients } = useClients();
  const {
    convertProspectToClient,
    syncedUpdateProspect,
    unlinkClientFromProspect,
  } = useProspectClientSync();

  const [showForm, setShowForm] = useState<FormType>(null);
  const [showConvert, setShowConvert] = useState(false);

  const prospect = id ? getProspect(id) : undefined;
  const devisList = id ? getDevisForProspect(id) : [];
  const interventions = id ? getInterventionsForProspect(id) : [];

  const existingClient = prospect
    ? clients.find(c => c.id === prospect.clientId) ||
      clients.find(c => c.nom.trim().toLowerCase() === prospect.nomStructure.trim().toLowerCase())
    : undefined;

  if (!prospect) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Prospect non trouvé</p>
      </div>
    );
  }

  const handleStatusChange = (newStatus: ProspectStatus) => {
    updateProspect(prospect.id, { statut: newStatus });
    toast.success('Statut mis à jour');
  };

  const handleDelete = () => {
    deleteProspect(prospect.id);
    devisList.forEach((d) => deleteDevis(d.id));
    interventions.forEach((i) => deleteIntervention(i.id));
    toast.success('Prospect supprimé');
    navigate('/prospects');
  };

  const handleEditProspect = (data: Parameters<typeof updateProspect>[1]) => {
    updateProspect(prospect.id, data);
    setShowForm(null);
    toast.success('Prospect modifié');
  };

  const handleAddDevis = (data: Parameters<typeof addDevis>[0]) => {
    addDevis(data);
    setShowForm(null);
    toast.success('Devis créé');
  };

  const handleAddIntervention = (data: Parameters<typeof addIntervention>[0]) => {
    addIntervention(data);
    setShowForm(null);
    toast.success('Intervention créée');
  };

  const handleConvertToClient = () => {
    const newClient = addClient({
      nom: prospect.nomStructure,
      telephone: prospect.telephone,
      email: '',
      adresse: '',
      ville: '',
      notes: `Converti depuis le prospect (${prospect.nomDecideur || 'N/A'})\n${prospect.notes || ''}`.trim(),
    });
    setShowConvert(false);
    toast.success(`Client ${newClient.code} créé`);
    navigate(`/clients/${newClient.id}`);
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title={prospect.nomStructure}
        subtitle={prospect.nomDecideur}
        showBack
        action={
          <div className="flex gap-2">
            {existingClient ? (
              <Button variant="ghost" size="icon" onClick={() => navigate(`/clients/${existingClient.id}`)} title="Voir le client lié">
                <UserCheck className="h-4 w-4 text-success" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setShowConvert(true)} title="Convertir en client">
                <UserCheck className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowForm('prospect')}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer ce prospect ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action supprimera également tous les devis et interventions
                    associés.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Status Card */}
        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Statut</span>
              <Select value={prospect.statut} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-auto">
                  <StatusBadge status={prospect.statut} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contact Actions */}
        {prospect.telephone && (
          <div className="flex gap-3 animate-slide-up">
            <a href={`tel:${prospect.telephone}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Appeler
              </Button>
            </a>
            <a
              href={`https://wa.me/${prospect.telephone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </a>
          </div>
        )}

        {/* Info Card */}
        <Card className="animate-slide-up">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">
                {STRUCTURE_LABELS[prospect.typeStructure]}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Besoin:</span>
              <span className="font-medium">
                {BESOIN_LABELS[prospect.besoinPrincipal]}
              </span>
            </div>
            {prospect.notes && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">{prospect.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Devis Section */}
        <Card className="animate-slide-up">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Devis ({devisList.length})
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setShowForm('devis')}>
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {devisList.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Aucun devis</p>
            ) : (
              devisList.map((devis) => (
                <div
                  key={devis.id}
                  className="p-3 bg-muted rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {devis.montant.toLocaleString('fr-FR')} FCFA
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {DEVIS_OPTION_LABELS[devis.option]} •{' '}
                      {format(new Date(devis.dateDevis), 'dd MMM yyyy', {
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {devis.acompteRecu && (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    )}
                    <Select
                      value={devis.statut}
                      onValueChange={(newStatus: DevisStatus) => {
                        const previousStatus = devis.statut;
                        
                        // Déduire le stock si passage à "accepté" et pas encore déduit
                        if (newStatus === 'accepte' && previousStatus !== 'accepte' && !devis.stockDeduit) {
                          deductStockForDevis(devis.lignes);
                          updateDevis(devis.id, { statut: newStatus, stockDeduit: true });
                          toast.success('Devis accepté - Stock déduit automatiquement');
                        } 
                        // Restaurer le stock si passage de "accepté" à un autre statut
                        else if (previousStatus === 'accepte' && newStatus !== 'accepte' && devis.stockDeduit) {
                          restoreStockForDevis(devis.lignes);
                          updateDevis(devis.id, { statut: newStatus, stockDeduit: false });
                          toast.success('Devis annulé - Stock restauré automatiquement');
                        } else {
                          updateDevis(devis.id, { statut: newStatus });
                          toast.success('Statut du devis mis à jour');
                        }
                      }}
                    >
                      <SelectTrigger className="w-auto h-7 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-full ${
                            devis.statut === 'accepte'
                              ? 'bg-success/10 text-success'
                              : devis.statut === 'refuse'
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-warning/10 text-warning'
                          }`}
                        >
                          {DEVIS_STATUS_LABELS[devis.statut]}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DEVIS_STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Interventions Section */}
        <Card className="animate-slide-up">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Interventions ({interventions.length})
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowForm('intervention')}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {interventions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Aucune intervention
              </p>
            ) : (
              interventions.map((intervention) => (
                <div
                  key={intervention.id}
                  className="p-3 bg-muted rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {INTERVENTION_TYPE_LABELS[intervention.type]}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(intervention.datePrevue), 'dd MMM yyyy', {
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={intervention.statut === 'fait' ? 'secondary' : 'default'}
                    onClick={() =>
                      updateIntervention(intervention.id, {
                        statut: intervention.statut === 'fait' ? 'a_faire' : 'fait',
                      })
                    }
                  >
                    {intervention.statut === 'fait' ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Fait
                      </>
                    ) : (
                      'Marquer fait'
                    )}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>

      {/* Forms */}
      <Sheet open={showForm === 'prospect'} onOpenChange={() => setShowForm(null)}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
          <SheetHeader className="mb-4">
            <SheetTitle>Modifier le prospect</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            <ProspectForm
              prospect={prospect}
              onSubmit={handleEditProspect}
              onCancel={() => setShowForm(null)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showForm === 'devis'} onOpenChange={() => setShowForm(null)}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
          <SheetHeader className="mb-4">
            <SheetTitle>Nouveau devis</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            <DevisForm
              prospectId={prospect.id}
              onSubmit={handleAddDevis}
              onCancel={() => setShowForm(null)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={showForm === 'intervention'}
        onOpenChange={() => setShowForm(null)}
      >
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
          <SheetHeader className="mb-4">
            <SheetTitle>Nouvelle intervention</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            <InterventionForm
              prospectId={prospect.id}
              onSubmit={handleAddIntervention}
              onCancel={() => setShowForm(null)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showConvert} onOpenChange={setShowConvert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convertir en client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Un nouveau client sera créé à partir de "{prospect.nomStructure}". Le prospect sera conservé pour l'historique commercial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConvertToClient}>Convertir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

