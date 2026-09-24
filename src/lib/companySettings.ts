import { CompanySettings } from '@/types';
import logoAsset from '@/assets/allntic-group-logo.jpg.asset.json';

const DEFAULT_SETTINGS: CompanySettings = {
  nom: 'ALLNTIC GROUP',
  adresse: 'Abidjan, Côte d\'Ivoire',
  ville: 'Abidjan',
  telephone: '+225 07 78 02 33 31',
  email: 'all.ntic225@gmail.com',
  siteWeb: 'www.allntic.com',
  tauxTVA: 0,
  logo: logoAsset.url,
  services: [
    'Installation et maintenance',
    'Réseaux et câblage',
    'Vidéosurveillance',
    'Solutions de sécurité',
    'Développement web',
  ],
};

export function getCompanySettings(): CompanySettings {
  try {
    const item = window.localStorage.getItem('allntic_company_settings');
    if (!item) return DEFAULT_SETTINGS;
    const stored = JSON.parse(item) as CompanySettings;
    return { ...DEFAULT_SETTINGS, ...stored, nom: stored.nom === 'ALLNTIC' ? 'ALLNTIC GROUP' : stored.nom, logo: stored.logo || logoAsset.url };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
