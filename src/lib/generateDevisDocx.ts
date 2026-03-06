import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle, HeadingLevel, ShadingType, TableLayoutType } from 'docx';
import { saveAs } from 'file-saver';
import { Devis, Prospect, DEVIS_OPTION_LABELS, DEVIS_STATUS_LABELS, MATERIAL_CATEGORY_LABELS } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function getCompanyInfo(devis: Devis) {
  return {
    name: devis.entrepriseNom || 'ALLNTIC',
    address: devis.entrepriseAdresse || 'Abidjan, Côte d\'Ivoire',
    phone: devis.entrepriseTelephone || '+225 07 78 02 33 31',
    email: devis.entrepriseEmail || 'all.ntic225@gmail.com',
    website: devis.entrepriseSite || 'www.allntic.com',
  };
}

function formatMontant(montant: number): string {
  return montant.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const BLUE = '215AA8';
const GRAY = '505050';
const LIGHT_BG = 'F0F5FA';

function headerCell(text: string): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 16, font: 'Times New Roman' })], spacing: { before: 40, after: 40 } })],
    shading: { type: ShadingType.SOLID, color: BLUE },
    verticalAlign: 'center',
  });
}

function dataCell(text: string, shade?: boolean): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, size: 16, font: 'Times New Roman', color: '323232' })], spacing: { before: 30, after: 30 } })],
    ...(shade ? { shading: { type: ShadingType.SOLID, color: 'F0F2F5' } } : {}),
    verticalAlign: 'center',
  });
}

export async function generateDevisDocx(devis: Devis, prospect: Prospect) {
  const COMPANY_INFO = getCompanyInfo(devis);
  const children: (Paragraph | Table)[] = [];

  // Header
  children.push(new Paragraph({
    children: [
      new TextRun({ text: COMPANY_INFO.name, bold: true, size: 36, color: BLUE, font: 'Times New Roman' }),
      new TextRun({ text: '    ', size: 36 }),
      new TextRun({ text: 'DEVIS', bold: true, size: 52, color: BLUE, font: 'Times New Roman' }),
    ],
    alignment: AlignmentType.LEFT,
    spacing: { after: 100 },
  }));

  children.push(new Paragraph({
    children: [new TextRun({ text: 'Installation • Maintenance • Réseaux • Vidéosurveillance', size: 16, color: '646464', font: 'Times New Roman', italics: true })],
    spacing: { after: 80 },
  }));

  children.push(new Paragraph({
    children: [new TextRun({ text: `Numéro : ${devis.id.slice(0, 8).toUpperCase()}   |   Date : ${format(new Date(devis.dateDevis), 'dd/MM/yyyy', { locale: fr })}`, size: 20, color: GRAY, font: 'Times New Roman' })],
    spacing: { after: 200 },
  }));

  // Info table (company | client)
  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const borders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

  const infoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: COMPANY_INFO.name, bold: true, size: 20, color: BLUE, font: 'Times New Roman' })], spacing: { after: 40 } }),
              new Paragraph({ children: [new TextRun({ text: COMPANY_INFO.address, size: 16, color: GRAY, font: 'Times New Roman' })], spacing: { after: 20 } }),
              new Paragraph({ children: [new TextRun({ text: `Tél : ${COMPANY_INFO.phone}`, size: 16, color: GRAY, font: 'Times New Roman' })], spacing: { after: 20 } }),
              new Paragraph({ children: [new TextRun({ text: `Email : ${COMPANY_INFO.email}`, size: 16, color: GRAY, font: 'Times New Roman' })], spacing: { after: 20 } }),
              new Paragraph({ children: [new TextRun({ text: `Site : ${COMPANY_INFO.website}`, size: 16, color: GRAY, font: 'Times New Roman' })], spacing: { after: 20 } }),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, color: LIGHT_BG },
            borders,
          }),
          new TableCell({
            children: [
              new Paragraph({ children: [new TextRun({ text: 'Client :', bold: true, size: 20, color: BLUE, font: 'Times New Roman' })], spacing: { after: 40 } }),
              new Paragraph({ children: [new TextRun({ text: prospect.nomStructure, size: 16, color: GRAY, font: 'Times New Roman' })], spacing: { after: 20 } }),
              new Paragraph({ children: [new TextRun({ text: `Contact : ${prospect.nomDecideur}`, size: 16, color: GRAY, font: 'Times New Roman' })], spacing: { after: 20 } }),
              new Paragraph({ children: [new TextRun({ text: `Tél : ${prospect.telephone}`, size: 16, color: GRAY, font: 'Times New Roman' })], spacing: { after: 20 } }),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, color: LIGHT_BG },
            borders,
          }),
        ],
      }),
    ],
  });
  children.push(infoTable);

  // Object
  children.push(new Paragraph({
    children: [new TextRun({ text: `Objet : ${devis.objet || `${DEVIS_OPTION_LABELS[devis.option]} - ${DEVIS_STATUS_LABELS[devis.statut]}`}`, bold: true, size: 20, color: BLUE, font: 'Times New Roman' })],
    spacing: { before: 300, after: 200 },
  }));

  // Materials table
  if (devis.lignes && devis.lignes.length > 0) {
    const tableRows = [
      new TableRow({
        children: [
          headerCell('Désignation'),
          headerCell('Réf.'),
          headerCell('P.U. HT'),
          headerCell('Qté'),
          headerCell('Total HT'),
        ],
        tableHeader: true,
      }),
      ...devis.lignes.map((ligne, i) => {
        const shade = i % 2 === 1;
        return new TableRow({
          children: [
            dataCell(ligne.nom, shade),
            dataCell(ligne.reference || '-', shade),
            dataCell(`${formatMontant(ligne.prixUnitaire)} F`, shade),
            dataCell(ligne.quantite.toString(), shade),
            dataCell(`${formatMontant(ligne.total)} F`, shade),
          ],
        });
      }),
    ];

    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      rows: tableRows,
    }));
  }

  // Main-d'œuvre
  if (devis.mainDoeuvre > 0) {
    children.push(new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: 'Main-d\'œuvre : ', bold: true, size: 20, color: BLUE, font: 'Times New Roman' }),
        new TextRun({ text: `${formatMontant(devis.mainDoeuvre)} F`, size: 20, color: GRAY, font: 'Times New Roman' }),
      ],
      spacing: { before: 100, after: 80 },
    }));
  }

  // Totals
  children.push(new Paragraph({ spacing: { before: 200 }, children: [] }));

  children.push(new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [
      new TextRun({ text: 'Total HT : ', bold: true, size: 20, color: BLUE, font: 'Times New Roman' }),
      new TextRun({ text: `${formatMontant(devis.montant)} F`, size: 20, color: GRAY, font: 'Times New Roman' }),
    ],
    spacing: { after: 80 },
  }));

  children.push(new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [
      new TextRun({ text: 'Net à payer : ', bold: true, size: 24, color: BLUE, font: 'Times New Roman' }),
      new TextRun({ text: `${formatMontant(devis.montant)} F`, bold: true, size: 24, color: BLUE, font: 'Times New Roman' }),
    ],
    spacing: { after: 200 },
  }));

  // Acompte
  if (devis.acompteRecu && devis.montantAcompte > 0) {
    children.push(new Paragraph({
      children: [new TextRun({ text: 'Conditions de règlement :', bold: true, size: 18, color: BLUE, font: 'Times New Roman' })],
      spacing: { after: 60 },
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: `Acompte de 50% à la commande : ${formatMontant(devis.montantAcompte)} F`, size: 16, color: GRAY, font: 'Times New Roman' })],
      spacing: { after: 40 },
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: `Solde à la livraison : ${formatMontant(devis.montant - devis.montantAcompte)} F`, size: 16, color: GRAY, font: 'Times New Roman' })],
      spacing: { after: 200 },
    }));
  }

  // Signature
  children.push(new Paragraph({
    children: [new TextRun({ text: 'Signature du client (précédée de la mention « Bon pour accord »)', italics: true, size: 16, color: '646464', font: 'Times New Roman' })],
    spacing: { before: 300, after: 600 },
    alignment: AlignmentType.RIGHT,
  }));

  // CGV
  children.push(new Paragraph({
    children: [new TextRun({ text: 'CONDITIONS GÉNÉRALES DE VENTE', bold: true, size: 16, color: BLUE, font: 'Times New Roman' })],
    spacing: { before: 200, after: 60 },
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: '1. VALIDITÉ : Ce devis est valable 7 jours à compter de sa date d\'émission.', size: 14, color: GRAY, font: 'Times New Roman' })],
    spacing: { after: 30 },
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: '2. PAIEMENT : Un acompte de 60% est requis à la commande. Le solde est dû à la livraison.', size: 14, color: GRAY, font: 'Times New Roman' })],
    spacing: { after: 200 },
  }));

  // Footer
  children.push(new Paragraph({
    children: [new TextRun({ text: `${COMPANY_INFO.name} - ${COMPANY_INFO.address} | Tél : ${COMPANY_INFO.phone} | ${COMPANY_INFO.email} | ${COMPANY_INFO.website}`, size: 14, color: GRAY, font: 'Times New Roman' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 300 },
  }));

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `Devis_${prospect.nomStructure.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(devis.dateDevis), 'yyyy-MM-dd')}.docx`;
  saveAs(blob, fileName);
}
