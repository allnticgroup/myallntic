import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, Trash2, Plus, CheckCircle2, Clock, Circle, ShoppingCart, Receipt, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { VenteForm } from '@/components/forms/VenteForm';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClients, useProjects, useVentes } from '@/hooks/useErpData';
import { useExpenses, useMaterials } from '@/hooks/useData';
import { PROJECT_STATUS_LABELS, TASK_PRIORITY_LABELS, TaskStatus, TaskPriority, VENTE_STATUS_LABELS } from '@/types/erp';
import { toast } from 'sonner';

export default function ProjetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, getClient } = useClients();
  const { projects, getProject, updateProject, deleteProject, addTask, updateTask, deleteTask } = useProjects();
  const { ventes, addVente, getVentesForClient } = useVentes();
  const { expenses, addExpense } = useExpenses();
  const { materials } = useMaterials();

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddVente, setShowAddVente] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('normale');

  const project = id ? getProject(id) : undefined;

  const projectVentes = useMemo(
    () => (project ? ventes.filter(v => v.projectId === project.id) : []),
    [ventes, project]
  );
  const projectExpenses = useMemo(
    () => (project ? expenses.filter(e => e.projectId === project.id) : []),
    [expenses, project]
  );

  if (!project) {
    return (
      <div className="min-h-screen pb-20">
        <PageHeader title="Projet introuvable" />
        <main className="p-4 text-center">
          <Button onClick={() => navigate('/projets')}>Retour</Button>
        </main>
      </div>
    );
  }

  const client = project.clientId ? getClient(project.clientId) : null;
  const totalTasks = project.taches.length;
  const doneTasks = project.taches.filter(t => t.statut === 'fait').length;
  const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

  const revenusValides = projectVentes.filter(v => v.statut === 'validee').reduce((s, v) => s + v.total, 0);
  const depensesTotales = projectExpenses.reduce((s, e) => s + e.montant, 0);
  const marge = revenusValides - depensesTotales;
  const budgetUtilise = project.budget > 0 ? (depensesTotales / project.budget) * 100 : 0;

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask(project.id, {
      titre: newTaskTitle,
      statut: 'a_faire',
      priorite: newTaskPriority,
      notes: '',
    });
    setNewTaskTitle('');
    setNewTaskPriority('normale');
    setShowAddTask(false);
    toast.success('Tâche ajoutée');
  };

  const cycleTaskStatus = (taskId: string, current: TaskStatus) => {
    const next: Record<TaskStatus, TaskStatus> = { a_faire: 'en_cours', en_cours: 'fait', fait: 'a_faire' };
    updateTask(project.id, taskId, { statut: next[current] });
  };

  const statusIcon = (s: TaskStatus) => {
    if (s === 'fait') return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (s === 'en_cours') return <Clock className="h-4 w-4 text-warning" />;
    return <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  const priorityColor = (p: TaskPriority) => {
    if (p === 'urgente') return 'destructive';
    if (p === 'haute') return 'default';
    return 'secondary';
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title={project.nom} subtitle={project.code}
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowEdit(true)}><Edit className="h-4 w-4" /></Button>
            <Button size="sm" variant="destructive" onClick={() => setShowDelete(true)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        }
      />
      <main className="p-4 space-y-4 max-w-lg mx-auto">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge>{PROJECT_STATUS_LABELS[project.statut]}</Badge>
              {client && <Badge variant="outline">{client.nom}</Badge>}
            </div>
            {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Début: </span>{format(new Date(project.dateDebut), 'dd/MM/yyyy')}</div>
              {project.dateFin && <div><span className="text-muted-foreground">Fin: </span>{format(new Date(project.dateFin), 'dd/MM/yyyy')}</div>}
              {project.budget > 0 && <div><span className="text-muted-foreground">Budget: </span>{project.budget.toLocaleString('fr-FR')} F</div>}
            </div>
            {totalTasks > 0 && (
              <div className="pt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progression: {doneTasks}/{totalTasks}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rentabilité */}
        <Card className="bg-gradient-to-br from-primary/5 to-success/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />Rentabilité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Revenus</p>
                <p className="text-sm font-bold text-success">+{revenusValides.toLocaleString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dépenses</p>
                <p className="text-sm font-bold text-destructive">-{depensesTotales.toLocaleString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Marge</p>
                <p className={`text-sm font-bold ${marge >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {marge >= 0 ? '+' : ''}{marge.toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
            {project.budget > 0 && (
              <div className="pt-2 border-t">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Budget consommé</span>
                  <span className={budgetUtilise > 100 ? 'text-destructive font-semibold' : ''}>{Math.round(budgetUtilise)}%</span>
                </div>
                <Progress value={Math.min(100, budgetUtilise)} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tâches */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Tâches</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowAddTask(true)}>
                <Plus className="h-4 w-4 mr-1" />Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {project.taches.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune tâche</p>
            ) : (
              project.taches.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted group">
                  <button onClick={() => cycleTaskStatus(task.id, task.statut)}>
                    {statusIcon(task.statut)}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.statut === 'fait' ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                      {task.titre}
                    </p>
                  </div>
                  <Badge variant={priorityColor(task.priorite)} className="text-xs">{TASK_PRIORITY_LABELS[task.priorite]}</Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteTask(project.id, task.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Ventes liées */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />Ventes ({projectVentes.length})
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowAddVente(true)}>
                <Plus className="h-4 w-4 mr-1" />Vente
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {projectVentes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune vente liée</p>
            ) : (
              projectVentes.map(v => (
                <Link key={v.id} to="/ventes" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                  <div>
                    <p className="text-sm font-medium">{v.code}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(v.dateVente), 'dd MMM yyyy', { locale: fr })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{v.total.toLocaleString('fr-FR')} F</p>
                    <Badge variant={v.statut === 'validee' ? 'default' : 'secondary'} className="text-xs">{VENTE_STATUS_LABELS[v.statut]}</Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Dépenses liées */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4" />Dépenses ({projectExpenses.length})
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowAddExpense(true)}>
                <Plus className="h-4 w-4 mr-1" />Dépense
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {projectExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune dépense liée</p>
            ) : (
              projectExpenses.map(e => (
                <div key={e.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{e.libelle}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(e.dateDepense), 'dd MMM yyyy', { locale: fr })}</p>
                  </div>
                  <p className="text-sm font-semibold text-destructive shrink-0">-{e.montant.toLocaleString('fr-FR')} F</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>

      <Sheet open={showAddTask} onOpenChange={setShowAddTask}>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader className="mb-4"><SheetTitle>Nouvelle tâche</SheetTitle></SheetHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Nom de la tâche" />
            </div>
            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select value={newTaskPriority} onValueChange={(v: TaskPriority) => setNewTaskPriority(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TASK_PRIORITY_LABELS).map(([k, l]) => (
                    <SelectItem key={k} value={k}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowAddTask(false)} className="flex-1">Annuler</Button>
              <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()} className="flex-1">Ajouter</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showAddVente} onOpenChange={setShowAddVente}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
          <SheetHeader className="mb-4"><SheetTitle>Nouvelle vente liée</SheetTitle></SheetHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            <VenteForm
              clients={clients}
              materials={materials}
              projects={projects}
              defaultProjectId={project.id}
              onSubmit={(data) => {
                addVente({ ...data, projectId: project.id, clientId: data.clientId || project.clientId || '' });
                setShowAddVente(false);
                toast.success('Vente créée et liée au projet');
              }}
              onCancel={() => setShowAddVente(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showAddExpense} onOpenChange={setShowAddExpense}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
          <SheetHeader className="mb-4"><SheetTitle>Nouvelle dépense liée</SheetTitle></SheetHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            <ExpenseForm
              projects={projects}
              defaultProjectId={project.id}
              onSubmit={(data) => {
                addExpense({ ...data, projectId: project.id });
                setShowAddExpense(false);
                toast.success('Dépense créée et liée au projet');
              }}
              onCancel={() => setShowAddExpense(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showEdit} onOpenChange={setShowEdit}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
          <SheetHeader className="mb-4"><SheetTitle>Modifier le projet</SheetTitle></SheetHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            <ProjectForm project={project} clients={clients} onSubmit={(data) => { updateProject(project.id, data); setShowEdit(false); toast.success('Projet modifié'); }} onCancel={() => setShowEdit(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce projet ?</AlertDialogTitle>
            <AlertDialogDescription>
              {project.taches.length} tâche(s), {projectVentes.length} vente(s) et {projectExpenses.length} dépense(s) sont liées à ce projet. Les ventes et dépenses ne seront pas supprimées mais perdront leur lien.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => { deleteProject(project.id); navigate('/projets'); toast.success('Projet supprimé'); }} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
