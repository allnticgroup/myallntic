import { Devis, Prospect, DEVIS_OPTION_LABELS, DEVIS_STATUS_LABELS } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getCompanySettings } from '@/lib/companySettings';

function getCompanyInfo(devis: Devis) {
  const settings = getCompanySettings();
  return {
    name: devis.entrepriseNom || settings.nom,
    address: devis.entrepriseAdresse || settings.adresse,
    phone: devis.entrepriseTelephone || settings.telephone,
    email: devis.entrepriseEmail || settings.email,
    website: devis.entrepriseSite || settings.siteWeb,
    logo: settings.logo,
    services: settings.services,
  };
}

function formatMontant(montant: number): string {
  return montant.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

interface DevisPreviewProps {
  devis: Devis;
  prospect: Prospect;
}

export function DevisPreview({ devis, prospect }: DevisPreviewProps) {
  const COMPANY_INFO = getCompanyInfo(devis);
  return (
    <div className="bg-white text-gray-800 p-6 rounded-lg shadow-sm border max-h-[70vh] overflow-y-auto">
      {/* En-tête */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3">
          <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
          <div>
            <h2 className="text-lg font-bold text-blue-700">{COMPANY_INFO.name}</h2>
            <p className="text-xs text-gray-500">
              • {COMPANY_SERVICES.join(' • ')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-blue-700">DEVIS</h1>
          <p className="text-sm text-gray-600">N° {devis.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-sm text-gray-600">
            {format(new Date(devis.dateDevis), 'dd/MM/yyyy', { locale: fr })}
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
            <h3 className="font-bold text-blue-700 text-sm mb-1">Client :</h3>
            <p className="text-xs text-gray-600">{prospect.nomStructure}</p>
            <p className="text-xs text-gray-600">Contact : {prospect.nomDecideur}</p>
            <p className="text-xs text-gray-600">Tél : {prospect.telephone}</p>
          </CardContent>
        </Card>
      </div>

      {/* Objet */}
      <p className="text-sm font-bold text-blue-700 mb-3">
        Objet : {devis.objet || `${DEVIS_OPTION_LABELS[devis.option]} - ${DEVIS_STATUS_LABELS[devis.statut]}`}
      </p>

      {/* Tableau des matériels */}
      {devis.lignes && devis.lignes.length > 0 && (
        <div className="border rounded-lg overflow-hidden mb-4">
          <table className="w-full text-xs">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="text-left p-2">Désignation</th>
                <th className="text-left p-2">Réf.</th>
                <th className="text-right p-2 min-w-[110px]">P.U. HT</th>
                <th className="text-center p-2">Qté</th>
                <th className="text-right p-2 min-w-[120px]">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {devis.lignes.map((ligne, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-2 text-gray-700">{ligne.nom}</td>
                  <td className="p-2 text-gray-500">{ligne.reference || '-'}</td>
                  <td className="p-2 text-right text-gray-700">{formatMontant(ligne.prixUnitaire)} F</td>
                  <td className="p-2 text-center text-gray-700">{ligne.quantite}</td>
                  <td className="p-2 text-right text-gray-700">{formatMontant(ligne.total)} F</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totaux avec main-d'œuvre */}
      <div className="flex justify-end mb-4">
        <div className="w-56">
          {devis.lignes && devis.lignes.length > 0 && devis.mainDoeuvre > 0 && (
            <>
              <div className="flex justify-between items-center bg-blue-50 text-blue-700 px-3 py-1 text-sm border border-blue-200 rounded mb-1">
                <span className="font-medium">Total Matériel</span>
                <span>{formatMontant(devis.montant - devis.mainDoeuvre)} F</span>
              </div>
              <div className="flex justify-between items-center bg-blue-50 text-blue-700 px-3 py-1 text-sm border border-blue-200 rounded mb-1">
                <span className="font-medium">Main-d'œuvre</span>
                <span>{formatMontant(devis.mainDoeuvre)} F</span>
              </div>
            </>
          )}
          <div className="flex justify-between items-center bg-blue-700 text-white px-3 py-2 text-sm">
            <span className="font-bold">Total</span>
            <span className="font-bold">{formatMontant(devis.montant)} F</span>
          </div>
        </div>
      </div>

      {/* Acompte */}
      {devis.acompteRecu && devis.montantAcompte > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-bold text-blue-700 mb-1">Conditions de règlement :</h4>
          <p className="text-xs text-gray-600">Acompte de 50% à la commande : {formatMontant(devis.montantAcompte)} F</p>
          <p className="text-xs text-gray-600">Solde à la livraison : {formatMontant(devis.montant - devis.montantAcompte)} F</p>
        </div>
      )}

      {/* Zone signature */}
      <div className="flex justify-end mb-4">
        <div className="border border-gray-300 p-2 w-60 h-16 rounded">
          <p className="text-[10px] text-gray-500 italic">
            Signature du client (précédée de la mention « Bon pour accord »)
          </p>
        </div>
      </div>

      <Separator className="my-3" />

      {/* CGV */}
      <div>
        <h4 className="text-xs font-bold text-blue-700 mb-1">CONDITIONS GÉNÉRALES DE VENTE</h4>
        <p className="text-[10px] text-gray-500">
          1. VALIDITÉ : Ce devis est valable 7 jours à compter de sa date d'émission.
        </p>
        <p className="text-[10px] text-gray-500">
          2. PAIEMENT : Un acompte de 60% est requis à la commande. Le solde est dû à la livraison.
        </p>
      </div>

      <Separator className="my-3 bg-blue-700" />

      {/* Footer */}
      <p className="text-center text-[10px] text-gray-500">
        {COMPANY_INFO.name} - {COMPANY_INFO.address} | Tél : {COMPANY_INFO.phone} | {COMPANY_INFO.email} | {COMPANY_INFO.website}
      </p>
    </div>
  );
}
