import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Wrench, TrendingUp, Clock, CheckCircle2, Download, Upload, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
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
import { useProspects, useDevis, useInterventions } from '@/hooks/useData';
import { exportToJson, getAllData, generateExportFilename, readJsonFile, validateImportData, importData, ImportData } from '@/lib/export';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Dashboard() {
  const { prospects } = useProspects();
  const { devisList } = useDevis();
  const { interventions } = useInterventions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<ImportData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const activeProspects = prospects.filter(
    (p) => !['signe', 'refuse'].includes(p.statut)
  );
  const signedCount = prospects.filter((p) => p.statut === 'signe').length;
  const pendingDevis = devisList.filter((d) => d.statut === 'envoye');
  const upcomingInterventions = interventions.filter((i) => i.statut === 'a_faire');

  const totalRevenue = devisList
    .filter((d) => d.statut === 'accepte')
    .reduce((sum, d) => sum + d.montant, 0);

  const recentProspects = [...prospects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const handleExport = () => {
    const data = getAllData();
    const filename = generateExportFilename();
    exportToJson(data, filename);
    toast.success('Sauvegarde téléchargée');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await readJsonFile(file);
      
      if (!validateImportData(data)) {
        toast.error('Format de fichier invalide');
        e.target.value = '';
        return;
      }

      // Store pending import and show confirmation
      setPendingImport(data);
      setShowConfirmDialog(true);
    } catch (error) {
      toast.error('Fichier JSON invalide');
    }
    
    // Reset input
    e.target.value = '';
  };

  const confirmImport = () => {
    if (!pendingImport) return;

    const result = importData(pendingImport);
    
    if (result.success) {
      toast.success(
        `Importé: ${result.counts.prospects} prospects, ${result.counts.devis} devis, ${result.counts.interventions} interventions`
      );
      setShowConfirmDialog(false);
      setPendingImport(null);
      // Reload to reflect changes
      window.location.reload();
    } else {
      toast.error('Erreur lors de l\'import');
    }
  };

  const cancelImport = () => {
    setShowConfirmDialog(false);
    setPendingImport(null);
  };

  const hasExistingData = prospects.length > 0 || devisList.length > 0 || interventions.length > 0;

  return (
    <div className="min-h-screen pb-20">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Import Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {hasExistingData && <AlertTriangle className="h-5 w-5 text-warning" />}
              Confirmer l'import
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                {hasExistingData && (
                  <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <p className="text-sm font-medium text-warning">
                      Attention : vos données actuelles seront remplacées
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {prospects.length} prospects, {devisList.length} devis, {interventions.length} interventions
                    </p>
                  </div>
                )}
                
                {pendingImport && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-foreground">Données à importer :</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pendingImport.data.prospects.length} prospects, {pendingImport.data.devis.length} devis, {pendingImport.data.interventions.length} interventions
                    </p>
                    {pendingImport.exportDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Sauvegarde du {format(new Date(pendingImport.exportDate), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelImport}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>
              Importer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <PageHeader 
        title="ALLNTIC" 
        subtitle="Tableau de bord"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleImportClick}>
              <Upload className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <main className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Users}
            label="Prospects actifs"
            value={activeProspects.length}
            variant="primary"
          />
          <StatCard
            icon={CheckCircle2}
            label="Signés"
            value={signedCount}
            variant="success"
          />
          <StatCard
            icon={FileText}
            label="Devis en attente"
            value={pendingDevis.length}
            variant="warning"
          />
          <StatCard
            icon={Wrench}
            label="Interventions à faire"
            value={upcomingInterventions.length}
          />
        </div>

        {/* Revenue */}
        {totalRevenue > 0 && (
          <Card className="animate-slide-up bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/20">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CA signé</p>
                  <p className="text-xl font-bold text-foreground">
                    {totalRevenue.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {recentProspects.length > 0 && (
          <Card className="animate-slide-up">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentProspects.map((prospect) => (
                <Link
                  key={prospect.id}
                  to={`/prospects/${prospect.id}`}
                  className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-muted transition-smooth"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {prospect.nomStructure}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(prospect.updatedAt), 'dd MMM', { locale: fr })}
                    </p>
                  </div>
                  <StatusBadge status={prospect.statut} />
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/prospects">
            <Card className="transition-smooth hover:shadow-md hover:border-primary/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium text-sm">Prospects</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/interventions">
            <Card className="transition-smooth hover:shadow-md hover:border-primary/30">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Wrench className="h-5 w-5 text-accent" />
                </div>
                <span className="font-medium text-sm">Travaux</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
