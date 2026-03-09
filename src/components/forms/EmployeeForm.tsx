import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Employee, EMPLOYEE_ROLE_LABELS, EmployeeRole, EmployeeStatus, ContractType, CONTRACT_TYPE_LABELS } from '@/types';
import { User, Upload, X, FileText, Camera } from 'lucide-react';

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const [nom, setNom] = useState(employee?.nom || '');
  const [prenom, setPrenom] = useState(employee?.prenom || '');
  const [telephone, setTelephone] = useState(employee?.telephone || '');
  const [email, setEmail] = useState(employee?.email || '');
  const [poste, setPoste] = useState(employee?.poste || '');
  const [role, setRole] = useState<EmployeeRole>(employee?.role || 'technicien');
  const [statut, setStatut] = useState<EmployeeStatus>(employee?.statut || 'actif');
  const [dateEmbauche, setDateEmbauche] = useState(employee?.dateEmbauche || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(employee?.notes || '');
  
  // Nouveaux champs
  const [photo, setPhoto] = useState<string | undefined>(employee?.photo);
  const [adresse, setAdresse] = useState(employee?.adresse || '');
  const [ville, setVille] = useState(employee?.ville || '');
  const [typeContrat, setTypeContrat] = useState<ContractType>(employee?.typeContrat || 'cdi');
  const [salaireBase, setSalaireBase] = useState(employee?.salaireBase || 0);
  const [dateFinContrat, setDateFinContrat] = useState(employee?.dateFinContrat || '');
  const [photoIdentite, setPhotoIdentite] = useState<string | undefined>(employee?.photoIdentite);
  const [cvData, setCvData] = useState<string | undefined>(employee?.cvData);
  const [cvFileName, setCvFileName] = useState<string | undefined>(employee?.cvFileName);
  const [numeroSecuriteSociale, setNumeroSecuriteSociale] = useState(employee?.numeroSecuriteSociale || '');
  const [contactUrgence, setContactUrgence] = useState(employee?.contactUrgence || '');
  const [telephoneUrgence, setTelephoneUrgence] = useState(employee?.telephoneUrgence || '');

  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoIdInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const handleFileToBase64 = (file: File, maxSizeMB: number = 2): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        reject(new Error(`Le fichier dépasse ${maxSizeMB}MB`));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await handleFileToBase64(file, 2);
        setPhoto(base64);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Erreur lors du chargement');
      }
    }
  };

  const handlePhotoIdChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await handleFileToBase64(file, 3);
        setPhotoIdentite(base64);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Erreur lors du chargement');
      }
    }
  };

  const handleCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await handleFileToBase64(file, 5);
        setCvData(base64);
        setCvFileName(file.name);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Erreur lors du chargement');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nom,
      prenom,
      telephone,
      email,
      poste,
      role,
      statut,
      dateEmbauche,
      notes,
      photo,
      adresse,
      ville,
      typeContrat,
      salaireBase,
      dateFinContrat: dateFinContrat || undefined,
      photoIdentite,
      cvData,
      cvFileName,
      numeroSecuriteSociale: numeroSecuriteSociale || undefined,
      contactUrgence: contactUrgence || undefined,
      telephoneUrgence: telephoneUrgence || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue="identite" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="identite">Identité</TabsTrigger>
          <TabsTrigger value="contrat">Contrat</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="identite" className="space-y-4 mt-4">
          {/* Photo de profil */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {photo ? (
                <AvatarImage src={photo} alt="Photo" />
              ) : (
                <AvatarFallback className="bg-muted">
                  <User className="h-8 w-8 text-muted-foreground" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col gap-2">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => photoInputRef.current?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                {photo ? 'Changer' : 'Ajouter photo'}
              </Button>
              {photo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPhoto(undefined)}
                  className="text-destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input
              id="adresse"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Rue, quartier..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ville">Ville</Label>
              <Input id="ville" value={ville} onChange={(e) => setVille(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select value={role} onValueChange={(v) => setRole(v as EmployeeRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(EMPLOYEE_ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="poste">Poste / Fonction</Label>
            <Input id="poste" value={poste} onChange={(e) => setPoste(e.target.value)} placeholder="Ex: Technicien réseau senior" />
          </div>

          {/* Contact d'urgence */}
          <div className="border-t pt-4 mt-4">
            <Label className="text-muted-foreground text-xs uppercase tracking-wide">Contact d'urgence</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="contactUrgence">Nom du contact</Label>
                <Input
                  id="contactUrgence"
                  value={contactUrgence}
                  onChange={(e) => setContactUrgence(e.target.value)}
                  placeholder="Nom et relation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephoneUrgence">Téléphone</Label>
                <Input
                  id="telephoneUrgence"
                  value={telephoneUrgence}
                  onChange={(e) => setTelephoneUrgence(e.target.value)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contrat" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type de contrat</Label>
              <Select value={typeContrat} onValueChange={(v) => setTypeContrat(v as ContractType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={statut} onValueChange={(v) => setStatut(v as EmployeeStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateEmbauche">Date d'embauche</Label>
              <Input
                id="dateEmbauche"
                type="date"
                value={dateEmbauche}
                onChange={(e) => setDateEmbauche(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFinContrat">Date fin de contrat</Label>
              <Input
                id="dateFinContrat"
                type="date"
                value={dateFinContrat}
                onChange={(e) => setDateFinContrat(e.target.value)}
                placeholder="Si CDD ou stage"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaireBase">Salaire de base (FCFA)</Label>
              <Input
                id="salaireBase"
                type="number"
                value={salaireBase || ''}
                onChange={(e) => setSalaireBase(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numeroSecuriteSociale">N° Sécurité Sociale</Label>
              <Input
                id="numeroSecuriteSociale"
                value={numeroSecuriteSociale}
                onChange={(e) => setNumeroSecuriteSociale(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Informations complémentaires..."
            />
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4 mt-4">
          {/* Photo pièce d'identité */}
          <div className="space-y-2">
            <Label>Photo de la pièce d'identité</Label>
            <div className="border-2 border-dashed border-muted rounded-lg p-4">
              {photoIdentite ? (
                <div className="space-y-2">
                  <img
                    src={photoIdentite}
                    alt="Pièce d'identité"
                    className="max-h-40 rounded-lg mx-auto"
                  />
                  <div className="flex justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => photoIdInputRef.current?.click()}
                    >
                      Changer
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPhotoIdentite(undefined)}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-4 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => photoIdInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Cliquez pour ajouter (max 3MB)</span>
                </div>
              )}
              <input
                ref={photoIdInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoIdChange}
                className="hidden"
              />
            </div>
          </div>

          {/* CV */}
          <div className="space-y-2">
            <Label>CV (PDF, Word, Image)</Label>
            <div className="border-2 border-dashed border-muted rounded-lg p-4">
              {cvData ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium truncate max-w-[200px]">{cvFileName}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => cvInputRef.current?.click()}
                    >
                      Changer
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCvData(undefined);
                        setCvFileName(undefined);
                      }}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-4 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => cvInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Cliquez pour ajouter le CV (max 5MB)</span>
                </div>
              )}
              <input
                ref={cvInputRef}
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={handleCvChange}
                className="hidden"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Les documents sont stockés localement. Pour une gestion avancée des documents, utilisez l'onglet Documents dans la fiche employé.
          </p>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" className="flex-1">
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
