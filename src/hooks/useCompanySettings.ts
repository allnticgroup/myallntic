import { useLocalStorage } from './useLocalStorage';
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

export function useCompanySettings() {
  const [settings, setSettings] = useLocalStorage<CompanySettings>('allntic_company_settings', DEFAULT_SETTINGS);

  const updateSettings = (updates: Partial<CompanySettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const brandedSettings = { ...settings, nom: settings.nom === 'ALLNTIC' ? 'ALLNTIC GROUP' : settings.nom, logo: settings.logo || logoAsset.url };
  return { settings: brandedSettings, updateSettings };
}
