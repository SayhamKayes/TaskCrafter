import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import TimerPage from "./pages/TimerPage";
import Tasks from "./pages/Tasks";
import CalculatorPage from "./pages/CalculatorPage";
import SalahPage from "./pages/SalahPage";
import InvoicePage from "./pages/InvoicePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/TaskCrafter">
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/timer" element={<TimerPage />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/salah" element={<SalahPage />} />
            <Route path="/invoice" element={<InvoicePage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
