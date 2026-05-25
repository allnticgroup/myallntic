import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Download, Phone, Mail, MapPin, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { ClientForm } from '@/components/forms/ClientForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useClients, useVentes } from '@/hooks/useErpData';
import { Client } from '@/types/erp';
import { Users } from 'lucide-react';
import { toast } from 'sonner';

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const { getVentesForClient } = useVentes();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const deletingVentes = deletingClient ? getVentesForClient(deletingClient.id) : [];

  const filtered = clients
    .filter(c => c.nom.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAdd = (data: Parameters<typeof addClient>[0]) => {
    addClient(data);
    setShowForm(false);
    toast.success('Client créé');
  };

  const handleUpdate = (data: Parameters<typeof addClient>[0]) => {
    if (editingClient) {
      updateClient(editingClient.id, data);
      setEditingClient(null);
      toast.success('Client modifié');
    }
  };

  const handleDelete = () => {
    if (deletingClient) {
      deleteClient(deletingClient.id);
      setDeletingClient(null);
      toast.success('Client supprimé');
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader title="Clients" subtitle={`${clients.length} client${clients.length > 1 ? 's' : ''}`}
        action={
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />Nouveau
          </Button>
        }
      />
      <main className="p-4 space-y-4 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher un client..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="Aucun client" description="Créez votre premier client" />
        ) : (
          <div className="space-y-3">
            {filtered.map((client) => (
              <Link key={client.id} to={`/clients/${client.id}`}>
                <Card className="hover:shadow-md transition-smooth">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs shrink-0">{client.code}</Badge>
                          <h3 className="font-semibold truncate">{client.nom}</h3>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {client.telephone && <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{client.telephone}</p>}
                          {client.email && <p className="flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</p>}
                          {client.ville && <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{client.ville}</p>}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingClient(client); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeletingClient(client); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
          <SheetHeader className="mb-4"><SheetTitle>Nouveau client</SheetTitle></SheetHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            <ClientForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl">
          <SheetHeader className="mb-4"><SheetTitle>Modifier le client</SheetTitle></SheetHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            {editingClient && <ClientForm client={editingClient} onSubmit={handleUpdate} onCancel={() => setEditingClient(null)} />}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deletingClient} onOpenChange={() => setDeletingClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le client ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action supprimera définitivement "{deletingClient?.nom}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
