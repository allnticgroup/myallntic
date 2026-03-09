import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Phone, Mail, Briefcase, Calendar, Plus, Pencil, Trash2, Banknote, Wrench, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { PageHeader } from '@/components/PageHeader';
import { EmployeeForm } from '@/components/forms/EmployeeForm';
import { SalaryForm } from '@/components/forms/SalaryForm';
import { EmployeeDocumentForm } from '@/components/forms/EmployeeDocumentForm';
import { useEmployees, useSalaries, useInterventions, useProspects, useEmployeeDocuments } from '@/hooks/useData';
import { 
  EMPLOYEE_ROLE_LABELS, 
  SALARY_TYPE_LABELS, 
  PAYMENT_MODE_LABELS, 
  INTERVENTION_TYPE_LABELS,
  INTERVENTION_STATUS_LABELS,
  EMPLOYEE_DOCUMENT_TYPE_LABELS,
  Salary,
  EmployeeDocument
} from '@/types';
import { toast } from 'sonner';

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateEmployee, deleteEmployee, getEmployee } = useEmployees();
  const { addSalary, updateSalary, deleteSalary, getSalariesForEmployee, getTotalSalariesForEmployee } = useSalaries();
  const { getInterventionsForEmployee } = useInterventions();
  const { getProspect } = useProspects();
  const { addDocument, updateDocument, deleteDocument, getDocumentsForEmployee } = useEmployeeDocuments();

  const [editingEmployee, setEditingEmployee] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState(false);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [editingSalary, setEditingSalary] = useState<Salary | null>(null);
  const [deletingSalary, setDeletingSalary] = useState<Salary | null>(null);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<EmployeeDocument | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<EmployeeDocument | null>(null);

  const employee = getEmployee(id || '');
  const employeeSalaries = getSalariesForEmployee(id || '').sort(
    (a, b) => new Date(b.datePaiement).getTime() - new Date(a.datePaiement).getTime()
  );
  const totalPaid = getTotalSalariesForEmployee(id || '');
  const employeeInterventions = getInterventionsForEmployee(id || '').sort(
    (a, b) => new Date(b.datePrevue).getTime() - new Date(a.datePrevue).getTime()
  );
  const employeeDocuments = getDocumentsForEmployee(id || '').sort(
    (a, b) => new Date(b.dateDocument).getTime() - new Date(a.dateDocument).getTime()
  );

  // Check for expiring documents (within 30 days)
  const expiringDocs = employeeDocuments.filter(doc => {
    if (!doc.dateExpiration) return false;
    const expDate = new Date(doc.dateExpiration);
    const today = new Date();
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  });

  if (!employee) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <PageHeader title="Employé non trouvé" showBack />
        <div className="container max-w-lg mx-auto px-4 py-6">
          <p className="text-muted-foreground">Cet employé n'existe pas ou a été supprimé.</p>
        </div>
      </div>
    );
  }

  const handleUpdateEmployee = (data: Parameters<typeof updateEmployee>[1]) => {
    updateEmployee(employee.id, data);
    setEditingEmployee(false);
    toast.success('Employé modifié');
  };

  const handleDeleteEmployee = () => {
    deleteEmployee(employee.id);
    toast.success('Employé supprimé');
    navigate('/employes');
  };

  const handleAddSalary = (data: Parameters<typeof addSalary>[0]) => {
    addSalary(data);
    setShowSalaryForm(false);
    toast.success('Paiement ajouté');
  };

  const handleUpdateSalary = (data: Parameters<typeof addSalary>[0]) => {
    if (editingSalary) {
      updateSalary(editingSalary.id, data);
      setEditingSalary(null);
      toast.success('Paiement modifié');
    }
  };

  const handleDeleteSalary = () => {
    if (deletingSalary) {
      deleteSalary(deletingSalary.id);
      setDeletingSalary(null);
      toast.success('Paiement supprimé');
    }
  };

  const handleAddDocument = (data: Parameters<typeof addDocument>[0]) => {
    addDocument(data);
    setShowDocumentForm(false);
    toast.success('Document ajouté');
  };

  const handleUpdateDocument = (data: Parameters<typeof addDocument>[0]) => {
    if (editingDocument) {
      updateDocument(editingDocument.id, data);
      setEditingDocument(null);
      toast.success('Document modifié');
    }
  };

  const handleDeleteDocument = () => {
    if (deletingDocument) {
      deleteDocument(deletingDocument.id);
      setDeletingDocument(null);
      toast.success('Document supprimé');
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';

  const formatPeriode = (periode: string) => {
    const [year, month] = periode.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return format(date, 'MMMM yyyy', { locale: fr });
  };

  const isDocumentExpired = (dateExpiration?: string) => {
    if (!dateExpiration) return false;
    return new Date(dateExpiration) < new Date();
  };

  const isDocumentExpiringSoon = (dateExpiration?: string) => {
    if (!dateExpiration) return false;
    const expDate = new Date(dateExpiration);
    const today = new Date();
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader
        title={`${employee.prenom} ${employee.nom}`}
        subtitle={employee.poste || EMPLOYEE_ROLE_LABELS[employee.role]}
        showBack
        action={
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => setEditingEmployee(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setDeletingEmployee(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="container max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Expiring documents alert */}
        {expiringDocs.length > 0 && (
          <Card className="border-warning bg-warning/10">
            <CardContent className="py-3">
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {expiringDocs.length} document{expiringDocs.length > 1 ? 's' : ''} expire{expiringDocs.length > 1 ? 'nt' : ''} bientôt
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Informations</CardTitle>
              <Badge variant={employee.statut === 'actif' ? 'default' : 'secondary'}>
                {employee.statut === 'actif' ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {employee.telephone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${employee.telephone}`} className="text-primary">{employee.telephone}</a>
              </div>
            )}
            {employee.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${employee.email}`} className="text-primary">{employee.email}</a>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{EMPLOYEE_ROLE_LABELS[employee.role]}</span>
            </div>
            {employee.dateEmbauche && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Embauché le {format(new Date(employee.dateEmbauche), 'dd MMMM yyyy', { locale: fr })}</span>
              </div>
            )}
            {employee.notes && (
              <p className="text-sm text-muted-foreground pt-2 border-t">{employee.notes}</p>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="salaries" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="salaries" className="text-xs">
              <Banknote className="h-4 w-4 mr-1" />
              Salaires
            </TabsTrigger>
            <TabsTrigger value="interventions" className="text-xs">
              <Wrench className="h-4 w-4 mr-1" />
              Interventions
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs">
              <FileText className="h-4 w-4 mr-1" />
              Documents
            </TabsTrigger>
          </TabsList>

          {/* Salaries Tab */}
          <TabsContent value="salaries" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">Salaires & Paiements</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total versé : <span className="font-semibold text-foreground">{formatCurrency(totalPaid)}</span>
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setShowSalaryForm(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {employeeSalaries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Aucun paiement enregistré
                  </p>
                ) : (
                  <div className="space-y-3">
                    {employeeSalaries.map((salary) => (
                      <div
                        key={salary.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatCurrency(salary.montant)}</span>
                            <Badge variant="outline" className="text-xs">
                              {SALARY_TYPE_LABELS[salary.type]}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatPeriode(salary.periode)} • {PAYMENT_MODE_LABELS[salary.modePaiement]}
                          </div>
                          {salary.notes && (
                            <p className="text-xs text-muted-foreground">{salary.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingSalary(salary)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeletingSalary(salary)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interventions Tab */}
          <TabsContent value="interventions" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Historique des interventions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {employeeInterventions.length} intervention{employeeInterventions.length > 1 ? 's' : ''} assignée{employeeInterventions.length > 1 ? 's' : ''}
                </p>
              </CardHeader>
              <CardContent>
                {employeeInterventions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Aucune intervention assignée
                  </p>
                ) : (
                  <div className="space-y-3">
                    {employeeInterventions.map((intervention) => {
                      const prospect = getProspect(intervention.prospectId);
                      return (
                        <Link
                          key={intervention.id}
                          to={`/prospects/${intervention.prospectId}`}
                          className="block p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {INTERVENTION_TYPE_LABELS[intervention.type]}
                                </span>
                                <Badge 
                                  variant={intervention.statut === 'fait' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {INTERVENTION_STATUS_LABELS[intervention.statut]}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {prospect?.nomStructure || 'Client inconnu'} • {format(new Date(intervention.datePrevue), 'dd MMM yyyy', { locale: fr })}
                              </p>
                              {intervention.notes && (
                                <p className="text-xs text-muted-foreground line-clamp-1">{intervention.notes}</p>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">Documents</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {employeeDocuments.length} document{employeeDocuments.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setShowDocumentForm(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {employeeDocuments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Aucun document enregistré
                  </p>
                ) : (
                  <div className="space-y-3">
                    {employeeDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{doc.nom}</span>
                            <Badge variant="outline" className="text-xs">
                              {EMPLOYEE_DOCUMENT_TYPE_LABELS[doc.type]}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>{format(new Date(doc.dateDocument), 'dd MMM yyyy', { locale: fr })}</span>
                            {doc.dateExpiration && (
                              <>
                                <span>•</span>
                                <span className={
                                  isDocumentExpired(doc.dateExpiration) 
                                    ? 'text-destructive font-medium' 
                                    : isDocumentExpiringSoon(doc.dateExpiration)
                                      ? 'text-warning font-medium'
                                      : ''
                                }>
                                  {isDocumentExpired(doc.dateExpiration) 
                                    ? 'Expiré' 
                                    : `Expire le ${format(new Date(doc.dateExpiration), 'dd MMM yyyy', { locale: fr })}`
                                  }
                                </span>
                              </>
                            )}
                          </div>
                          {doc.notes && (
                            <p className="text-xs text-muted-foreground">{doc.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingDocument(doc)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeletingDocument(doc)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Employee Dialog */}
      <Dialog open={editingEmployee} onOpenChange={setEditingEmployee}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'employé</DialogTitle>
          </DialogHeader>
          <EmployeeForm
            employee={employee}
            onSubmit={handleUpdateEmployee}
            onCancel={() => setEditingEmployee(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Employee Dialog */}
      <AlertDialog open={deletingEmployee} onOpenChange={setDeletingEmployee}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'employé ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. "{employee.prenom} {employee.nom}" et tous ses paiements seront supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEmployee} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Salary Dialog */}
      <Dialog open={showSalaryForm} onOpenChange={setShowSalaryForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau paiement</DialogTitle>
          </DialogHeader>
          <SalaryForm
            employeeId={employee.id}
            onSubmit={handleAddSalary}
            onCancel={() => setShowSalaryForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Salary Dialog */}
      <Dialog open={!!editingSalary} onOpenChange={() => setEditingSalary(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le paiement</DialogTitle>
          </DialogHeader>
          {editingSalary && (
            <SalaryForm
              salary={editingSalary}
              employeeId={employee.id}
              onSubmit={handleUpdateSalary}
              onCancel={() => setEditingSalary(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Salary Dialog */}
      <AlertDialog open={!!deletingSalary} onOpenChange={() => setDeletingSalary(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce paiement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSalary} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Document Dialog */}
      <Dialog open={showDocumentForm} onOpenChange={setShowDocumentForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau document</DialogTitle>
          </DialogHeader>
          <EmployeeDocumentForm
            employeeId={employee.id}
            onSubmit={handleAddDocument}
            onCancel={() => setShowDocumentForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={!!editingDocument} onOpenChange={() => setEditingDocument(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le document</DialogTitle>
          </DialogHeader>
          {editingDocument && (
            <EmployeeDocumentForm
              document={editingDocument}
              employeeId={employee.id}
              onSubmit={handleUpdateDocument}
              onCancel={() => setEditingDocument(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Document Dialog */}
      <AlertDialog open={!!deletingDocument} onOpenChange={() => setDeletingDocument(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDocument} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
