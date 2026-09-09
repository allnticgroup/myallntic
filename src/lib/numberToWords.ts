const UNITS = [
  'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf',
];

const TENS: Record<number, string> = {
  2: 'vingt',
  3: 'trente',
  4: 'quarante',
  5: 'cinquante',
  6: 'soixante',
  7: 'soixante',
  8: 'quatre-vingt',
  9: 'quatre-vingt',
};

function belowHundred(n: number): string {
  if (n < 20) return UNITS[n];
  const tens = Math.floor(n / 10);
  const rest = n % 10;
  const base = TENS[tens];

  if (tens === 7 || tens === 9) {
    const sub = 10 + rest;
    if (tens === 7 && rest === 1) return 'soixante et onze';
    return `${base}-${UNITS[sub]}`;
  }

  if (rest === 0) return tens === 8 ? 'quatre-vingts' : base;
  if (rest === 1 && tens !== 8) return `${base} et un`;
  return `${base}-${UNITS[rest]}`;
}

function belowThousand(n: number): string {
  if (n < 100) return belowHundred(n);
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const prefix = hundreds === 1 ? 'cent' : `${UNITS[hundreds]} cent`;
  if (rest === 0) return hundreds === 1 ? 'cent' : `${prefix}s`;
  return `${prefix} ${belowThousand(rest)}`;
}

/** Convertit un entier en toutes lettres (français). */
export function numberToFrenchWords(value: number): string {
  const n = Math.floor(Math.abs(value));
  if (n === 0) return 'zéro';

  const scales: { limit: number; singular: string; plural: string }[] = [
    { limit: 1_000_000_000, singular: 'milliard', plural: 'milliards' },
    { limit: 1_000_000, singular: 'million', plural: 'millions' },
    { limit: 1_000, singular: 'mille', plural: 'mille' },
  ];

  let rest = n;
  const parts: string[] = [];

  for (const scale of scales) {
    const count = Math.floor(rest / scale.limit);
    if (count > 0) {
      const label = count > 1 ? scale.plural : scale.singular;
      if (scale.limit === 1000 && count === 1) {
        parts.push('mille');
      } else {
        parts.push(`${numberToFrenchWords(count)} ${label}`);
      }
      rest %= scale.limit;
    }
  }

  if (rest > 0) parts.push(belowThousand(rest));

  const words = parts.join(' ');
  return value < 0 ? `moins ${words}` : words;
}

/** Montant en toutes lettres, ex : "Cinq cent mille francs CFA". */
export function montantEnLettres(montant: number, devise = 'francs CFA'): string {
  const words = numberToFrenchWords(montant);
  const text = `${words} ${devise}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
