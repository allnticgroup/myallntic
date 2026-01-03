import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMaterials } from '@/hooks/useData';
import { Material, MATERIAL_CATEGORY_LABELS, MaterialCategory } from '@/types';
import { toast } from 'sonner';

const materialSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  reference: z.string().min(1, 'La référence est requise'),
  categorie: z.enum(['camera', 'cable', 'enregistreur', 'accessoire', 'reseau', 'autre'] as const),
  prixUnitaire: z.number().min(0, 'Le prix doit être positif'),
  unite: z.string().min(1, 'L\'unité est requise'),
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

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      nom: material?.nom ?? '',
      reference: material?.reference ?? '',
      categorie: material?.categorie ?? 'autre',
      prixUnitaire: material?.prixUnitaire ?? 0,
      unite: material?.unite ?? 'unité',
      stockQuantite: material?.stockQuantite ?? 0,
      stockMinimum: material?.stockMinimum ?? 5,
      description: material?.description ?? '',
    },
  });

  const onSubmit = (data: MaterialFormValues) => {
    try {
      if (material) {
        updateMaterial(material.id, data);
        toast.success('Matériel modifié');
      } else {
        addMaterial({
          nom: data.nom,
          reference: data.reference,
          categorie: data.categorie,
          prixUnitaire: data.prixUnitaire,
          unite: data.unite,
          stockQuantite: data.stockQuantite,
          stockMinimum: data.stockMinimum,
          description: data.description ?? '',
        });
        toast.success('Matériel ajouté');
      }
      onSuccess();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du matériel</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Caméra dôme IP 4MP" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  <Input placeholder="Ex: mètre, unité" {...field} />
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
              <FormLabel>Description (optionnel)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Description du matériel..."
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
