// Import de devis et factures depuis Excel (.xlsx/.xls/.csv) ou Word (.docx)
// Colonnes attendues : "Client", "Désignation", "PU", "Qté"
// Colonnes optionnelles : "Numéro", "Date", "Objet", "Statut"
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

export interface ImportedDocLine {
  designation: string;
  pu: number;
  qte: number;
}

export interface ImportedDocument {
  numero: string;
  client: string;
  date: string; // ISO yyyy-mm-dd
  objet: string;
  statut: string;
  lignes: ImportedDocLine[];
  montant: number;
}

const HEADER_PATTERNS: Record<string, RegExp[]> = {
  numero: [/num[ée]ro/i, /^n\s*[°o]/i, /document/i, /r[ée]f[ée]rence/i],
  client: [/client/i, /structure/i, /prospect/i, /soci[ée]t[ée]/i, /^entreprise/i],
  date: [/date/i, /[ée]mission/i],
  objet: [/objet/i],
  designation: [/d[ée]signation/i, /^nom/i, /article/i, /produit/i, /libell[ée]/i, /prestation/i, /mat[ée]riel/i],
  pu: [/^p\.?\s*u/i, /prix\s*unitaire/i, /unitaire/i, /tarif/i, /^prix/i],
  qte: [/qt[ée]/i, /quantit/i, /^qte/i, /nombre/i],
  statut: [/statut/i, /status/i, /[ée]tat/i],
};

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

function mapHeader(row: (string | number | undefined)[]): Record<string, number> {
  const map: Record<string, number> = {};
  row.forEach((cell, i) => {
    const s = normalize(String(cell ?? ''));
    if (!s) return;
    for (const [key, patterns] of Object.entries(HEADER_PATTERNS)) {
      if (map[key] === undefined && patterns.some((p) => p.test(String(cell ?? '').trim()) || p.test(s))) {
        map[key] = i;
        break;
      }
    }
  });
  return map;
}

function extractNumber(v: string | number | undefined): number {
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  const s = String(v ?? '')
    .replace(/\s|CFA|FCFA|€|\$/gi, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const m = s.match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : 0;
}

function parseDate(v: string | number | undefined): string {
  if (typeof v === 'number' && isFinite(v)) {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
  }
  const s = String(v ?? '').trim();
  const iso = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
  const fr = s.match(/(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/);
  if (fr) {
    const year = fr[3].length === 2 ? `20${fr[3]}` : fr[3];
    return `${year}-${fr[2].padStart(2, '0')}-${fr[1].padStart(2, '0')}`;
  }
  return new Date().toISOString().split('T')[0];
}

function rowsToDocuments(rows: (string | number | undefined)[][]): ImportedDocument[] {
  if (rows.length < 2) throw new Error('Le fichier ne contient pas assez de lignes.');

  // Trouve la ligne d'en-tête (celle qui correspond le mieux aux colonnes attendues)
  let bestIdx = 0;
  let bestMap: Record<string, number> = {};
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const map = mapHeader(rows[i]);
    if (Object.keys(map).length > Object.keys(bestMap).length) {
      bestMap = map;
      bestIdx = i;
    }
  }

  if (bestMap.designation === undefined) {
    throw new Error(
      'Colonnes non détectées. En-têtes attendus : "Client", "Désignation", "PU", "Qté" (optionnels : "Numéro", "Date", "Objet", "Statut").'
    );
  }

  const groups = new Map<string, ImportedDocument>();

  for (let i = bestIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === undefined || String(c).trim() === '')) continue;

    const designation = String(row[bestMap.designation] ?? '').trim();
    if (!designation) continue;

    const numero = bestMap.numero !== undefined ? String(row[bestMap.numero] ?? '').trim() : '';
    const clientRaw = bestMap.client !== undefined ? String(row[bestMap.client] ?? '').trim() : '';
    const date = bestMap.date !== undefined ? parseDate(row[bestMap.date]) : new Date().toISOString().split('T')[0];
    const objet = bestMap.objet !== undefined ? String(row[bestMap.objet] ?? '').trim() : '';
    const statut = bestMap.statut !== undefined ? String(row[bestMap.statut] ?? '').trim() : '';
    const pu = bestMap.pu !== undefined ? extractNumber(row[bestMap.pu]) : 0;
    const qteRaw = bestMap.qte !== undefined ? extractNumber(row[bestMap.qte]) : 1;
    const qte = qteRaw > 0 ? qteRaw : 1;

    const key = numero || `${clientRaw}|${date}|${objet}`;
    let doc = groups.get(key);
    if (!doc) {
      doc = {
        numero,
        client: clientRaw || 'Client importé',
        date,
        objet,
        statut,
        lignes: [],
        montant: 0,
      };
      groups.set(key, doc);
    }
    doc.lignes.push({ designation, pu, qte });
    doc.montant += pu * qte;
    if (clientRaw && doc.client === 'Client importé') doc.client = clientRaw;
    if (objet && !doc.objet) doc.objet = objet;
    if (statut && !doc.statut) doc.statut = statut;
  }

  const docs = Array.from(groups.values());
  if (docs.length === 0) throw new Error('Aucune ligne valide détectée dans le fichier.');
  return docs;
}

async function parseExcel(file: File): Promise<ImportedDocument[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const rows: (string | number | undefined)[][] = [];
  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    const raw = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
      header: 1,
      defval: '',
      raw: false,
      dateNF: 'yyyy-mm-dd',
    });
    rows.push(...raw);
  }
  return rowsToDocuments(rows);
}

async function parseWord(file: File): Promise<ImportedDocument[]> {
  const buf = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buf });
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const tables = Array.from(doc.querySelectorAll('table'));
  if (tables.length === 0) {
    throw new Error('Aucun tableau trouvé dans le document Word. Utilisez un tableau avec les colonnes "Désignation", "PU", "Qté".');
  }
  const rows: string[][] = [];
  for (const table of tables) {
    for (const tr of Array.from(table.querySelectorAll('tr'))) {
      const cells = Array.from(tr.querySelectorAll('td, th')).map((c) => c.textContent?.trim() ?? '');
      if (cells.some((c) => c)) rows.push(cells);
    }
  }
  return rowsToDocuments(rows);
}

export async function parseDocumentsFile(file: File): Promise<ImportedDocument[]> {
  const name = file.name.toLowerCase();
  if (/\.(xlsx|xls|csv)$/.test(name)) return parseExcel(file);
  if (/\.(docx)$/.test(name)) return parseWord(file);
  throw new Error('Format non supporté. Utilisez Excel (.xlsx, .xls, .csv) ou Word (.docx).');
}
