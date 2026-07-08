import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMaterials } from '@/hooks/useData';
import { Material, MATERIAL_CATEGORY_LABELS } from '@/types';
import { compressImageToBase64 } from '@/lib/imageCompression';
import { toast } from 'sonner';
import { ImagePlus, X } from 'lucide-react';

const materialSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  reference: z.string().min(1, 'La référence est requise'),
  modele: z.string().optional(),
  categorie: z.enum(['camera', 'cable', 'enregistreur', 'accessoire', 'reseau', 'autre'] as const),
  prixUnitaire: z.number().min(0, 'Le prix doit être positif'),
  unite: z.string().min(1, "L'unité est requise"),
  stockQuantite: z.number().min(0, 'La quantité doit être positive'),
  stockMinimum: z.number().min(0, 'Le seuil doit être positif'),
  description: z.string().optional(),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

interface MaterialFormProps {
  material?: Material | null;
  onSuccess: () => void;
}

export function MaterialForm({ material, onSuccess }: MaterialFormProps) {
  const { addMaterial, updateMaterial } = useMaterials();
  const [photo, setPhoto] = useState<string | undefined>(material?.photo);
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      nom: material?.nom ?? '',
      reference: material?.reference ?? '',
      modele: material?.modele ?? '',
      categorie: material?.categorie ?? 'autre',
      prixUnitaire: material?.prixUnitaire ?? 0,
      unite: material?.unite ?? 'PCS',
      stockQuantite: material?.stockQuantite ?? 0,
      stockMinimum: material?.stockMinimum ?? 5,
      description: material?.description ?? '',
    },
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop lourde (max 5 Mo)');
      return;
    }
    try {
      const base64 = await compressImageToBase64(file, 400, 0.75);
      setPhoto(base64);
      toast.success('Photo ajoutée');
    } catch {
      toast.error("Impossible de traiter l'image");
    }
  };

  const onSubmit = (data: MaterialFormValues) => {
    try {
      const payload = {
        nom: data.nom,
        reference: data.reference,
        modele: data.modele ?? '',
        categorie: data.categorie,
        prixUnitaire: data.prixUnitaire,
        unite: data.unite,
        stockQuantite: data.stockQuantite,
        stockMinimum: data.stockMinimum,
        description: data.description ?? '',
        photo,
      };
      if (material) {
        updateMaterial(material.id, payload);
        toast.success('Matériel modifié');
      } else {
        addMaterial(payload);
        toast.success('Matériel ajouté');
      }
      onSuccess();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Photo produit */}
        <div>
          <FormLabel>Photo du produit</FormLabel>
          <div className="mt-2 flex items-center gap-3">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
              {photo ? (
                <>
                  <img src={photo} alt="Aperçu" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhoto(undefined)}
                    className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl-md p-0.5"
                    aria-label="Supprimer la photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              {photo ? 'Changer la photo' : 'Choisir une photo'}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Apparaîtra dans le tableau du devis PDF.
          </p>
        </div>

        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du produit</FormLabel>
              <FormControl>
                <Input placeholder="Ex: moniteur d'intérieur" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Référence</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: CAM-DOME-4MP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="modele"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modèle</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: DS-KD-ACW3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categorie"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(MATERIAL_CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prixUnitaire"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix unitaire (FCFA)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unité</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: PCS, mètre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stockQuantite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantité en stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stockMinimum"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seuil d'alerte</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="5"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description technique du produit..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {material ? 'Modifier' : 'Ajouter'}
        </Button>
      </form>
    </Form>
  );
}
