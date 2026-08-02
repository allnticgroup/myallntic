import { useState, useMemo } from 'react';
import { Search, Package, AlertTriangle, ArrowDownCircle, ArrowUpCircle, RotateCcw, Plus, Download, ScanLine } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMaterials } from '@/hooks/useData';
import { useStockMovements } from '@/hooks/useErpData';
import { MATERIAL_CATEGORY_LABELS, Material } from '@/types';
import { STOCK_MOVEMENT_LABELS, StockMovementType } from '@/types/erp';
import { toast } from 'sonner';

export default function Stock() {
  const { materials, updateMaterial } = useMaterials();
  const { movements, addMovement } = useStockMovements();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [movementData, setMovementData] = useState({
    materialId: '',
    type: 'entree' as StockMovementType,
    quantite: 0,
    notes: '',
  });

  const criticalStock = useMemo(() =>
    materials.filter(m => m.stockQuantite <= m.stockMinimum),
    [materials]
  );

  const filteredMaterials = materials.filter(m =>
    m.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const barcodeSupported = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  const handleScan = async () => {
    try {
      const Detector = (window as any).BarcodeDetector;
      const detector = new Detector();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      await video.play();
      setScanning(true);
      const stop = () => { stream.getTracks().forEach(t => t.stop()); setScanning(false); };
      const deadline = Date.now() + 15000;
      const loop = async () => {
        if (Date.now() > deadline) { stop(); toast.error('Aucun code détecté'); return; }
        try {
          const codes = await detector.detect(video);
          if (codes.length > 0) {
            const value = codes[0].rawValue as string;
            setSearchQuery(value);
            stop();
            const found = materials.find(m => m.reference.toLowerCase() === value.toLowerCase());
            toast.success(found ? `Produit trouvé : ${found.nom}` : `Code scanné : ${value}`);
            return;
          }
        } catch { /* ignore frame errors */ }
        requestAnimationFrame(loop);
      };
      loop();
    } catch {
      setScanning(false);
      toast.error("Impossible d'accéder à la caméra");
    }
  };

  const handleMovement = () => {
    const mat = materials.find(m => m.id === movementData.materialId);
    if (!mat) return;

    let newStock: number;
    if (movementData.type === 'entree') {
      newStock = mat.stockQuantite + movementData.quantite;
    } else if (movementData.type === 'sortie') {
      newStock = Math.max(0, mat.stockQuantite - movementData.quantite);
    } else {
      newStock = movementData.quantite; // inventaire = set directly
    }

    addMovement({
      materialId: mat.id,
      type: movementData.type,
      quantite: movementData.quantite,
      quantiteAvant: mat.stockQuantite,
      quantiteApres: newStock,
      reference: 'Manuel',
      notes: movementData.notes,
    });

    updateMaterial(mat.id, { stockQuantite: newStock });
    setShowMovementForm(false);
    setMovementData({ materialId: '', type: 'entree', quantite: 0, notes: '' });
    toast.success('Mouvement de stock enregistré');
  };

  const getIcon = (type: StockMovementType) => {
    if (type === 'entree') return <ArrowDownCircle className="h-4 w-4 text-success" />;
    if (type === 'sortie') return <ArrowUpCircle className="h-4 w-4 text-destructive" />;
    return <RotateCcw className="h-4 w-4 text-primary" />;
  };

  const stockValue = useMemo(
    () => materials.reduce((sum, m) => sum + (m.prixUnitaire || 0) * m.stockQuantite, 0),
    [materials]
  );

  const handleExportCsv = () => {
    const headers = ['Reference', 'Nom', 'Categorie', 'Stock', 'Minimum', 'PrixUnitaire', 'ValeurStock'];
    const rows = materials.map((m) => [
      m.reference,
      `"${m.nom.replace(/"/g, '""')}"`,
      MATERIAL_CATEGORY_LABELS[m.categorie],
      m.stockQuantite,
      m.stockMinimum,
      m.prixUnitaire || 0,
      (m.prixUnitaire || 0) * m.stockQuantite,
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventaire-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Inventaire exporté');
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title="Stock" subtitle={`${materials.length} produit${materials.length > 1 ? 's' : ''}`}
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExportCsv}><Download className="h-4 w-4 mr-1" />CSV</Button>
            <Button size="sm" onClick={() => setShowMovementForm(true)}><Plus className="h-4 w-4 mr-1" />Mouvement</Button>
          </div>
        }
      />
      <main className="p-4 space-y-4 max-w-lg mx-auto">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Valeur du stock</p>
              <p className="text-lg font-bold text-primary">{stockValue.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <Package className="h-6 w-6 text-primary/60" />
          </CardContent>
        </Card>
        {criticalStock.length > 0 && (
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <p className="font-semibold text-sm">{criticalStock.length} alerte{criticalStock.length > 1 ? 's' : ''} stock</p>
              </div>
              <div className="space-y-1">
                {criticalStock.slice(0, 5).map(m => (
                  <p key={m.id} className="text-xs text-muted-foreground">
                    {m.nom}: <span className="text-destructive font-medium">{m.stockQuantite}</span> / min {m.stockMinimum}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="inventaire">
          <TabsList className="w-full">
            <TabsTrigger value="inventaire" className="flex-1">Inventaire</TabsTrigger>
            <TabsTrigger value="mouvements" className="flex-1">Mouvements</TabsTrigger>
          </TabsList>

          <TabsContent value="inventaire" className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher (nom ou référence)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            {barcodeSupported && (
              <Button variant="outline" size="sm" className="w-full" onClick={handleScan} disabled={scanning}>
                <ScanLine className="h-4 w-4 mr-1" />{scanning ? 'Scan en cours...' : 'Scanner un code-barres'}
              </Button>
            )}
            {filteredMaterials.map(m => (
              <Card key={m.id} className={m.stockQuantite <= m.stockMinimum ? 'border-destructive/50' : ''}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{m.nom}</p>
                    <p className="text-xs text-muted-foreground">{MATERIAL_CATEGORY_LABELS[m.categorie]} · {m.reference}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${m.stockQuantite <= m.stockMinimum ? 'text-destructive' : ''}`}>
                      {m.stockQuantite}
                    </p>
                    <p className="text-xs text-muted-foreground">min: {m.stockMinimum}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="mouvements" className="space-y-3">
            {movements.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Aucun mouvement enregistré</p>
            ) : (
              movements.slice(0, 50).map(m => {
                const mat = materials.find(mt => mt.id === m.materialId);
                return (
                  <Card key={m.id}>
                    <CardContent className="p-3 flex items-center gap-3">
                      {getIcon(m.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{mat?.nom || 'Produit inconnu'}</p>
                        <p className="text-xs text-muted-foreground">{m.reference} · {format(new Date(m.createdAt), 'dd/MM/yy HH:mm', { locale: fr })}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={m.type === 'entree' ? 'default' : m.type === 'sortie' ? 'destructive' : 'secondary'} className="text-xs">
                          {m.type === 'entree' ? '+' : m.type === 'sortie' ? '-' : '='}{m.quantite}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{m.quantiteAvant} → {m.quantiteApres}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Sheet open={showMovementForm} onOpenChange={setShowMovementForm}>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader className="mb-4"><SheetTitle>Nouveau mouvement de stock</SheetTitle></SheetHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Produit *</Label>
              <Select value={movementData.materialId} onValueChange={(v) => setMovementData({ ...movementData, materialId: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {materials.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.nom} (Stock: {m.stockQuantite})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={movementData.type} onValueChange={(v: StockMovementType) => setMovementData({ ...movementData, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STOCK_MOVEMENT_LABELS).map(([k, l]) => (
                      <SelectItem key={k} value={k}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantité</Label>
                <Input type="number" min={0} value={movementData.quantite} onChange={(e) => setMovementData({ ...movementData, quantite: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={movementData.notes} onChange={(e) => setMovementData({ ...movementData, notes: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowMovementForm(false)} className="flex-1">Annuler</Button>
              <Button onClick={handleMovement} disabled={!movementData.materialId || movementData.quantite <= 0} className="flex-1">Enregistrer</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
