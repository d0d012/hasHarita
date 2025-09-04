import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import API from "./pages/API";
import ApiTest from "./pages/ApiTest";
import Documentation from "./pages/Documentation";
import Contact from "./pages/Contact";
import LightningLogs from "./pages/LightningLogs";
import DisasterLogs from "./pages/DisasterLogs";
import SustainabilityLogs from "./pages/SustainabilityLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/api" element={<API />} />
          <Route path="/api-test" element={<ApiTest />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/lightning-logs" element={<LightningLogs />} />
          <Route path="/disaster-logs" element={<DisasterLogs />} />
          <Route path="/sustainability-logs" element={<SustainabilityLogs />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
