import { useEffect } from 'react';
import { getCompanySettings } from '@/lib/companySettings';
import { applyBrandTheme } from '@/lib/brandSettings';

export const BRAND_SETTINGS_EVENT = 'allntic-brand-settings-updated';

export function BrandIdentity() {
  useEffect(() => {
    const refresh = () => applyBrandTheme(getCompanySettings());
    refresh();
    window.addEventListener(BRAND_SETTINGS_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(BRAND_SETTINGS_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return null;
}