import { useLocalStorage } from './useLocalStorage';
import { CompanySettings } from '@/types';
import { applyBrandTheme, OFFICIAL_BRAND } from '@/lib/brandSettings';
import { BRAND_SETTINGS_EVENT } from '@/components/BrandIdentity';
const logoAsset = { url: '/allntic-group-logo.jpg' };

const DEFAULT_SETTINGS: CompanySettings = {
  nom: 'ALLNTIC GROUP',
  adresse: 'Abidjan, Côte d\'Ivoire',
  ville: 'Abidjan',
  telephone: '+225 07 78 02 33 31',
  email: 'all.ntic225@gmail.com',
  siteWeb: 'www.allntic.com',
  tauxTVA: 0,
  logo: logoAsset.url,
  logoLight: logoAsset.url,
  logoDark: logoAsset.url,
  primaryColor: OFFICIAL_BRAND.primaryColor,
  accentColor: OFFICIAL_BRAND.accentColor,
  darkColor: OFFICIAL_BRAND.darkColor,
  documentFooter: 'Merci pour votre confiance.',
  documentTerms: 'Devis valable 7 jours. Acompte de 75% à la commande, solde à la livraison.',
  services: [
    'Installation et maintenance',
    'Réseaux et câblage',
    'Vidéosurveillance',
    'Solutions de sécurité',
    'Développement web',
  ],
};

export function useCompanySettings() {
  const [settings, setSettings] = useLocalStorage<CompanySettings>('allntic_company_settings', DEFAULT_SETTINGS);

  const updateSettings = (updates: Partial<CompanySettings>) => {
    const next = { ...brandedSettings, ...updates };
    setSettings(next);
    applyBrandTheme(next);
    window.dispatchEvent(new Event(BRAND_SETTINGS_EVENT));
  };

  const brandedSettings = { ...DEFAULT_SETTINGS, ...settings, nom: settings.nom === 'ALLNTIC' ? 'ALLNTIC GROUP' : settings.nom, logo: settings.logo || logoAsset.url };
  return { settings: brandedSettings, updateSettings };
}
