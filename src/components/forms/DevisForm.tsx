import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Devis,
  DevisOption,
  DevisStatus,
  DevisLigne,
  DEVIS_OPTION_LABELS,
  DEVIS_STATUS_LABELS,
  MATERIAL_CATEGORY_LABELS,
  Material,
} from '@/types';
import { useMaterials } from '@/hooks/useData';
import { Plus, Trash2, Package } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DevisFormProps {
  prospectId: string;
  devis?: Devis;
  onSubmit: (data: Omit<Devis, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function DevisForm({ prospectId, devis, onSubmit, onCancel }: DevisFormProps) {
  const { materials } = useMaterials();
  const [lignes, setLignes] = useState<DevisLigne[]>(devis?.lignes || []);
  const [mainDoeuvre, setMainDoeuvre] = useState<number>(devis?.mainDoeuvre || 0);
  const [formData, setFormData] = useState({
    prospectId,
    dateDevis: devis?.dateDevis || new Date().toISOString().split('T')[0],
    objet: devis?.objet || '',
    option: devis?.option || ('Essentiel' as DevisOption),
    statut: devis?.statut || ('envoye' as DevisStatus),
    acompteRecu: devis?.acompteRecu || false,
    montantAcompte: devis?.montantAcompte || 0,
    entrepriseNom: devis?.entrepriseNom || 'ALLNTIC',
    entrepriseAdresse: devis?.entrepriseAdresse || 'Abidjan, Côte d\'Ivoire',
    entrepriseTelephone: devis?.entrepriseTelephone || '+225 07 78 02 33 31',
    entrepriseEmail: devis?.entrepriseEmail || 'all.ntic225@gmail.com',
    entrepriseSite: devis?.entrepriseSite || 'www.allntic.com',
  });

  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [quantite, setQuantite] = useState<number>(1);

  // Calcul automatique du montant total
  const montantTotal = useMemo(() => {
    return lignes.reduce((sum, ligne) => sum + ligne.total, 0) + mainDoeuvre;
  }, [lignes, mainDoeuvre]);

  // Grouper les matériaux par catégorie pour un affichage plus clair
  const materialsByCategory = useMemo(() => {
    const grouped: Record<string, Material[]> = {};
    materials.forEach((material) => {
      if (!grouped[material.categorie]) {
        grouped[material.categorie] = [];
      }
      grouped[material.categorie].push(material);
    });
    return grouped;
  }, [materials]);

  const handleAddMaterial = () => {
    if (!selectedMaterialId || quantite <= 0) return;

    const material = materials.find((m) => m.id === selectedMaterialId);
    if (!material) return;

    // Vérifier si le matériel existe déjà dans les lignes
    const existingIndex = lignes.findIndex((l) => l.materialId === selectedMaterialId);
    
    if (existingIndex >= 0) {
      // Mettre à jour la quantité existante
      const updatedLignes = [...lignes];
      const newQuantite = updatedLignes[existingIndex].quantite + quantite;
      updatedLignes[existingIndex] = {
        ...updatedLignes[existingIndex],
        quantite: newQuantite,
        total: newQuantite * updatedLignes[existingIndex].prixUnitaire,
      };
      setLignes(updatedLignes);
    } else {
      // Ajouter une nouvelle ligne
      const newLigne: DevisLigne = {
        materialId: material.id,
        nom: material.nom,
        reference: material.reference,
        categorie: material.categorie,
        quantite,
        prixUnitaire: material.prixUnitaire,
        total: quantite * material.prixUnitaire,
      };
      setLignes([...lignes, newLigne]);
    }

    setSelectedMaterialId('');
    setQuantite(1);
  };

  const handleRemoveLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };

  const handleUpdateQuantite = (index: number, newQuantite: number) => {
    if (newQuantite <= 0) return;
    const updatedLignes = [...lignes];
    updatedLignes[index] = {
      ...updatedLignes[index],
      quantite: newQuantite,
      total: newQuantite * updatedLignes[index].prixUnitaire,
    };
    setLignes(updatedLignes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      lignes,
      mainDoeuvre,
      montant: montantTotal,
      stockDeduit: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dateDevis">Date du devis</Label>
        <Input
          id="dateDevis"
          type="date"
          value={formData.dateDevis}
          onChange={(e) => setFormData({ ...formData, dateDevis: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="objet">Objet du devis</Label>
        <Input
          id="objet"
          value={formData.objet}
          onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
          placeholder="Ex: Installation vidéosurveillance"
        />
      </div>

      {/* Infos entreprise modifiables */}
      <div className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border">
        <Label className="text-sm font-medium">Informations de l'entreprise</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="entrepriseNom" className="text-xs text-muted-foreground">Nom</Label>
            <Input id="entrepriseNom" value={formData.entrepriseNom} onChange={(e) => setFormData({ ...formData, entrepriseNom: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="entrepriseAdresse" className="text-xs text-muted-foreground">Adresse</Label>
            <Input id="entrepriseAdresse" value={formData.entrepriseAdresse} onChange={(e) => setFormData({ ...formData, entrepriseAdresse: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="entrepriseTelephone" className="text-xs text-muted-foreground">Téléphone</Label>
            <Input id="entrepriseTelephone" value={formData.entrepriseTelephone} onChange={(e) => setFormData({ ...formData, entrepriseTelephone: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="entrepriseEmail" className="text-xs text-muted-foreground">Email</Label>
            <Input id="entrepriseEmail" value={formData.entrepriseEmail} onChange={(e) => setFormData({ ...formData, entrepriseEmail: e.target.value })} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label htmlFor="entrepriseSite" className="text-xs text-muted-foreground">Site web</Label>
            <Input id="entrepriseSite" value={formData.entrepriseSite} onChange={(e) => setFormData({ ...formData, entrepriseSite: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Option</Label>
        <Select
          value={formData.option}
          onValueChange={(value: DevisOption) =>
            setFormData({ ...formData, option: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DEVIS_OPTION_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sélection des matériels */}
      <div className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium">Matériels du devis</Label>
        </div>

        {materials.length > 0 ? (
          <div className="flex gap-2">
            <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sélectionner un matériel..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(materialsByCategory).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                      {MATERIAL_CATEGORY_LABELS[category as keyof typeof MATERIAL_CATEGORY_LABELS]}
                    </div>
                    {items.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.nom} - {material.prixUnitaire.toLocaleString()} FCFA
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              value={quantite}
              onChange={(e) => setQuantite(parseInt(e.target.value) || 1)}
              className="w-20"
              placeholder="Qté"
            />
            <Button
              type="button"
              size="icon"
              onClick={handleAddMaterial}
              disabled={!selectedMaterialId}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucun matériel dans la base. Ajoutez-en dans la section Matériels.
          </p>
        )}

        {/* Liste des lignes du devis */}
        {lignes.length > 0 && (
          <ScrollArea className="max-h-48">
            <div className="space-y-2">
              {lignes.map((ligne, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-md bg-background border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ligne.nom}</p>
                    <p className="text-xs text-muted-foreground">
                      {ligne.prixUnitaire.toLocaleString()} FCFA × {ligne.quantite}
                    </p>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    value={ligne.quantite}
                    onChange={(e) =>
                      handleUpdateQuantite(index, parseInt(e.target.value) || 1)
                    }
                    className="w-16 h-8 text-center"
                  />
                  <span className="text-sm font-medium w-24 text-right">
                    {ligne.total.toLocaleString()} F
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveLigne(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Main-d'œuvre */}
        <div className="space-y-2 pt-2 border-t border-border">
          <Label htmlFor="mainDoeuvre" className="text-sm">Main-d'œuvre (FCFA)</Label>
          <Input
            id="mainDoeuvre"
            type="number"
            min={0}
            value={mainDoeuvre || ''}
            onChange={(e) => setMainDoeuvre(parseInt(e.target.value) || 0)}
            placeholder="Ex: 50000"
          />
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="font-medium">Total</span>
          <span className="text-lg font-bold text-primary">
            {montantTotal.toLocaleString()} FCFA
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Statut</Label>
        <Select
          value={formData.statut}
          onValueChange={(value: DevisStatus) =>
            setFormData({ ...formData, statut: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
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

      <div className="flex items-center justify-between py-2">
        <Label htmlFor="acompteRecu" className="cursor-pointer">
          Acompte reçu
        </Label>
        <Switch
          id="acompteRecu"
          checked={formData.acompteRecu}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, acompteRecu: checked })
          }
        />
      </div>

      {formData.acompteRecu && (
        <div className="space-y-2 animate-slide-up">
          <Label htmlFor="montantAcompte">Montant de l'acompte (FCFA)</Label>
          <Input
            id="montantAcompte"
            type="number"
            value={formData.montantAcompte || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                montantAcompte: parseInt(e.target.value) || 0,
              })
            }
            placeholder="Ex: 100000"
          />
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" className="flex-1">
          {devis ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}