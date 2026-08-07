// Import de devis et factures depuis Excel (.xlsx/.xls/.csv), Word (.docx) ou PDF (.pdf)
// Colonnes attendues : "Client", "Désignation", "PU", "Qté"
// Colonnes optionnelles : "Numéro", "Date", "Objet", "Statut"
// PDF : analyse positionnelle du tableau (en-têtes "Désignation/Nom", "PU", "Qté", "Total")
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
// Worker bundlé par Vite (pas de CDN → pas d'erreur réseau/CORS)
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

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

// ===================== PARSING PDF =====================

interface PdfCell {
  x: number;
  text: string;
}
interface PdfLine {
  cells: PdfCell[];
  text: string;
}

// Reconstruction de lignes positionnées depuis pdfjs en regroupant par Y arrondi
async function extractPdfLines(file: File): Promise<PdfLine[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const lines: PdfLine[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = content.items as { transform: number[]; str: string }[];

    const buckets = new Map<number, PdfCell[]>();
    items.forEach((it) => {
      if (!it.str.trim()) return;
      const y = Math.round(it.transform[5] / 3) * 3;
      if (!buckets.has(y)) buckets.set(y, []);
      buckets.get(y)!.push({ x: it.transform[4], text: it.str });
    });

    Array.from(buckets.entries())
      .sort((a, b) => b[0] - a[0])
      .forEach(([, cells]) => {
        cells.sort((a, b) => a.x - b.x);
        const text = cells.map((c) => c.text).join(' ').replace(/\s+/g, ' ').trim();
        if (text) lines.push({ cells, text });
      });
  }
  return lines;
}

function parsePdfNumber(raw: string): number {
  let s = raw.replace(/[\s  ]|CFA|FCFA|€|\$/gi, '');
  // "25,000" ou "25,000.5" → virgule = milliers ; sinon virgule = décimale
  if (/,\d{3}(\.|$)/.test(s)) s = s.replace(/,/g, '');
  else s = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s.replace(/[^\d.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

// Motifs de colonnes pour les tableaux PDF (compatibles avec les PDF générés par l'app :
// "Nom du produit", "PU,TTC", "PT.TTC" (=Qté), "M.T. T.T.C" — et "Désignation", "P.U. HT", "Qté", "Total HT")
const PDF_COL_PATTERNS: Record<string, RegExp[]> = {
  designation: [/d[ée]signation/i, /^nom/i, /libell[ée]/i, /article/i, /produit/i, /prestation/i, /mat[ée]riel/i],
  pu: [/^p\.?\s*u/i, /prix\s*unitaire/i, /unitaire/i, /^prix/i],
  qte: [/qt[ée]/i, /quantit/i, /^pt[.,\s]/i],
  total: [/total/i, /montant/i, /^m\.?t\.?/i],
};

const PDF_HEADER_DESIG_RE = /d[ée]signation|nom du produit|libell[ée]|prestation|article/i;
const PDF_HEADER_PU_RE = /p\.?\s*u[.,\s]|prix\s*unitaire|unitaire/i;
const PDF_STOP_RE = /^(montant\b|total\b|net\s+[àa]\s+payer|arr[êe]t[ée]|tva\b|conditions|signature|main.?d|bon pour|cachet|d[ée]tail|mode de r[èe]glement)/i;
const PDF_META_SKIP_RE = /devis|facture|client|date|[ée]ch[ée]ance|n\s*[°o]|t[ée]l|contact|adresse/i;

async function parsePdf(file: File): Promise<ImportedDocument[]> {
  const lines = await extractPdfLines(file);
  if (lines.length === 0) {
    throw new Error('Aucun texte extractible dans ce PDF (peut-être scanné en image).');
  }

  // ----- Métadonnées du document -----
  let numero = '';
  let client = '';
  let date = '';
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].text;
    if (!numero) {
      const m = t.match(/n\s*[°o]\s*[:.]?\s*([A-Za-z0-9][\w/.-]*)/i);
      if (m) numero = m[1];
    }
    if (!client) {
      const inline = t.match(/^(?:client|factur[ée]\s+[àa]|destinataire)\s*:?\s*(.+)$/i);
      if (inline) {
        client = inline[1].trim();
      } else if (/^(?:client|factur[ée]\s+[àa]|destinataire)\s*:?\s*$/i.test(t)) {
        const next = lines[i + 1]?.text.trim();
        if (next) client = next;
      }
    }
    if (!date) {
      const m = t.match(/\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}/);
      if (m) date = parseDate(m[0]);
    }
  }
  if (!date) date = new Date().toISOString().split('T')[0];

  // ----- Repérage de l'en-tête du tableau -----
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].text;
    if (PDF_HEADER_DESIG_RE.test(t) && PDF_HEADER_PU_RE.test(t)) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) {
    throw new Error(
      'Tableau introuvable dans le PDF. En-têtes attendus : « Désignation » (ou « Nom du produit »), « PU », « Qté », « Total ».'
    );
  }

  // ----- Définition des segments de colonnes à partir des positions X de l'en-tête -----
  const anchors = [...lines[headerIdx].cells].sort((a, b) => a.x - b.x);
  const kinds = anchors.map((c) => {
    const t = c.text.trim();
    for (const [kind, patterns] of Object.entries(PDF_COL_PATTERNS)) {
      if (patterns.some((p) => p.test(t))) return kind;
    }
    return 'other';
  });
  const boundaries = anchors.slice(0, -1).map((c, i) => (c.x + anchors[i + 1].x) / 2);
  const segOf = (x: number): number => {
    for (let i = 0; i < boundaries.length; i++) {
      if (x < boundaries[i]) return i;
    }
    return anchors.length - 1;
  };

  // Objet du document : ligne juste au-dessus de l'en-tête si elle est plausible
  let objet = '';
  const prevLine = lines[headerIdx - 1]?.text.trim() ?? '';
  if (prevLine && prevLine.length > 2 && !PDF_META_SKIP_RE.test(prevLine) && !/\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}/.test(prevLine)) {
    objet = prevLine;
  }

  // ----- Extraction des lignes d'articles -----
  const lignes: ImportedDocLine[] = [];
  let pendingPrefix: string[] = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    const t = line.text;
    if (PDF_STOP_RE.test(t)) break;
    // En-tête répété sur une autre page
    if (PDF_HEADER_DESIG_RE.test(t) && PDF_HEADER_PU_RE.test(t)) continue;

    const buckets: Record<string, string[]> = { designation: [], pu: [], qte: [], total: [] };
    line.cells.forEach((c) => {
      const kind = kinds[segOf(c.x)];
      if (kind !== 'other' && c.text.trim()) buckets[kind].push(c.text.trim());
    });

    const desig = buckets.designation.join(' ').trim();
    const pu = parsePdfNumber(buckets.pu.filter((s) => /\d/.test(s)).join(' '));
    let qte = parsePdfNumber(buckets.qte.filter((s) => /\d/.test(s)).join(' '));
    const total = parsePdfNumber(buckets.total.filter((s) => /\d/.test(s)).join(' '));

    if (pu <= 0 && total <= 0) {
      // Nom d'article sur plusieurs lignes (texte seul avant les chiffres)
      if (desig) pendingPrefix.push(desig);
      continue;
    }
    const designation = [...pendingPrefix, desig].filter(Boolean).join(' ').trim();
    pendingPrefix = [];
    if (!designation) continue;

    if (qte <= 0) qte = pu > 0 && total > 0 ? Math.max(1, Math.round(total / pu)) : 1;
    const finalPu = pu > 0 ? pu : qte > 0 ? Math.round(total / qte) : total;
    lignes.push({ designation, pu: finalPu, qte });
  }

  if (lignes.length === 0) {
    throw new Error("Aucune ligne d'article détectée dans le PDF.");
  }

  return [
    {
      numero,
      client: client || 'Client importé',
      date,
      objet,
      statut: '',
      lignes,
      montant: lignes.reduce((s, l) => s + l.pu * l.qte, 0),
    },
  ];
}

export async function parseDocumentsFile(file: File): Promise<ImportedDocument[]> {
  const name = file.name.toLowerCase();
  if (/\.(xlsx|xls|csv)$/.test(name)) return parseExcel(file);
  if (/\.(docx)$/.test(name)) return parseWord(file);
  if (/\.(pdf)$/.test(name)) return parsePdf(file);
  throw new Error('Format non supporté. Utilisez Excel (.xlsx, .xls, .csv), Word (.docx) ou PDF (.pdf).');
}
