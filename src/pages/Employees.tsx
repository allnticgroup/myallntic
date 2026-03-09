import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, UserCheck, Phone, Banknote, MapPin, Briefcase, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { EmptyState } from '@/components/EmptyState';
import { EmployeeForm } from '@/components/forms/EmployeeForm';
import { useEmployees, useSalaries } from '@/hooks/useData';
import { EMPLOYEE_ROLE_LABELS, CONTRACT_TYPE_LABELS, Employee } from '@/types';
import { toast } from 'sonner';

const TEST_EMPLOYEE: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> = {
  prenom: 'Kouassi',
  nom: 'Diabaté',
  telephone: '+225 07 12 34 56 78',
  email: 'k.diabate@allntic.com',
  poste: 'Technicien Réseau Senior',
  role: 'technicien',
  statut: 'actif',
  dateEmbauche: '2022-03-15',
  adresse: '12 Rue des Cocotiers, Cocody',
  ville: 'Abidjan',
  typeContrat: 'cdi',
  salaireBase: 350000,
  dateFinContrat: undefined,
  numeroSecuriteSociale: 'CI-2022-0045-K',
  contactUrgence: 'Awa Diabaté (Épouse)',
  telephoneUrgence: '+225 05 98 76 54 32',
  notes: 'Employé exemplaire, certifié Cisco. Responsable des installations réseau à Cocody et Plateau.',
};

export default function Employees() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const { getTotalSalariesForEmployee } = useSalaries();
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  const filtered = employees.filter((e) => {
    const matchesSearch =
      `${e.prenom} ${e.nom}`.toLowerCase().includes(search.toLowerCase()) ||
      e.poste.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || e.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAdd = (data: Parameters<typeof addEmployee>[0]) => {
    addEmployee(data);
    setShowForm(false);
    toast.success('Employé ajouté');
  };

  const handleAddTestEmployee = () => {
    addEmployee(TEST_EMPLOYEE);
    toast.success('Employé test ajouté avec toutes les informations');
  };

  const handleUpdate = (data: Parameters<typeof addEmployee>[0]) => {
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, data);
      setEditingEmployee(null);
      toast.success('Employé modifié');
    }
  };

  const handleDelete = () => {
    if (deletingEmployee) {
      deleteEmployee(deletingEmployee.id);
      setDeletingEmployee(null);
      toast.success('Employé supprimé');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader
        title="Employés"
        subtitle={`${employees.length} employé${employees.length > 1 ? 's' : ''}`}
        action={
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nouveau
          </Button>
        }
      />

      <div className="container max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {Object.entries(EMPLOYEE_ROLE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Employee List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="Aucun employé"
            description="Ajoutez votre premier employé"
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((emp) => {
              const totalSalary = getTotalSalariesForEmployee(emp.id);
              return (
                <Link key={emp.id} to={`/employes/${emp.id}`}>
                  <Card className="hover:shadow-md transition-all hover:border-primary/20 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Avatar */}
                        <Avatar className="h-14 w-14 shrink-0">
                          <AvatarImage src={emp.photo} alt={`${emp.prenom} ${emp.nom}`} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(emp.prenom, emp.nom)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Name & Status */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-base truncate">
                                {emp.prenom} {emp.nom}
                              </h3>
                              {emp.poste && (
                                <p className="text-sm text-muted-foreground truncate">{emp.poste}</p>
                              )}
                            </div>
                            <Badge 
                              variant={emp.statut === 'actif' ? 'default' : 'secondary'}
                              className="shrink-0"
                            >
                              {emp.statut === 'actif' ? 'Actif' : 'Inactif'}
                            </Badge>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant="outline" className="text-xs">
                              {EMPLOYEE_ROLE_LABELS[emp.role]}
                            </Badge>
                            {emp.typeContrat && (
                              <Badge variant="outline" className="text-xs">
                                {CONTRACT_TYPE_LABELS[emp.typeContrat]}
                              </Badge>
                            )}
                          </div>

                          {/* Contact & Location */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            {emp.telephone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {emp.telephone}
                              </span>
                            )}
                            {emp.ville && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {emp.ville}
                              </span>
                            )}
                          </div>

                          {/* Salary Info */}
                          {(emp.salaireBase || totalSalary > 0) && (
                            <div className="flex items-center gap-4 pt-2 border-t text-xs">
                              {emp.salaireBase && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Briefcase className="h-3 w-3" />
                                  Base: {formatCurrency(emp.salaireBase)}
                                </span>
                              )}
                              {totalSalary > 0 && (
                                <span className="flex items-center gap-1 font-medium text-primary">
                                  <Banknote className="h-3 w-3" />
                                  Versé: {formatCurrency(totalSalary)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Add form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel employé</DialogTitle>
          </DialogHeader>
          <EmployeeForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit form */}
      <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'employé</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <EmployeeForm employee={editingEmployee} onSubmit={handleUpdate} onCancel={() => setEditingEmployee(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deletingEmployee} onOpenChange={() => setDeletingEmployee(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'employé ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. "{deletingEmployee?.prenom} {deletingEmployee?.nom}" sera supprimé.
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
