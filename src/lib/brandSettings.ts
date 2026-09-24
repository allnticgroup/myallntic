import { CompanySettings } from '@/types';

export const OFFICIAL_BRAND = {
  primaryColor: '#0645B5',
  accentColor: '#08BEE8',
  darkColor: '#061D49',
};

const HEX_PATTERN = /^#[0-9a-f]{6}$/i;

export function normalizeHex(value: string | undefined, fallback: string) {
  return value && HEX_PATTERN.test(value) ? value.toUpperCase() : fallback;
}

export function hexToRgb(value: string | undefined, fallback = OFFICIAL_BRAND.primaryColor): [number, number, number] {
  const hex = normalizeHex(value, fallback).slice(1);
  return [Number.parseInt(hex.slice(0, 2), 16), Number.parseInt(hex.slice(2, 4), 16), Number.parseInt(hex.slice(4, 6), 16)];
}

export function hexToDocx(value: string | undefined, fallback = OFFICIAL_BRAND.primaryColor) {
  return normalizeHex(value, fallback).slice(1);
}

function hexToHsl(value: string, fallback: string) {
  const [r8, g8, b8] = hexToRgb(value, fallback);
  const r = r8 / 255;
  const g = g8 / 255;
  const b = b8 / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const delta = max - min;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }
  if (h < 0) h += 360;
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function applyBrandTheme(settings: Pick<CompanySettings, 'primaryColor' | 'accentColor' | 'darkColor'>) {
  const root = document.documentElement;
  root.style.setProperty('--primary', hexToHsl(settings.primaryColor || OFFICIAL_BRAND.primaryColor, OFFICIAL_BRAND.primaryColor));
  root.style.setProperty('--accent', hexToHsl(settings.accentColor || OFFICIAL_BRAND.accentColor, OFFICIAL_BRAND.accentColor));
  root.style.setProperty('--sidebar-background', hexToHsl(settings.darkColor || OFFICIAL_BRAND.darkColor, OFFICIAL_BRAND.darkColor));
  root.style.setProperty('--foreground', hexToHsl(settings.darkColor || OFFICIAL_BRAND.darkColor, OFFICIAL_BRAND.darkColor));
}

export function getThemeLogo(settings: CompanySettings, dark: boolean) {
  if (dark) return settings.logoDark || settings.logo || '/allntic-group-logo.jpg';
  return settings.logoLight || settings.logo || '/allntic-group-logo.jpg';
}