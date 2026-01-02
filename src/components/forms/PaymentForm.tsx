import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Payment, PAYMENT_MODE_LABELS } from '@/types';
import { useProspects, useDevis } from '@/hooks/useData';

interface PaymentFormProps {
  payment?: Payment;
  onSubmit: (data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function PaymentForm({ payment, onSubmit, onCancel }: PaymentFormProps) {
  const { prospects } = useProspects();
  const { devisList } = useDevis();
  
  const [prospectId, setProspectId] = useState(payment?.prospectId || '');
  const [devisId, setDevisId] = useState(payment?.devisId || '');
  const [montant, setMontant] = useState(payment?.montant?.toString() || '');
  const [datePaiement, setDatePaiement] = useState(payment?.datePaiement || new Date().toISOString().split('T')[0]);
  const [modePaiement, setModePaiement] = useState<Payment['modePaiement']>(payment?.modePaiement || 'virement');
  const [reference, setReference] = useState(payment?.reference || '');
  const [notes, setNotes] = useState(payment?.notes || '');

  const acceptedDevis = devisList.filter(d => d.statut === 'accepte');
  const filteredDevis = prospectId 
    ? acceptedDevis.filter(d => d.prospectId === prospectId)
    : acceptedDevis;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      devisId,
      prospectId,
      montant: parseFloat(montant) || 0,
      datePaiement,
      modePaiement,
      reference: reference.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Client</Label>
        <Select value={prospectId} onValueChange={(v) => { setProspectId(v); setDevisId(''); }}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un client" />
          </SelectTrigger>
          <SelectContent>
            {prospects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.nomStructure}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Devis associé</Label>
        <Select value={devisId} onValueChange={setDevisId}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un devis" />
          </SelectTrigger>
          <SelectContent>
            {filteredDevis.map((d) => {
              const prospect = prospects.find(p => p.id === d.prospectId);
              return (
                <SelectItem key={d.id} value={d.id}>
                  {prospect?.nomStructure} - {d.montant.toLocaleString('fr-FR')} FCFA
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Montant (FCFA)</Label>
          <Input
            type="number"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            placeholder="0"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input
            type="date"
            value={datePaiement}
            onChange={(e) => setDatePaiement(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Mode de paiement</Label>
        <Select value={modePaiement} onValueChange={(v) => setModePaiement(v as Payment['modePaiement'])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Référence</Label>
        <Input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Numéro de transaction..."
        />
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes additionnelles..."
          rows={2}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" className="flex-1">
          {payment ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
}
