import { useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Wrench, TrendingUp, Clock, Download, Upload, AlertTriangle, Search, ShoppingCart, FolderKanban, Package, Boxes, Receipt, UserPlus, ArrowRight, CalendarClock } from 'lucide-react';
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
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, differenceInDays, differenceInHours } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fr } from 'date-fns/locale';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { GlobalSearch } from '@/components/GlobalSearch';
import { useCompanySettings } from '@/hooks/useCompanySettings';

export default function Dashboard() {
  const { settings } = useCompanySettings();
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
    .filter((invoice) => invoice.statut === 'overdue' || (invoice.statut !== 'paid' && new Date(invoice.dateEcheance) < new Date()))
    .reduce((sum, invoice) => sum + invoice.montantTTC, 0);
  const criticalStock = materials.filter((material) => material.stockQuantite <= material.stockMinimum).length;
  const activeProjects = projects.filter((project) => project.statut === 'en_cours').length;
  const monthlyTarget = Number(localStorage.getItem('allntic_objectif_mensuel') || 0);
  const targetProgress = monthlyTarget > 0 ? Math.min(100, Math.round((totalRevenue / monthlyTarget) * 100)) : 0;
  const now = new Date();
  const deadlineAlerts = [
    ...invoices.filter((invoice) => invoice.statut !== 'paid' && differenceInHours(new Date(invoice.dateEcheance), now) <= 72).map((invoice) => ({
      id: `invoice-${invoice.id}`, to: '/factures', label: `Facture ${invoice.numero}`, detail: new Date(invoice.dateEcheance) < now ? 'Échéance dépassée' : `Échéance ${format(new Date(invoice.dateEcheance), 'dd MMM', { locale: fr })}`, urgent: new Date(invoice.dateEcheance) < now,
    })),
    ...interventions.filter((item) => item.statut === 'a_faire' && differenceInHours(new Date(item.datePrevue), now) <= 72).map((item) => ({
      id: `intervention-${item.id}`, to: '/interventions', label: `${item.type} à planifier`, detail: format(new Date(item.datePrevue), 'dd MMM à HH:mm', { locale: fr }), urgent: new Date(item.datePrevue) < now,
    })),
    ...pendingDevis.filter((devis) => differenceInDays(now, new Date(devis.dateDevis)) >= 5).map((devis) => ({
      id: `devis-${devis.id}`, to: '/devis', label: `Devis ${devis.id.slice(0, 8).toUpperCase()}`, detail: differenceInDays(now, new Date(devis.dateDevis)) >= 7 ? 'Relance en retard' : 'Relance à préparer', urgent: differenceInDays(now, new Date(devis.dateDevis)) >= 7,
    })),
  ].sort((a, b) => Number(b.urgent) - Number(a.urgent)).slice(0, 4);

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

      <PageHeader title={settings.nom} subtitle="Centre de pilotage" action={<div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => setShowSearch(true)} aria-label="Rechercher"><Search /></Button><Button size="icon" variant="ghost" onClick={handleImportClick} aria-label="Importer"><Upload /></Button><Button size="icon" variant="ghost" onClick={handleExport} aria-label="Sauvegarder"><Download /></Button></div>} />

      <main className="p-4 lg:p-8 max-w-7xl mx-auto space-y-5">
        <header><h2 className="text-2xl lg:text-3xl font-bold">Priorités du jour</h2><p className="text-sm text-muted-foreground mt-1">Décidez et agissez depuis un seul écran.</p></header>
        {showExportReminder && <Alert className="bg-warning/10 border-warning/30"><Download className="h-4 w-4 text-warning"/><AlertDescription className="flex items-center justify-between gap-3"><span>{daysSinceExport === null ? 'Pensez à sauvegarder vos données régulièrement' : `Dernière sauvegarde il y a ${daysSinceExport} jours`}</span><Button size="sm" variant="outline" onClick={handleExport}>Exporter</Button></AlertDescription></Alert>}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Card className="col-span-2 lg:row-span-2 overflow-hidden border-0 bg-primary text-primary-foreground shadow-lg relative circuit-pattern">
            <CardContent className="p-5 lg:p-7 relative z-10 flex h-full min-h-56 flex-col justify-between">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-accent">Chiffre d'affaires signé</p><p className="text-2xl lg:text-4xl font-bold mt-2">{totalRevenue.toLocaleString('fr-FR')} <span className="text-sm font-medium">FCFA</span></p></div><TrendingUp className="h-7 w-7 text-accent"/></div>
              <div className="h-24 mt-6"><ResponsiveContainer width="100%" height="100%"><BarChart data={revenueByMonth}><Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[3,3,0,0]}/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:10, fill:'hsl(var(--primary-foreground))'}}/></BarChart></ResponsiveContainer></div>
            </CardContent>
          </Card>
          <StatCard icon={FileText} label="Devis à relancer" value={pendingDevis.length} variant="warning" />
          <StatCard icon={Wrench} label="Interventions" value={upcomingInterventions.length} />
          <StatCard icon={Users} label="Prospects" value={prospects.length} variant="primary" />
          <StatCard icon={FolderKanban} label="Projets actifs" value={activeProjects} />

          <Card className="col-span-2 lg:col-span-2 border-destructive/20"><CardContent className="p-5 flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase text-destructive">Impayés à suivre</p><p className="text-2xl font-bold mt-1">{overdueTotal.toLocaleString('fr-FR')} FCFA</p><p className="text-xs text-muted-foreground mt-1">{invoices.filter(i => i.statut === 'overdue').length} facture(s) signalée(s)</p></div><Receipt className="h-9 w-9 text-destructive"/></CardContent></Card>
          <Card className="col-span-2 bg-primary text-primary-foreground border-0"><CardContent className="p-5 flex items-center gap-5"><div className="h-16 w-16 shrink-0 rounded-full border-8 border-accent/30 flex items-center justify-center font-bold">{targetProgress}%</div><div><p className="font-bold">Objectif mensuel</p><p className="text-xs text-primary-foreground/70 mt-1">{monthlyTarget ? `${totalRevenue.toLocaleString('fr-FR')} sur ${monthlyTarget.toLocaleString('fr-FR')} FCFA` : 'Définissez votre objectif dans Pilotage'}</p></div></CardContent></Card>

          <Card className="col-span-2 lg:col-span-2"><CardHeader className="pb-3"><CardTitle className="text-base">Actions rapides</CardTitle></CardHeader><CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-2">{[
            {to:'/prospects', icon:UserPlus, label:'Nouveau prospect'}, {to:'/devis', icon:FileText, label:'Créer un devis'}, {to:'/interventions', icon:Wrench, label:'Planifier'}
          ].map(({to,icon:Icon,label}) => <Button key={label} asChild variant="secondary" className="justify-start h-12"><Link to={to}><Icon />{label}</Link></Button>)}</CardContent></Card>

          <Card className="col-span-2 lg:col-span-2 border-warning/30"><CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><CalendarClock className="h-4 w-4 text-warning"/>Échéances à surveiller</CardTitle></CardHeader><CardContent className="space-y-1">{deadlineAlerts.length ? deadlineAlerts.map((alert) => <Link key={alert.id} to={alert.to} className="flex items-center justify-between gap-3 rounded-md p-2 hover:bg-muted"><div className="min-w-0"><p className="text-sm font-semibold truncate">{alert.label}</p><p className={alert.urgent ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>{alert.detail}</p></div><ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground"/></Link>) : <p className="text-sm text-muted-foreground py-2">Aucune échéance urgente dans les 72 heures.</p>}</CardContent></Card>

          <Card className="col-span-2 lg:col-span-2"><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/>Activité récente</CardTitle></CardHeader><CardContent className="space-y-2">{recentProspects.length ? recentProspects.map((prospect) => <Link key={prospect.id} to={`/prospects/${prospect.id}`} className="flex items-center justify-between p-2 rounded-md hover:bg-muted"><div><p className="text-sm font-semibold">{prospect.nomStructure}</p><p className="text-xs text-muted-foreground">{format(new Date(prospect.updatedAt), 'dd MMM', {locale:fr})}</p></div><StatusBadge status={prospect.statut}/></Link>) : <p className="text-sm text-muted-foreground">Aucune activité récente.</p>}</CardContent></Card>

          <Card className="col-span-2 lg:col-span-4"><CardContent className="p-4 grid grid-cols-3 sm:grid-cols-6 gap-2">{[
            {to:'/prospects',icon:Users,label:'Prospects'}, {to:'/devis',icon:FileText,label:'Devis'}, {to:'/interventions',icon:Wrench,label:'Interventions'}, {to:'/ventes',icon:ShoppingCart,label:'Ventes'}, {to:'/stock',icon:Boxes,label:`Stock ${criticalStock}`}, {to:'/pilotage',icon:Package,label:'Pilotage'}
          ].map(({to,icon:Icon,label}) => <Button key={to} asChild variant="ghost" className="h-20 flex-col gap-2"><Link to={to}><Icon className="text-primary"/><span className="text-xs">{label}</span></Link></Button>)}</CardContent></Card>
        </section>
      </main>
    </div>
  );
}
