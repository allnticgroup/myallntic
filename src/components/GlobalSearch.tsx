import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, UserCheck, Package, FileText, Wrench, ShoppingCart, FolderKanban, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useProspects } from '@/hooks/useData';
import { useClients, useProjects, useVentes } from '@/hooks/useErpData';

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  type: string;
  icon: React.ReactNode;
  path: string;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { prospects } = useProspects();
  const { clients } = useClients();
  const { projects } = useProjects();
  const { ventes } = useVentes();

  const results = useMemo<SearchResult[]>(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    const r: SearchResult[] = [];

    prospects.forEach(p => {
      if (p.nomStructure.toLowerCase().includes(q) || p.nomDecideur.toLowerCase().includes(q))
        r.push({ id: p.id, label: p.nomStructure, sublabel: p.nomDecideur, type: 'Prospect', icon: <Users className="h-4 w-4" />, path: `/prospects/${p.id}` });
    });

    clients.forEach(c => {
      if (c.nom.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
        r.push({ id: c.id, label: c.nom, sublabel: c.code, type: 'Client', icon: <UserCheck className="h-4 w-4" />, path: `/clients/${c.id}` });
    });

    projects.forEach(p => {
      if (p.nom.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
        r.push({ id: p.id, label: p.nom, sublabel: p.code, type: 'Projet', icon: <FolderKanban className="h-4 w-4" />, path: `/projets/${p.id}` });
    });

    ventes.forEach(v => {
      if (v.code.toLowerCase().includes(q))
        r.push({ id: v.id, label: v.code, sublabel: `${v.total.toLocaleString('fr-FR')} F`, type: 'Vente', icon: <ShoppingCart className="h-4 w-4" />, path: '/ventes' });
    });

    return r.slice(0, 10);
  }, [query, prospects, clients, projects, ventes]);

  const handleSelect = useCallback((path: string) => {
    navigate(path);
    onOpenChange(false);
    setQuery('');
  }, [navigate, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-md">
        <div className="flex items-center gap-2 p-3 border-b">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            placeholder="Rechercher partout..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 p-0 h-auto text-base"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')}><X className="h-4 w-4 text-muted-foreground" /></button>
          )}
        </div>
        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto p-2">
            {results.map(r => (
              <button
                key={`${r.type}-${r.id}`}
                onClick={() => handleSelect(r.path)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left transition-smooth"
              >
                <div className="text-muted-foreground">{r.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.sublabel}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{r.type}</span>
              </button>
            ))}
          </div>
        )}
        {query.length >= 2 && results.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">Aucun résultat</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
