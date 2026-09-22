
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import TruConsentSync from "./components/TruConsentSync";
import Index from "./pages/Index";
import Banking from "./pages/Banking";
import Investments from "./pages/Investments";
import Loans from "./pages/Loans";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Support from "./pages/Support";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RightsCenter from "./pages/RightsCenter";
import MyAccount from "./pages/MyAccount";
import NotFound from "./pages/NotFound";
import "@truconsent/consent-notice/banner-styles.css";
import "@truconsent/consent-notice/variables.css";
import "@truconsent/consent-notice/tailwind.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <TruConsentSync />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Index />} />
            <Route path="/banking" element={<Banking />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/support" element={<Support />} />
            <Route path="/rights-center" element={<RightsCenter />} />
            <Route path="/my-account" element={<MyAccount />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
