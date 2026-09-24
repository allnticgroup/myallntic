import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { getCompanySettings } from '@/lib/companySettings';
import { getThemeLogo } from '@/lib/brandSettings';
import { BRAND_SETTINGS_EVENT } from '@/components/BrandIdentity';

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

export function BrandLogo({ className, alt }: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const [settings, setSettings] = useState(getCompanySettings);

  useEffect(() => {
    const refresh = () => setSettings(getCompanySettings());
    window.addEventListener(BRAND_SETTINGS_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(BRAND_SETTINGS_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return <img src={getThemeLogo(settings, resolvedTheme === 'dark')} alt={alt || settings.nom} className={cn('object-contain', className)} />;
}