import jsPDF from 'jspdf';
import { Devis, Prospect, DEVIS_OPTION_LABELS, DEVIS_STATUS_LABELS } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Informations de l'entreprise
const COMPANY_INFO = {
  name: 'ALL-NTIC',
  address: 'Dakar, Sénégal',
  phone: '+221 XX XXX XX XX',
  email: 'contact@all-ntic.sn',
  website: 'www.all-ntic.sn',
};

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
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Logo
  try {
    const logoBase64 = await loadImageAsBase64('/logo.png');
    doc.addImage(logoBase64, 'PNG', margin, y - 5, 30, 30);
  } catch (e) {
    console.log('Logo non chargé:', e);
  }

  // Coordonnées entreprise (à droite du logo)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 90, 168); // Bleu
  doc.text(COMPANY_INFO.name, margin + 35, y + 5);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  doc.text(COMPANY_INFO.address, margin + 35, y + 12);
  doc.text(`Tél: ${COMPANY_INFO.phone}`, margin + 35, y + 17);
  doc.text(COMPANY_INFO.email, margin + 35, y + 22);
  
  y += 40;

  // Titre DEVIS
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('DEVIS', pageWidth / 2, y, { align: 'center' });
  y += 12;

  // Numéro et date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${devis.id.slice(0, 8).toUpperCase()}`, margin, y);
  doc.text(
    `Date: ${format(new Date(devis.dateDevis), 'dd MMMM yyyy', { locale: fr })}`,
    pageWidth - margin,
    y,
    { align: 'right' }
  );
  y += 8;

  // Statut et option
  doc.setFontSize(10);
  doc.text(`Statut: ${DEVIS_STATUS_LABELS[devis.statut]}`, margin, y);
  doc.text(`Option: ${DEVIS_OPTION_LABELS[devis.option]}`, pageWidth - margin, y, { align: 'right' });
  y += 12;

  // Ligne de séparation
  doc.setDrawColor(33, 90, 168);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  // Informations client
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 90, 168);
  doc.text('CLIENT', margin, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  doc.text(prospect.nomStructure, margin, y);
  y += 5;
  doc.text(`Contact: ${prospect.nomDecideur}`, margin, y);
  y += 5;
  doc.text(`Tél: ${prospect.telephone}`, margin, y);
  y += 15;

  // Tableau des matériels
  if (devis.lignes && devis.lignes.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 90, 168);
    doc.text('DÉTAIL DES PRESTATIONS', margin, y);
    y += 10;

    // En-têtes du tableau
    const colWidths = [80, 25, 35, 35];
    const colX = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2]];
    
    doc.setFillColor(33, 90, 168);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255);
    doc.text('Désignation', colX[0] + 2, y);
    doc.text('Qté', colX[1] + 2, y);
    doc.text('P.U.', colX[2] + 2, y);
    doc.text('Total', colX[3] + 2, y);
    y += 8;

    // Lignes du tableau
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    devis.lignes.forEach((ligne, index) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      
      // Alternance de couleurs
      if (index % 2 === 0) {
        doc.setFillColor(245, 247, 250);
        doc.rect(margin, y - 4, pageWidth - margin * 2, 7, 'F');
      }
      
      doc.text(ligne.nom.substring(0, 40), colX[0] + 2, y);
      doc.text(ligne.quantite.toString(), colX[1] + 2, y);
      doc.text(`${ligne.prixUnitaire.toLocaleString('fr-FR')} F`, colX[2] + 2, y);
      doc.text(`${ligne.total.toLocaleString('fr-FR')} F`, colX[3] + 2, y);
      y += 7;
    });

    y += 5;
  }

  // Ligne de séparation
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Total
  doc.setFillColor(33, 90, 168);
  doc.rect(pageWidth - 80, y - 5, 60, 10, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255);
  doc.text('TOTAL:', pageWidth - 78, y + 2);
  doc.text(`${devis.montant.toLocaleString('fr-FR')} F`, pageWidth - margin - 2, y + 2, { align: 'right' });
  y += 15;

  // Acompte si reçu
  doc.setTextColor(0);
  if (devis.acompteRecu && devis.montantAcompte > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Acompte reçu:', pageWidth - 80, y);
    doc.text(`${devis.montantAcompte.toLocaleString('fr-FR')} F`, pageWidth - margin, y, { align: 'right' });
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Reste à payer:', pageWidth - 80, y);
    doc.text(`${(devis.montant - devis.montantAcompte).toLocaleString('fr-FR')} F`, pageWidth - margin, y, { align: 'right' });
  }

  // Pied de page
  y = 265;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128);
  doc.text('Ce devis est valable 30 jours à compter de sa date d\'émission.', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text(`${COMPANY_INFO.name} - ${COMPANY_INFO.address} - ${COMPANY_INFO.phone}`, pageWidth / 2, y, { align: 'center' });

  // Télécharger le PDF
  const fileName = `Devis_${prospect.nomStructure.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(devis.dateDevis), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}
