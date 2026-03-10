import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FolderKanban, Pencil, Trash2, CheckCircle2, Clock, Pause, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClients, useProjects } from '@/hooks/useErpData';
import { Project, ProjectStatus, PROJECT_STATUS_LABELS } from '@/types/erp';
import { toast } from 'sonner';

const statusIcons: Record<ProjectStatus, React.ReactNode> = {
  en_cours: <Clock className="h-3 w-3" />,
  termine: <CheckCircle2 className="h-3 w-3" />,
  en_pause: <Pause className="h-3 w-3" />,
  annule: <XCircle className="h-3 w-3" />,
};

export default function Projets() {
  const { clients, getClient } = useClients();
  const { projects, addProject, deleteProject } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const filtered = projects
    .filter(p => {
      const matchSearch = p.nom.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.statut === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAdd = (data: Parameters<typeof addProject>[0]) => {
    addProject(data);
    setShowForm(false);
    toast.success('Projet créé');
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title="Projets" subtitle={`${projects.length} projet${projects.length > 1 ? 's' : ''}`}
        action={<Button size="sm" onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" />Nouveau</Button>}
      />
      <main className="p-4 space-y-4 max-w-lg mx-auto">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProjectStatus | 'all')}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {Object.entries(PROJECT_STATUS_LABELS).map(([k, l]) => (
                <SelectItem key={k} value={k}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={FolderKanban} title="Aucun projet" description="Créez votre premier projet" />
        ) : (
          <div className="space-y-3">
            {filtered.map(project => {
              const client = project.clientId ? getClient(project.clientId) : null;
              const totalTasks = project.taches.length;
              const doneTasks = project.taches.filter(t => t.statut === 'fait').length;
              const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

              return (
                <Link key={project.id} to={`/projets/${project.id}`}>
                  <Card className="hover:shadow-md transition-smooth">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">{project.code}</Badge>
                            <Badge variant={project.statut === 'en_cours' ? 'default' : project.statut === 'termine' ? 'outline' : 'secondary'} className="text-xs flex items-center gap-1">
                              {statusIcons[project.statut]}{PROJECT_STATUS_LABELS[project.statut]}
                            </Badge>
                          </div>
                          <h3 className="font-semibold">{project.nom}</h3>
                          {client && <p className="text-xs text-muted-foreground">{client.nom}</p>}
                        </div>
                        <div className="text-right">
                          {project.budget > 0 && (
                            <p className="text-sm font-semibold">{project.budget.toLocaleString('fr-FR')} F</p>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeletingProject(project); }}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      {totalTasks > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{doneTasks}/{totalTasks} tâches</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
          <SheetHeader className="mb-4"><SheetTitle>Nouveau projet</SheetTitle></SheetHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            <ProjectForm clients={clients} onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deletingProject} onOpenChange={() => setDeletingProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer "{deletingProject?.nom}" ?</AlertDialogTitle>
            <AlertDialogDescription>Toutes les tâches seront supprimées.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deletingProject) { deleteProject(deletingProject.id); setDeletingProject(null); toast.success('Projet supprimé'); }}} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
