import jsPDF from 'jspdf';
import { Devis, Prospect, Material, DEVIS_OPTION_LABELS } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getCompanySettings } from './companySettings';

function getMaterialsMap(): Record<string, Material> {
  try {
    const raw = window.localStorage.getItem('allntic_materials');
    const list: Material[] = raw ? JSON.parse(raw) : [];
    return Object.fromEntries(list.map((m) => [m.id, m]));
  } catch {
    return {};
  }
}


// Informations de l'entreprise
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
    tauxTVA: settings.tauxTVA,
  };
}

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
  let y = 15;

  // ===== EN-TÊTE =====
  // Logo à gauche - use custom logo if available
  try {
    const logoSrc = COMPANY_INFO.logo || '/logo.png';
    const logoBase64 = COMPANY_INFO.logo || await loadImageAsBase64('/logo.png');
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
  const servicesText = '• ' + COMPANY_INFO.services.join(' • ');
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

  // ===== TABLEAU DES MATÉRIELS (style catalogue avec photos) =====
  const materialsMap = getMaterialsMap();

  if (devis.lignes && devis.lignes.length > 0) {
    const tableWidth = pageWidth - margin * 2;
    // Colonnes : Nom | Photo | Uté | PU TTC | Qté | MT TTC
    const ratios = [0.30, 0.16, 0.08, 0.16, 0.10, 0.20];
    const colW = ratios.map((r) => tableWidth * r);
    const colX: number[] = [];
    let cx = margin;
    for (const w of colW) {
      colX.push(cx);
      cx += w;
    }

    // Bandeau rouge du haut
    doc.setFillColor(220, 38, 38);
    doc.rect(margin, y, tableWidth, 4, 'F');
    y += 4;

    // Titre catégorie (issu de l'objet du devis)
    const titre = (devis.objet || DEVIS_OPTION_LABELS[devis.option] || 'DEVIS').toUpperCase();
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, tableWidth, 10, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, tableWidth, 10, 'S');
    doc.setFontSize(14);
    doc.setFont('times', 'italic');
    doc.setTextColor(0, 0, 0);
    doc.text(titre, margin + tableWidth / 2, y + 7, { align: 'center' });
    y += 10;

    // En-tête de colonnes
    const headerH = 10;
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, tableWidth, headerH, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.rect(margin, y, tableWidth, headerH, 'S');
    const headers = ['Nom du produit', 'Photo', 'Uté', 'PU,TTC', 'PT.TTC', 'M.T. T.T.C'];
    doc.setFontSize(7);
    doc.setFont('times', 'bold');
    doc.setTextColor(0, 0, 0);
    headers.forEach((h, i) => {
      if (i > 0) doc.line(colX[i], y, colX[i], y + headerH);
      doc.text(h, colX[i] + colW[i] / 2, y + 6.5, { align: 'center' });
    });
    y += headerH;

    // Lignes du tableau
    doc.setFont('times', 'normal');
    doc.setTextColor(50, 50, 50);

    devis.lignes.forEach((ligne) => {
      const mat = materialsMap[ligne.materialId];
      const nom = ligne.nom || mat?.nom || '';
      const photo = mat?.photo;

      const rowH = 22;

      if (y + rowH > 275) {
        doc.addPage();
        y = 20;
      }

      // Fond ligne
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, y, tableWidth, rowH, 'F');
      // Bordures
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, tableWidth, rowH, 'S');
      for (let i = 1; i < colX.length; i++) {
        doc.line(colX[i], y, colX[i], y + rowH);
      }

      const cy = y + rowH / 2;
      doc.setFontSize(7);
      doc.setTextColor(50, 50, 50);

      // Nom (wrap, centré verticalement)
      const nomLines = doc.splitTextToSize(nom, colW[0] - 4) as string[];
      const nomStartY = cy - ((nomLines.length - 1) * 3.5) / 2 + 1;
      doc.text(nomLines, colX[0] + colW[0] / 2, nomStartY, { align: 'center', maxWidth: colW[0] - 4 });

      // Photo
      if (photo) {
        try {
          const imgSize = Math.min(colW[1] - 4, rowH - 4);
          const imgX = colX[1] + (colW[1] - imgSize) / 2;
          const imgY = y + (rowH - imgSize) / 2;
          doc.addImage(photo, 'JPEG', imgX, imgY, imgSize, imgSize);
        } catch (e) {
          console.warn('Photo non ajoutée', e);
        }
      }

      // Uté (unité)
      doc.text(mat?.unite || 'PCS', colX[2] + colW[2] / 2, cy + 1, { align: 'center' });

      // PU TTC
      doc.text(`${formatMontant(ligne.prixUnitaire)}`, colX[3] + colW[3] - 2, cy + 1, { align: 'right' });

      // Qté
      doc.text(String(ligne.quantite), colX[4] + colW[4] / 2, cy + 1, { align: 'center' });

      // MT TTC
      doc.setFont('times', 'bold');
      doc.text(`${formatMontant(ligne.total)}`, colX[5] + colW[5] - 2, cy + 1, { align: 'right' });
      doc.setFont('times', 'normal');

      y += rowH;
    });

    // Ligne Montant total
    const totalRowH = 12;
    if (y + totalRowH > 275) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, tableWidth, totalRowH, 'F');
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, tableWidth, totalRowH, 'S');
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Montant', margin + (tableWidth - colW[5]) / 2, y + 8, { align: 'center' });
    doc.line(colX[5], y, colX[5], y + totalRowH);
    doc.text(`${formatMontant(devis.montant)}`, colX[5] + colW[5] - 2, y + 8, { align: 'right' });
    y += totalRowH + 5;
  }


  // ===== DÉTAIL MAIN-D'ŒUVRE (si applicable) =====
  if (devis.lignes && devis.lignes.length > 0 && devis.mainDoeuvre > 0) {
    const totalMateriel = devis.montant - devis.mainDoeuvre;
    const totalsX = pageWidth - margin - 80;

    doc.setFontSize(8);
    doc.setFont('times', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Dont Matériel :', totalsX, y);
    doc.text(`${formatMontant(totalMateriel)} F`, pageWidth - margin, y, { align: 'right' });
    y += 5;
    doc.text("Dont Main-d'œuvre :", totalsX, y);
    doc.text(`${formatMontant(devis.mainDoeuvre)} F`, pageWidth - margin, y, { align: 'right' });
    y += 8;
  }


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
