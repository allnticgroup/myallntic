import jsPDF from 'jspdf';
import { Employee, Salary, SALARY_TYPE_LABELS, PAYMENT_MODE_LABELS, CONTRACT_TYPE_LABELS } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BulletinData {
  employee: Employee;
  salaries: Salary[];
  periode: string; // "2024-03"
  entreprise: {
    nom: string;
    adresse: string;
    telephone: string;
  };
}

export function generateBulletinPdf(data: BulletinData) {
  const { employee, salaries, periode, entreprise } = data;
  const doc = new jsPDF();
  
  const [year, month] = periode.split('-');
  const periodeDate = new Date(parseInt(year), parseInt(month) - 1);
  const periodeLabel = format(periodeDate, 'MMMM yyyy', { locale: fr });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(0, 71, 133);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(20);
  doc.text('BULLETIN DE SALAIRE', pageWidth / 2, 18, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(periodeLabel.toUpperCase(), pageWidth / 2, 30, { align: 'center' });
  
  let y = 55;
  
  // Entreprise info
  doc.setTextColor(0, 71, 133);
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('EMPLOYEUR', 15, y);
  
  doc.setTextColor(60, 60, 60);
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  y += 7;
  doc.text(entreprise.nom, 15, y);
  y += 5;
  doc.text(entreprise.adresse, 15, y);
  y += 5;
  doc.text(`Tél: ${entreprise.telephone}`, 15, y);
  
  // Employee info
  y = 55;
  doc.setTextColor(0, 71, 133);
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.text('EMPLOYÉ', 115, y);
  
  doc.setTextColor(60, 60, 60);
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  y += 7;
  doc.text(`${employee.prenom} ${employee.nom}`, 115, y);
  y += 5;
  doc.text(`Poste: ${employee.poste}`, 115, y);
  y += 5;
  doc.text(`Contrat: ${CONTRACT_TYPE_LABELS[employee.typeContrat] || 'N/A'}`, 115, y);
  y += 5;
  if (employee.numeroSecuriteSociale) {
    doc.text(`N° SS: ${employee.numeroSecuriteSociale}`, 115, y);
    y += 5;
  }
  doc.text(`Embauché le: ${format(new Date(employee.dateEmbauche), 'dd/MM/yyyy')}`, 115, y);
  
  // Separator
  y = 95;
  doc.setDrawColor(0, 71, 133);
  doc.setLineWidth(0.5);
  doc.line(15, y, pageWidth - 15, y);
  
  // Table header
  y += 10;
  doc.setFillColor(240, 245, 250);
  doc.rect(15, y - 5, pageWidth - 30, 10, 'F');
  
  doc.setTextColor(0, 71, 133);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.text('Désignation', 20, y);
  doc.text('Date', 90, y);
  doc.text('Mode', 125, y);
  doc.text('Montant (FCFA)', pageWidth - 20, y, { align: 'right' });
  
  // Table rows
  y += 8;
  doc.setTextColor(60, 60, 60);
  doc.setFont('times', 'normal');
  
  let totalBrut = 0;
  
  salaries.forEach((sal) => {
    const label = SALARY_TYPE_LABELS[sal.type];
    const dateStr = format(new Date(sal.datePaiement), 'dd/MM/yyyy');
    const mode = PAYMENT_MODE_LABELS[sal.modePaiement];
    
    doc.text(label, 20, y);
    doc.text(dateStr, 90, y);
    doc.text(mode, 125, y);
    doc.text(sal.montant.toLocaleString('fr-FR'), pageWidth - 20, y, { align: 'right' });
    
    if (sal.notes) {
      y += 5;
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(sal.notes, 25, y);
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
    }
    
    totalBrut += sal.montant;
    y += 8;
    
    // Light separator
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(15, y - 3, pageWidth - 15, y - 3);
  });
  
  if (salaries.length === 0) {
    doc.setTextColor(150, 150, 150);
    doc.text('Aucun versement pour cette période', pageWidth / 2, y, { align: 'center' });
    y += 10;
  }
  
  // Total
  y += 5;
  doc.setFillColor(0, 71, 133);
  doc.rect(15, y - 5, pageWidth - 30, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text('NET À PAYER', 20, y + 2);
  doc.text(`${totalBrut.toLocaleString('fr-FR')} FCFA`, pageWidth - 20, y + 2, { align: 'right' });
  
  // Salaire de base reference
  if (employee.salaireBase) {
    y += 18;
    doc.setTextColor(120, 120, 120);
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.text(`Salaire de base de référence : ${employee.salaireBase.toLocaleString('fr-FR')} FCFA`, 15, y);
  }
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 25;
  doc.setDrawColor(0, 71, 133);
  doc.setLineWidth(0.5);
  doc.line(15, footerY, pageWidth - 15, footerY);
  
  doc.setTextColor(120, 120, 120);
  doc.setFont('times', 'normal');
  doc.setFontSize(8);
  doc.text('Ce bulletin de salaire est établi conformément aux dispositions légales en vigueur.', pageWidth / 2, footerY + 7, { align: 'center' });
  doc.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}`, pageWidth / 2, footerY + 13, { align: 'center' });
  
  const fileName = `bulletin_${employee.prenom}_${employee.nom}_${periode}.pdf`;
  doc.save(fileName);
}
