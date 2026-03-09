import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, UserCheck, Phone, Mail, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { EMPLOYEE_ROLE_LABELS, Employee } from '@/types';
import { toast } from 'sonner';

export default function Employees() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

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

      <div className="container max-w-lg mx-auto px-4 py-6 space-y-6">
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

        {filtered.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="Aucun employé"
            description="Ajoutez votre premier employé"
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((emp) => (
              <Card key={emp.id} className="relative group hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{emp.prenom} {emp.nom}</CardTitle>
                      {emp.poste && (
                        <p className="text-sm text-muted-foreground">{emp.poste}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={emp.statut === 'actif' ? 'default' : 'secondary'}>
                        {emp.statut === 'actif' ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Badge variant="outline">
                        {EMPLOYEE_ROLE_LABELS[emp.role]}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {emp.telephone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{emp.telephone}</span>
                      </div>
                    )}
                    {emp.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{emp.email}</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => setEditingEmployee(emp)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => setDeletingEmployee(emp)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
