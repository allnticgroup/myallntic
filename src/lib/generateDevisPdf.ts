import jsPDF from 'jspdf';
import { Devis, Prospect, DEVIS_OPTION_LABELS, DEVIS_STATUS_LABELS } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function generateDevisPdf(devis: Devis, prospect: Prospect) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // En-tête
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVIS', pageWidth / 2, y, { align: 'center' });
  y += 15;

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
  y += 10;

  // Statut
  doc.setFontSize(10);
  doc.text(`Statut: ${DEVIS_STATUS_LABELS[devis.statut]}`, margin, y);
  doc.text(`Option: ${DEVIS_OPTION_LABELS[devis.option]}`, pageWidth - margin, y, { align: 'right' });
  y += 15;

  // Ligne de séparation
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Informations client
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT', margin, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
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
    doc.text('DÉTAIL DES PRESTATIONS', margin, y);
    y += 10;

    // En-têtes du tableau
    const colWidths = [80, 25, 35, 35];
    const colX = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1], margin + colWidths[0] + colWidths[1] + colWidths[2]];
    
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Désignation', colX[0] + 2, y);
    doc.text('Qté', colX[1] + 2, y);
    doc.text('P.U.', colX[2] + 2, y);
    doc.text('Total', colX[3] + 2, y);
    y += 8;

    // Lignes du tableau
    doc.setFont('helvetica', 'normal');
    devis.lignes.forEach((ligne) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
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
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Total
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', pageWidth - 80, y);
  doc.text(`${devis.montant.toLocaleString('fr-FR')} F`, pageWidth - margin, y, { align: 'right' });
  y += 10;

  // Acompte si reçu
  if (devis.acompteRecu && devis.montantAcompte > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Acompte reçu:', pageWidth - 80, y);
    doc.text(`${devis.montantAcompte.toLocaleString('fr-FR')} F`, pageWidth - margin, y, { align: 'right' });
    y += 7;
    doc.text('Reste à payer:', pageWidth - 80, y);
    doc.text(`${(devis.montant - devis.montantAcompte).toLocaleString('fr-FR')} F`, pageWidth - margin, y, { align: 'right' });
  }

  // Pied de page
  y = 270;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128);
  doc.text('Ce devis est valable 30 jours à compter de sa date d\'émission.', pageWidth / 2, y, { align: 'center' });

  // Télécharger le PDF
  const fileName = `Devis_${prospect.nomStructure.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(devis.dateDevis), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
}
