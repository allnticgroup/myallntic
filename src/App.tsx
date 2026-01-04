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
import DevisList from "./pages/DevisList";
import Interventions from "./pages/Interventions";
import Materials from "./pages/Materials";
import Finances from "./pages/Finances";
import Suppliers from "./pages/Suppliers";
import SupplierDetail from "./pages/SupplierDetail";
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
            <Route path="/devis" element={<DevisList />} />
            <Route path="/interventions" element={<Interventions />} />
            <Route path="/materiels" element={<Materials />} />
            <Route path="/finances" element={<Finances />} />
            <Route path="/fournisseurs" element={<Suppliers />} />
            <Route path="/fournisseurs/:id" element={<SupplierDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
