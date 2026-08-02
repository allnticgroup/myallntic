import { useState } from 'react';
import { Plus, Search, ShoppingCart, Trash2, CheckCircle2, XCircle, FileText, Download } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { VenteForm } from '@/components/forms/VenteForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClients, useVentes, useStockMovements, useProjects } from '@/hooks/useErpData';
import { useMaterials, useInvoices } from '@/hooks/useData';
import { Vente, VenteStatus, VENTE_STATUS_LABELS } from '@/types/erp';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { exportVentesToCsv } from '@/lib/export';

export default function Ventes() {
  const navigate = useNavigate();
  const { clients, getClient } = useClients();
  const { ventes, addVente, updateVente, deleteVente } = useVentes();
  const { projects } = useProjects();
  const { materials, updateMaterial } = useMaterials();
  const { addMovement } = useStockMovements();
  const { invoices, addInvoice, generateInvoiceNumber } = useInvoices();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<VenteStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [deletingVente, setDeletingVente] = useState<Vente | null>(null);

  const filtered = ventes
    .filter(v => {
      const client = getClient(v.clientId);
      const matchSearch = v.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (client?.nom || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || v.statut === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAdd = (data: Parameters<typeof addVente>[0]) => {
    addVente(data);
    setShowForm(false);
    toast.success('Vente créée');
  };

  const handleValidate = (vente: Vente) => {
    // Deduct stock
    vente.lignes.forEach(l => {
      const mat = materials.find(m => m.id === l.materialId);
      if (mat) {
        const newStock = Math.max(0, mat.stockQuantite - l.quantite);
        updateMaterial(mat.id, { stockQuantite: newStock });
        addMovement({
          materialId: mat.id,
          type: 'sortie',
          quantite: l.quantite,
          quantiteAvant: mat.stockQuantite,
          quantiteApres: newStock,
          reference: `Vente ${vente.code}`,
          notes: '',
        });
      }
    });
    updateVente(vente.id, { statut: 'validee', stockDeduit: true });
    toast.success('Vente validée, stock mis à jour');
  };

  const handleCancel = (vente: Vente) => {
    if (vente.stockDeduit) {
      vente.lignes.forEach(l => {
        const mat = materials.find(m => m.id === l.materialId);
        if (mat) {
          const newStock = mat.stockQuantite + l.quantite;
          updateMaterial(mat.id, { stockQuantite: newStock });
          addMovement({
            materialId: mat.id,
            type: 'entree',
            quantite: l.quantite,
            quantiteAvant: mat.stockQuantite,
            quantiteApres: newStock,
            reference: `Annulation vente ${vente.code}`,
            notes: '',
          });
        }
      });
    }
    updateVente(vente.id, { statut: 'annulee', stockDeduit: false });
    toast.success('Vente annulée');
  };

  const handleDelete = () => {
    if (deletingVente) {
      deleteVente(deletingVente.id);
      setDeletingVente(null);
      toast.success('Vente supprimée');
    }
  };

  const hasInvoice = (venteId: string) => invoices.some(i => i.venteId === venteId);

  const handleGenerateInvoice = (vente: Vente) => {
    if (hasInvoice(vente.id)) {
      toast.info('Une facture existe déjà pour cette vente');
      navigate('/factures');
      return;
    }
    const today = new Date();
    addInvoice({
      numero: generateInvoiceNumber(),
      devisId: '',
      prospectId: '',
      venteId: vente.id,
      clientId: vente.clientId,
      source: 'vente',
      montantHT: vente.total,
      montantTTC: vente.total,
      dateEmission: today.toISOString(),
      dateEcheance: addDays(today, 30).toISOString(),
      statut: 'draft',
    });
    toast.success(`Facture générée pour la vente ${vente.code}`);
    navigate('/factures');
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title="Ventes" subtitle={`${ventes.length} vente${ventes.length > 1 ? 's' : ''}`}
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => exportVentesToCsv(filtered, (id) => getClient(id)?.nom || '')} disabled={filtered.length === 0}>
              <Download className="h-4 w-4 mr-1" />CSV
            </Button>
            <Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" />Nouvelle</Button>
          </div>
        }
      />
      <main className="p-4 space-y-4 max-w-lg mx-auto">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as VenteStatus | 'all')}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {Object.entries(VENTE_STATUS_LABELS).map(([k, l]) => (
                <SelectItem key={k} value={k}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="Aucune vente" description="Créez votre première vente" />
        ) : (
          <div className="space-y-3">
            {filtered.map(vente => {
              const client = getClient(vente.clientId);
              return (
                <Card key={vente.id} className="hover:shadow-md transition-smooth">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">{vente.code}</Badge>
                          <Badge variant={vente.statut === 'validee' ? 'default' : vente.statut === 'annulee' ? 'destructive' : 'outline'} className="text-xs">
                            {VENTE_STATUS_LABELS[vente.statut]}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm">{client?.nom || 'Client inconnu'}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(vente.dateVente), 'dd MMM yyyy', { locale: fr })} · {vente.lignes.length} article{vente.lignes.length > 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{vente.total.toLocaleString('fr-FR')} F</p>
                        <div className="flex gap-1 mt-1">
                          {vente.statut === 'brouillon' && (
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleValidate(vente)}>
                              <CheckCircle2 className="h-3 w-3 mr-1" />Valider
                            </Button>
                          )}
                          {vente.statut === 'validee' && (
                            <>
                              {hasInvoice(vente.id) ? (
                                <Badge variant="secondary" className="h-7 text-xs px-2 flex items-center">
                                  <FileText className="h-3 w-3 mr-1" />Facturée
                                </Badge>
                              ) : (
                                <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleGenerateInvoice(vente)}>
                                  <FileText className="h-3 w-3 mr-1" />Facture
                                </Button>
                              )}
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleCancel(vente)}>
                                <XCircle className="h-3 w-3 mr-1" />Annuler
                              </Button>
                            </>
                          )}
                          {vente.statut !== 'validee' && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => setDeletingVente(vente)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
          <SheetHeader className="mb-4"><SheetTitle>Nouvelle vente</SheetTitle></SheetHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            <VenteForm clients={clients} materials={materials} projects={projects} onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deletingVente} onOpenChange={() => setDeletingVente(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la vente {deletingVente?.code} ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
