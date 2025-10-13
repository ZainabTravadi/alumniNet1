"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopNavbar } from "@/components/dashboard/TopNavbar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import {
  Users,
  Calendar,
  DollarSign,
  UserCheck,
  MessageSquare,
  Award,
  Activity,
  TrendingUp,
} from "lucide-react";

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [userRole] = useState<"admin" | "superadmin">("superadmin");

  const statsData = [
    {
      title: "Active Users",
      value: "2,847",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: Users,
      description: "Monthly active alumni",
    },
    {
      title: "Events This Month",
      value: "23",
      change: "+8.2%",
      changeType: "positive" as const,
      icon: Calendar,
      description: "Scheduled gatherings",
    },
    {
      title: "Total Donations",
      value: "$284,590",
      change: "+15.3%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "This fiscal year",
    },
    {
      title: "Mentorship Matches",
      value: "156",
      change: "+4.1%",
      changeType: "positive" as const,
      icon: UserCheck,
      description: "Active partnerships",
    },
    {
      title: "Forum Posts",
      value: "1,234",
      change: "+22.1%",
      changeType: "positive" as const,
      icon: MessageSquare,
      description: "This week",
    },
    {
      title: "New Registrations",
      value: "89",
      change: "-2.4%",
      changeType: "negative" as const,
      icon: Award,
      description: "This month",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole={userRole}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <TopNavbar
          sidebarCollapsed={sidebarCollapsed}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />

        {/* Main Content */}
        <main
          className={`transition-all duration-300 ${
            sidebarCollapsed ? "ml-16" : "ml-64"
          } pt-16`}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <section className="bg-card border border-border/40 rounded-2xl p-6 sm:p-8 shadow-sm hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
                <div className="min-w-[200px]">
                  <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
                    <span className="text-white">Welcome&nbsp;</span>
                    <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-white bg-clip-text text-transparent">
                      Admin
                    </span>
                  </h1>
                  <p className="text-muted-foreground text-sm mt-2">
                    Here’s your latest activity overview.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  <span>System Status: Operational</span>
                </div>
              </div>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {statsData.map((stat) => (
                <div
                  key={stat.title}
                  className="bg-card border border-border/40 rounded-xl p-5 sm:p-6 shadow-sm hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-300"
                >
                  <StatsCard {...stat} />
                </div>
              ))}
            </section>

            {/* Analytics & Events */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Growth Analytics */}
              <div className="lg:col-span-2 bg-card border border-border/40 rounded-2xl p-6 shadow-sm hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-300">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                  <div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 via-purple-500 to-white bg-clip-text text-transparent">
                      Growth Analytics
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Overview of alumni trends
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4 shrink-0" />
                    <span>Last 30 days</span>
                  </div>
                </div>

                <div className="h-64 sm:h-72 flex items-center justify-center rounded-xl bg-muted/20 border border-border/30">
                  <div className="text-center">
                    <TrendingUp className="h-10 w-10 text-primary mx-auto opacity-80" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Charts coming soon
                    </p>
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div>
                <UpcomingEvents />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
