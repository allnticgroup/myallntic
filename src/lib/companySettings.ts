import { CompanySettings } from '@/types';

const DEFAULT_SETTINGS: CompanySettings = {
  nom: 'ALLNTIC',
  adresse: 'Abidjan, Côte d\'Ivoire',
  ville: 'Abidjan',
  telephone: '+225 07 78 02 33 31',
  email: 'all.ntic225@gmail.com',
  siteWeb: 'www.allntic.com',
  tauxTVA: 0,
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
    return item ? { ...DEFAULT_SETTINGS, ...JSON.parse(item) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
