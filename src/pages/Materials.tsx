import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMaterials } from '@/hooks/useData';
import { MaterialForm } from '@/components/forms/MaterialForm';
import { Material, MaterialCategory, MATERIAL_CATEGORY_LABELS } from '@/types';
import { EmptyState } from '@/components/EmptyState';

export default function Materials() {
  const { materials, deleteMaterial } = useMaterials();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MaterialCategory | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null);

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = 
      material.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || material.categorie === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (deletingMaterial) {
      deleteMaterial(deletingMaterial.id);
      setDeletingMaterial(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMaterial(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
  };

  const getCategoryColor = (category: MaterialCategory) => {
    const colors: Record<MaterialCategory, string> = {
      camera: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      cable: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      enregistreur: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      accessoire: 'bg-green-500/10 text-green-500 border-green-500/20',
      reseau: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      autre: 'bg-muted text-muted-foreground border-border',
    };
    return colors[category];
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader 
        title="Matériels & Prix" 
        action={
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        }
      />

      <div className="px-4 space-y-4">
        {/* Search and Filter */}
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
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as MaterialCategory | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {Object.entries(MATERIAL_CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Materials List */}
        {filteredMaterials.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Aucun matériel"
            description={searchQuery || categoryFilter !== 'all' 
              ? "Aucun matériel ne correspond à votre recherche"
              : "Ajoutez votre premier matériel pour commencer"
            }
            action={
              !searchQuery && categoryFilter === 'all' ? (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un matériel
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredMaterials.map((material) => (
              <Card key={material.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {material.nom}
                        </h3>
                        <Badge variant="outline" className={getCategoryColor(material.categorie)}>
                          {MATERIAL_CATEGORY_LABELS[material.categorie]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Réf: {material.reference}
                      </p>
                      {material.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {material.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(material.prixUnitaire)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          / {material.unite}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(material)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingMaterial(material)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMaterial ? 'Modifier le matériel' : 'Nouveau matériel'}
            </DialogTitle>
          </DialogHeader>
          <MaterialForm
            material={editingMaterial}
            onSuccess={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingMaterial} onOpenChange={() => setDeletingMaterial(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce matériel ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le matériel "{deletingMaterial?.nom}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
