// Parseur universel : PDF / Excel / Word → ParsedMaterial[]
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { parseMaterialsPdf, ParsedMaterial } from './parseMaterialsPdf';
import { MaterialCategory } from '@/types';

const CATEGORY_KEYWORDS: Record<MaterialCategory, string[]> = {
  camera: ['caméra', 'camera', 'dôme', 'dome', 'bullet', 'ptz', 'ip cam', 'turret', 'tandemvu', 'colorvu', 'wifi cam'],
  cable: ['câble', 'cable', 'rj45', 'coaxial', 'utp', 'ftp', 'fibre', 'fiber', 'cat5', 'cat6', 'patch cord', 'cordon'],
  enregistreur: ['nvr', 'dvr', 'edvr', 'envr', 'enregistreur', 'recorder'],
  accessoire: ['support', 'alimentation', 'power supply', 'connecteur', 'boîtier', 'boitier', 'adaptateur', 'ups', 'onduleur', 'balun', 'hdd', 'disque'],
  reseau: ['switch', 'routeur', 'router', 'access point', 'modem', 'firewall', 'baie', 'coffret', 'cabinet', 'patch panel', 'keystone', 'face plate'],
  autre: [],
};

function detectCategory(text: string): MaterialCategory {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'autre') continue;
    if (keywords.some((kw) => lower.includes(kw))) return category as MaterialCategory;
  }
  return 'autre';
}

function extractPrice(text: string | number | undefined): number {
  if (typeof text === 'number') return isFinite(text) ? text : 0;
  if (!text) return 0;
  const match = String(text).replace(/\s|CFA|FCFA|€|\$/gi, '').match(/[\d.,]+/);
  if (!match) return 0;
  const cleaned = match[0].replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function extractInt(text: string | number | undefined): number {
  if (typeof text === 'number') return Math.floor(text);
  if (!text) return 0;
  const m = String(text).replace(/\s/g, '').match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

// Mapping fuzzy pour headers
const HEADER_PATTERNS: Record<string, RegExp[]> = {
  nom: [/product\s*name/i, /^nom/i, /d[ée]signation/i, /article/i, /produit/i, /libell[ée]/i, /appearance/i],
  reference: [/r[ée]f/i, /^code$/i, /sku/i, /^n[°o]/i, /model/i, /part/i],
  prix: [/prix/i, /price/i, /^p\.?u/i, /tarif/i, /montant/i, /fcfa/i, /cfa/i],
  quantite: [/qt[ée]/i, /quantit/i, /^stock/i, /nbre/i, /nombre/i],
  unite: [/unit[ée]/i, /^u\.?m$/i, /mesure/i],
  categorie: [/cat[ée]gorie/i, /^type$/i, /famille/i],
  description: [/desc/i, /observation/i, /commentaire/i, /d[ée]tail/i],
};

function mapHeader(header: string): keyof typeof HEADER_PATTERNS | null {
  const h = header.trim().toLowerCase();
  if (!h) return null;
  for (const [field, patterns] of Object.entries(HEADER_PATTERNS)) {
    if (patterns.some((p) => p.test(h))) return field as keyof typeof HEADER_PATTERNS;
  }
  return null;
}

function rowsToMaterials(rows: (string | number | undefined)[][]): ParsedMaterial[] {
  if (rows.length < 2) throw new Error('Le fichier ne contient pas assez de lignes.');

  // Détecte la ligne d'en-tête (la plus riche en mots-clés)
  let headerIdx = 0;
  let bestMap: Record<string, number> = {};
  for (let i = 0; i < Math.min(6, rows.length); i++) {
    const map: Record<string, number> = {};
    rows[i].forEach((c, idx) => {
      const key = mapHeader(String(c ?? ''));
      if (key && !(key in map)) map[key] = idx;
    });
    if (Object.keys(map).length > Object.keys(bestMap).length) {
      bestMap = map;
      headerIdx = i;
    }
  }

  if (!bestMap.nom && !bestMap.reference) {
    throw new Error('Colonnes non détectées. Ajoutez des en-têtes comme "Nom", "Référence", "Prix", "Quantité".');
  }

  const materials: ParsedMaterial[] = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === undefined || String(c).trim() === '')) continue;

    const nom = String(row[bestMap.nom ?? -1] ?? '').trim();
    const reference = String(row[bestMap.reference ?? -1] ?? '').trim();
    if (!nom && !reference) continue;

    const desc = String(row[bestMap.description ?? -1] ?? '').trim();
    const catRaw = String(row[bestMap.categorie ?? -1] ?? '').trim();
    let categorie: MaterialCategory = catRaw ? detectCategory(catRaw) : 'autre';
    if (categorie === 'autre') categorie = detectCategory(`${nom} ${desc}`);

    materials.push({
      nom: nom || reference,
      reference: reference || `REF-${Date.now()}-${i}`,
      categorie,
      prixUnitaire: extractPrice(row[bestMap.prix ?? -1] as string),
      unite: String(row[bestMap.unite ?? -1] ?? 'PCS').trim() || 'PCS',
      stockQuantite: extractInt(row[bestMap.quantite ?? -1] as string),
      stockMinimum: 5,
      description: desc,
    });
  }

  return materials;
}

async function parseExcel(file: File): Promise<ParsedMaterial[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const all: ParsedMaterial[] = [];
  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const rows: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    try {
      all.push(...rowsToMaterials(rows));
    } catch {
      /* feuille sans tableau valide, on ignore */
    }
  }
  if (all.length === 0) throw new Error('Aucun matériel détecté dans le fichier Excel.');
  return all;
}

async function parseWord(file: File): Promise<ParsedMaterial[]> {
  const buf = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buf });
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const tables = Array.from(doc.querySelectorAll('table'));
  const all: ParsedMaterial[] = [];
  for (const table of tables) {
    const rows: string[][] = Array.from(table.querySelectorAll('tr')).map((tr) =>
      Array.from(tr.querySelectorAll('th,td')).map((c) => (c.textContent || '').trim())
    );
    try {
      all.push(...rowsToMaterials(rows));
    } catch {
      /* tableau ignoré */
    }
  }
  if (all.length === 0) throw new Error('Aucun tableau exploitable trouvé dans le document Word.');
  return all;
}

export async function parseMaterialsFile(file: File): Promise<ParsedMaterial[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf') || file.type === 'application/pdf') return parseMaterialsPdf(file);
  if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) return parseExcel(file);
  if (name.endsWith('.docx')) return parseWord(file);
  throw new Error('Format non supporté. Utilisez PDF, Excel (.xlsx/.xls/.csv) ou Word (.docx).');
}
