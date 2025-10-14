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
import RecentAlumniPage from "./pages/RecentAlumni";
import ChatPage from "./pages/ChatPage"; // Chat Page
import { useState, useEffect } from "react";
import FloatingRocket from "./components/ui/FloatingRocket";
import EventDetailPage from "./pages/EventDetailPage";
import Settings from "./pages/Settings";
import DiscussionPage from "./pages/DiscussionPage";
import MentorApplicationPage from './pages/MentorApplicationPage'; 
import { ProfileCompletionCard } from "./pages/ProfileCompletionCard";

const queryClient = new QueryClient();

const App = () => {
  const location = useLocation();

  // Hide header on login/auth screens
  const hideHeader =
    location.pathname === "/" || location.pathname === "/auth";

  // Detect if we're on a Chat page
  const isChatPage = location.pathname.startsWith("/chat");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        {/* 🌍 App Layout */}
        <div className="flex flex-col min-h-screen bg-background text-foreground">
          {/* Header (hidden on auth pages) */}
          {!hideHeader && <Header />}

          {/* Main content area */}
          <div
            className={`flex-1 ${
              isChatPage
                ? "overflow-hidden h-[calc(100vh-64px)]" // chat fits below header
                : "overflow-auto" // other pages scroll normally
            }`}
          >
            <Routes>
              {/* Authentication */}
              <Route path="/" element={<AuthCard />} />
              <Route path="/auth" element={<AuthCard />} />
              <Route path="/complete-profile" element={<ProfileCompletionCard />} />

              {/* Main Pages */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/events" element={<Events />} />
              <Route path="/forums" element={<Forums />} />
              <Route path="/mentorship" element={<Mentorship />} />
              <Route path="/fundraising" element={<Fundraising />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/update-profile" element={<UpdateProfile />} />
              <Route path="/notifications" element={<NotificationCenter />} />
              <Route path="/recent-alumnis" element={<RecentAlumniPage />} />
              <Route path="/events/:eventId" element={<EventDetailPage />} />
              <Route path="/apply-to-mentor" element={<MentorApplicationPage />} />
              <Route path="/chat" element={<ChatPage />} /> 
              <Route path="/chat/:alumniId" element={<ChatPage />} />

              <Route path="/forums/:threadId" element={<DiscussionPage />} /> 

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>

          {/* Floating rocket stays global */}
          <FloatingRocket />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// Root wrapper for router
const RootApp = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default RootApp;
