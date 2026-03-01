import * as pdfjsLib from 'pdfjs-dist';
import { MaterialCategory } from '@/types';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export interface ParsedMaterial {
  nom: string;
  reference: string;
  categorie: MaterialCategory;
  prixUnitaire: number;
  unite: string;
  stockQuantite: number;
  stockMinimum: number;
  description: string;
}

const CATEGORY_KEYWORDS: Record<MaterialCategory, string[]> = {
  camera: ['caméra', 'camera', 'dôme', 'dome', 'bullet', 'ptz', 'ip cam', 'tourelle'],
  cable: ['câble', 'cable', 'rj45', 'coaxial', 'utp', 'ftp', 'fibre', 'cat5', 'cat6'],
  enregistreur: ['nvr', 'dvr', 'enregistreur', 'recorder'],
  accessoire: ['support', 'alimentation', 'connecteur', 'boîtier', 'boitier', 'adaptateur', 'switch poe'],
  reseau: ['switch', 'routeur', 'router', 'access point', 'ap', 'modem', 'firewall', 'baie'],
  autre: [],
};

function detectCategory(text: string): MaterialCategory {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'autre') continue;
    if (keywords.some(kw => lower.includes(kw))) {
      return category as MaterialCategory;
    }
  }
  return 'autre';
}

function extractPrice(text: string): number {
  // Match patterns like "25 000", "25000", "25,000", "25.000"
  const match = text.replace(/\s/g, '').match(/[\d,.]+/);
  if (match) {
    const cleaned = match[0].replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

function extractNumber(text: string): number {
  const match = text.replace(/\s/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

interface ColumnMapping {
  nom: number;
  reference: number;
  prix: number;
  quantite: number;
  unite: number;
  categorie: number;
  description: number;
}

const COLUMN_PATTERNS: Record<keyof ColumnMapping, RegExp[]> = {
  nom: [/product\s*name/i, /nom/i, /d[ée]signation/i, /article/i, /produit/i, /mat[ée]riel/i, /libell[ée]/i],
  reference: [/r[ée]f/i, /code/i, /sku/i, /n[°o]/i, /model/i],
  prix: [/prix/i, /price/i, /p\.?u/i, /tarif/i, /co[uû]t/i, /montant/i, /fcfa/i, /ht/i],
  quantite: [/qt[ée]/i, /quantit/i, /stock/i, /qte/i, /nbre/i, /nombre/i],
  unite: [/unit[ée]/i, /u\.?m/i, /mesure/i],
  categorie: [/cat[ée]gorie/i, /type/i, /famille/i],
  description: [/desc/i, /observation/i, /note/i, /commentaire/i, /d[ée]tail/i, /appearance/i, /image/i],
};

function detectColumns(headerCells: string[]): Partial<ColumnMapping> {
  const mapping: Partial<ColumnMapping> = {};
  
  headerCells.forEach((cell, idx) => {
    const trimmed = cell.trim().toLowerCase();
    if (!trimmed) return;
    
    for (const [field, patterns] of Object.entries(COLUMN_PATTERNS)) {
      if (patterns.some(p => p.test(trimmed)) && !(field in mapping)) {
        (mapping as any)[field] = idx;
      }
    }
  });
  
  return mapping;
}

function splitRowIntoCells(text: string): string[] {
  // Try tab-separated first
  if (text.includes('\t')) {
    return text.split('\t').map(s => s.trim());
  }
  // Then try multiple spaces (common in PDF extracted text)
  const cells = text.split(/\s{2,}/).map(s => s.trim()).filter(Boolean);
  return cells;
}

export async function parseMaterialsPdf(file: File): Promise<ParsedMaterial[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const allLines: string[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Group text items by Y position to reconstruct rows
    const items = textContent.items as any[];
    const rows = new Map<number, { x: number; text: string }[]>();
    
    items.forEach(item => {
      const y = Math.round(item.transform[5]); // Round Y to group nearby items
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y)!.push({ x: item.transform[4], text: item.str });
    });
    
    // Sort rows by Y (descending = top to bottom in PDF)
    const sortedRows = Array.from(rows.entries())
      .sort((a, b) => b[0] - a[0]);
    
    sortedRows.forEach(([, cells]) => {
      // Sort cells by X position (left to right)
      cells.sort((a, b) => a.x - b.x);
      const line = cells.map(c => c.text).join('\t');
      if (line.trim()) allLines.push(line);
    });
  }
  
  if (allLines.length < 2) {
    throw new Error('Le PDF ne contient pas assez de données. Assurez-vous qu\'il contient un tableau avec des en-têtes.');
  }
  
  // Try to find header row
  let headerIdx = 0;
  let bestMapping: Partial<ColumnMapping> = {};
  
  for (let i = 0; i < Math.min(5, allLines.length); i++) {
    const cells = splitRowIntoCells(allLines[i]);
    const mapping = detectColumns(cells);
    const matchCount = Object.keys(mapping).length;
    
    if (matchCount > Object.keys(bestMapping).length) {
      bestMapping = mapping;
      headerIdx = i;
    }
  }
  
  if (!bestMapping.nom && !bestMapping.reference) {
    throw new Error('Impossible de détecter les colonnes du tableau. Assurez-vous que les en-têtes contiennent "Nom/Désignation" et/ou "Référence".');
  }
  
  const materials: ParsedMaterial[] = [];
  
  for (let i = headerIdx + 1; i < allLines.length; i++) {
    const cells = splitRowIntoCells(allLines[i]);
    if (cells.length < 2) continue;
    
    const nom = bestMapping.nom !== undefined ? cells[bestMapping.nom] || '' : '';
    const reference = bestMapping.reference !== undefined ? cells[bestMapping.reference] || '' : '';
    
    // Skip empty rows
    if (!nom && !reference) continue;
    
    const prixText = bestMapping.prix !== undefined ? cells[bestMapping.prix] || '0' : '0';
    const qteText = bestMapping.quantite !== undefined ? cells[bestMapping.quantite] || '0' : '0';
    const unite = bestMapping.unite !== undefined ? cells[bestMapping.unite] || 'unité' : 'unité';
    const categorieText = bestMapping.categorie !== undefined ? cells[bestMapping.categorie] || '' : '';
    const description = bestMapping.description !== undefined ? cells[bestMapping.description] || '' : '';
    
    // Detect category from name + category column
    let categorie: MaterialCategory = 'autre';
    if (categorieText) {
      categorie = detectCategory(categorieText);
    }
    if (categorie === 'autre' && nom) {
      categorie = detectCategory(nom);
    }
    
    materials.push({
      nom: nom || reference,
      reference: reference || `REF-${Date.now()}-${i}`,
      categorie,
      prixUnitaire: extractPrice(prixText),
      unite: unite || 'unité',
      stockQuantite: extractNumber(qteText),
      stockMinimum: 5,
      description,
    });
  }
  
  return materials;
}
