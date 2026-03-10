import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { BottomNav } from "@/components/BottomNav";
import Index from "./pages/Index";
import Prospects from "./pages/Prospects";
import ProspectDetail from "./pages/ProspectDetail";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import DevisList from "./pages/DevisList";
import Ventes from "./pages/Ventes";
import Stock from "./pages/Stock";
import Interventions from "./pages/Interventions";
import Materials from "./pages/Materials";
import Finances from "./pages/Finances";
import Suppliers from "./pages/Suppliers";
import SupplierDetail from "./pages/SupplierDetail";
import Calendar from "./pages/Calendar";
import Invoices from "./pages/Invoices";
import Employees from "./pages/Employees";
import EmployeeDetail from "./pages/EmployeeDetail";
import Projets from "./pages/Projets";
import ProjetDetail from "./pages/ProjetDetail";
import Rapports from "./pages/Rapports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/prospects" element={<Prospects />} />
            <Route path="/prospects/:id" element={<ProspectDetail />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/devis" element={<DevisList />} />
            <Route path="/ventes" element={<Ventes />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/interventions" element={<Interventions />} />
            <Route path="/materiels" element={<Materials />} />
            <Route path="/finances" element={<Finances />} />
            <Route path="/fournisseurs" element={<Suppliers />} />
            <Route path="/fournisseurs/:id" element={<SupplierDetail />} />
            <Route path="/calendrier" element={<Calendar />} />
            <Route path="/factures" element={<Invoices />} />
            <Route path="/employes" element={<Employees />} />
            <Route path="/employes/:id" element={<EmployeeDetail />} />
            <Route path="/projets" element={<Projets />} />
            <Route path="/projets/:id" element={<ProjetDetail />} />
            <Route path="/rapports" element={<Rapports />} />
            <Route path="/parametres" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
