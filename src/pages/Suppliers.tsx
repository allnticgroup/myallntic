import { useState } from 'react';
import { Plus, Search, Phone, Mail, MapPin, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { SupplierForm } from '@/components/forms/SupplierForm';
import { useSuppliers, usePurchases } from '@/hooks/useData';
import { SUPPLIER_CATEGORY_LABELS, SupplierCategory } from '@/types';
import { toast } from 'sonner';

export default function Suppliers() {
  const { suppliers, addSupplier } = useSuppliers();
  const { getTotalPurchasesForSupplier } = usePurchases();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.nom.toLowerCase().includes(search.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || supplier.categorie === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddSupplier = (data: Parameters<typeof addSupplier>[0]) => {
    addSupplier(data);
    setShowForm(false);
    toast.success('Fournisseur ajouté');
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="Fournisseurs" />

      <div className="container max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Search and filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {Object.entries(SUPPLIER_CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Supplier list */}
        {filteredSuppliers.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="Aucun fournisseur"
            description="Ajoutez votre premier fournisseur"
          />
        ) : (
          <div className="space-y-3">
            {filteredSuppliers.map((supplier) => {
              const totalPurchases = getTotalPurchasesForSupplier(supplier.id);
              return (
                <Link key={supplier.id} to={`/fournisseurs/${supplier.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{supplier.nom}</CardTitle>
                          {supplier.contact && (
                            <p className="text-sm text-muted-foreground">{supplier.contact}</p>
                          )}
                        </div>
                        <Badge variant="secondary">
                          {SUPPLIER_CATEGORY_LABELS[supplier.categorie]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {supplier.telephone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span>{supplier.telephone}</span>
                          </div>
                        )}
                        {supplier.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            <span>{supplier.email}</span>
                          </div>
                        )}
                        {supplier.adresse && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{supplier.adresse}</span>
                          </div>
                        )}
                      </div>
                      {totalPurchases > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-medium">
                            Total achats : {formatCurrency(totalPurchases)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* FAB */}
        <Button
          onClick={() => setShowForm(true)}
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau fournisseur</DialogTitle>
            </DialogHeader>
            <SupplierForm
              onSubmit={handleAddSupplier}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
