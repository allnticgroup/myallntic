import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, ShoppingCart, Menu, FileText, Package, Wallet, CalendarDays, Receipt, Wrench, Settings, FolderKanban, BarChart3, Truck, Boxes } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const mainNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau' },
  { to: '/clients', icon: UserCheck, label: 'Clients' },
  { to: '/ventes', icon: ShoppingCart, label: 'Ventes' },
  { to: '/stock', icon: Boxes, label: 'Stock' },
];

const menuItems = [
  { to: '/prospects', icon: Users, label: 'Prospects' },
  { to: '/devis', icon: FileText, label: 'Devis' },
  { to: '/factures', icon: Receipt, label: 'Factures' },
  { to: '/fournisseurs', icon: Truck, label: 'Fournisseurs' },
  { to: '/interventions', icon: Wrench, label: 'Interventions' },
  { to: '/projets', icon: FolderKanban, label: 'Projets' },
  { to: '/materiels', icon: Package, label: 'Matériels' },
  { to: '/finances', icon: Wallet, label: 'Finances' },
  { to: '/rapports', icon: BarChart3, label: 'Rapports' },
  { to: '/employes', icon: Users, label: 'Employés' },
  { to: '/calendrier', icon: CalendarDays, label: 'Calendrier' },
  { to: '/parametres', icon: Settings, label: 'Paramètres' },
];

export function BottomNav() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (to: string) =>
    location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  const isMenuItemActive = menuItems.some((item) => isActive(item.to));

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {mainNavItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-smooth',
                isActive(to)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 mb-1', isActive(to) && 'scale-110')} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
          <button
            onClick={() => setMenuOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full transition-smooth',
              isMenuItemActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Menu className={cn('h-5 w-5 mb-1', isMenuItemActive && 'scale-110')} />
            <span className="text-xs font-medium">Plus</span>
          </button>
        </div>
      </nav>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="rounded-t-xl pb-8">
          <SheetHeader className="mb-4">
            <SheetTitle>Modules</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-3">
            {menuItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border transition-smooth',
                  isActive(to)
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
