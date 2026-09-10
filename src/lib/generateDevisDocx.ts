import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, ImageRun, WidthType, AlignmentType, BorderStyle, ShadingType, TableLayoutType } from 'docx';
import { saveAs } from 'file-saver';
import { Devis, Prospect, Material, DEVIS_OPTION_LABELS } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getCompanySettings } from './companySettings';
import { loadLogoImageRun } from './docxLogo';
import { montantEnLettres } from './numberToWords';

function getMaterialsMap(): Record<string, Material> {
  try {
    const raw = window.localStorage.getItem('allntic_materials');
    const list: Material[] = raw ? JSON.parse(raw) : [];
    return Object.fromEntries(list.map((m) => [m.id, m]));
  } catch {
    return {};
  }
}

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

const BLUE = '215AA8';
const GRAY = '505050';
const LIGHT_BG = 'F0F5FA';
const RED = 'DC2626';
const FONT = 'Times New Roman';

// Largeurs (DXA) alignées sur les ratios du PDF : 0.30 / 0.16 / 0.08 / 0.16 / 0.10 / 0.20
const TABLE_WIDTH = 9360;
const COL_WIDTHS = [2808, 1498, 749, 1498, 936, 1871];

const thinBorder = { style: BorderStyle.SINGLE, size: 2, color: '000000' };
const cellBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

function base64ToUint8Array(base64: string): Uint8Array {
  const data = base64.replace(/^data:image\/\w+;base64,/, '');
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function photoRun(src: string): ImageRun | null {
  try {
    const type = /^data:image\/jpe?g/i.test(src) ? 'jpg' : /^data:image\/gif/i.test(src) ? 'gif' : 'png';
    return new ImageRun({
      data: base64ToUint8Array(src),
      transformation: { width: 55, height: 55 },
      type: type as 'jpg' | 'gif' | 'png',
    });
  } catch {
    return null;
  }
}

function headerCell(text: string, index: number): TableCell {
  return new TableCell({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, size: 14, font: FONT, color: '000000' })],
      spacing: { before: 40, after: 40 },
    })],
    width: { size: COL_WIDTHS[index], type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F5F5F5' },
    borders: cellBorders,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    verticalAlign: 'center',
  });
}

function textCell(
  text: string,
  index: number,
  align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.CENTER,
  bold = false,
): TableCell {
  return new TableCell({
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text, size: 14, font: FONT, color: '323232', bold })],
      spacing: { before: 40, after: 40 },
    })],
    width: { size: COL_WIDTHS[index], type: WidthType.DXA },
    borders: cellBorders,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    verticalAlign: 'center',
  });
}

function imageCell(src: string | undefined, index: number): TableCell {
  const run = src ? photoRun(src) : null;
  return new TableCell({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: run ? [run] : [],
      spacing: { before: 40, after: 40 },
    })],
    width: { size: COL_WIDTHS[index], type: WidthType.DXA },
    borders: cellBorders,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    verticalAlign: 'center',
  });
}

export async function generateDevisDocx(devis: Devis, prospect: Prospect) {
  const COMPANY_INFO = getCompanyInfo(devis);
  const materialsMap = getMaterialsMap();
  const children: (Paragraph | Table)[] = [];
  const logoImage = await loadLogoImageRun();

  // ===== EN-TÊTE =====
  children.push(new Paragraph({
    children: [
      ...(logoImage ? [logoImage, new TextRun({ text: '  ', size: 36 })] : []),
      new TextRun({ text: COMPANY_INFO.name, bold: true, size: 36, color: BLUE, font: FONT }),
      new TextRun({ text: '\t', size: 36 }),
      new TextRun({ text: 'DEVIS', bold: true, size: 52, color: BLUE, font: FONT }),
    ],
    spacing: { after: 100 },
  }));

  children.push(new Paragraph({
    children: [new TextRun({ text: '• ' + COMPANY_INFO.services.join(' • '), size: 14, color: '646464', font: FONT, italics: true })],
    spacing: { after: 80 },
  }));

  children.push(new Paragraph({
    children: [new TextRun({ text: `Numéro : ${devis.id.slice(0, 8).toUpperCase()}   |   Date : ${format(new Date(devis.dateDevis), 'dd/MM/yyyy', { locale: fr })}`, size: 20, color: GRAY, font: FONT })],
    spacing: { after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 4 } },
  }));

  // ===== ENTREPRISE / CLIENT =====
  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const borders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

  children.push(new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: COMPANY_INFO.name, bold: true, size: 20, color: BLUE, font: FONT })], spacing: { after: 40 } }),
              new Paragraph({ children: [new TextRun({ text: COMPANY_INFO.address, size: 16, color: GRAY, font: FONT })], spacing: { after: 20 } }),
              new Paragraph({ children: [new TextRun({ text: `Tél : ${COMPANY_INFO.phone}`, size: 16, color: GRAY, font: FONT })], spacing: { after: 20 } }),
              new Paragraph({ children: [new TextRun({ text: `Email : ${COMPANY_INFO.email}`, size: 16, color: GRAY, font: FONT })], spacing: { after: 20 } }),
              new Paragraph({ children: [new TextRun({ text: `Site : ${COMPANY_INFO.website}`, size: 16, color: GRAY, font: FONT })], spacing: { after: 20 } }),
            ],
            width: { size: 4680, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: LIGHT_BG },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            borders,
          }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: 'Client :', bold: true, size: 20, color: BLUE, font: FONT })], spacing: { after: 40 } }),
              new Paragraph({ children: [new TextRun({ text: prospect.nomStructure, size: 16, color: GRAY, font: FONT })], spacing: { after: 20 } }),
              new Paragraph({ children: [new TextRun({ text: `Contact : ${prospect.nomDecideur}`, size: 16, color: GRAY, font: FONT })], spacing: { after: 20 } }),
              new Paragraph({ children: [new TextRun({ text: `Tél : ${prospect.telephone}`, size: 16, color: GRAY, font: FONT })], spacing: { after: 20 } }),
            ],
            width: { size: 4680, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: LIGHT_BG },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            borders,
          }),
        ],
      }),
    ],
  }));

  // ===== TABLEAU CATALOGUE (identique au PDF) =====
  if (devis.lignes && devis.lignes.length > 0) {
    const titre = (devis.objet || DEVIS_OPTION_LABELS[devis.option] || 'DEVIS').toUpperCase();

    // Bandeau rouge
    children.push(new Paragraph({
      spacing: { before: 300, after: 0 },
      children: [new TextRun({ text: '', size: 4 })],
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: RED },
    }));

    const rows: TableRow[] = [
      // Titre catégorie sur toute la largeur
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 6,
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: titre, italics: true, bold: true, size: 26, font: FONT, color: '000000' })],
              spacing: { before: 60, after: 60 },
            })],
            borders: cellBorders,
            width: { size: TABLE_WIDTH, type: WidthType.DXA },
          }),
        ],
      }),
      new TableRow({
        tableHeader: true,
        children: ['Nom du produit', 'Photo', 'Uté', 'PU,TTC', 'PT.TTC', 'M.T. T.T.C'].map((h, i) => headerCell(h, i)),
      }),
      ...devis.lignes.map((ligne) => {
        const mat = materialsMap[ligne.materialId];
        const nom = ligne.nom || mat?.nom || '';
        return new TableRow({
          children: [
            textCell(nom, 0),
            imageCell(mat?.photo, 1),
            textCell(mat?.unite || 'PCS', 2),
            textCell(formatMontant(ligne.prixUnitaire), 3, AlignmentType.RIGHT),
            textCell(String(ligne.quantite), 4),
            textCell(formatMontant(ligne.total), 5, AlignmentType.RIGHT, true),
          ],
        });
      }),
      // Ligne Montant
      new TableRow({
        children: [
          new TableCell({
            columnSpan: 5,
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'Montant', bold: true, size: 24, font: FONT, color: '000000' })],
              spacing: { before: 60, after: 60 },
            })],
            borders: cellBorders,
            width: { size: COL_WIDTHS.slice(0, 5).reduce((a, b) => a + b, 0), type: WidthType.DXA },
          }),
          new TableCell({
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: formatMontant(devis.montant), bold: true, size: 24, font: FONT, color: '000000' })],
              spacing: { before: 60, after: 60 },
            })],
            borders: cellBorders,
            width: { size: COL_WIDTHS[5], type: WidthType.DXA },
          }),
        ],
      }),
    ];

    children.push(new Table({
      width: { size: TABLE_WIDTH, type: WidthType.DXA },
      columnWidths: COL_WIDTHS,
      layout: TableLayoutType.FIXED,
      rows,
    }));
  }

  // Montant total en lettres
  children.push(new Paragraph({
    children: [
      new TextRun({ text: 'Arrêté le présent devis à la somme de : ', bold: true, size: 18, color: BLUE, font: FONT }),
      new TextRun({ text: montantEnLettres(devis.montant), italics: true, size: 18, color: GRAY, font: FONT }),
    ],
    spacing: { before: 200, after: 160 },
  }));

  // Détail main-d'œuvre
  if (devis.lignes && devis.lignes.length > 0 && devis.mainDoeuvre > 0) {
    children.push(new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: 'Dont Matériel : ', size: 16, color: GRAY, font: FONT }),
        new TextRun({ text: `${formatMontant(devis.montant - devis.mainDoeuvre)} F`, size: 16, color: GRAY, font: FONT }),
      ],
      spacing: { after: 40 },
    }));
    children.push(new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: "Dont Main-d'œuvre : ", size: 16, color: GRAY, font: FONT }),
        new TextRun({ text: `${formatMontant(devis.mainDoeuvre)} F`, size: 16, color: GRAY, font: FONT }),
      ],
      spacing: { after: 160 },
    }));
  }

  // Acompte
  if (devis.acompteRecu && devis.montantAcompte > 0) {
    children.push(new Paragraph({
      children: [new TextRun({ text: 'Conditions de règlement :', bold: true, size: 18, color: BLUE, font: FONT })],
      spacing: { after: 60 },
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: `Acompte de 75% à la commande : ${formatMontant(devis.montantAcompte)} F`, size: 16, color: GRAY, font: FONT })],
      spacing: { after: 40 },
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: `Solde à la livraison : ${formatMontant(devis.montant - devis.montantAcompte)} F`, size: 16, color: GRAY, font: FONT })],
      spacing: { after: 200 },
    }));
  }

  // Signature
  children.push(new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [new TextRun({ text: 'Signature du client (précédée de la mention « Bon pour accord »)', italics: true, size: 14, color: '646464', font: FONT })],
    spacing: { before: 300, after: 600 },
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'B4B4B4', space: 4 } },
  }));

  // CGV
  children.push(new Paragraph({
    children: [new TextRun({ text: 'CONDITIONS GÉNÉRALES DE VENTE', bold: true, size: 16, color: BLUE, font: FONT })],
    spacing: { before: 200, after: 60 },
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: "1. VALIDITÉ : Ce devis est valable 7 jours à compter de sa date d'émission.", size: 14, color: GRAY, font: FONT })],
    spacing: { after: 30 },
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: '2. PAIEMENT : Un acompte de 75% est requis à la commande. Le solde est dû à la livraison.', size: 14, color: GRAY, font: FONT })],
    spacing: { after: 200 },
  }));

  // Footer
  children.push(new Paragraph({
    children: [new TextRun({ text: `${COMPANY_INFO.name} - ${COMPANY_INFO.address} | Tél : ${COMPANY_INFO.phone} | ${COMPANY_INFO.email} | ${COMPANY_INFO.website}`, size: 14, color: GRAY, font: FONT })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 300 },
    border: { top: { style: BorderStyle.SINGLE, size: 6, color: BLUE, space: 4 } },
  }));

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `Devis_${prospect.nomStructure.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(devis.dateDevis), 'yyyy-MM-dd')}.docx`;
  saveAs(blob, fileName);
}
