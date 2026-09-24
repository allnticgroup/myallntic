import { useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Wrench, TrendingUp, Clock, Download, Upload, AlertTriangle, Search, ShoppingCart, FolderKanban, Package, Boxes, UserCheck, Receipt, UserPlus } from 'lucide-react';
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
import { useProspects, useDevis, useInterventions, useMaterials, useInvoices } from '@/hooks/useData';
import { useClients, useVentes, useProjects } from '@/hooks/useErpData';
import { exportToJson, getAllData, generateExportFilename, readJsonFile, validateImportData, importData, sanitizeImportData, ImportData } from '@/lib/export';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, differenceInDays } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fr } from 'date-fns/locale';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { GlobalSearch } from '@/components/GlobalSearch';

export default function Dashboard() {
  const { prospects } = useProspects();
  const { devisList } = useDevis();
  const { interventions } = useInterventions();
  const { materials } = useMaterials();
  const { clients } = useClients();
  const { ventes } = useVentes();
  const { projects } = useProjects();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [pendingImport, setPendingImport] = useState<ImportData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [lastExportDate, setLastExportDate] = useState<string | null>(() => 
    localStorage.getItem('lastExportDate')
  );

  const daysSinceExport = lastExportDate 
    ? differenceInDays(new Date(), new Date(lastExportDate))
    : null;
  
  const showExportReminder = daysSinceExport === null || daysSinceExport >= 7;

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

  // Chart data: Revenue per month (last 6 months)
  const revenueByMonth = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      
      const monthRevenue = devisList
        .filter(d => d.statut === 'accepte' && isWithinInterval(new Date(d.dateDevis), { start, end }))
        .reduce((sum, d) => sum + d.montant, 0);
      
      months.push({
        name: format(date, 'MMM', { locale: fr }),
        revenue: monthRevenue,
      });
    }
    return months;
  }, [devisList]);

  // Chart data: Prospects by status
  const prospectsByStatus = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    prospects.forEach(p => {
      statusCounts[p.statut] = (statusCounts[p.statut] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: STATUS_LABELS[status as ProspectStatus] || status,
      value: count,
      status,
    }));
  }, [prospects]);

  const STATUS_COLORS: Record<string, string> = {
    prospect: 'hsl(var(--primary))',
    audit_prevu: 'hsl(var(--warning))',
    audit_realise: 'hsl(210, 70%, 50%)',
    devis_envoye: 'hsl(280, 70%, 50%)',
    signe: 'hsl(var(--success))',
    refuse: 'hsl(var(--destructive))',
  };

  // Chart data: Prospects per month (last 6 months)
  const prospectsByMonth = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      
      const monthProspects = prospects.filter(p => 
        isWithinInterval(new Date(p.createdAt), { start, end })
      ).length;
      
      months.push({
        name: format(date, 'MMM', { locale: fr }),
        prospects: monthProspects,
      });
    }
    return months;
  }, [prospects]);

  const handleExport = () => {
    const data = getAllData();
    const filename = generateExportFilename();
    exportToJson(data, filename);
    const now = new Date().toISOString();
    localStorage.setItem('lastExportDate', now);
    setLastExportDate(now);
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

  const confirmImport = (mode: 'replace' | 'merge') => {
    if (!pendingImport) return;

    // Sanitize data before import
    const { sanitized, skipped } = sanitizeImportData(pendingImport);
    const totalSkipped = skipped.prospects + skipped.devis + skipped.interventions;

    const result = importData(sanitized, mode);
    
    if (result.success) {
      let message = mode === 'merge' 
        ? `Ajouté: ${result.counts.prospects} prospects, ${result.counts.devis} devis, ${result.counts.interventions} interventions`
        : `Importé: ${result.counts.prospects} prospects, ${result.counts.devis} devis, ${result.counts.interventions} interventions`;
      if (totalSkipped > 0) {
        message += ` (${totalSkipped} éléments invalides ignorés)`;
      }
      toast.success(message);
      setShowConfirmDialog(false);
      setPendingImport(null);
      setImportMode('replace');
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

  const { invoices } = useInvoices();
  const overdueTotal = invoices
    .filter((invoice) => invoice.statut === 'late' || (invoice.statut !== 'paid' && new Date(invoice.dateEcheance) < new Date()))
    .reduce((sum, invoice) => sum + invoice.montantTTC, 0);
  const criticalStock = materials.filter((material) => material.stockQuantite <= material.stockMinimum).length;
  const activeProjects = projects.filter((project) => project.statut === 'en_cours').length;
  const monthlyTarget = Number(localStorage.getItem('allntic_objectif_mensuel') || 0);
  const targetProgress = monthlyTarget > 0 ? Math.min(100, Math.round((totalRevenue / monthlyTarget) * 100)) : 0;

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2">{hasExistingData && <AlertTriangle className="h-5 w-5 text-warning" />}Confirmer l'import</AlertDialogTitle>
            <AlertDialogDescription>{pendingImport ? `${pendingImport.data.prospects.length} prospects, ${pendingImport.data.devis.length} devis et ${pendingImport.data.interventions.length} interventions seront importés.` : ''}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={cancelImport}>Annuler</AlertDialogCancel>{hasExistingData && <Button variant="outline" onClick={() => confirmImport('merge')}>Fusionner</Button>}<AlertDialogAction onClick={() => confirmImport('replace')}>{hasExistingData ? 'Remplacer tout' : 'Importer'}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <GlobalSearch open={showSearch} onOpenChange={setShowSearch} />

      <PageHeader title="ALLNTIC GROUP" subtitle="Centre de pilotage" action={<div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => setShowSearch(true)} aria-label="Rechercher"><Search /></Button><Button size="icon" variant="ghost" onClick={handleImportClick} aria-label="Importer"><Upload /></Button><Button size="icon" variant="ghost" onClick={handleExport} aria-label="Sauvegarder"><Download /></Button></div>} />

      <main className="p-4 lg:p-8 max-w-7xl mx-auto space-y-5">
        <header><h2 className="text-2xl lg:text-3xl font-bold">Vue d'ensemble</h2><p className="text-sm text-muted-foreground mt-1">Les données essentielles de votre activité, aujourd'hui.</p></header>
        {showExportReminder && <Alert className="bg-warning/10 border-warning/30"><Download className="h-4 w-4 text-warning"/><AlertDescription className="flex items-center justify-between gap-3"><span>{daysSinceExport === null ? 'Pensez à sauvegarder vos données régulièrement' : `Dernière sauvegarde il y a ${daysSinceExport} jours`}</span><Button size="sm" variant="outline" onClick={handleExport}>Exporter</Button></AlertDescription></Alert>}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Card className="col-span-2 lg:row-span-2 overflow-hidden border-0 bg-primary text-primary-foreground shadow-lg relative circuit-pattern">
            <CardContent className="p-5 lg:p-7 relative z-10 flex h-full min-h-56 flex-col justify-between">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-accent">Chiffre d'affaires signé</p><p className="text-2xl lg:text-4xl font-bold mt-2">{totalRevenue.toLocaleString('fr-FR')} <span className="text-sm font-medium">FCFA</span></p></div><TrendingUp className="h-7 w-7 text-accent"/></div>
              <div className="h-24 mt-6"><ResponsiveContainer width="100%" height="100%"><BarChart data={revenueByMonth}><Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[3,3,0,0]}/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:10, fill:'hsl(var(--primary-foreground))'}}/></BarChart></ResponsiveContainer></div>
            </CardContent>
          </Card>
          <StatCard icon={UserCheck} label="Clients actifs" value={clients.length} variant="primary" />
          <StatCard icon={FolderKanban} label="Projets actifs" value={activeProjects} />
          <StatCard icon={FileText} label="Devis à relancer" value={pendingDevis.length} variant="warning" />
          <StatCard icon={Wrench} label="Interventions" value={upcomingInterventions.length} />

          <Card className="col-span-2 lg:col-span-2 border-destructive/20"><CardContent className="p-5 flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase text-destructive">Impayés à suivre</p><p className="text-2xl font-bold mt-1">{overdueTotal.toLocaleString('fr-FR')} FCFA</p><p className="text-xs text-muted-foreground mt-1">{invoices.filter(i => i.statut === 'late').length} facture(s) signalée(s)</p></div><Receipt className="h-9 w-9 text-destructive"/></CardContent></Card>
          <Card className="col-span-2 bg-primary text-primary-foreground border-0"><CardContent className="p-5 flex items-center gap-5"><div className="h-16 w-16 shrink-0 rounded-full border-8 border-accent/30 flex items-center justify-center font-bold">{targetProgress}%</div><div><p className="font-bold">Objectif mensuel</p><p className="text-xs text-primary-foreground/70 mt-1">{monthlyTarget ? `${totalRevenue.toLocaleString('fr-FR')} sur ${monthlyTarget.toLocaleString('fr-FR')} FCFA` : 'Définissez votre objectif dans Pilotage'}</p></div></CardContent></Card>

          <Card className="col-span-2 lg:col-span-2"><CardHeader className="pb-3"><CardTitle className="text-base">Actions rapides</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-2">{[
            {to:'/devis', icon:FileText, label:'Nouveau devis'}, {to:'/clients', icon:UserPlus, label:'Ajouter un client'}, {to:'/interventions', icon:Wrench, label:'Planifier'}, {to:'/factures', icon:Receipt, label:'Facturer'}
          ].map(({to,icon:Icon,label}) => <Button key={label} asChild variant="secondary" className="justify-start h-12"><Link to={to}><Icon />{label}</Link></Button>)}</CardContent></Card>

          <Card className="col-span-2 lg:col-span-2"><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/>Activité récente</CardTitle></CardHeader><CardContent className="space-y-2">{recentProspects.length ? recentProspects.map((prospect) => <Link key={prospect.id} to={`/prospects/${prospect.id}`} className="flex items-center justify-between p-2 rounded-md hover:bg-muted"><div><p className="text-sm font-semibold">{prospect.nomStructure}</p><p className="text-xs text-muted-foreground">{format(new Date(prospect.updatedAt), 'dd MMM', {locale:fr})}</p></div><StatusBadge status={prospect.statut}/></Link>) : <p className="text-sm text-muted-foreground">Aucune activité récente.</p>}</CardContent></Card>

          <Card className="col-span-2 lg:col-span-4"><CardContent className="p-4 grid grid-cols-3 sm:grid-cols-6 gap-2">{[
            {to:'/clients',icon:Users,label:'Clients'}, {to:'/ventes',icon:ShoppingCart,label:'Ventes'}, {to:'/stock',icon:Boxes,label:`Stock ${criticalStock}`}, {to:'/projets',icon:FolderKanban,label:'Projets'}, {to:'/rapports',icon:TrendingUp,label:'Rapports'}, {to:'/pilotage',icon:Package,label:'Pilotage'}
          ].map(({to,icon:Icon,label}) => <Button key={to} asChild variant="ghost" className="h-20 flex-col gap-2"><Link to={to}><Icon className="text-primary"/><span className="text-xs">{label}</span></Link></Button>)}</CardContent></Card>
        </section>
      </main>
    </div>
  );
}
