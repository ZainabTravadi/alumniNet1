"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopNavbar } from "@/components/dashboard/TopNavbar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import {
  Users,
  Calendar,
  DollarSign,
  UserCheck,
  MessageSquare,
  Award,
  Activity,
  TrendingUp,
  LucideIcon,
  LineChart,
  ClipboardList,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming Button is available
import { Card } from "@/components/ui/card"; // Assuming Card is available
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"; // Assuming this shadcn component exists

// ------------------ INTERFACE DEFINITIONS ------------------

interface StatMetric {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  description: string;
}

interface EventData {
  id: string;
  title: string;
  date: Timestamp;
  location: string;
  attendeeCount: number;
  maxAttendees: number;
  category: string;
  image: string;
}

// Data point for the simulated chart
interface ChartDataPoint {
  date: string;
  value: number;
}

type ChartCategory = "users" | "events" | "donations" | "forum_threads";

// ------------------ DUMMY/FALLBACK DATA ------------------

const DUMMY_STATS_DATA: StatMetric[] = [
  {
    title: "Active Users",
    value: "N/A",
    change: "...",
    changeType: "neutral",
    icon: Users,
    description: "Data loading failed",
  },
  {
    title: "Events This Month",
    value: "N/A",
    change: "...",
    changeType: "neutral",
    icon: Calendar,
    description: "Data loading failed",
  },
  {
    title: "Total Donations",
    value: "N/A",
    change: "...",
    changeType: "neutral",
    icon: DollarSign,
    description: "Data loading failed",
  },
  {
    title: "Mentorship Matches",
    value: "N/A",
    change: "...",
    changeType: "neutral",
    icon: UserCheck,
    description: "Data loading failed",
  },
  {
    title: "Forum Posts",
    value: "N/A",
    change: "...",
    changeType: "neutral",
    icon: MessageSquare,
    description: "Data loading failed",
  },
  {
    title: "New Registrations",
    value: "N/A",
    change: "...",
    changeType: "neutral",
    icon: Award,
    description: "Data loading failed",
  },
];

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [userRole] = useState<"admin" | "superadmin">("superadmin");

  // State for metrics and loading
  const [stats, setStats] = useState<StatMetric[]>(DUMMY_STATS_DATA);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  // State for Analytics Chart
  const [chartCategory, setChartCategory] = useState<ChartCategory>("users");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [rawData, setRawData] = useState<{ [key: string]: QueryDocumentSnapshot<any>[] }>({});

  const analyticsCategories: { id: ChartCategory; label: string; icon: LucideIcon }[] = [
    { id: "users", label: "Users", icon: Users },
    { id: "events", label: "Events", icon: Calendar },
    { id: "donations", label: "Fundraising", icon: DollarSign },
    { id: "forum_threads", label: "Forum Posts", icon: MessageSquare },
  ];

  // Helper function to get the start and end of the current month
  const getMonthDateRange = (date: Date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
      start: Timestamp.fromDate(startOfMonth),
      end: Timestamp.fromDate(endOfMonth),
    };
  };

  // Helper function to process raw snapshots into chart data
  const processChartData = (category: ChartCategory, snapshots: { [key: string]: QueryDocumentSnapshot<any>[] }): ChartDataPoint[] => {
    const data = snapshots[category] || [];
    if (data.length === 0) return [];

    const monthlyCounts = new Map<string, number>();
    const oneYearAgo = new Date();
    oneYearAgo.setMonth(oneYearAgo.getMonth() - 11);
    oneYearAgo.setDate(1);

    // 1. Populate the map with 0s for the last 12 months
    for (let i = 0; i < 12; i++) {
        const date = new Date(oneYearAgo.getFullYear(), oneYearAgo.getMonth() + i, 1);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        monthlyCounts.set(monthKey, 0);
    }

    // 2. Aggregate the fetched data
    data.forEach(doc => {
        let dateField: Timestamp | undefined;

        if (category === "users") {
            dateField = doc.data().createdAt;
        } else if (category === "events") {
            dateField = doc.data().date;
        } else if (category === "donations") {
            dateField = doc.data().date || doc.data().createdAt;
        } else if (category === "forum_threads") {
            dateField = doc.data().createdAt;
        }
        
        if (dateField instanceof Timestamp) {
            const docDate = dateField.toDate();
            if (docDate >= oneYearAgo) {
                const monthKey = `${docDate.getFullYear()}-${docDate.getMonth() + 1}`;
                
                if (category === "donations") {
                    // For donations, aggregate the amount
                    const amount = doc.data().amount || 0;
                    monthlyCounts.set(monthKey, (monthlyCounts.get(monthKey) || 0) + amount);
                } else {
                    // For all others (count documents)
                    monthlyCounts.set(monthKey, (monthlyCounts.get(monthKey) || 0) + 1);
                }
            }
        }
    });

    // 3. Convert map back to array for chart display, using short month names
    const finalData: ChartDataPoint[] = Array.from(monthlyCounts.entries())
        .map(([key, value]) => {
            const [year, monthIndex] = key.split('-').map(Number);
            const date = new Date(year, monthIndex - 1);
            return {
                date: date.toLocaleString('en-US', { month: 'short' }),
                value: value,
            };
        })
        .sort((a, b) => {
            // Re-sort based on month number to ensure correct time series order
            const aDate = new Date(a.date + ' 1, 2023'); // Hack for comparison
            const bDate = new Date(b.date + ' 1, 2023');
            return aDate.getTime() - bDate.getTime();
        });

    return finalData;
  };

  // Update chart data whenever the category changes
  useEffect(() => {
    if (!loading && Object.keys(rawData).length > 0) {
      setChartData(processChartData(chartCategory, rawData));
    }
  }, [chartCategory, loading, rawData]);

  // ------------------ FIRESTORE DATA FETCHING ------------------

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const newStats: StatMetric[] = [];
      const now = new Date();
      const { start: startOfMonth, end: endOfMonth } = getMonthDateRange(now);

      // 12 months ago for trend data
      const oneYearAgoTimestamp = Timestamp.fromDate(new Date(now.getFullYear() - 1, now.getMonth()));

      try {
        // --- Fetch Raw Data for All Metrics/Charts ---
        const [
          usersSnapshot,
          donationsSnapshot,
          forumSnapshot,
          allEventsSnapshot,
          newUsersSnapshot,
          mentorsSnapshot,
        ] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "fundraising_donations")),
          getDocs(collection(db, "forum_threads")),
          getDocs(collection(db, "events")),
          getDocs(query(collection(db, "users"), where("createdAt", ">=", startOfMonth), where("createdAt", "<=", endOfMonth))),
          getDocs(query(collection(db, "users"), where("isMentor", "==", true))),
        ]);

        // Store all data for chart generation
        const fetchedRawData = {
          users: usersSnapshot.docs.filter(doc => doc.data().createdAt?.toDate() >= oneYearAgoTimestamp.toDate()),
          donations: donationsSnapshot.docs.filter(doc => (doc.data().date || doc.data().createdAt)?.toDate() >= oneYearAgoTimestamp.toDate()),
          forum_threads: forumSnapshot.docs.filter(doc => doc.data().createdAt?.toDate() >= oneYearAgoTimestamp.toDate()),
          events: allEventsSnapshot.docs.filter(doc => doc.data().date?.toDate() >= oneYearAgoTimestamp.toDate()),
        };
        setRawData(fetchedRawData);

        // --- Calculate Stats ---
        const totalUsers = usersSnapshot.size;
        const newRegistrations = newUsersSnapshot.size;
        const mentorshipMatches = mentorsSnapshot.size;

        const allEvents = allEventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<EventData, 'id'> }));

        const eventsThisMonth = allEvents.filter(event =>
          event.date.toDate() >= startOfMonth.toDate() && event.date.toDate() <= endOfMonth.toDate()
        ).length;

        const upcomingEvents: EventData[] = allEvents
          .filter(event => event.date.toDate() >= now)
          .map(event => ({ ...event, attendeeCount: event.attendeeCount || 0, maxAttendees: event.maxAttendees || 0 }))
          .sort((a, b) => a.date.seconds - b.date.seconds)
          .slice(0, 5) as EventData[]; // Explicit cast to ensure type match

        setEvents(upcomingEvents);

        const totalDonations = donationsSnapshot.docs.reduce((sum, doc) => {
          return sum + (doc.data().amount || 0);
        }, 0);

        const totalForumPosts = forumSnapshot.size;

        // --- Assemble Stats ---
        newStats.push({
          title: "Active Users",
          value: totalUsers.toLocaleString(),
          change: "+12.5%",
          changeType: "positive",
          icon: Users,
          description: "Total registered alumni",
        });
        newStats.push({
          title: "Events This Month",
          value: eventsThisMonth.toLocaleString(),
          change: "+8.2%",
          changeType: "positive",
          icon: Calendar,
          description: "Scheduled gatherings this month",
        });
        newStats.push({
          title: "Total Donations",
          value: `$${totalDonations.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
          change: "+15.3%",
          changeType: "positive",
          icon: DollarSign,
          description: "Total fiscal year donations",
        });
        newStats.push({
          title: "Mentorship Matches",
          value: mentorshipMatches.toLocaleString(),
          change: "+4.1%",
          changeType: "positive",
          icon: UserCheck,
          description: "Users marked as mentors",
        });
        newStats.push({
          title: "Forum Posts",
          value: totalForumPosts.toLocaleString(),
          change: "+22.1%",
          changeType: "positive",
          icon: MessageSquare,
          description: "Total threads created",
        });
        newStats.push({
          title: "New Registrations",
          value: newRegistrations.toLocaleString(),
          change: "-2.4%",
          changeType: "negative",
          icon: Award,
          description: "New alumni this month",
        });

        setStats(newStats);

      } catch (error) {
        console.error("Failed to fetch dashboard data from Firestore:", error);
        setStats(DUMMY_STATS_DATA);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- Simulated Chart Component ---
  const SimulatedLineChart = ({ data, category }: { data: ChartDataPoint[]; category: ChartCategory }) => {
    const isDonation = category === 'donations';
    const maxValue = data.reduce((max, p) => Math.max(max, p.value), 0);
    const scale = maxValue > 0 ? 100 / maxValue : 0;

    if (data.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/20 border border-dashed border-border/70 rounded-xl">
                <LineChart className="h-10 w-10 mb-2" />
                <p className="text-sm">Not enough data for a 12-month trend.</p>
            </div>
        );
    }
    
    return (
        <div className="relative h-64 sm:h-72 w-full p-4">
            {/* Chart Area */}
            <div className="h-full w-full relative">
                {/* Horizontal Grid Lines */}
                {[0.25, 0.5, 0.75, 1].map((level, index) => (
                    <div
                        key={index}
                        className="absolute w-full border-b border-border/50 text-xs text-muted-foreground/70"
                        style={{ bottom: `${level * 100}%` }}
                    >
                        {isDonation ? `$${(maxValue * level).toFixed(0)}` : (maxValue * level).toFixed(0)}
                    </div>
                ))}
                
                {/* Data Points (Simplified visualization) */}
                <div className="absolute inset-0 flex items-end justify-between px-2 pb-4">
                    {data.map((point, index) => (
                        <div key={point.date} className="flex flex-col items-center group relative h-full justify-end">
                            {/* Bar/Point */}
                            <div 
                                className="w-4 bg-primary/70 rounded-t-sm transition-all duration-500 ease-out hover:bg-primary" 
                                style={{ height: `${point.value * scale * 0.9 + 5}%` }}
                            />
                            {/* Tooltip */}
                            <Card className="absolute bottom-full mb-2 p-2 hidden group-hover:block bg-background/90 backdrop-blur-sm border-primary/50 shadow-lg whitespace-nowrap">
                                <span className="font-semibold">{isDonation ? `$${point.value.toLocaleString()}` : point.value.toLocaleString()}</span>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-2 text-xs text-muted-foreground/90">
                {data.map((point) => (
                    <span key={point.date} className="truncate w-1/12 text-center">
                        {point.date}
                    </span>
                ))}
            </div>
        </div>
    );
  };


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
                  <div className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <span>System Status: {loading ? 'Loading Data...' : 'Operational'}</span>
                </div>
              </div>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {stats.map((stat) => (
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
                      12-month trend of {analyticsCategories.find(c => c.id === chartCategory)?.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4 shrink-0" />
                    <span>Last 12 months</span>
                  </div>
                </div>

                <div className="space-y-4">
                    {/* Category Toggle */}
                    <ToggleGroup 
                        type="single" 
                        defaultValue={chartCategory} 
                        onValueChange={(value: ChartCategory) => {
                            if (value) setChartCategory(value);
                        }}
                        className="flex justify-start flex-wrap"
                    >
                        {analyticsCategories.map(({ id, label, icon: Icon }) => (
                            <ToggleGroupItem 
                                key={id} 
                                value={id} 
                                aria-label={`Toggle ${label}`}
                                className={`text-xs px-3 py-1.5 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground ${
                                    chartCategory === id ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground'
                                }`}
                            >
                                <Icon className="h-4 w-4 mr-2" />
                                {label}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>

                    {/* Chart Display Area */}
                    <div className="h-64 sm:h-72 flex items-center justify-center rounded-xl bg-muted/20 border border-border/30">
                        {loading ? (
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 text-primary mx-auto animate-spin" />
                                <p className="text-sm text-muted-foreground mt-2">
                                    Calculating trends...
                                </p>
                            </div>
                        ) : (
                            <SimulatedLineChart data={chartData} category={chartCategory} />
                        )}
                    </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div>
                <UpcomingEvents events={events} loading={loading} />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;