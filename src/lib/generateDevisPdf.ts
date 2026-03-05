import jsPDF from 'jspdf';
import { Devis, Prospect, DEVIS_OPTION_LABELS, DEVIS_STATUS_LABELS, MATERIAL_CATEGORY_LABELS } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Informations de l'entreprise
function getCompanyInfo(devis: Devis) {
  return {
    name: devis.entrepriseNom || 'ALLNTIC',
    address: devis.entrepriseAdresse || 'Abidjan, Côte d\'Ivoire',
    phone: devis.entrepriseTelephone || '+225 07 78 02 33 31',
    email: devis.entrepriseEmail || 'all.ntic225@gmail.com',
    website: devis.entrepriseSite || 'www.allntic.com',
  };
}

// Prestations de l'entreprise
const COMPANY_SERVICES = [
  'Installation et maintenance',
  'Réseaux et câblage',
  'Vidéosurveillance',
  'Solutions de sécurité',
  'Développement web',
];

// Fonction pour formater les montants avec des points
function formatMontant(montant: number): string {
  return montant.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

async function loadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function generateDevisPdf(devis: Devis, prospect: Prospect) {
  const COMPANY_INFO = getCompanyInfo(devis);
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  // ===== EN-TÊTE =====
  // Logo à gauche
  try {
    const logoBase64 = await loadImageAsBase64('/logo.png');
    doc.addImage(logoBase64, 'PNG', margin, y, 25, 25);
  } catch (e) {
    console.log('Logo non chargé:', e);
  }

  // Nom de l'entreprise à côté du logo
  doc.setFontSize(18);
  doc.setFont('times', 'bold');
  doc.setTextColor(33, 90, 168);
  doc.text(COMPANY_INFO.name, margin + 30, y + 10);

  // Services à côté du logo (sous le nom)
  doc.setFontSize(7);
  doc.setFont('times', 'normal');
  doc.setTextColor(100, 100, 100);
  const servicesText = '• ' + COMPANY_SERVICES.join(' • ');
  const servicesLines = doc.splitTextToSize(servicesText, 80);
  doc.text(servicesLines, margin + 30, y + 16);

  // DEVIS en haut à droite
  doc.setFontSize(28);
  doc.setFont('times', 'bold');
  doc.setTextColor(33, 90, 168);
  doc.text('DEVIS', pageWidth - margin, y + 8, { align: 'right' });

  // Numéro et date sous DEVIS
  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Numéro : ${devis.id.slice(0, 8).toUpperCase()}`, pageWidth - margin, y + 16, { align: 'right' });
  doc.text(`Date : ${format(new Date(devis.dateDevis), 'dd/MM/yyyy', { locale: fr })}`, pageWidth - margin, y + 22, { align: 'right' });

  y += 35;

  // Ligne de séparation
  doc.setDrawColor(33, 90, 168);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ===== INFORMATIONS ENTREPRISE ET CLIENT CÔTE À CÔTE =====
  const colWidth = (pageWidth - margin * 2 - 10) / 2;
  const leftColX = margin;
  const rightColX = margin + colWidth + 10;

  // Bloc entreprise à gauche
  doc.setFillColor(240, 245, 250);
  doc.rect(leftColX, y, colWidth, 35, 'F');
  doc.setDrawColor(33, 90, 168);
  doc.setLineWidth(0.5);
  doc.line(leftColX, y, leftColX, y + 35);

  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.setTextColor(33, 90, 168);
  doc.text(COMPANY_INFO.name, leftColX + 5, y + 8);
  
  doc.setFontSize(8);
  doc.setFont('times', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(COMPANY_INFO.address, leftColX + 5, y + 14);
  doc.text(`Tél : ${COMPANY_INFO.phone}`, leftColX + 5, y + 20);
  doc.text(`Email : ${COMPANY_INFO.email}`, leftColX + 5, y + 26);
  doc.text(`Site : ${COMPANY_INFO.website}`, leftColX + 5, y + 32);

  // Bloc client à droite
  doc.setFillColor(240, 245, 250);
  doc.rect(rightColX, y, colWidth, 35, 'F');
  doc.setDrawColor(33, 90, 168);
  doc.setLineWidth(0.5);
  doc.line(rightColX, y, rightColX, y + 35);

  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.setTextColor(33, 90, 168);
  doc.text('Client :', rightColX + 5, y + 8);
  
  doc.setFontSize(8);
  doc.setFont('times', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(prospect.nomStructure, rightColX + 5, y + 14);
  doc.text(`Contact : ${prospect.nomDecideur}`, rightColX + 5, y + 20);
  doc.text(`Tél : ${prospect.telephone}`, rightColX + 5, y + 26);

  y += 45;

  // Objet du devis
  doc.setFontSize(9);
  doc.setFont('times', 'bold');
  doc.setTextColor(33, 90, 168);
  doc.text(`Objet : ${devis.objet || `${DEVIS_OPTION_LABELS[devis.option]} - ${DEVIS_STATUS_LABELS[devis.statut]}`}`, margin, y);

  // ===== TABLEAU DES MATÉRIELS =====
  if (devis.lignes && devis.lignes.length > 0) {
    // En-têtes du tableau
    const tableWidth = pageWidth - margin * 2;
    const colWidths = [tableWidth * 0.35, tableWidth * 0.15, tableWidth * 0.18, tableWidth * 0.10, tableWidth * 0.22];
    const colX = [
      margin,
      margin + colWidths[0],
      margin + colWidths[0] + colWidths[1],
      margin + colWidths[0] + colWidths[1] + colWidths[2],
      margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
    ];
    
    // Header du tableau avec fond bleu
    doc.setFillColor(33, 90, 168);
    doc.rect(margin, y - 5, tableWidth, 10, 'F');
    
    doc.setFontSize(7);
    doc.setFont('times', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Désignation', colX[0] + 2, y + 1);
    doc.text('Réf.', colX[1] + 2, y + 1);
    doc.text('P.U. HT', colX[2] + 2, y + 1);
    doc.text('Qté', colX[3] + 2, y + 1);
    doc.text('Total HT', colX[4] + 2, y + 1);
    y += 10;

    // Lignes du tableau
    doc.setFont('times', 'normal');
    doc.setTextColor(0);
    devis.lignes.forEach((ligne, index) => {
      if (y > 245) {
        doc.addPage();
        y = 20;
      }
      
      // Alternance de couleurs gris clair
      if (index % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(240, 242, 245);
      }
      doc.rect(margin, y - 4, tableWidth, 8, 'F');
      
      // Bordures légères grises
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.1);
      doc.line(margin, y + 4, margin + tableWidth, y + 4);
      
      doc.setFontSize(7);
      doc.setTextColor(50, 50, 50);
      const nom = ligne.nom.length > 30 ? ligne.nom.substring(0, 30) + '...' : ligne.nom;
      const ref = ligne.reference ? (ligne.reference.length > 12 ? ligne.reference.substring(0, 12) + '...' : ligne.reference) : '-';
      doc.text(nom, colX[0] + 2, y + 1);
      doc.text(ref, colX[1] + 2, y + 1);
      doc.text(`${formatMontant(ligne.prixUnitaire)} F`, colX[2] + 2, y + 1);
      doc.text(ligne.quantite.toString(), colX[3] + 2, y + 1);
      doc.text(`${formatMontant(ligne.total)} F`, colX[4] + 2, y + 1);
      y += 8;
    });

    y += 5;
  }

  // ===== TOTAUX À DROITE =====
  const totalsX = pageWidth - margin - 70;
  
  // Total HT
  doc.setFillColor(33, 90, 168);
  doc.rect(totalsX, y, 35, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('times', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Total HT', totalsX + 3, y + 5);
  doc.setFillColor(255, 255, 255);
  doc.rect(totalsX + 35, y, 35, 8, 'F');
  doc.setDrawColor(180, 180, 180);
  doc.rect(totalsX + 35, y, 35, 8, 'S');
  doc.setTextColor(50, 50, 50);
  doc.text(`${formatMontant(devis.montant)} F`, totalsX + 68, y + 5, { align: 'right' });
  y += 10;

  // Net à payer
  doc.setFillColor(33, 90, 168);
  doc.rect(totalsX, y, 35, 10, 'F');
  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Net à payer', totalsX + 3, y + 7);
  doc.setFillColor(255, 255, 255);
  doc.rect(totalsX + 35, y, 35, 10, 'F');
  doc.setDrawColor(33, 90, 168);
  doc.rect(totalsX + 35, y, 35, 10, 'S');
  doc.setTextColor(33, 90, 168);
  doc.setFontSize(11);
  doc.text(`${formatMontant(devis.montant)} F`, totalsX + 68, y + 7, { align: 'right' });
  y += 15;

  // Acompte si reçu
  if (devis.acompteRecu && devis.montantAcompte > 0) {
    doc.setFontSize(9);
    doc.setFont('times', 'bold');
    doc.setTextColor(33, 90, 168);
    doc.text('Conditions de règlement :', margin, y);
    y += 6;
    doc.setFont('times', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Acompte de 50% à la commande : ${formatMontant(devis.montantAcompte)} F`, margin, y);
    y += 5;
    doc.text(`Solde à la livraison : ${formatMontant(devis.montant - devis.montantAcompte)} F`, margin, y);
    y += 10;
  }

  // ===== ZONE SIGNATURE =====
  if (y > 210) {
    doc.addPage();
    y = 20;
  }
  
  y += 5;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.rect(pageWidth - margin - 80, y, 80, 25, 'S');
  doc.setFontSize(7);
  doc.setFont('times', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Signature du client (précédée de la mention « Bon pour accord »)', pageWidth - margin - 78, y + 5);
  y += 35;

  // ===== CONDITIONS GÉNÉRALES =====
  if (y > 230) {
    doc.addPage();
    y = 20;
  }
  
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  
  doc.setFontSize(8);
  doc.setFont('times', 'bold');
  doc.setTextColor(33, 90, 168);
  doc.text('CONDITIONS GÉNÉRALES DE VENTE', margin, y);
  y += 6;
  
  doc.setFontSize(7);
  doc.setFont('times', 'normal');
  doc.setTextColor(80, 80, 80);
  
  const cgv = [
    '1. VALIDITÉ : Ce devis est valable 7 jours à compter de sa date d\'émission.',
    '2. PAIEMENT : Un acompte de 60% est requis à la commande. Le solde est dû à la livraison.',
  ];
  
  cgv.forEach((line) => {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, margin, y);
    y += 4;
  });

  // ===== PIED DE PAGE CENTRÉ =====
  const footerY = 285;
  
  doc.setDrawColor(33, 90, 168);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
  
  doc.setFontSize(7);
  doc.setFont('times', 'normal');
  doc.setTextColor(80, 80, 80);
  const footerText = `${COMPANY_INFO.name} - ${COMPANY_INFO.address} | Tél : ${COMPANY_INFO.phone} | ${COMPANY_INFO.email} | ${COMPANY_INFO.website}`;
  doc.text(footerText, pageWidth / 2, footerY - 2, { align: 'center' });

  // Télécharger le PDF
  const fileName = `Devis_${prospect.nomStructure.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(devis.dateDevis), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}
