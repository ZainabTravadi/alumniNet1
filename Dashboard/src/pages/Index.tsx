import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopNavbar } from '@/components/dashboard/TopNavbar';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { EngagementHeatmap } from '@/components/dashboard/EngagementHeatmap';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  UserCheck, 
  TrendingUp, 
  Activity,
  MessageSquare,
  Award
} from 'lucide-react';

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [userRole] = useState<'admin' | 'superadmin'>('superadmin');

  const statsData = [
    {
      title: 'Active Users',
      value: '2,847',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Users,
      description: 'Monthly active alumni'
    },
    {
      title: 'Events This Month',
      value: '23',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: Calendar,
      description: 'Scheduled gatherings'
    },
    {
      title: 'Total Donations',
      value: '$284,590',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: DollarSign,
      description: 'This fiscal year'
    },
    {
      title: 'Mentorship Matches',
      value: '156',
      change: '+4.1%',
      changeType: 'positive' as const,
      icon: UserCheck,
      description: 'Active partnerships'
    },
    {
      title: 'Forum Posts',
      value: '1,234',
      change: '+22.1%',
      changeType: 'positive' as const,
      icon: MessageSquare,
      description: 'This week'
    },
    {
      title: 'New Registrations',
      value: '89',
      change: '-2.4%',
      changeType: 'negative' as const,
      icon: Award,
      description: 'This month'
    }
  ];

  return (
    <div className="min-h-screen gradient-bg">
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        userRole={userRole}
      />
      
      <TopNavbar 
        sidebarCollapsed={sidebarCollapsed}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Content */}
      <main className={`transition-all duration-300 pt-16 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="p-6 space-y-6">
          {/* Welcome Section */}
          <div className="mentor-card p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gradient">
                  Welcome back, Admin! 👋
                </h1>
                <p className="text-muted-foreground">
                  Here's what's happening with your alumni network today.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm text-muted-foreground">System Status: Operational</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statsData.map((stat) => (
              <StatsCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              <EngagementHeatmap />
              
              {/* Analytics Preview */}
              <div className="mentor-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gradient">Growth Analytics</h3>
                    <p className="text-sm text-muted-foreground">Alumni engagement trends</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span>Last 30 days</span>
                  </div>
                </div>
                
                {/* Placeholder Chart Area */}
                <div className="h-64 rounded-lg glow-border flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <TrendingUp className="h-12 w-12 text-primary mx-auto pulse-glow" />
                    <p className="text-muted-foreground">Interactive charts coming soon</p>
                    <p className="text-xs text-muted-foreground">Real-time engagement metrics</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              <QuickActions />
              <UpcomingEvents />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;