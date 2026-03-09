import { Invoice, Prospect, Devis, INVOICE_STATUS_LABELS } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getCompanySettings } from '@/lib/companySettings';

function getCompanyInfo() {
  const settings = getCompanySettings();
  return {
    name: settings.nom,
    address: settings.adresse,
    phone: settings.telephone,
    email: settings.email,
    website: settings.siteWeb,
    logo: settings.logo,
    services: settings.services,
  };
}

function formatMontant(montant: number): string {
  return montant.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

interface InvoicePreviewProps {
  invoice: Invoice;
  prospect: Prospect;
  devis?: Devis;
}

export function InvoicePreview({ invoice, prospect, devis }: InvoicePreviewProps) {
  const COMPANY_INFO = getCompanyInfo();
    <div className="bg-white text-gray-800 p-6 rounded-lg shadow-sm border max-h-[70vh] overflow-y-auto">
      {/* En-tête */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3">
          <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
          <div>
            <h2 className="text-lg font-bold text-blue-700">{COMPANY_INFO.name}</h2>
            <p className="text-xs text-gray-500 italic">
              Installation • Maintenance • Réseaux • Vidéosurveillance
            </p>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-blue-700">FACTURE</h1>
          <p className="text-sm text-gray-600">N° {invoice.numero}</p>
          <p className="text-sm text-gray-600">
            {format(new Date(invoice.dateEmission), 'dd/MM/yyyy', { locale: fr })}
          </p>
        </div>
      </div>

      <Separator className="my-4 bg-blue-700" />

      {/* Infos entreprise et client */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="bg-blue-50 border-l-4 border-l-blue-700">
          <CardContent className="p-3">
            <h3 className="font-bold text-blue-700 text-sm mb-1">{COMPANY_INFO.name}</h3>
            <p className="text-xs text-gray-600">{COMPANY_INFO.address}</p>
            <p className="text-xs text-gray-600">Tél : {COMPANY_INFO.phone}</p>
            <p className="text-xs text-gray-600">Email : {COMPANY_INFO.email}</p>
            <p className="text-xs text-gray-600">Site : {COMPANY_INFO.website}</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-l-4 border-l-blue-700">
          <CardContent className="p-3">
            <h3 className="font-bold text-blue-700 text-sm mb-1">Facturé à :</h3>
            <p className="text-xs text-gray-600">{prospect.nomStructure}</p>
            <p className="text-xs text-gray-600">Contact : {prospect.nomDecideur}</p>
            <p className="text-xs text-gray-600">Tél : {prospect.telephone}</p>
          </CardContent>
        </Card>
      </div>

      {/* Échéance */}
      <p className="text-sm font-bold text-gray-600 mb-3">
        Date d'échéance : {format(new Date(invoice.dateEcheance), 'dd/MM/yyyy', { locale: fr })}
      </p>

      {/* Tableau des lignes */}
      {devis?.lignes && devis.lignes.length > 0 ? (
        <div className="border rounded-lg overflow-hidden mb-4">
          <table className="w-full text-xs">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="text-left p-2">Désignation</th>
                <th className="text-right p-2 min-w-[110px]">P.U. HT</th>
                <th className="text-center p-2">Qté</th>
                <th className="text-right p-2 min-w-[120px]">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {devis.lignes.map((ligne, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-2 text-gray-700">{ligne.nom}</td>
                  <td className="p-2 text-right text-gray-700">{formatMontant(ligne.prixUnitaire)} F</td>
                  <td className="p-2 text-center text-gray-700">{ligne.quantite}</td>
                  <td className="p-2 text-right text-gray-700">{formatMontant(ligne.total)} F</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-600 mb-4">Prestation de services</p>
      )}

      {/* Totaux */}
      <div className="flex justify-end mb-4">
        <div className="w-48">
          <div className="flex justify-between items-center bg-blue-700 text-white px-3 py-2 text-sm">
            <span className="font-bold">Total HT</span>
            <span className="font-bold">{formatMontant(invoice.montantHT)} F</span>
          </div>
        </div>
      </div>

      {/* Modalités de paiement */}
      <div className="mb-4">
        <h4 className="text-sm font-bold text-blue-700 mb-1">Modalités de paiement :</h4>
        <p className="text-xs text-gray-600">• Virement bancaire</p>
        <p className="text-xs text-gray-600">• Mobile Money</p>
        <p className="text-xs text-gray-600">• Espèces</p>
      </div>

      {/* Statut payée */}
      {invoice.statut === 'paid' && (
        <p className="text-lg font-bold text-green-500 mb-4">✓ PAYÉE</p>
      )}

      <Separator className="my-3 bg-blue-700" />

      {/* Footer */}
      <p className="text-center text-[10px] text-gray-500">
        {COMPANY_INFO.name} - {COMPANY_INFO.address} | Tél : {COMPANY_INFO.phone} | {COMPANY_INFO.email} | {COMPANY_INFO.website}
      </p>
    </div>
  );
}
