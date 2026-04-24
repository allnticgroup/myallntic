import { useState, useMemo } from 'react';
import { Plus, FileText, Download, Trash2, Check, Send, Clock, AlertTriangle, Search, Filter, ChevronDown, Eye, Pencil } from 'lucide-react';
import { format, addDays, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { InvoicePreview } from '@/components/InvoicePreview';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useInvoices, useProspects, useDevis } from '@/hooks/useData';
import { useClients } from '@/hooks/useErpData';
import { Invoice, InvoiceStatus, INVOICE_STATUS_LABELS } from '@/types';
import { generateInvoiceDocx } from '@/lib/generateInvoiceDocx';
import { generateInvoicePdf } from '@/lib/generateInvoicePdf';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function Invoices() {
  const { invoices, addInvoice, updateInvoice, deleteInvoice, generateInvoiceNumber } = useInvoices();
  const { prospects, getProspect } = useProspects();
  const { devisList } = useDevis();
  const { getClient } = useClients();

  const getInvoiceClientName = (invoice: Invoice) => {
    if (invoice.source === 'vente' && invoice.clientId) {
      return getClient(invoice.clientId)?.nom;
    }
    return getProspect(invoice.prospectId)?.nomStructure;
  };
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDevisId, setSelectedDevisId] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [previewingInvoice, setPreviewingInvoice] = useState<Invoice | null>(null);

  // Auto-update overdue invoices
  useMemo(() => {
    invoices.forEach((invoice) => {
      if (
        (invoice.statut === 'sent' || invoice.statut === 'draft') &&
        isAfter(new Date(), new Date(invoice.dateEcheance))
      ) {
        updateInvoice(invoice.id, { statut: 'overdue' });
      }
    });
  }, [invoices, updateInvoice]);

  // Devis acceptés sans facture
  const devisWithoutInvoice = useMemo(() => {
    return devisList.filter(
      (d) => d.statut === 'accepte' && !invoices.some((i) => i.devisId === d.id)
    );
  }, [devisList, invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((invoice) => {
        const clientName = getInvoiceClientName(invoice) || '';
        const matchesSearch =
          searchQuery === '' ||
          invoice.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
          clientName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || invoice.statut === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.dateEmission).getTime() - new Date(a.dateEmission).getTime());
  }, [invoices, searchQuery, statusFilter, getProspect, getClient]);

  // Stats
  const stats = useMemo(() => {
    const total = invoices.reduce((sum, i) => sum + i.montantTTC, 0);
    const paid = invoices.filter((i) => i.statut === 'paid').reduce((sum, i) => sum + i.montantTTC, 0);
    const pending = invoices.filter((i) => i.statut === 'sent').reduce((sum, i) => sum + i.montantTTC, 0);
    const overdue = invoices.filter((i) => i.statut === 'overdue').reduce((sum, i) => sum + i.montantTTC, 0);
    return { total, paid, pending, overdue };
  }, [invoices]);

  const handleCreateInvoice = () => {
    if (!selectedDevisId) return;
    const devis = devisList.find((d) => d.id === selectedDevisId);
    if (!devis) return;

    const invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
      numero: generateInvoiceNumber(),
      devisId: selectedDevisId,
      prospectId: devis.prospectId,
      montantHT: devis.montant,
      montantTTC: devis.montant,
      dateEmission: new Date().toISOString().split('T')[0],
      dateEcheance: addDays(new Date(), 30).toISOString().split('T')[0],
      statut: 'draft',
    };
    addInvoice(invoice);
    toast.success(`Facture ${invoice.numero} créée`);
    setShowCreateDialog(false);
    setSelectedDevisId('');
  };

  const handleDownloadDocx = async (invoice: Invoice) => {
    if (invoice.source === 'vente') {
      toast.info('Téléchargement Word indisponible pour les factures issues de ventes');
      return;
    }
    const prospect = getProspect(invoice.prospectId);
    const devis = devisList.find((d) => d.id === invoice.devisId);
    if (!prospect) { toast.error('Client introuvable'); return; }
    await generateInvoiceDocx(invoice, prospect, devis);
    toast.success('Document Word téléchargé');
  };

  const handleDownloadPdf = async (invoice: Invoice) => {
    if (invoice.source === 'vente') {
      toast.info('Téléchargement PDF indisponible pour les factures issues de ventes');
      return;
    }
    const prospect = getProspect(invoice.prospectId);
    const devis = devisList.find((d) => d.id === invoice.devisId);
    if (!prospect) { toast.error('Client introuvable'); return; }
    await generateInvoicePdf(invoice, prospect, devis);
    toast.success('Document PDF téléchargé');
  };

  const handleStatusChange = (invoiceId: string, newStatus: InvoiceStatus) => {
    updateInvoice(invoiceId, { statut: newStatus });
    toast.success(`Statut mis à jour : ${INVOICE_STATUS_LABELS[newStatus]}`);
  };

  const handleDelete = (invoiceId: string) => {
    deleteInvoice(invoiceId);
    setDeleteConfirm(null);
    toast.success('Facture supprimée');
  };

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return <Check className="h-4 w-4" />;
      case 'sent':
        return <Send className="h-4 w-4" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Factures" subtitle={`${invoices.length} factures`} />

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-green-600">{stats.paid.toLocaleString('fr-FR')} F</p>
              <p className="text-xs text-muted-foreground">Payées</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-500/10 border-orange-500/20">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-orange-600">{stats.pending.toLocaleString('fr-FR')} F</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </CardContent>
          </Card>
        </div>

        {stats.overdue > 0 && (
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-red-600">{stats.overdue.toLocaleString('fr-FR')} F en retard</p>
                <p className="text-xs text-muted-foreground">
                  {invoices.filter((i) => i.statut === 'overdue').length} facture(s)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {devisWithoutInvoice.length > 0 && (
          <Button onClick={() => setShowCreateDialog(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Créer une facture
          </Button>
        )}

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InvoiceStatus | 'all')}>
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Invoice List */}
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Aucune facture</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredInvoices.map((invoice) => {
              const clientName = getInvoiceClientName(invoice);
              return (
                <Card key={invoice.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{invoice.numero}</p>
                        <p className="text-sm text-muted-foreground">
                          {clientName || 'Client inconnu'}
                          {invoice.source === 'vente' && <span className="ml-1 text-xs">(Vente)</span>}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(invoice.statut)} className="flex items-center gap-1">
                        {getStatusIcon(invoice.statut)}
                        {INVOICE_STATUS_LABELS[invoice.statut]}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xl font-bold">{invoice.montantTTC.toLocaleString('fr-FR')} FCFA</p>
                      <p className="text-xs text-muted-foreground">
                        Échéance : {format(new Date(invoice.dateEcheance), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewingInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> Aperçu
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleDownloadPdf(invoice)}>
                            <FileText className="h-4 w-4 mr-2" /> PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadDocx(invoice)}>
                            <FileText className="h-4 w-4 mr-2" /> Word (.docx)
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      {invoice.statut === 'draft' && (
                        <Button size="sm" variant="secondary" onClick={() => handleStatusChange(invoice.id, 'sent')}>
                          <Send className="h-4 w-4 mr-1" /> Envoyer
                        </Button>
                      )}
                      
                      {(invoice.statut === 'sent' || invoice.statut === 'overdue') && (
                        <Button size="sm" onClick={() => handleStatusChange(invoice.id, 'paid')}>
                          <Check className="h-4 w-4 mr-1" /> Payée
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive ml-auto"
                        onClick={() => setDeleteConfirm(invoice.id)}
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

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une facture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sélectionnez un devis accepté pour créer la facture correspondante.
            </p>
            <Select value={selectedDevisId} onValueChange={setSelectedDevisId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un devis" />
              </SelectTrigger>
              <SelectContent>
                {devisWithoutInvoice.map((devis) => {
                  const prospect = getProspect(devis.prospectId);
                  return (
                    <SelectItem key={devis.id} value={devis.id}>
                      {prospect?.nomStructure} - {devis.montant.toLocaleString('fr-FR')} F
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                Annuler
              </Button>
              <Button onClick={handleCreateInvoice} disabled={!selectedDevisId} className="flex-1">
                Créer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la facture ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La facture sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invoice Preview Dialog */}
      <Dialog open={!!previewingInvoice} onOpenChange={() => setPreviewingInvoice(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Aperçu de la facture</DialogTitle>
          </DialogHeader>
          {previewingInvoice && getProspect(previewingInvoice.prospectId) && (
            <InvoicePreview
              invoice={previewingInvoice}
              prospect={getProspect(previewingInvoice.prospectId)!}
              devis={devisList.find((d) => d.id === previewingInvoice.devisId)}
            />
          )}
          <DialogFooter className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={async () => {
                  if (previewingInvoice) {
                    await handleDownloadPdf(previewingInvoice);
                    setPreviewingInvoice(null);
                  }
                }}>
                  <FileText className="h-4 w-4 mr-2" /> PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={async () => {
                  if (previewingInvoice) {
                    await handleDownloadDocx(previewingInvoice);
                    setPreviewingInvoice(null);
                  }
                }}>
                  <FileText className="h-4 w-4 mr-2" /> Word (.docx)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
