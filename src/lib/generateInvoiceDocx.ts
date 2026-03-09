import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle, ShadingType, TableLayoutType } from 'docx';
import { saveAs } from 'file-saver';
import { Invoice, Prospect, Devis } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const COMPANY_INFO = {
  name: 'ALLNTIC',
  address: 'Abidjan, Côte d\'Ivoire',
  phone: '+225 07 78 02 33 31',
  email: 'all.ntic225@gmail.com',
  website: 'www.allntic.com',
};

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

export async function generateInvoiceDocx(invoice: Invoice, prospect: Prospect, devis?: Devis) {
  const children: (Paragraph | Table)[] = [];
  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const borders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

  // Header
  children.push(new Paragraph({
    children: [
      new TextRun({ text: COMPANY_INFO.name, bold: true, size: 36, color: BLUE, font: 'Times New Roman' }),
      new TextRun({ text: '    ', size: 36 }),
      new TextRun({ text: 'FACTURE', bold: true, size: 52, color: BLUE, font: 'Times New Roman' }),
    ],
    spacing: { after: 100 },
  }));

  children.push(new Paragraph({
    children: [new TextRun({ text: 'Installation • Maintenance • Réseaux • Vidéosurveillance', size: 16, color: '646464', font: 'Times New Roman', italics: true })],
    spacing: { after: 80 },
  }));

  children.push(new Paragraph({
    children: [new TextRun({ text: `N° ${invoice.numero}   |   Date : ${format(new Date(invoice.dateEmission), 'dd/MM/yyyy', { locale: fr })}`, size: 20, color: GRAY, font: 'Times New Roman' })],
    spacing: { after: 200 },
  }));

  // Info table
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
              new Paragraph({ children: [new TextRun({ text: 'Facturé à :', bold: true, size: 20, color: BLUE, font: 'Times New Roman' })], spacing: { after: 40 } }),
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

  // Échéance
  children.push(new Paragraph({
    children: [new TextRun({ text: `Date d'échéance : ${format(new Date(invoice.dateEcheance), 'dd/MM/yyyy', { locale: fr })}`, bold: true, size: 18, color: GRAY, font: 'Times New Roman' })],
    spacing: { before: 300, after: 200 },
  }));

  // Lines table
  if (devis?.lignes && devis.lignes.length > 0) {
    const tableRows = [
      new TableRow({
        children: [
          headerCell('Désignation'),
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
  } else {
    children.push(new Paragraph({
      children: [new TextRun({ text: 'Prestation de services', size: 18, color: GRAY, font: 'Times New Roman' })],
      spacing: { after: 200 },
    }));
  }

  // Totals
  children.push(new Paragraph({ spacing: { before: 200 }, children: [] }));

  children.push(new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [
      new TextRun({ text: 'Total HT : ', bold: true, size: 24, color: BLUE, font: 'Times New Roman' }),
      new TextRun({ text: `${formatMontant(invoice.montantHT)} F`, bold: true, size: 24, color: BLUE, font: 'Times New Roman' }),
    ],
    spacing: { after: 200 },
  }));

  // Payment methods
  children.push(new Paragraph({
    children: [new TextRun({ text: 'Modalités de paiement :', bold: true, size: 18, color: BLUE, font: 'Times New Roman' })],
    spacing: { after: 60 },
  }));
  for (const mode of ['Virement bancaire', 'Mobile Money', 'Espèces']) {
    children.push(new Paragraph({
      children: [new TextRun({ text: `• ${mode}`, size: 16, color: GRAY, font: 'Times New Roman' })],
      spacing: { after: 20 },
    }));
  }

  // Status
  if (invoice.statut === 'paid') {
    children.push(new Paragraph({
      children: [new TextRun({ text: '✓ PAYÉE', bold: true, size: 24, color: '22C55E', font: 'Times New Roman' })],
      spacing: { before: 200, after: 200 },
    }));
  }

  // Footer
  children.push(new Paragraph({
    children: [new TextRun({ text: `${COMPANY_INFO.name} - ${COMPANY_INFO.address} | Tél : ${COMPANY_INFO.phone} | ${COMPANY_INFO.email} | ${COMPANY_INFO.website}`, size: 14, color: GRAY, font: 'Times New Roman' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 400 },
  }));

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `Facture_${invoice.numero}_${prospect.nomStructure.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
  saveAs(blob, fileName);
}
