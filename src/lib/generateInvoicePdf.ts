import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Invoice, Prospect, Devis } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getCompanySettings } from './companySettings';

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
    waveLink: settings.waveLink,
    orangeMoneyLink: settings.orangeMoneyLink,
    ibanBancaire: settings.ibanBancaire,
    banqueNom: settings.banqueNom,
  };
}

async function makeQrDataUrl(text: string): Promise<string | null> {
  try {
    return await QRCode.toDataURL(text, { margin: 1, width: 200 });
  } catch {
    return null;
  }
}

function fillTemplate(tpl: string, amount: number): string {
  return tpl.replace(/\{amount\}/gi, String(amount));
}

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

export async function generateInvoicePdf(invoice: Invoice, prospect: Prospect, devis?: Devis) {
  const COMPANY_INFO = getCompanyInfo();
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 15;

  // ===== EN-TÊTE =====
  try {
    const logoBase64 = COMPANY_INFO.logo || await loadImageAsBase64('/logo.png');
    doc.addImage(logoBase64, 'PNG', margin, y, 25, 25);
  } catch (e) {
    console.log('Logo non chargé:', e);
  }

  doc.setFontSize(18);
  doc.setFont('times', 'bold');
  doc.setTextColor(33, 90, 168);
  doc.text(COMPANY_INFO.name, margin + 30, y + 10);

  doc.setFontSize(7);
  doc.setFont('times', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('• ' + COMPANY_INFO.services.join(' • '), margin + 30, y + 16);

  // FACTURE en haut à droite
  doc.setFontSize(28);
  doc.setFont('times', 'bold');
  doc.setTextColor(33, 90, 168);
  doc.text('FACTURE', pageWidth - margin, y + 8, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`N° ${invoice.numero}`, pageWidth - margin, y + 16, { align: 'right' });
  doc.text(`Date : ${format(new Date(invoice.dateEmission), 'dd/MM/yyyy', { locale: fr })}`, pageWidth - margin, y + 22, { align: 'right' });

  y += 35;

  // Ligne de séparation
  doc.setDrawColor(33, 90, 168);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ===== INFORMATIONS ENTREPRISE ET CLIENT =====
  const colWidth = (pageWidth - margin * 2 - 10) / 2;
  const leftColX = margin;
  const rightColX = margin + colWidth + 10;

  // Bloc entreprise
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

  // Bloc client
  doc.setFillColor(240, 245, 250);
  doc.rect(rightColX, y, colWidth, 35, 'F');
  doc.setDrawColor(33, 90, 168);
  doc.setLineWidth(0.5);
  doc.line(rightColX, y, rightColX, y + 35);

  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.setTextColor(33, 90, 168);
  doc.text('Facturé à :', rightColX + 5, y + 8);

  doc.setFontSize(8);
  doc.setFont('times', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(prospect.nomStructure, rightColX + 5, y + 14);
  doc.text(`Contact : ${prospect.nomDecideur}`, rightColX + 5, y + 20);
  doc.text(`Tél : ${prospect.telephone}`, rightColX + 5, y + 26);

  y += 45;

  // Échéance
  doc.setFontSize(9);
  doc.setFont('times', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text(`Date d'échéance : ${format(new Date(invoice.dateEcheance), 'dd/MM/yyyy', { locale: fr })}`, margin, y);
  y += 12;

  // ===== TABLEAU DES LIGNES =====
  if (devis?.lignes && devis.lignes.length > 0) {
    const tableWidth = pageWidth - margin * 2;
    const colWidths = [tableWidth * 0.40, tableWidth * 0.20, tableWidth * 0.15, tableWidth * 0.20];
    const colX = [
      margin,
      margin + colWidths[0],
      margin + colWidths[0] + colWidths[1],
      margin + colWidths[0] + colWidths[1] + colWidths[2],
    ];

    doc.setFillColor(33, 90, 168);
    doc.rect(margin, y - 5, tableWidth, 10, 'F');

    doc.setFontSize(8);
    doc.setFont('times', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Désignation', colX[0] + 2, y + 1);
    doc.text('P.U. HT', colX[1] + 2, y + 1);
    doc.text('Qté', colX[2] + 2, y + 1);
    doc.text('Total HT', colX[3] + 2, y + 1);
    y += 10;

    doc.setFont('times', 'normal');
    doc.setTextColor(0);
    devis.lignes.forEach((ligne, index) => {
      if (y > 245) {
        doc.addPage();
        y = 20;
      }

      if (index % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(240, 242, 245);
      }
      doc.rect(margin, y - 4, tableWidth, 8, 'F');

      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.1);
      doc.line(margin, y + 4, margin + tableWidth, y + 4);

      doc.setFontSize(7);
      doc.setTextColor(50, 50, 50);
      const nom = ligne.nom.length > 40 ? ligne.nom.substring(0, 40) + '...' : ligne.nom;
      doc.text(nom, colX[0] + 2, y + 1);
      doc.text(`${formatMontant(ligne.prixUnitaire)} F`, colX[1] + 2, y + 1);
      doc.text(ligne.quantite.toString(), colX[2] + 2, y + 1);
      doc.text(`${formatMontant(ligne.total)} F`, colX[3] + 2, y + 1);
      y += 8;
    });

    y += 5;
  } else {
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('Prestation de services', margin, y);
    y += 15;
  }

  // ===== TOTAUX =====
  const totalsX = pageWidth - margin - 70;

  doc.setFillColor(33, 90, 168);
  doc.rect(totalsX, y, 35, 10, 'F');
  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Total HT', totalsX + 3, y + 7);
  doc.setFillColor(255, 255, 255);
  doc.rect(totalsX + 35, y, 35, 10, 'F');
  doc.setDrawColor(33, 90, 168);
  doc.rect(totalsX + 35, y, 35, 10, 'S');
  doc.setTextColor(33, 90, 168);
  doc.setFontSize(11);
  doc.text(`${formatMontant(invoice.montantHT)} F`, totalsX + 68, y + 7, { align: 'right' });
  y += 15;

  // ===== INFORMATIONS DE PAIEMENT =====
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(9);
  doc.setFont('times', 'bold');
  doc.setTextColor(33, 90, 168);
  doc.text('Modalités de paiement :', margin, y);
  y += 6;
  doc.setFont('times', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);

  const textBlockY = y;
  if (COMPANY_INFO.ibanBancaire) {
    doc.text(`• Virement : ${COMPANY_INFO.banqueNom || ''} - ${COMPANY_INFO.ibanBancaire}`, margin, y);
    y += 4;
  } else {
    doc.text('• Virement bancaire', margin, y);
    y += 4;
  }
  if (COMPANY_INFO.waveLink) {
    doc.text(`• Wave : ${COMPANY_INFO.waveLink}`, margin, y);
    y += 4;
  }
  if (COMPANY_INFO.orangeMoneyLink) {
    doc.text(`• Orange Money : ${COMPANY_INFO.orangeMoneyLink}`, margin, y);
    y += 4;
  }
  doc.text('• Espèces', margin, y);
  y += 4;

  // QR codes Wave / Orange Money
  const qrSize = 28;
  let qrX = pageWidth - margin - qrSize;
  const qrY = textBlockY - 2;

  if (COMPANY_INFO.waveLink) {
    const waveUrl = fillTemplate(COMPANY_INFO.waveLink, invoice.montantTTC);
    const qr = await makeQrDataUrl(waveUrl);
    if (qr) {
      doc.addImage(qr, 'PNG', qrX, qrY, qrSize, qrSize);
      doc.setFontSize(7);
      doc.setTextColor(33, 90, 168);
      doc.text('Wave', qrX + qrSize / 2, qrY + qrSize + 3, { align: 'center' });
      qrX -= qrSize + 5;
    }
  }
  if (COMPANY_INFO.orangeMoneyLink) {
    const omUrl = fillTemplate(COMPANY_INFO.orangeMoneyLink, invoice.montantTTC);
    const qr = await makeQrDataUrl(omUrl);
    if (qr) {
      doc.addImage(qr, 'PNG', qrX, qrY, qrSize, qrSize);
      doc.setFontSize(7);
      doc.setTextColor(33, 90, 168);
      doc.text('Orange Money', qrX + qrSize / 2, qrY + qrSize + 3, { align: 'center' });
    }
  }

  y = Math.max(y, qrY + qrSize + 8);

  // Statut
  if (invoice.statut === 'paid') {
    doc.setFillColor(34, 197, 94);
    doc.rect(margin, y, 40, 12, 'F');
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('PAYÉE', margin + 12, y + 8);
  }

  // ===== PIED DE PAGE =====
  const footerY = 285;
  doc.setDrawColor(33, 90, 168);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);

  doc.setFontSize(7);
  doc.setFont('times', 'normal');
  doc.setTextColor(80, 80, 80);
  const footerText = `${COMPANY_INFO.name} - ${COMPANY_INFO.address} | Tél : ${COMPANY_INFO.phone} | ${COMPANY_INFO.email} | ${COMPANY_INFO.website}`;
  doc.text(footerText, pageWidth / 2, footerY - 2, { align: 'center' });

  const fileName = `Facture_${invoice.numero}_${prospect.nomStructure.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
}
