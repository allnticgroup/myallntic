import { useState, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Package, AlertTriangle, Upload, FileUp } from 'lucide-react';
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
import { parseMaterialsPdf, ParsedMaterial } from '@/lib/parseMaterialsPdf';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

export default function Materials() {
  const { materials, addMaterial, deleteMaterial } = useMaterials();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<MaterialCategory | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null);
  const [isPdfImportOpen, setIsPdfImportOpen] = useState(false);
  const [parsedMaterials, setParsedMaterials] = useState<ParsedMaterial[]>([]);
  const [selectedImports, setSelectedImports] = useState<Set<number>>(new Set());
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Veuillez sélectionner un fichier PDF');
      return;
    }

    setIsParsing(true);
    try {
      const parsed = await parseMaterialsPdf(file);
      if (parsed.length === 0) {
        toast.error('Aucun matériel trouvé dans le PDF');
        return;
      }
      setParsedMaterials(parsed);
      setSelectedImports(new Set(parsed.map((_, i) => i)));
      setIsPdfImportOpen(true);
      toast.success(`${parsed.length} matériel(s) détecté(s)`);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la lecture du PDF');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const updateParsedCategory = (idx: number, categorie: MaterialCategory) => {
    setParsedMaterials(prev => prev.map((m, i) => i === idx ? { ...m, categorie } : m));
  };

  const handleImportSelected = () => {
    let count = 0;
    parsedMaterials.forEach((mat, idx) => {
      if (selectedImports.has(idx)) {
        addMaterial(mat);
        count++;
      }
    });
    toast.success(`${count} matériel(s) importé(s)`);
    setIsPdfImportOpen(false);
    setParsedMaterials([]);
    setSelectedImports(new Set());
  };

  const toggleImportSelection = (idx: number) => {
    setSelectedImports(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleAllImports = () => {
    if (selectedImports.size === parsedMaterials.length) {
      setSelectedImports(new Set());
    } else {
      setSelectedImports(new Set(parsedMaterials.map((_, i) => i)));
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader 
        title="Matériels & Prix" 
        action={
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isParsing}
            >
              <FileUp className="h-4 w-4 mr-1" />
              {isParsing ? 'Lecture...' : 'PDF'}
            </Button>
            <Button size="sm" onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handlePdfSelect}
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
              : "Ajoutez votre premier matériel ou importez depuis un PDF"
            }
            action={
              !searchQuery && categoryFilter === 'all' ? (
                <div className="flex flex-col gap-2 items-center">
                  <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter manuellement
                  </Button>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <FileUp className="h-4 w-4 mr-2" />
                    Importer depuis un PDF
                  </Button>
                </div>
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
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(material.prixUnitaire)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            / {material.unite}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {(material.stockQuantite ?? 0) <= (material.stockMinimum ?? 5) && (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                          <Badge 
                            variant="outline" 
                            className={
                              (material.stockQuantite ?? 0) === 0
                                ? 'bg-destructive/10 text-destructive border-destructive/20'
                                : (material.stockQuantite ?? 0) <= (material.stockMinimum ?? 5)
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                : 'bg-green-500/10 text-green-500 border-green-500/20'
                            }
                          >
                            Stock: {material.stockQuantite ?? 0}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(material)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingMaterial(material)}>
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

      {/* Floating Add Button */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors active:scale-95"
        aria-label="Ajouter un matériel"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMaterial ? 'Modifier le matériel' : 'Nouveau matériel'}
            </DialogTitle>
          </DialogHeader>
          <MaterialForm material={editingMaterial} onSuccess={handleFormClose} />
        </DialogContent>
      </Dialog>

      {/* PDF Import Dialog */}
      <Dialog open={isPdfImportOpen} onOpenChange={setIsPdfImportOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import PDF — {parsedMaterials.length} matériel(s) détecté(s)
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={selectedImports.size === parsedMaterials.length}
                  onCheckedChange={toggleAllImports}
                />
                Tout sélectionner
              </label>
              <span className="text-sm text-muted-foreground">
                {selectedImports.size} sélectionné(s)
              </span>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {parsedMaterials.map((mat, idx) => (
                <Card 
                  key={idx} 
                  className={`cursor-pointer transition-colors ${selectedImports.has(idx) ? 'border-primary/50 bg-primary/5' : 'opacity-60'}`}
                  onClick={() => toggleImportSelection(idx)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedImports.has(idx)}
                        onCheckedChange={() => toggleImportSelection(idx)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm truncate">{mat.nom}</span>
                          <Select
                            value={mat.categorie}
                            onValueChange={(v) => updateParsedCategory(idx, v as MaterialCategory)}
                          >
                            <SelectTrigger className="h-6 w-auto text-xs px-2 py-0" onClick={(e) => e.stopPropagation()}>
                              <Badge variant="outline" className={`text-xs ${getCategoryColor(mat.categorie)}`}>
                                {MATERIAL_CATEGORY_LABELS[mat.categorie]}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(MATERIAL_CATEGORY_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>Réf: {mat.reference}</span>
                          {mat.prixUnitaire > 0 && (
                            <span className="font-semibold text-foreground">
                              {formatPrice(mat.prixUnitaire)}
                            </span>
                          )}
                          {mat.stockQuantite > 0 && (
                            <span>Stock: {mat.stockQuantite}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button 
              className="w-full" 
              onClick={handleImportSelected}
              disabled={selectedImports.size === 0}
            >
              Importer {selectedImports.size} matériel(s)
            </Button>
          </div>
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
