import jsPDF from 'jspdf';
import { Payment, PAYMENT_MODE_LABELS } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getCompanySettings } from './companySettings';

function formatMontant(montant: number): string {
  return montant.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export async function generateReceiptPdf(
  payment: Payment,
  clientName: string,
  invoiceNumero?: string,
) {
  const company = getCompanySettings();
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  // Logo
  if (company.logo) {
    try {
      doc.addImage(company.logo, 'PNG', margin, y, 25, 25);
    } catch {}
  }

  // En-tête entreprise
  doc.setFontSize(16);
  doc.setFont('times', 'bold');
  doc.setTextColor(33, 90, 168);
  doc.text(company.nom, margin + 30, y + 8);

  doc.setFontSize(8);
  doc.setFont('times', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(company.adresse, margin + 30, y + 14);
  doc.text(`Tél : ${company.telephone}`, margin + 30, y + 19);
  doc.text(`Email : ${company.email}`, margin + 30, y + 24);

  // Titre REÇU
  doc.setFontSize(26);
  doc.setFont('times', 'bold');
  doc.setTextColor(34, 139, 34);
  doc.text('REÇU', pageWidth - margin, y + 10, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('times', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`N° ${payment.id.slice(0, 8).toUpperCase()}`, pageWidth - margin, y + 17, { align: 'right' });
  doc.text(
    `Date : ${format(new Date(payment.datePaiement), 'dd/MM/yyyy', { locale: fr })}`,
    pageWidth - margin,
    y + 22,
    { align: 'right' },
  );

  y += 38;
  doc.setDrawColor(33, 90, 168);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  // Reçu de
  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.setTextColor(33, 90, 168);
  doc.text('Reçu de :', margin, y);
  doc.setFont('times', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.text(clientName, margin + 25, y);
  y += 10;

  // Montant - cadre vert
  doc.setFillColor(34, 139, 34);
  doc.rect(margin, y, pageWidth - margin * 2, 18, 'F');
  doc.setFontSize(11);
  doc.setFont('times', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('La somme de :', margin + 5, y + 8);
  doc.setFontSize(16);
  doc.text(`${formatMontant(payment.montant)} FCFA`, pageWidth - margin - 5, y + 12, { align: 'right' });
  y += 28;

  // Détails
  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.setTextColor(33, 90, 168);
  doc.text('Mode de paiement :', margin, y);
  doc.setFont('times', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.text(PAYMENT_MODE_LABELS[payment.modePaiement], margin + 50, y);
  y += 7;

  if (payment.reference) {
    doc.setFont('times', 'bold');
    doc.setTextColor(33, 90, 168);
    doc.text('Référence :', margin, y);
    doc.setFont('times', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(payment.reference, margin + 50, y);
    y += 7;
  }

  if (invoiceNumero) {
    doc.setFont('times', 'bold');
    doc.setTextColor(33, 90, 168);
    doc.text('Facture :', margin, y);
    doc.setFont('times', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(invoiceNumero, margin + 50, y);
    y += 7;
  }

  if (payment.notes) {
    y += 4;
    doc.setFont('times', 'bold');
    doc.setTextColor(33, 90, 168);
    doc.text('Notes :', margin, y);
    y += 5;
    doc.setFont('times', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    const split = doc.splitTextToSize(payment.notes, pageWidth - margin * 2);
    doc.text(split, margin, y);
    y += split.length * 5;
  }

  // Signature
  y = Math.max(y + 30, 200);
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.3);
  doc.line(pageWidth - margin - 60, y, pageWidth - margin, y);
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Signature et cachet', pageWidth - margin - 30, y + 5, { align: 'center' });

  // Footer
  const footerY = 285;
  doc.setDrawColor(33, 90, 168);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
  doc.setFontSize(7);
  doc.setFont('times', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(
    `${company.nom} - ${company.adresse} | ${company.telephone} | ${company.email}`,
    pageWidth / 2,
    footerY - 2,
    { align: 'center' },
  );

  const safeName = clientName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Recu_${payment.id.slice(0, 8)}_${safeName}.pdf`);
}
