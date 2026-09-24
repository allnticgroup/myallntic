import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import type { Material } from '@/types';
import { getCompanySettings } from './companySettings';
import { addLogoToPdf } from './pdfLogo';

export async function generateMaterialQrLabels(materials: Material[]) {
  const doc = new jsPDF();
  const company = getCompanySettings();
  const cols = 3, rows = 8, margin = 8, gap = 3;
  const width = (210 - margin * 2 - gap * (cols - 1)) / cols;
  const height = (297 - margin * 2 - gap * (rows - 1)) / rows;
  for (let index = 0; index < materials.length; index++) {
    if (index > 0 && index % (cols * rows) === 0) doc.addPage();
    const pos = index % (cols * rows);
    const x = margin + (pos % cols) * (width + gap);
    const y = margin + Math.floor(pos / cols) * (height + gap);
    doc.setDrawColor(205, 215, 228); doc.roundedRect(x, y, width, height, 2, 2);
    const qr = await QRCode.toDataURL(JSON.stringify({ type: 'materiel', id: materials[index].id, reference: materials[index].reference }));
    doc.addImage(qr, 'PNG', x + 3, y + 4, 23, 23);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(6, 29, 73);
    doc.text(doc.splitTextToSize(materials[index].nom, width - 31), x + 29, y + 8);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(70, 80, 95);
    doc.text(`Réf. ${materials[index].reference || '—'}`, x + 29, y + 22);
    doc.text(company.nom, x + 29, y + 27);
  }
  doc.save(`etiquettes-materiels-${new Date().toISOString().slice(0, 10)}.pdf`);
}
