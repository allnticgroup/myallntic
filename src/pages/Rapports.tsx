import { useState, useMemo } from 'react';
import { BarChart3, Download, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { useVentes, useClients } from '@/hooks/useErpData';
import { useDevis, useExpenses, useMaterials, usePayments } from '@/hooks/useData';
import { exportToCsv } from '@/lib/export';
import { toast } from 'sonner';

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--accent))',
  'hsl(var(--destructive))',
  'hsl(280, 60%, 55%)',
];

export default function Rapports() {
  const { ventes } = useVentes();
  const { clients } = useClients();
  const { devisList } = useDevis();
  const { expenses } = useExpenses();
  const { payments } = usePayments();
  const { materials } = useMaterials();
  const [period, setPeriod] = useState('6');

  const months = useMemo(() => {
    const n = parseInt(period);
    const result = [];
    for (let i = n - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      result.push({ date, start: startOfMonth(date), end: endOfMonth(date), label: format(date, 'MMM yy', { locale: fr }) });
    }
    return result;
  }, [period]);

  // Revenue from validated sales + accepted devis
  const revenueData = useMemo(() =>
    months.map(m => {
      const ventesRev = ventes
        .filter(v => v.statut === 'validee' && isWithinInterval(new Date(v.dateVente), { start: m.start, end: m.end }))
        .reduce((s, v) => s + v.total, 0);
      const devisRev = devisList
        .filter(d => d.statut === 'accepte' && isWithinInterval(new Date(d.dateDevis), { start: m.start, end: m.end }))
        .reduce((s, d) => s + d.montant, 0);
      const dep = expenses
        .filter(e => isWithinInterval(new Date(e.dateDepense), { start: m.start, end: m.end }))
        .reduce((s, e) => s + e.montant, 0);
      return { name: m.label, revenus: ventesRev + devisRev, depenses: dep, benefice: ventesRev + devisRev - dep };
    }),
    [months, ventes, devisList, expenses]
  );

  // Top selling products
  const topProducts = useMemo(() => {
    const counts: Record<string, { nom: string; qty: number; revenue: number }> = {};
    ventes.filter(v => v.statut === 'validee').forEach(v => {
      v.lignes.forEach(l => {
        if (!counts[l.materialId]) counts[l.materialId] = { nom: l.nom, qty: 0, revenue: 0 };
        counts[l.materialId].qty += l.quantite;
        counts[l.materialId].revenue += l.total;
      });
    });
    return Object.values(counts).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, [ventes]);

  // Expenses by category
  const expensesByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach(e => { cats[e.categorie] = (cats[e.categorie] || 0) + e.montant; });
    const labels: Record<string, string> = { materiel: 'Matériel', transport: 'Transport', personnel: 'Personnel', marketing: 'Marketing', autre: 'Autre' };
    return Object.entries(cats).map(([k, v]) => ({ name: labels[k] || k, value: v }));
  }, [expenses]);

  const totalRevenue = revenueData.reduce((s, d) => s + d.revenus, 0);
  const totalExpenses = revenueData.reduce((s, d) => s + d.depenses, 0);
  const totalBenefice = totalRevenue - totalExpenses;

  const handleExportReport = () => {
    const headers = ['Mois', 'Revenus (FCFA)', 'Dépenses (FCFA)', 'Bénéfice (FCFA)'];
    const rows = revenueData.map(d => [d.name, String(d.revenus), String(d.depenses), String(d.benefice)]);
    const date = new Date().toISOString().split('T')[0];
    exportToCsv([headers, ...rows], `rapport-financier-${date}.csv`);
    toast.success('Rapport exporté');
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title="Rapports" subtitle="Analyse de l'activité"
        action={<Button size="sm" variant="outline" onClick={handleExportReport}><Download className="h-4 w-4 mr-1" />Export CSV</Button>}
      />
      <main className="p-4 space-y-4 max-w-lg mx-auto">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 derniers mois</SelectItem>
            <SelectItem value="6">6 derniers mois</SelectItem>
            <SelectItem value="12">12 derniers mois</SelectItem>
          </SelectContent>
        </Select>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-5 w-5 text-success mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Revenus</p>
              <p className="font-bold text-sm">{(totalRevenue / 1000).toFixed(0)}k F</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <TrendingDown className="h-5 w-5 text-destructive mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Dépenses</p>
              <p className="font-bold text-sm">{(totalExpenses / 1000).toFixed(0)}k F</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <DollarSign className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Bénéfice</p>
              <p className={`font-bold text-sm ${totalBenefice >= 0 ? 'text-success' : 'text-destructive'}`}>{(totalBenefice / 1000).toFixed(0)}k F</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="ca">
          <TabsList className="w-full">
            <TabsTrigger value="ca" className="flex-1">CA</TabsTrigger>
            <TabsTrigger value="produits" className="flex-1">Produits</TabsTrigger>
            <TabsTrigger value="depenses" className="flex-1">Dépenses</TabsTrigger>
          </TabsList>

          <TabsContent value="ca">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Revenus vs Dépenses</CardTitle></CardHeader>
              <CardContent>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => [`${v.toLocaleString('fr-FR')} F`]} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Bar dataKey="revenus" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Revenus" />
                      <Bar dataKey="depenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Dépenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="mt-3">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Bénéfice</CardTitle></CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => [`${v.toLocaleString('fr-FR')} F`]} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Line type="monotone" dataKey="benefice" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} name="Bénéfice" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="produits">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Produits les plus vendus</CardTitle></CardHeader>
              <CardContent>
                {topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée de vente</p>
                ) : (
                  <div className="space-y-3">
                    {topProducts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                          <div>
                            <p className="text-sm font-medium">{p.nom}</p>
                            <p className="text-xs text-muted-foreground">{p.qty} vendus</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold">{p.revenue.toLocaleString('fr-FR')} F</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="depenses">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Répartition des dépenses</CardTitle></CardHeader>
              <CardContent>
                {expensesByCategory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Aucune dépense</p>
                ) : (
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={expensesByCategory} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                          {expensesByCategory.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => [`${v.toLocaleString('fr-FR')} F`]} contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                        <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
