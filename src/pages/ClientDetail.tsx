import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Edit, Trash2, ShoppingCart, Target } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { ClientForm } from '@/components/forms/ClientForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useClients, useVentes } from '@/hooks/useErpData';
import { useProspects } from '@/hooks/useData';
import { useProspectClientSync } from '@/hooks/useProspectClientSync';
import { VENTE_STATUS_LABELS } from '@/types/erp';
import { toast } from 'sonner';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClient, deleteClient } = useClients();
  const { getVentesForClient } = useVentes();
  const { prospects } = useProspects();
  const { syncedUpdateClient, unlinkProspectFromClient } = useProspectClientSync();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const client = id ? getClient(id) : undefined;
  const ventes = id ? getVentesForClient(id) : [];
  const linkedProspect = client?.prospectId ? prospects.find(p => p.id === client.prospectId) : undefined;

  if (!client) {
    return (
      <div className="min-h-screen pb-20">
        <PageHeader title="Client introuvable" />
        <main className="p-4 text-center">
          <p className="text-muted-foreground">Ce client n'existe pas.</p>
          <Button className="mt-4" onClick={() => navigate('/clients')}>Retour</Button>
        </main>
      </div>
    );
  }

  const totalVentes = ventes.filter(v => v.statut === 'validee').reduce((s, v) => s + v.total, 0);

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title={client.nom} subtitle={client.code}
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowEdit(true)}><Edit className="h-4 w-4" /></Button>
            <Button size="sm" variant="destructive" onClick={() => setShowDelete(true)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        }
      />
      <main className="p-4 space-y-4 max-w-lg mx-auto">
        {linkedProspect && (
          <Link to={`/prospects/${linkedProspect.id}`}>
            <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-smooth">
              <CardContent className="p-3 flex items-center gap-3">
                <Target className="h-4 w-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Prospect d'origine (synchronisé)</p>
                  <p className="text-sm font-medium truncate">{linkedProspect.nomStructure}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
        <Card>
          <CardContent className="p-4 space-y-3">
            {client.telephone && (
              <a href={`tel:${client.telephone}`} className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />{client.telephone}
              </a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`} className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />{client.email}
              </a>
            )}
            {(client.adresse || client.ville) && (
              <p className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />{[client.adresse, client.ville].filter(Boolean).join(', ')}
              </p>
            )}
            {client.notes && <p className="text-sm text-muted-foreground pt-2 border-t">{client.notes}</p>}
          </CardContent>
        </Card>

        {totalVentes > 0 && (
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total des ventes</p>
              <p className="text-xl font-bold">{totalVentes.toLocaleString('fr-FR')} FCFA</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />Historique des ventes ({ventes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ventes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune vente</p>
            ) : (
              ventes.sort((a, b) => new Date(b.dateVente).getTime() - new Date(a.dateVente).getTime()).map(v => (
                <div key={v.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                  <div>
                    <p className="text-sm font-medium">{v.code}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(v.dateVente), 'dd MMM yyyy', { locale: fr })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{v.total.toLocaleString('fr-FR')} F</p>
                    <Badge variant={v.statut === 'validee' ? 'default' : 'secondary'} className="text-xs">
                      {VENTE_STATUS_LABELS[v.statut]}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>

      <Sheet open={showEdit} onOpenChange={setShowEdit}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
          <SheetHeader className="mb-4"><SheetTitle>Modifier le client</SheetTitle></SheetHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            <ClientForm client={client} onSubmit={(data) => { syncedUpdateClient(client.id, data); setShowEdit(false); toast.success('Client modifié'); }} onCancel={() => setShowEdit(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer "{client.nom}" ?</AlertDialogTitle>
            <AlertDialogDescription>
              {ventes.length > 0 ? (
                <>
                  ⚠️ Ce client a <strong>{ventes.length} vente(s)</strong> liée(s) (total: {totalVentes.toLocaleString('fr-FR')} F).
                  Les ventes ne seront pas supprimées mais perdront la référence client.
                  <br /><br />
                </>
              ) : null}
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => { unlinkProspectFromClient(client.id); deleteClient(client.id); navigate('/clients'); toast.success('Client supprimé'); }} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
