import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Trash2, 
  Plus, 
  Package,
  Calendar,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { EmptyState } from '@/components/EmptyState';
import { SupplierForm } from '@/components/forms/SupplierForm';
import { PurchaseForm } from '@/components/forms/PurchaseForm';
import { useSuppliers, usePurchases, useMaterials } from '@/hooks/useData';
import { SUPPLIER_CATEGORY_LABELS, PURCHASE_STATUS_LABELS, Purchase } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const { 
    getPurchasesForSupplier, 
    addPurchase, 
    updatePurchase, 
    deletePurchase,
    getTotalPurchasesForSupplier 
  } = usePurchases();
  const { materials, getMaterial, updateMaterial } = useMaterials();

  const [showEditForm, setShowEditForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

  const supplier = id ? getSupplier(id) : undefined;
  const purchases = id ? getPurchasesForSupplier(id) : [];
  const totalPurchases = id ? getTotalPurchasesForSupplier(id) : 0;

  if (!supplier) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Fournisseur non trouvé</p>
          <Button onClick={() => navigate('/fournisseurs')} className="mt-4">
            Retour aux fournisseurs
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdateSupplier = (data: Parameters<typeof updateSupplier>[1]) => {
    updateSupplier(supplier.id, data);
    setShowEditForm(false);
    toast.success('Fournisseur mis à jour');
  };

  const handleDeleteSupplier = () => {
    deleteSupplier(supplier.id);
    toast.success('Fournisseur supprimé');
    navigate('/fournisseurs');
  };

  const handleAddPurchase = (data: Parameters<typeof addPurchase>[0]) => {
    const newPurchase = addPurchase(data);
    
    // Si statut livré et matériel lié, mettre à jour le stock
    if (data.statut === 'livree' && data.materialId && !data.stockUpdated) {
      const material = getMaterial(data.materialId);
      if (material) {
        updateMaterial(data.materialId, {
          stockQuantite: material.stockQuantite + data.quantite
        });
        updatePurchase(newPurchase.id, { stockUpdated: true });
        toast.success(`Achat enregistré - Stock +${data.quantite} ${material.unite}`);
        setShowPurchaseForm(false);
        return;
      }
    }
    
    setShowPurchaseForm(false);
    toast.success('Achat enregistré');
  };

  const handleUpdatePurchase = (data: Parameters<typeof addPurchase>[0]) => {
    if (editingPurchase) {
      updatePurchase(editingPurchase.id, data);
      setEditingPurchase(null);
      toast.success('Achat mis à jour');
    }
  };

  const handleStatusChange = (purchase: Purchase, newStatus: Purchase['statut']) => {
    const previousStatus = purchase.statut;
    
    // Passage à "livrée" avec matériel lié et stock pas encore mis à jour
    if (newStatus === 'livree' && previousStatus !== 'livree' && purchase.materialId && !purchase.stockUpdated) {
      const material = getMaterial(purchase.materialId);
      if (material) {
        updateMaterial(purchase.materialId, {
          stockQuantite: material.stockQuantite + purchase.quantite
        });
        updatePurchase(purchase.id, { 
          statut: newStatus, 
          stockUpdated: true,
          dateReception: new Date().toISOString().split('T')[0]
        });
        toast.success(`Livraison confirmée - Stock +${purchase.quantite} ${material.unite}`);
        return;
      }
    }
    
    // Annulation d'une commande livrée avec stock mis à jour
    if (newStatus === 'annulee' && previousStatus === 'livree' && purchase.materialId && purchase.stockUpdated) {
      const material = getMaterial(purchase.materialId);
      if (material) {
        updateMaterial(purchase.materialId, {
          stockQuantite: Math.max(0, material.stockQuantite - purchase.quantite)
        });
        updatePurchase(purchase.id, { statut: newStatus, stockUpdated: false });
        toast.success(`Commande annulée - Stock -${purchase.quantite} ${material.unite}`);
        return;
      }
    }
    
    // Changement de "livrée" vers "commandée" (retour en arrière)
    if (newStatus === 'commande' && previousStatus === 'livree' && purchase.materialId && purchase.stockUpdated) {
      const material = getMaterial(purchase.materialId);
      if (material) {
        updateMaterial(purchase.materialId, {
          stockQuantite: Math.max(0, material.stockQuantite - purchase.quantite)
        });
        updatePurchase(purchase.id, { statut: newStatus, stockUpdated: false });
        toast.success(`Statut mis à jour - Stock corrigé`);
        return;
      }
    }
    
    updatePurchase(purchase.id, { statut: newStatus });
    toast.success('Statut mis à jour');
  };

  const handleDeletePurchase = (purchase: Purchase) => {
    // Si le stock a été mis à jour, le restaurer
    if (purchase.stockUpdated && purchase.materialId) {
      const material = getMaterial(purchase.materialId);
      if (material) {
        updateMaterial(purchase.materialId, {
          stockQuantite: Math.max(0, material.stockQuantite - purchase.quantite)
        });
      }
    }
    deletePurchase(purchase.id);
    toast.success('Achat supprimé');
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/fournisseurs')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold truncate flex-1">{supplier.nom}</h1>
          <Button variant="ghost" size="icon" onClick={() => setShowEditForm(true)}>
            <Edit className="h-5 w-5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer le fournisseur ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Tous les achats associés seront conservés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSupplier}>
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <div className="container max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Contact Info */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Informations</CardTitle>
              <Badge variant="secondary">
                {SUPPLIER_CATEGORY_LABELS[supplier.categorie]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {supplier.contact && (
              <p className="text-sm font-medium">{supplier.contact}</p>
            )}
            {supplier.telephone && (
              <a
                href={`tel:${supplier.telephone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Phone className="h-4 w-4" />
                {supplier.telephone}
              </a>
            )}
            {supplier.email && (
              <a
                href={`mailto:${supplier.email}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
                {supplier.email}
              </a>
            )}
            {supplier.adresse && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {supplier.adresse}
              </div>
            )}
            {supplier.notes && (
              <p className="text-sm text-muted-foreground pt-2 border-t">
                {supplier.notes}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{purchases.length}</div>
              <p className="text-sm text-muted-foreground">Commandes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totalPurchases)}
              </div>
              <p className="text-sm text-muted-foreground">Total achats</p>
            </CardContent>
          </Card>
        </div>

        {/* Purchases */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Historique des achats</h2>
            <Button
              size="sm"
              onClick={() => setShowPurchaseForm(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>

          {purchases.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Aucun achat"
              description="Enregistrez votre première commande"
            />
          ) : (
            <div className="space-y-3">
              {purchases
                .sort((a, b) => new Date(b.datePurchase).getTime() - new Date(a.datePurchase).getTime())
                .map((purchase) => {
                  const linkedMaterial = purchase.materialId ? getMaterial(purchase.materialId) : null;
                  return (
                    <Card key={purchase.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{purchase.reference}</p>
                            <p className="text-sm text-muted-foreground">
                              {purchase.description}
                            </p>
                            {linkedMaterial && (
                              <div className="flex items-center gap-1 mt-1">
                                <Package className="h-3 w-3 text-primary" />
                                <span className="text-xs text-primary">
                                  {linkedMaterial.nom} × {purchase.quantite} {linkedMaterial.unite}
                                </span>
                                {purchase.stockUpdated && (
                                  <Badge variant="secondary" className="text-xs ml-1">
                                    Stock ✓
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <Select
                            value={purchase.statut}
                            onValueChange={(value: Purchase['statut']) => handleStatusChange(purchase, value)}
                          >
                            <SelectTrigger className="w-28 h-7">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PURCHASE_STATUS_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(purchase.datePurchase), 'dd MMM yyyy', { locale: fr })}
                          </div>
                          <span className="font-semibold">
                            {formatCurrency(purchase.montant)}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-3 pt-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setEditingPurchase(purchase)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Modifier
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Supprimer
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer l'achat ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {purchase.stockUpdated && purchase.materialId
                                    ? 'Le stock sera automatiquement réduit de la quantité livrée.'
                                    : 'Cette action est irréversible.'}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePurchase(purchase)}>
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le fournisseur</DialogTitle>
          </DialogHeader>
          <SupplierForm
            initialData={supplier}
            onSubmit={handleUpdateSupplier}
            onCancel={() => setShowEditForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showPurchaseForm} onOpenChange={setShowPurchaseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel achat</DialogTitle>
          </DialogHeader>
          <PurchaseForm
            supplierId={supplier.id}
            materials={materials}
            onSubmit={handleAddPurchase}
            onCancel={() => setShowPurchaseForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingPurchase} onOpenChange={(open) => !open && setEditingPurchase(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'achat</DialogTitle>
          </DialogHeader>
          {editingPurchase && (
            <PurchaseForm
              supplierId={supplier.id}
              materials={materials}
              initialData={editingPurchase}
              onSubmit={handleUpdatePurchase}
              onCancel={() => setEditingPurchase(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
