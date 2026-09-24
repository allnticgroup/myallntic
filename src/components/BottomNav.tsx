import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, ShoppingCart, Menu, FileText, Package, Wallet, CalendarDays, Receipt, Wrench, Settings, FolderKanban, BarChart3, Truck, Boxes, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
const logoAsset = { url: '/allntic-group-logo.jpg' };

const mainNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau' },
  { to: '/clients', icon: UserCheck, label: 'Clients' },
  { to: '/ventes', icon: ShoppingCart, label: 'Ventes' },
  { to: '/stock', icon: Boxes, label: 'Stock' },
];

const menuItems = [
  { to: '/prospects', icon: Users, label: 'Prospects' }, { to: '/devis', icon: FileText, label: 'Devis' },
  { to: '/factures', icon: Receipt, label: 'Factures' }, { to: '/fournisseurs', icon: Truck, label: 'Fournisseurs' },
  { to: '/interventions', icon: Wrench, label: 'Interventions' }, { to: '/projets', icon: FolderKanban, label: 'Projets' },
  { to: '/materiels', icon: Package, label: 'Matériels' }, { to: '/finances', icon: Wallet, label: 'Finances' },
  { to: '/rapports', icon: BarChart3, label: 'Rapports' }, { to: '/pilotage', icon: BarChart3, label: 'Pilotage' },
  { to: '/employes', icon: Users, label: 'Employés' }, { to: '/calendrier', icon: CalendarDays, label: 'Calendrier' },
  { to: '/parametres', icon: Settings, label: 'Paramètres' },
];

export function BottomNav() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isActive = (to: string) => location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  const allItems = [...mainNavItems, ...menuItems];

  return (
    <>
      <aside className={cn('fixed inset-y-0 left-0 z-50 hidden lg:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-200', collapsed ? 'w-20' : 'w-64')}>
        <Link to="/" className="h-20 px-4 flex items-center gap-3 border-b border-sidebar-border overflow-hidden">
          <img src={logoAsset.url} alt="ALLNTIC GROUP" className="h-12 w-12 shrink-0 rounded-md object-contain bg-card" />
          {!collapsed && <span className="font-bold font-heading leading-tight">ALLNTIC<br/><span className="text-accent text-xs">GROUP</span></span>}
        </Link>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {allItems.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} title={collapsed ? label : undefined} className={cn('flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors', isActive(to) ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground')}>
              <Icon className="h-5 w-5 shrink-0" />{!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" size="icon" onClick={() => setCollapsed((value) => !value)} className="m-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" aria-label={collapsed ? 'Déployer le menu' : 'Réduire le menu'}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-bottom lg:hidden">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {mainNavItems.map(({ to, icon: Icon, label }) => <Link key={to} to={to} className={cn('flex flex-col items-center justify-center flex-1 h-full transition-smooth', isActive(to) ? 'text-primary' : 'text-muted-foreground')}><Icon className="h-5 w-5 mb-1"/><span className="text-[11px] font-semibold">{label}</span></Link>)}
          <Button variant="ghost" onClick={() => setMenuOpen(true)} className="flex flex-col items-center justify-center flex-1 h-full rounded-none text-muted-foreground"><Menu className="h-5 w-5 mb-1"/><span className="text-[11px] font-semibold">Plus</span></Button>
        </div>
      </nav>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="rounded-t-lg pb-8 max-h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-4"><SheetTitle>Modules ALLNTIC GROUP</SheetTitle></SheetHeader>
          <div className="grid grid-cols-3 gap-3">
            {menuItems.map(({ to, icon: Icon, label }) => <Link key={to} to={to} onClick={() => setMenuOpen(false)} className={cn('flex min-h-20 flex-col items-center justify-center gap-2 p-3 rounded-md border transition-smooth text-center', isActive(to) ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border text-muted-foreground hover:bg-muted')}><Icon className="h-6 w-6"/><span className="text-xs font-semibold leading-tight">{label}</span></Link>)}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}