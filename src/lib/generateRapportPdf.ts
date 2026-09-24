import jsPDF from 'jspdf';
import { getCompanySettings } from './companySettings';
import { addLogoToPdf } from './pdfLogo';

interface MonthlyRow { name: string; revenus: number; depenses: number; benefice: number }
interface ProductRow { nom: string; qty: number; revenue: number }
const money = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} FCFA`;

export async function generateRapportPdf(rows: MonthlyRow[], products: ProductRow[]) {
  const company = getCompanySettings();
  const doc = new jsPDF();
  await addLogoToPdf(doc, company.logo, 15, 12, 24);
  doc.setTextColor(6, 29, 73); doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.text('RAPPORT DE PERFORMANCE', 45, 23);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.text(`${company.nom} • ${new Date().toLocaleDateString('fr-FR')}`, 45, 30);
  const revenue = rows.reduce((s, r) => s + r.revenus, 0), expenses = rows.reduce((s, r) => s + r.depenses, 0);
  doc.setFillColor(6, 69, 181); doc.roundedRect(15, 46, 180, 25, 3, 3, 'F'); doc.setTextColor(255,255,255); doc.setFontSize(10);
  doc.text(`Revenus : ${money(revenue)}`, 22, 57); doc.text(`Dépenses : ${money(expenses)}`, 78, 57); doc.text(`Résultat : ${money(revenue-expenses)}`, 140, 57);
  let y=84; doc.setTextColor(6,29,73); doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.text('Synthèse mensuelle',15,y); y+=8;
  doc.setFontSize(8); rows.forEach(r=>{ doc.setFont('helvetica','normal'); doc.text(r.name,15,y); doc.text(money(r.revenus),55,y); doc.text(money(r.depenses),108,y); doc.text(money(r.benefice),155,y); y+=7; });
  y+=8; doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.text('Produits les plus performants',15,y); y+=8;
  doc.setFontSize(8); products.forEach(p=>{doc.setFont('helvetica','normal'); doc.text(doc.splitTextToSize(p.nom,100),15,y); doc.text(`${p.qty} unité(s)`,125,y); doc.text(money(p.revenue),160,y); y+=8;});
  doc.setDrawColor(8,190,232); doc.line(15,282,195,282); doc.setFontSize(7); doc.setTextColor(90,100,115); doc.text(`${company.nom} • ${company.telephone} • ${company.email}`,105,288,{align:'center'});
  doc.save(`rapport-mensuel-${new Date().toISOString().slice(0,7)}.pdf`);
}
