import * as pdfjsLib from 'pdfjs-dist';
// Utilise le worker bundlé par Vite (pas de CDN → pas d'erreur réseau/CORS)
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { MaterialCategory } from '@/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

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
  camera: ['caméra', 'camera', 'dôme', 'dome', 'bullet', 'ptz', 'ip cam', 'tourelle', 'turret', 'colorvu', 'tandemvu', 'display'],
  cable: ['câble', 'cable', 'rj45', 'coaxial', 'utp', 'ftp', 'fibre', 'cat5', 'cat6', 'patch cord', 'cordon'],
  enregistreur: ['nvr', 'dvr', 'enregistreur', 'recorder', 'edvr', 'envr'],
  accessoire: ['support', 'alimentation', 'connecteur', 'boîtier', 'boitier', 'adaptateur', 'lock', 'button', 'reader', 'terminal', 'card', 'ups', 'onduleur', 'balun', 'hdd', 'disque', 'bell'],
  reseau: ['switch', 'routeur', 'router', 'access point', 'modem', 'firewall', 'baie', 'coffret', 'patch panel'],
  autre: [],
};

function detectCategory(text: string): MaterialCategory {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'autre') continue;
    if (keywords.some(kw => lower.includes(kw))) return category as MaterialCategory;
  }
  return 'autre';
}

function parsePrice(raw: string): number {
  const cleaned = raw.replace(/\s/g, '').replace(/,/g, '');
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? 0 : n;
}

// Reconstruction de lignes depuis pdfjs en regroupant par Y arrondi
async function extractLines(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const lines: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = content.items as any[];

    // Groupe par Y (tolérance 3px)
    const buckets = new Map<number, { x: number; text: string }[]>();
    items.forEach((it) => {
      const y = Math.round(it.transform[5] / 3) * 3;
      if (!buckets.has(y)) buckets.set(y, []);
      buckets.get(y)!.push({ x: it.transform[4], text: it.str });
    });

    Array.from(buckets.entries())
      .sort((a, b) => b[0] - a[0])
      .forEach(([, cells]) => {
        cells.sort((a, b) => a.x - b.x);
        const line = cells.map((c) => c.text).join(' ').replace(/\s+/g, ' ').trim();
        if (line) lines.push(line);
      });
  }
  return lines;
}

// Détection ligne-par-ligne : format catalogue Hikvision & similaires
// Chaque produit = 1 ligne contenant "XX,XXX CFA" (ou €, FCFA...) et un code-référence au début
const PRICE_RE = /([\d]{1,3}(?:[.,\s]\d{3})+|\d+)\s*(?:CFA|FCFA|F\.CFA|€|EUR)/i;
const REF_RE = /^[A-Z0-9][A-Z0-9._/+-]{2,}(?:\([^)]+\))?$/;

function parseLineBased(lines: string[]): ParsedMaterial[] {
  const materials: ParsedMaterial[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const priceMatch = line.match(PRICE_RE);
    if (!priceMatch) continue;

    const prix = parsePrice(priceMatch[1]);
    if (prix < 100) continue;

    // Tout ce qui est avant le prix
    const before = line.slice(0, priceMatch.index).trim();
    if (!before) continue;

    const tokens = before.split(/\s+/);
    let reference = '';
    let nameStart = 0;
    // La référence est en général le 1er ou 2e token qui matche REF_RE
    for (let i = 0; i < Math.min(3, tokens.length); i++) {
      if (REF_RE.test(tokens[i]) && /[0-9]/.test(tokens[i])) {
        reference = tokens[i];
        nameStart = i + 1;
        break;
      }
    }
    if (!reference) continue;
    if (seen.has(reference)) continue;
    seen.add(reference);

    const rest = tokens.slice(nameStart).join(' ').trim();
    // Nom = premiers ~60 caractères, description = reste
    let nom = rest;
    let description = '';
    if (rest.length > 70) {
      // coupe sur le 1er point ou après ~60 chars
      const cut = rest.indexOf('.') > 0 && rest.indexOf('.') < 90 ? rest.indexOf('.') : 60;
      nom = rest.slice(0, cut).trim();
      description = rest.slice(cut).replace(/^[.\s]+/, '').trim();
    }
    if (!nom) nom = reference;

    materials.push({
      nom,
      reference,
      categorie: detectCategory(`${nom} ${description}`),
      prixUnitaire: prix,
      unite: 'PCS',
      stockQuantite: 0,
      stockMinimum: 5,
      description,
    });
  }

  return materials;
}

export async function parseMaterialsPdf(file: File): Promise<ParsedMaterial[]> {
  let lines: string[];
  try {
    lines = await extractLines(file);
  } catch (e: any) {
    throw new Error(`Lecture du PDF impossible : ${e?.message || e}`);
  }

  if (lines.length === 0) {
    throw new Error('Aucun texte extractible dans ce PDF (peut-être scanné en image).');
  }

  const materials = parseLineBased(lines);
  if (materials.length === 0) {
    throw new Error(
      "Aucun produit détecté. Formats supportés : lignes contenant une référence puis un prix (ex : « DS-XXXX ... 25 000 CFA »)."
    );
  }
  return materials;
}
