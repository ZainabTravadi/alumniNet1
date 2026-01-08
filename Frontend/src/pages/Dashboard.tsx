// =================================================================================
// DASHBOARD.tsx
// =================================================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  updateDoc,
  arrayUnion,
  addDoc,
} from "firebase/firestore";

import { auth, db } from "@/firebase";

// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  MapPin,
  Building2,
  GraduationCap,
  Star,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// =================================================================================
// Types
// =================================================================================

interface AlumniProfile {
  id: string;
  name: string;
  title: string;
  company: string;
  batch: string;
  department: string;
  location: string;
  avatar: string;
  rating: number;
  mentees: number;
  expertise: string[];
  bio: string;
  availability: string;
  responseTime: string;
  languages: string[];
}

interface EventItem {
  title: string;
  date: string;
  location: string;
  attendees: number;
}

// =================================================================================
// Utils
// =================================================================================

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return isNaN(d.getTime())
    ? "Date N/A"
    : d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
};

// =================================================================================
// Dummy fallback
// =================================================================================

const DUMMY_ALUMNI: AlumniProfile[] = [
  {
    id: "dummy-1",
    name: "Sarah Chen",
    title: "Senior Software Engineer",
    company: "Google",
    batch: "2019",
    department: "Computer Science",
    location: "San Francisco",
    avatar: "/placeholder-avatar.jpg",
    rating: 4.9,
    mentees: 12,
    expertise: ["System Design", "Career Growth"],
    bio: "Tech mentor with 8+ years experience.",
    availability: "Weekends",
    responseTime: "24 hours",
    languages: ["English"],
  },
];

const DUMMY_EVENTS: EventItem[] = [
  {
    title: "Annual Alumni Meetup",
    date: "2025-10-25",
    location: "Main Campus",
    attendees: 245,
  },
];

// =================================================================================
// Component
// =================================================================================

const Dashboard = () => {
  const navigate = useNavigate();

  // 🔐 Auth
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 📦 Data
  const [recentAlumni, setRecentAlumni] = useState<AlumniProfile[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(
    null
  );
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // 📊 Stats
  const [liveStats, setLiveStats] = useState({
    totalAlumni: "...",
    upcomingEvents: "...",
    activeDiscussions: "...",
    monthlyDonations: "...",
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // =================================================================================
  // Auth Guard (FIXED)
  // =================================================================================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        navigate("/auth");
      } else {
        setUser(currentUser);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  // =================================================================================
  // Backend Data
  // =================================================================================
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        const [alumniRes, eventsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/dashboard/alumni`),
          fetch(`${API_BASE_URL}/api/dashboard/events`),
        ]);

        const alumniJson = alumniRes.ok ? await alumniRes.json() : null;
        const eventsJson = eventsRes.ok ? await eventsRes.json() : null;

        setRecentAlumni(alumniJson?.data?.length ? alumniJson.data : DUMMY_ALUMNI);
        setUpcomingEvents(eventsJson?.data?.length ? eventsJson.data : DUMMY_EVENTS);
      } catch (err) {
        console.error("❌ API failed, using fallback", err);
        setRecentAlumni(DUMMY_ALUMNI);
        setUpcomingEvents(DUMMY_EVENTS);
      }
    };

    fetchDashboardData();
  }, [user, API_BASE_URL]);

  // =================================================================================
  // Firestore Stats
  // =================================================================================
  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const [usersSnap, eventsSnap, threadsSnap, fundsSnap] =
          await Promise.all([
            getDocs(collection(db, "users")),
            getDocs(
              query(
                collection(db, "events"),
                where("date", ">=", Timestamp.fromDate(new Date()))
              )
            ),
            getDocs(collection(db, "forum_threads")),
            getDocs(collection(db, "fundraising_campaigns")),
          ]);

        let raised = 0;
        fundsSnap.forEach((d) => {
          if (typeof d.data().raised === "number") {
            raised += d.data().raised;
          }
        });

        setLiveStats({
          totalAlumni: usersSnap.size.toString(),
          upcomingEvents: eventsSnap.size.toString(),
          activeDiscussions: threadsSnap.size.toString(),
          monthlyDonations: `₹${(raised / 1000).toFixed(1)}K`,
        });
      } catch (e) {
        console.error("❌ Stats fetch failed", e);
      }
    };

    fetchStats();
  }, [user]);

  // =================================================================================
  // Connect Request
  // =================================================================================
  const handleConnect = async () => {
    if (!user || !selectedAlumni) return;

    try {
      await addDoc(
        collection(db, "users", selectedAlumni.id, "notifications"),
        {
          type: "connection",
          title: `New connection from ${user.displayName || "Alumni"}`,
          message: "Would like to connect with you.",
          timestamp: Timestamp.now(),
          isRead: false,
          linkToId: user.uid,
          avatar: user.photoURL,
        }
      );

      await updateDoc(doc(db, "users", user.uid), {
        pendingSentRequests: arrayUnion(selectedAlumni.id),
      });

      alert("Connection request sent");
      setIsProfileOpen(false);
    } catch (e) {
      console.error("❌ Connection failed", e);
      alert("Failed to send request");
    }
  };

  // =================================================================================
  // Guards
  // =================================================================================
  if (authLoading) {
    return <p className="text-center mt-20">Checking authentication...</p>;
  }

  if (!user) return null;

  // =================================================================================
  // Render
  // =================================================================================
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center">
          Welcome to <span className="text-primary">AlumniNet</span>
        </h1>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { label: "Total Alumni", value: liveStats.totalAlumni, icon: Users },
            { label: "Events", value: liveStats.upcomingEvents, icon: Calendar },
            { label: "Discussions", value: liveStats.activeDiscussions, icon: MessageSquare },
            { label: "Raised", value: liveStats.monthlyDonations, icon: TrendingUp },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <s.icon className="h-8 w-8 text-primary" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alumni */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Joined Alumni</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAlumni.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-4 p-3 cursor-pointer"
                onClick={() => {
                  setSelectedAlumni(a);
                  setIsProfileOpen(true);
                }}
              >
                <Avatar>
                  <AvatarImage src={a.avatar} />
                  <AvatarFallback>{a.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.company}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      {selectedAlumni && (
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent>
            <DialogHeader>
              Perfected Auth & Implemented Basic UI of all Admin Dashboard Pages
              <DialogTitle>{selectedAlumni.name}</DialogTitle>
              <DialogDescription>{selectedAlumni.title}</DialogDescription>
            </DialogHeader>
            <Button onClick={handleConnect}>Connect</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Dashboard;
