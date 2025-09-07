import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/layout/Header";
import Dashboard from "./pages/Dashboard";
import Directory from "./pages/Directory";
import Events from "./pages/Events";
import Forums from "./pages/Forums";
import Mentorship from "./pages/Mentorship";
import Fundraising from "./pages/Fundraising";
import Profile from "./pages/Profile";
import UpdateProfile from "./pages/UpdateProfile";
import NotificationCenter from "./components/notifications/NotificationCenter";
import NotFound from "./pages/NotFound";
import { AuthCard } from "./components/auth/AuthCard";

// 🚀 Import your floating rocket
import FloatingRocket from "./components/ui/FloatingRocket";

const queryClient = new QueryClient();

const App = () => {
  const location = useLocation();
  const hideHeader = location.pathname === "/" || location.pathname === "/auth";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen">
          {!hideHeader && <Header />}
          <Routes>
            {/* Auth first */}
            <Route path="/" element={<AuthCard />} />
            <Route path="/auth" element={<AuthCard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/events" element={<Events />} />
            <Route path="/forums" element={<Forums />} />
            <Route path="/mentorship" element={<Mentorship />} />
            <Route path="/fundraising" element={<Fundraising />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/update-profile" element={<UpdateProfile />} />
            <Route path="/notifications" element={<NotificationCenter />} />
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* 🚀 Floating rocket button */}
          <FloatingRocket />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const RootApp = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default RootApp;
