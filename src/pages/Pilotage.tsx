import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDevis, useInvoices, useProspects, useExpenses, useMaterials } from '@/hooks/useData';
import { useVentes, useClients } from '@/hooks/useErpData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuditLog } from '@/hooks/useAuditLog';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

const fmt = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} FCFA`;
const daysSince = (d: string) => Math.floor((Date.now() - new Date(d).getTime()) / 86400000);

interface Relance { devisId: string; date: string; note: string }
interface Garantie { id: string; materiel: string; client: string; dateFin: string; statut: 'garantie' | 'retour_sav' | 'repare'; notes: string }

export default function Pilotage() {
  const { devisList } = useDevis();
  const { invoices } = useInvoices();
  const { prospects } = useProspects();
  const { expenses } = useExpenses();
  const { materials, updateMaterial } = useMaterials();
  const { ventes } = useVentes();
  const { clients } = useClients();
  const { addEntry } = useAuditLog();

  const [relances, setRelances] = useLocalStorage<Relance[]>('allntic_relances_devis', []);
  const [objectif, setObjectif] = useLocalStorage<number>('allntic_objectif_mensuel', 0);
  const [garanties, setGaranties] = useLocalStorage<Garantie[]>('allntic_garanties', []);
  const [comptage, setComptage] = useState<Record<string, string>>({});
  const [g, setG] = useState({ materiel: '', client: '', dateFin: '', notes: '' });

  const prospectName = (id: string) => prospects.find((p) => p.id === id)?.nomStructure || '—';
  const clientName = (inv: { clientId?: string; prospectId: string }) =>
    inv.clientId ? clients.find((c) => c.id === inv.clientId)?.nom || '—' : prospectName(inv.prospectId);

  // Relances
  const aRelancer = devisList
    .filter((d) => d.statut === 'envoye')
    .map((d) => {
      const last = relances.filter((r) => r.devisId === d.id).sort((a, b) => b.date.localeCompare(a.date))[0];
      const ref = last?.date || d.dateDevis;
      return { d, last, jours: daysSince(ref), nb: relances.filter((r) => r.devisId === d.id).length };
    })
    .sort((a, b) => b.jours - a.jours);

  const relancer = (devisId: string) => {
    setRelances((prev) => [...prev, { devisId, date: new Date().toISOString(), note: '' }]);
    addEntry('update', 'devis', devisId, devisId, 'Relance devis');
    toast.success('Relance enregistrée');
  };

  // Encaissements par client
  const impayes = useMemo(() => {
    const map = new Map<string, { nom: string; total: number; retard: number }>();
    invoices.filter((i) => i.statut !== 'paid' && i.statut !== 'draft').forEach((i) => {
      const nom = clientName(i);
      const e = map.get(nom) || { nom, total: 0, retard: 0 };
      e.total += i.montantTTC || i.montantHT;
      if (new Date(i.dateEcheance) < new Date()) e.retard += i.montantTTC || i.montantHT;
      map.set(nom, e);
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices, clients, prospects]);

  // Objectifs
  const mois = new Date().toISOString().slice(0, 7);
  const realise =
    ventes.filter((v) => v.statut === 'validee' && v.dateVente.startsWith(mois)).reduce((s, v) => s + v.total, 0) +
    devisList.filter((d) => d.statut === 'accepte' && d.dateDevis.startsWith(mois)).reduce((s, d) => s + d.montant, 0);
  const pct = objectif > 0 ? Math.min(100, (realise / objectif) * 100) : 0;

  // Trésorerie
  const now = Date.now();
  const entrees = (jours: number) =>
    invoices
      .filter((i) => i.statut !== 'paid' && new Date(i.dateEcheance).getTime() <= now + jours * 86400000)
      .reduce((s, i) => s + (i.montantTTC || i.montantHT), 0);
  const troisMois = expenses.filter((e) => daysSince(e.dateDepense) <= 90).reduce((s, e) => s + e.montant, 0);
  const sortieMensuelle = troisMois / 3;

  // Inventaire
  const ecarts = materials
    .filter((m) => comptage[m.id] !== undefined && comptage[m.id] !== '')
    .map((m) => ({ m, reel: Number(comptage[m.id]), ecart: Number(comptage[m.id]) - m.stockQuantite }))
    .filter((x) => x.ecart !== 0);

  const validerInventaire = () => {
    ecarts.forEach(({ m, reel, ecart }) => {
      updateMaterial(m.id, { stockQuantite: reel });
      addEntry('update', 'material', m.id, m.nom, `Inventaire : écart ${ecart > 0 ? '+' : ''}${ecart}`);
    });
    setComptage({});
    toast.success(`${ecarts.length} article(s) ajusté(s)`);
  };

  const ajouterGarantie = () => {
    if (!g.materiel || !g.dateFin) return toast.error('Matériel et date de fin requis');
    setGaranties((prev) => [{ id: crypto.randomUUID(), statut: 'garantie', ...g }, ...prev]);
    setG({ materiel: '', client: '', dateFin: '', notes: '' });
    toast.success('Garantie ajoutée');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">Pilotage</h1>
        <Tabs defaultValue="relances">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="relances">Relances</TabsTrigger>
            <TabsTrigger value="impayes">Impayés</TabsTrigger>
            <TabsTrigger value="objectif">Objectif</TabsTrigger>
            <TabsTrigger value="treso">Trésorerie</TabsTrigger>
            <TabsTrigger value="inventaire">Inventaire</TabsTrigger>
            <TabsTrigger value="sav">SAV</TabsTrigger>
          </TabsList>

          <TabsContent value="relances" className="space-y-2">
            {aRelancer.length === 0 && <p className="text-muted-foreground text-sm">Aucun devis en attente.</p>}
            {aRelancer.map(({ d, jours, nb }) => (
              <Card key={d.id}><CardContent className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <Link to={`/prospects/${d.prospectId}`} className="font-medium truncate block">{prospectName(d.prospectId)}</Link>
                  <p className="text-xs text-muted-foreground">{d.objet} · {fmt(d.montant)} · {nb} relance(s)</p>
                  {jours >= 3 ? <Badge variant="destructive">À relancer ({jours} j)</Badge> : <Badge variant="secondary">{jours} j</Badge>}
                </div>
                <Button size="sm" onClick={() => relancer(d.id)}>Relancé</Button>
              </CardContent></Card>
            ))}
          </TabsContent>

          <TabsContent value="impayes" className="space-y-2">
            {impayes.length === 0 && <p className="text-muted-foreground text-sm">Aucun impayé.</p>}
            {impayes.map((c) => (
              <Card key={c.nom}><CardContent className="p-3 flex justify-between">
                <span className="font-medium">{c.nom}</span>
                <div className="text-right">
                  <p className="font-semibold whitespace-nowrap">{fmt(c.total)}</p>
                  {c.retard > 0 && <p className="text-xs text-destructive whitespace-nowrap">En retard : {fmt(c.retard)}</p>}
                </div>
              </CardContent></Card>
            ))}
          </TabsContent>

          <TabsContent value="objectif">
            <Card><CardHeader><CardTitle>Objectif du mois</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input type="number" value={objectif || ''} placeholder="Objectif CA (FCFA)" onChange={(e) => setObjectif(Number(e.target.value))} />
                <Progress value={pct} />
                <p className="text-sm">Réalisé : <b>{fmt(realise)}</b> / {fmt(objectif)} ({pct.toFixed(0)} %)</p>
                {objectif > realise && <p className="text-sm text-muted-foreground">Reste : {fmt(objectif - realise)}</p>}
              </CardContent></Card>
          </TabsContent>

          <TabsContent value="treso">
            <Card><CardContent className="p-4 space-y-2 text-sm">
              {[30, 60, 90].map((j) => (
                <div key={j} className="flex justify-between border-b border-border pb-2">
                  <span>À {j} jours</span>
                  <span className="text-right whitespace-nowrap">
                    +{fmt(entrees(j))} / −{fmt(sortieMensuelle * (j / 30))}<br />
                    <b>Solde : {fmt(entrees(j) - sortieMensuelle * (j / 30))}</b>
                  </span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Entrées = factures à encaisser. Sorties = moyenne des dépenses des 3 derniers mois.</p>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="inventaire" className="space-y-2">
            <p className="text-sm text-muted-foreground">Saisissez les quantités comptées, puis validez.</p>
            {materials.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <span className="flex-1 text-sm truncate">{m.nom}</span>
                <span className="text-xs text-muted-foreground w-16 text-right">Théo. {m.stockQuantite}</span>
                <Input className="w-20" type="number" value={comptage[m.id] ?? ''} onChange={(e) => setComptage({ ...comptage, [m.id]: e.target.value })} />
              </div>
            ))}
            {ecarts.length > 0 && (
              <Card><CardContent className="p-3 space-y-1 text-sm">
                {ecarts.map(({ m, ecart }) => <p key={m.id}>{m.nom} : <b className={ecart < 0 ? 'text-destructive' : ''}>{ecart > 0 ? '+' : ''}{ecart}</b></p>)}
                <Button className="w-full mt-2" onClick={validerInventaire}>Appliquer les écarts</Button>
              </CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="sav" className="space-y-2">
            <Card><CardContent className="p-3 space-y-2">
              <Input placeholder="Matériel / n° de série" value={g.materiel} onChange={(e) => setG({ ...g, materiel: e.target.value })} />
              <Input placeholder="Client" value={g.client} onChange={(e) => setG({ ...g, client: e.target.value })} />
              <Input type="date" value={g.dateFin} onChange={(e) => setG({ ...g, dateFin: e.target.value })} />
              <Input placeholder="Notes" value={g.notes} onChange={(e) => setG({ ...g, notes: e.target.value })} />
              <Button className="w-full" onClick={ajouterGarantie}>Ajouter</Button>
            </CardContent></Card>
            {garanties.map((x) => {
              const reste = -daysSince(x.dateFin);
              return (
                <Card key={x.id}><CardContent className="p-3 flex justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{x.materiel}</p>
                    <p className="text-xs text-muted-foreground">{x.client} · fin {new Date(x.dateFin).toLocaleDateString('fr-FR')}</p>
                    {reste < 0 ? <Badge variant="destructive">Expirée</Badge> : reste <= 30 ? <Badge variant="destructive">Expire dans {reste} j</Badge> : <Badge variant="secondary">{reste} j restants</Badge>}
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <select className="text-xs bg-background border border-border rounded p-1" value={x.statut}
                      onChange={(e) => setGaranties((p) => p.map((y) => y.id === x.id ? { ...y, statut: e.target.value as Garantie['statut'] } : y))}>
                      <option value="garantie">Sous garantie</option>
                      <option value="retour_sav">Retour SAV</option>
                      <option value="repare">Réparé</option>
                    </select>
                    <Button size="icon" variant="ghost" onClick={() => setGaranties((p) => p.filter((y) => y.id !== x.id))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent></Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
