import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { OnboardingTour } from "@/components/OnboardingTour";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Programs from "./pages/Programs";
import Results from "./pages/Results";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import DocumentVault from "./pages/DocumentVault";
import Community from "./pages/Community";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Bootstrap from "./pages/Bootstrap";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <OnboardingTour />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/results" element={<Results />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/documents" element={<DocumentVault />} />
            <Route path="/community" element={<Community />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/bootstrap" element={<Bootstrap />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
