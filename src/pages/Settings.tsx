import { useState, useRef } from 'react';
import { Building2, Upload, X, Plus, Trash2, Save, History, Clock, Search, Filter, Palette, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { SecuritySettings } from '@/components/SecuritySettings';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useAuditLog } from '@/hooks/useAuditLog';
import { AUDIT_ACTION_LABELS, AUDIT_ENTITY_LABELS, AuditEntity } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { OFFICIAL_BRAND, normalizeHex } from '@/lib/brandSettings';

export default function Settings() {
  const { settings, updateSettings } = useCompanySettings();
  const { entries, clearLog, addEntry } = useAuditLog();

  const [nom, setNom] = useState(settings.nom);
  const [adresse, setAdresse] = useState(settings.adresse);
  const [ville, setVille] = useState(settings.ville);
  const [telephone, setTelephone] = useState(settings.telephone);
  const [email, setEmail] = useState(settings.email);
  const [siteWeb, setSiteWeb] = useState(settings.siteWeb);
  const [numeroFiscal, setNumeroFiscal] = useState(settings.numeroFiscal || '');
  const [tauxTVA, setTauxTVA] = useState(settings.tauxTVA);
  const [services, setServices] = useState(settings.services);
  const [logo, setLogo] = useState(settings.logo);
  const [logoLight, setLogoLight] = useState(settings.logoLight || settings.logo);
  const [logoDark, setLogoDark] = useState(settings.logoDark || settings.logo);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || OFFICIAL_BRAND.primaryColor);
  const [accentColor, setAccentColor] = useState(settings.accentColor || OFFICIAL_BRAND.accentColor);
  const [darkColor, setDarkColor] = useState(settings.darkColor || OFFICIAL_BRAND.darkColor);
  const [documentFooter, setDocumentFooter] = useState(settings.documentFooter || 'Merci pour votre confiance.');
  const [documentTerms, setDocumentTerms] = useState(settings.documentTerms || 'Devis valable 7 jours. Acompte de 75% à la commande, solde à la livraison.');
  const [waveLink, setWaveLink] = useState(settings.waveLink || '');
  const [orangeMoneyLink, setOrangeMoneyLink] = useState(settings.orangeMoneyLink || '');
  const [ibanBancaire, setIbanBancaire] = useState(settings.ibanBancaire || '');
  const [banqueNom, setBanqueNom] = useState(settings.banqueNom || '');
  const [newService, setNewService] = useState('');
  const [clearConfirm, setClearConfirm] = useState(false);


  // Audit log filters
  const [auditSearch, setAuditSearch] = useState('');
  const [auditEntityFilter, setAuditEntityFilter] = useState<AuditEntity | 'all'>('all');

  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoLightInputRef = useRef<HTMLInputElement>(null);
  const logoDarkInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Le logo ne doit pas dépasser 2 Mo');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateSettings({
      nom, adresse, ville, telephone, email, siteWeb,
      numeroFiscal: numeroFiscal || undefined,
      tauxTVA, services, logo, logoLight, logoDark,
      primaryColor: normalizeHex(primaryColor, OFFICIAL_BRAND.primaryColor),
      accentColor: normalizeHex(accentColor, OFFICIAL_BRAND.accentColor),
      darkColor: normalizeHex(darkColor, OFFICIAL_BRAND.darkColor),
      documentFooter: documentFooter.trim(), documentTerms: documentTerms.trim(),
      waveLink: waveLink || undefined,
      orangeMoneyLink: orangeMoneyLink || undefined,
      ibanBancaire: ibanBancaire || undefined,
      banqueNom: banqueNom || undefined,
    });
    addEntry('update', 'company_settings', 'settings', nom, 'Paramètres entreprise mis à jour');
    toast.success('Paramètres sauvegardés');
  };


  const addService = () => {
    if (newService.trim()) {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = auditSearch === '' ||
      entry.entityLabel.toLowerCase().includes(auditSearch.toLowerCase()) ||
      (entry.details || '').toLowerCase().includes(auditSearch.toLowerCase());
    const matchesEntity = auditEntityFilter === 'all' || entry.entity === auditEntityFilter;
    return matchesSearch && matchesEntity;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'default';
      case 'update': return 'secondary';
      case 'delete': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="Paramètres" subtitle="Configuration de l'entreprise" showBack />

      <div className="container max-w-3xl mx-auto px-4 py-6">
        <Tabs defaultValue="entreprise" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="entreprise">
              <Building2 className="h-4 w-4 mr-2" />
              Entreprise
            </TabsTrigger>
            <TabsTrigger value="historique">
              <History className="h-4 w-4 mr-2" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="securite">Sécurité</TabsTrigger>
          </TabsList>

          <TabsContent value="entreprise" className="space-y-4 mt-4">
            {/* Identité visuelle */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4 text-primary" />Identité visuelle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Logo principal', value: logo, setter: setLogo, ref: logoInputRef, surface: 'bg-muted' },
                    { label: 'Variante claire', value: logoLight, setter: setLogoLight, ref: logoLightInputRef, surface: 'bg-card' },
                    { label: 'Variante sombre', value: logoDark, setter: setLogoDark, ref: logoDarkInputRef, surface: 'bg-sidebar' },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <Label>{item.label}</Label>
                      <div className={`h-28 rounded-md border flex items-center justify-center p-3 ${item.surface}`}>
                        <Avatar className="h-20 w-20 rounded-md">
                          {item.value ? <AvatarImage src={item.value} alt={item.label} className="rounded-md object-contain" /> : <AvatarFallback className="rounded-md"><Building2 className="h-7 w-7" /></AvatarFallback>}
                        </Avatar>
                      </div>
                      <input ref={item.ref} type="file" accept="image/*" onChange={(event) => handleLogoUpload(event, item.setter)} className="hidden" />
                      <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => item.ref.current?.click()}><Upload className="h-4 w-4 mr-2" />Modifier</Button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'primaryColor', label: 'Bleu principal', value: primaryColor, setter: setPrimaryColor },
                    { id: 'accentColor', label: 'Accent cyan', value: accentColor, setter: setAccentColor },
                    { id: 'darkColor', label: 'Bleu nuit', value: darkColor, setter: setDarkColor },
                  ].map((color) => (
                    <div key={color.id} className="space-y-2">
                      <Label htmlFor={color.id}>{color.label}</Label>
                      <div className="flex gap-2">
                        <input id={color.id} type="color" value={normalizeHex(color.value, OFFICIAL_BRAND.primaryColor)} onChange={(event) => color.setter(event.target.value)} className="h-10 w-12 rounded-md border bg-card p-1" />
                        <Input value={color.value} onChange={(event) => color.setter(event.target.value)} maxLength={7} className="font-mono uppercase" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Informations */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom de l'entreprise *</Label>
                  <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <Input id="adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ville">Ville</Label>
                    <Input id="ville" value={ville} onChange={(e) => setVille(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input id="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteWeb">Site web</Label>
                    <Input id="siteWeb" value={siteWeb} onChange={(e) => setSiteWeb(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Informations sur les documents</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label htmlFor="documentFooter">Message de pied de page</Label><Input id="documentFooter" value={documentFooter} onChange={(event) => setDocumentFooter(event.target.value)} placeholder="Merci pour votre confiance." /></div>
                <div className="space-y-2"><Label htmlFor="documentTerms">Conditions et mentions</Label><Textarea id="documentTerms" value={documentTerms} onChange={(event) => setDocumentTerms(event.target.value)} rows={4} placeholder="Validité, acompte, délai et autres mentions..." /></div>
                <p className="text-xs text-muted-foreground">Ces informations accompagnent les coordonnées, le numéro fiscal et les moyens de paiement dans les documents générés.</p>
              </CardContent>
            </Card>

            {/* Fiscalité */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Fiscalité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numeroFiscal">N° Identification Fiscale</Label>
                    <Input id="numeroFiscal" value={numeroFiscal} onChange={(e) => setNumeroFiscal(e.target.value)} placeholder="NIF / RCCM" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tauxTVA">Taux TVA (%)</Label>
                    <Input id="tauxTVA" type="number" min="0" max="100" value={tauxTVA} onChange={(e) => setTauxTVA(Number(e.target.value))} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mettre 0 si pas de TVA applicable. Ce taux sera utilisé dans les documents générés.
                </p>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Services / Prestations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {services.map((service, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1">
                      {service}
                      <button onClick={() => removeService(index)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nouveau service..."
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addService()}
                  />
                  <Button size="sm" variant="outline" onClick={addService}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Modes de paiement */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Modes de paiement (factures)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Les liens Wave et Orange Money seront convertis en QR codes sur vos factures PDF.
                  Utilisez <code>{'{amount}'}</code> dans le lien pour insérer automatiquement le montant.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="waveLink">Lien Wave (marchand)</Label>
                  <Input
                    id="waveLink"
                    value={waveLink}
                    onChange={(e) => setWaveLink(e.target.value)}
                    placeholder="https://pay.wave.com/m/XXXX/c/xof/?amount={amount}"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orangeMoneyLink">Lien / Code Orange Money</Label>
                  <Input
                    id="orangeMoneyLink"
                    value={orangeMoneyLink}
                    onChange={(e) => setOrangeMoneyLink(e.target.value)}
                    placeholder="#144*82*CODE*{amount}#  ou  https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="banqueNom">Banque</Label>
                    <Input id="banqueNom" value={banqueNom} onChange={(e) => setBanqueNom(e.target.value)} placeholder="Ex: SGBCI" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ibanBancaire">IBAN / RIB</Label>
                    <Input id="ibanBancaire" value={ibanBancaire} onChange={(e) => setIbanBancaire(e.target.value)} placeholder="CI93 CI00 ..." />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder les paramètres
            </Button>
          </TabsContent>


          <TabsContent value="historique" className="space-y-4 mt-4">
            {/* Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={auditEntityFilter} onValueChange={(v) => setAuditEntityFilter(v as AuditEntity | 'all')}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {Object.entries(AUDIT_ENTITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{filteredEntries.length} entrée{filteredEntries.length > 1 ? 's' : ''}</p>
              {entries.length > 0 && (
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setClearConfirm(true)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Vider
                </Button>
              )}
            </div>

            {filteredEntries.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Aucune modification enregistrée</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredEntries.slice(0, 100).map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getActionColor(entry.action) as any}>
                              {AUDIT_ACTION_LABELS[entry.action]}
                            </Badge>
                            <Badge variant="outline">{AUDIT_ENTITY_LABELS[entry.entity]}</Badge>
                          </div>
                          <p className="text-sm font-medium">{entry.entityLabel}</p>
                          {entry.details && (
                            <p className="text-xs text-muted-foreground">{entry.details}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(entry.timestamp), 'dd/MM HH:mm', { locale: fr })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="securite" className="space-y-4 mt-4">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={clearConfirm} onOpenChange={setClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vider l'historique ?</AlertDialogTitle>
            <AlertDialogDescription>
              Toutes les entrées de l'historique seront supprimées définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => { clearLog(); setClearConfirm(false); toast.success('Historique vidé'); }}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
