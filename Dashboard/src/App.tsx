import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// 💡 AdminLayout component
import AdminLayout from "./components/AdminLayout"; 

import Index from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

import UserControlPanel from "./pages/UserManagement";
import EventsManager from "./pages/Events";
import FundManager from "./pages/FundraisingManagement";
import NotificationsManager from "./pages/NotificationsManager";
import AdminSettings from "./pages/Settings";
import { AuthCard } from "./components/auth/AuthCard"; // Auth component

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          
          {/* 💡 FIX: Keep the root route (/) separate for a no-navbar landing page */}
          {/* Authentication */}
              <Route path="/" element={<AuthCard />} />
              <Route path="/auth" element={<AuthCard />} />
              <Route path="/dashboard" element={<Index />} />
          
          {/* PERSISTENT LAYOUT: All child routes below inherit the sidebar.
             We use a wrapper route (e.g., /admin) or an asterisk path (*) 
             to contain all admin pages. Since your main content is admin-focused,
             we'll start a new path segment, or you can explicitly list them.
             
             To make the old routes accessible, we'll nest them under a simple wildcard parent.
          */}
          <Route element={<AdminLayout />}>
            
            {/* These routes will now load *with* the Sidebar */}
            
            <Route path="/users" element={<UserControlPanel />} />
            <Route path="/events" element={<EventsManager />} />
            <Route path="/fundraising" element={<FundManager />} />
            <Route path="/notifications" element={<NotificationsManager />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;