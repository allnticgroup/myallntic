import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import logoAsset from '@/assets/allntic-group-logo.jpg.asset.json';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, showBack, action }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border lg:ml-64">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0 -ml-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {!showBack && <img src={logoAsset.url} alt="ALLNTIC GROUP" className="h-10 w-10 rounded-md object-contain lg:hidden" />}
          <div className="min-w-0">
            <h1 className="font-semibold text-lg truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />
          {action}
        </div>
      </div>
    </header>
  );
}
