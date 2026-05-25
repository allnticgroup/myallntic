import { useState, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet, Receipt, CreditCard, Trash2, Edit2, FileText, Users, Download, ChevronLeft, ChevronRight, Bell, Phone, Mail, AlertTriangle } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, addDays, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/StatCard';
import { PaymentForm } from '@/components/forms/PaymentForm';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import { usePayments, useExpenses, useInvoices, useProspects, useDevis, useSalaries, useEmployees } from '@/hooks/useData';
import { Payment, Expense, Invoice, PAYMENT_MODE_LABELS, EXPENSE_CATEGORY_LABELS, INVOICE_STATUS_LABELS, SALARY_TYPE_LABELS, CONTRACT_TYPE_LABELS } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { toast } from 'sonner';
import { generateBulletinPdf } from '@/lib/generateBulletinPdf';
import { generateReceiptPdf } from '@/lib/generateReceiptPdf';


export default function Finances() {
  const { payments, addPayment, updatePayment, deletePayment } = usePayments();
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { invoices, addInvoice, updateInvoice, deleteInvoice, generateInvoiceNumber } = useInvoices();
  const { prospects } = useProspects();
  const { devisList } = useDevis();
  const { salaries } = useSalaries();
  const { employees } = useEmployees();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | undefined>();
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [selectedPeriode, setSelectedPeriode] = useState(new Date().toISOString().slice(0, 7));

  // Stats
  const totalRevenue = payments.reduce((sum, p) => sum + p.montant, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.montant, 0);
  const totalSalaries = salaries.reduce((sum, s) => sum + s.montant, 0);
  const balance = totalRevenue - totalExpenses - totalSalaries;
  const pendingInvoices = invoices.filter(i => i.statut === 'sent' || i.statut === 'overdue').length;

  // Chart data: Revenue vs Expenses by month
  const financialByMonth = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const monthRevenue = payments
        .filter(p => isWithinInterval(new Date(p.datePaiement), { start, end }))
        .reduce((sum, p) => sum + p.montant, 0);

      const monthExpenses = expenses
        .filter(e => isWithinInterval(new Date(e.dateDepense), { start, end }))
        .reduce((sum, e) => sum + e.montant, 0);

      months.push({
        name: format(date, 'MMM', { locale: fr }),
        revenus: monthRevenue,
        depenses: monthExpenses,
      });
    }
    return months;
  }, [payments, expenses]);

  // Expense by category
  const expensesByCategory = useMemo(() => {
    const byCategory: Record<string, number> = {};
    expenses.forEach(e => {
      byCategory[e.categorie] = (byCategory[e.categorie] || 0) + e.montant;
    });
    return Object.entries(byCategory).map(([cat, amount]) => ({
      name: EXPENSE_CATEGORY_LABELS[cat as keyof typeof EXPENSE_CATEGORY_LABELS] || cat,
      value: amount,
    }));
  }, [expenses]);

  // Salaries by selected period
  const salariesByPeriod = useMemo(() => {
    return salaries.filter(s => s.periode === selectedPeriode);
  }, [salaries, selectedPeriode]);

  const totalSalariesPeriod = salariesByPeriod.reduce((sum, s) => sum + s.montant, 0);

  // Get employee name
  const getEmployeeName = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp ? `${emp.prenom} ${emp.nom}` : 'Employé inconnu';
  };

  const getEmployee = (employeeId: string) => {
    return employees.find(e => e.id === employeeId);
  };

  // Navigate period
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const [year, month] = selectedPeriode.split('-').map(Number);
    const date = new Date(year, month - 1);
    if (direction === 'prev') {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    setSelectedPeriode(format(date, 'yyyy-MM'));
  };

  // Generate bulletin
  const handleGenerateBulletin = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    const employeeSalaries = salariesByPeriod.filter(s => s.employeeId === employeeId);
    
    generateBulletinPdf({
      employee,
      salaries: employeeSalaries,
      periode: selectedPeriode,
      entreprise: {
        nom: 'ALLNTIC',
        adresse: 'Dakar, Sénégal',
        telephone: '+221 77 000 00 00',
      },
    });
    
    toast.success('Bulletin de salaire généré');
  };

  const handleAddPayment = (data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingPayment) {
      updatePayment(editingPayment.id, data);
      toast.success('Paiement modifié');
    } else {
      addPayment(data);
      toast.success('Paiement ajouté');
    }
    setShowPaymentForm(false);
    setEditingPayment(undefined);
  };

  const handleAddExpense = (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, data);
      toast.success('Dépense modifiée');
    } else {
      addExpense(data);
      toast.success('Dépense ajoutée');
    }
    setShowExpenseForm(false);
    setEditingExpense(undefined);
  };

  const handleCreateInvoice = (devisId: string) => {
    const devis = devisList.find(d => d.id === devisId);
    if (!devis) return;

    const invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
      numero: generateInvoiceNumber(),
      devisId,
      prospectId: devis.prospectId,
      montantHT: devis.montant,
      montantTTC: devis.montant,
      dateEmission: new Date().toISOString().split('T')[0],
      dateEcheance: addDays(new Date(), 30).toISOString().split('T')[0],
      statut: 'draft',
    };
    addInvoice(invoice);
    toast.success(`Facture ${invoice.numero} créée`);
  };

  const getProspectName = (prospectId: string) => {
    return prospects.find(p => p.id === prospectId)?.nomStructure || 'Client inconnu';
  };

  const getProspect = (prospectId: string) => prospects.find(p => p.id === prospectId);

  // ===== Reçu PDF =====
  const handleGenerateReceipt = async (payment: Payment) => {
    const clientName = getProspectName(payment.prospectId);
    const devis = devisList.find(d => d.id === payment.devisId);
    const invoice = devis ? invoices.find(i => i.devisId === devis.id) : undefined;
    await generateReceiptPdf(payment, clientName, invoice?.numero);
    toast.success('Reçu PDF généré');
  };

  // ===== Encaissements & Relances =====
  const encaissementsStats = useMemo(() => {
    const totalEncaisse = payments.reduce((sum, p) => sum + p.montant, 0);
    const totalFacture = invoices.reduce((sum, i) => sum + i.montantTTC, 0);
    const totalImpaye = invoices
      .filter(i => i.statut !== 'paid')
      .reduce((sum, i) => sum + i.montantTTC, 0);
    const totalEnRetard = invoices
      .filter(i => i.statut === 'overdue')
      .reduce((sum, i) => sum + i.montantTTC, 0);
    const tauxEncaissement = totalFacture > 0 ? (totalEncaisse / totalFacture) * 100 : 0;
    return { totalEncaisse, totalFacture, totalImpaye, totalEnRetard, tauxEncaissement };
  }, [payments, invoices]);

  const relances = useMemo(() => {
    const today = new Date();
    return invoices
      .filter(i => i.statut === 'sent' || i.statut === 'overdue')
      .map(i => {
        const prospect = getProspect(i.prospectId);
        const joursRetard = differenceInDays(today, new Date(i.dateEcheance));
        return { invoice: i, prospect, joursRetard };
      })
      .sort((a, b) => b.joursRetard - a.joursRetard);
  }, [invoices, prospects]);

  const encaissementsParClient = useMemo(() => {
    const map = new Map<string, { name: string; encaisse: number; impaye: number }>();
    invoices.forEach(i => {
      const name = getProspectName(i.prospectId);
      const entry = map.get(i.prospectId) || { name, encaisse: 0, impaye: 0 };
      if (i.statut === 'paid') entry.encaisse += i.montantTTC;
      else entry.impaye += i.montantTTC;
      map.set(i.prospectId, entry);
    });
    return Array.from(map.values())
      .filter(e => e.encaisse > 0 || e.impaye > 0)
      .sort((a, b) => b.impaye - a.impaye);
  }, [invoices, prospects]);

  const buildRelanceMessage = (clientName: string, numero: string, montant: number, joursRetard: number) => {
    const intro = joursRetard > 0
      ? `Bonjour ${clientName}, nous vous rappelons que la facture ${numero} d'un montant de ${montant.toLocaleString('fr-FR')} FCFA est en retard de ${joursRetard} jour(s).`
      : `Bonjour ${clientName}, nous vous rappelons que la facture ${numero} d'un montant de ${montant.toLocaleString('fr-FR')} FCFA arrive à échéance.`;
    return `${intro} Merci de bien vouloir procéder au règlement dans les meilleurs délais.`;
  };

  const handleRelanceWhatsApp = (clientName: string, numero: string, montant: number, joursRetard: number, telephone: string) => {
    const msg = buildRelanceMessage(clientName, numero, montant, joursRetard);
    const phone = telephone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleRelanceEmail = (clientName: string, numero: string, montant: number, joursRetard: number, email: string) => {
    const msg = buildRelanceMessage(clientName, numero, montant, joursRetard);
    const subject = `Relance facture ${numero}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
  };


  return (
    <div className="min-h-screen pb-20">
      <PageHeader title="Finances" subtitle="Gestion financière" />

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="text-[10px] px-1">Tableau</TabsTrigger>
            <TabsTrigger value="payments" className="text-[10px] px-1">Revenus</TabsTrigger>
            <TabsTrigger value="relances" className="text-[10px] px-1">Relances</TabsTrigger>
            <TabsTrigger value="expenses" className="text-[10px] px-1">Dépenses</TabsTrigger>
            <TabsTrigger value="salaries" className="text-[10px] px-1">Salaires</TabsTrigger>
            <TabsTrigger value="invoices" className="text-[10px] px-1">Factures</TabsTrigger>
          </TabsList>


          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={TrendingUp} label="Revenus" value={`${(totalRevenue / 1000).toFixed(0)}k`} variant="success" />
              <StatCard icon={TrendingDown} label="Dépenses" value={`${(totalExpenses / 1000).toFixed(0)}k`} variant="warning" />
              <StatCard icon={Users} label="Salaires" value={`${(totalSalaries / 1000).toFixed(0)}k`} variant="default" />
            </div>

            <Card className={`${balance >= 0 ? 'bg-gradient-to-br from-success/10 to-success/5 border-success/20' : 'bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${balance >= 0 ? 'bg-success/20' : 'bg-destructive/20'}`}>
                    <Wallet className={`h-5 w-5 ${balance >= 0 ? 'text-success' : 'text-destructive'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Solde</p>
                    <p className="text-xl font-bold">{balance.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Encaissements - dashboard paiements */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Encaissements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-xs text-muted-foreground">Encaissé</p>
                    <p className="text-base font-bold text-success">{encaissementsStats.totalEncaisse.toLocaleString('fr-FR')} F</p>
                  </div>
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-xs text-muted-foreground">Impayé</p>
                    <p className="text-base font-bold text-warning">{encaissementsStats.totalImpaye.toLocaleString('fr-FR')} F</p>
                  </div>
                </div>
                {encaissementsStats.totalEnRetard > 0 && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">En retard</p>
                      <p className="text-sm font-bold text-destructive">{encaissementsStats.totalEnRetard.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab('relances')}>
                      Relancer
                    </Button>
                  </div>
                )}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Taux d'encaissement</span>
                    <span className="font-semibold">{encaissementsStats.tauxEncaissement.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success transition-all"
                      style={{ width: `${Math.min(100, encaissementsStats.tauxEncaissement)}%` }}
                    />
                  </div>
                </div>
                {encaissementsParClient.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium mb-2 text-muted-foreground">Top clients</p>
                    <div className="space-y-1.5">
                      {encaissementsParClient.slice(0, 5).map(c => (
                        <div key={c.name} className="flex items-center justify-between text-xs">
                          <span className="truncate flex-1">{c.name}</span>
                          <div className="flex gap-2 ml-2 shrink-0">
                            <span className="text-success">{(c.encaisse / 1000).toFixed(0)}k</span>
                            {c.impaye > 0 && <span className="text-warning">/ {(c.impaye / 1000).toFixed(0)}k</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>


            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenus vs Dépenses (6 mois)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialByMonth}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value: number) => [`${value.toLocaleString('fr-FR')} FCFA`]}
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Legend />
                      <Bar dataKey="revenus" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="depenses" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {expensesByCategory.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Dépenses par catégorie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {expensesByCategory.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between">
                        <span className="text-sm">{cat.name}</span>
                        <span className="text-sm font-medium">{cat.value.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4 mt-4">
            <Button onClick={() => { setEditingPayment(undefined); setShowPaymentForm(true); }} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Ajouter un paiement
            </Button>

            {payments.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Aucun paiement enregistré</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {[...payments].sort((a, b) => new Date(b.datePaiement).getTime() - new Date(a.datePaiement).getTime()).map((payment) => (
                  <Card key={payment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{getProspectName(payment.prospectId)}</p>
                          <p className="text-lg font-bold text-success">{payment.montant.toLocaleString('fr-FR')} FCFA</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{PAYMENT_MODE_LABELS[payment.modePaiement]}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(payment.datePaiement), 'dd MMM yyyy', { locale: fr })}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" title="Reçu PDF" onClick={() => handleGenerateReceipt(payment)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => { setEditingPayment(payment); setShowPaymentForm(true); }}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { deletePayment(payment.id); toast.success('Paiement supprimé'); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4 mt-4">
            <Button onClick={() => { setEditingExpense(undefined); setShowExpenseForm(true); }} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Ajouter une dépense
            </Button>

            {expenses.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Receipt className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Aucune dépense enregistrée</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {[...expenses].sort((a, b) => new Date(b.dateDepense).getTime() - new Date(a.dateDepense).getTime()).map((expense) => (
                  <Card key={expense.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{expense.libelle}</p>
                          <p className="text-lg font-bold text-warning">{expense.montant.toLocaleString('fr-FR')} FCFA</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary">{EXPENSE_CATEGORY_LABELS[expense.categorie]}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(expense.dateDepense), 'dd MMM yyyy', { locale: fr })}
                            </span>
                          </div>
                          {expense.fournisseur && (
                            <p className="text-xs text-muted-foreground mt-1">{expense.fournisseur}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => { setEditingExpense(expense); setShowExpenseForm(true); }}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { deleteExpense(expense.id); toast.success('Dépense supprimée'); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Salaries Tab */}
          <TabsContent value="salaries" className="space-y-4 mt-4">
            {/* Period Navigator */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="icon" onClick={() => navigatePeriod('prev')}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div className="text-center">
                    <p className="font-semibold capitalize">
                      {format(new Date(selectedPeriode + '-01'), 'MMMM yyyy', { locale: fr })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total: {totalSalariesPeriod.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => navigatePeriod('next')}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary by employee */}
            {(() => {
              const employeesWithSalaries = employees.filter(emp => 
                salariesByPeriod.some(s => s.employeeId === emp.id)
              );

              if (employeesWithSalaries.length === 0) {
                return (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>Aucun salaire versé ce mois</p>
                      <p className="text-xs mt-1">Les salaires sont ajoutés depuis la fiche employé</p>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <div className="space-y-3">
                  {employeesWithSalaries.map(employee => {
                    const empSalaries = salariesByPeriod.filter(s => s.employeeId === employee.id);
                    const empTotal = empSalaries.reduce((sum, s) => sum + s.montant, 0);

                    return (
                      <Card key={employee.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {employee.photo ? (
                                <img 
                                  src={employee.photo} 
                                  alt={`${employee.prenom} ${employee.nom}`}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-primary" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{employee.prenom} {employee.nom}</p>
                                <p className="text-xs text-muted-foreground">{employee.poste}</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleGenerateBulletin(employee.id)}
                            >
                              <Download className="h-4 w-4 mr-1" /> Bulletin
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {empSalaries.map(sal => (
                              <div key={sal.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {SALARY_TYPE_LABELS[sal.type]}
                                  </Badge>
                                  <span className="text-muted-foreground">
                                    {format(new Date(sal.datePaiement), 'dd/MM', { locale: fr })}
                                  </span>
                                </div>
                                <span className="font-medium">{sal.montant.toLocaleString('fr-FR')} FCFA</span>
                              </div>
                            ))}
                          </div>

                          <div className="border-t mt-3 pt-3 flex justify-between items-center">
                            <span className="text-sm font-medium">Total</span>
                            <span className="font-bold text-primary">{empTotal.toLocaleString('fr-FR')} FCFA</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              );
            })()}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4 mt-4">
            <Button asChild className="w-full">
              <a href="/factures">
                <FileText className="h-4 w-4 mr-2" /> Gérer les factures
              </a>
            </Button>

            {devisList.filter(d => d.statut === 'accepte' && !invoices.some(i => i.devisId === d.id)).length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-2">Devis acceptés sans facture :</p>
                  <div className="space-y-2">
                    {devisList
                      .filter(d => d.statut === 'accepte' && !invoices.some(i => i.devisId === d.id))
                      .map(devis => (
                        <div key={devis.id} className="flex items-center justify-between">
                          <span className="text-sm">{getProspectName(devis.prospectId)} - {devis.montant.toLocaleString('fr-FR')} FCFA</span>
                          <Button size="sm" onClick={() => handleCreateInvoice(devis.id)}>
                            <FileText className="h-4 w-4 mr-1" /> Facturer
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {invoices.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Aucune facture créée</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {[...invoices].sort((a, b) => new Date(b.dateEmission).getTime() - new Date(a.dateEmission).getTime()).map((invoice) => (
                  <Card key={invoice.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{invoice.numero}</p>
                          <p className="text-sm text-muted-foreground">{getProspectName(invoice.prospectId)}</p>
                          <p className="text-lg font-bold">{invoice.montantTTC.toLocaleString('fr-FR')} FCFA</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={invoice.statut === 'paid' ? 'default' : invoice.statut === 'overdue' ? 'destructive' : 'secondary'}>
                              {INVOICE_STATUS_LABELS[invoice.statut]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Échéance: {format(new Date(invoice.dateEcheance), 'dd MMM yyyy', { locale: fr })}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {invoice.statut !== 'paid' && (
                            <Button size="sm" variant="outline" onClick={() => { updateInvoice(invoice.id, { statut: 'paid' }); toast.success('Facture marquée comme payée'); }}>
                              Payée
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { deleteInvoice(invoice.id); toast.success('Facture supprimée'); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Payment Form Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPayment ? 'Modifier le paiement' : 'Nouveau paiement'}</DialogTitle>
          </DialogHeader>
          <PaymentForm
            payment={editingPayment}
            onSubmit={handleAddPayment}
            onCancel={() => { setShowPaymentForm(false); setEditingPayment(undefined); }}
          />
        </DialogContent>
      </Dialog>

      {/* Expense Form Dialog */}
      <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Modifier la dépense' : 'Nouvelle dépense'}</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            expense={editingExpense}
            onSubmit={handleAddExpense}
            onCancel={() => { setShowExpenseForm(false); setEditingExpense(undefined); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
