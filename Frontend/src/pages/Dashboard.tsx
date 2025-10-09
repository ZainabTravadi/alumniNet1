import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/firebase";

// UI Imports
import { 
    Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
    Users, Calendar, MessageSquare, TrendingUp, 
    ArrowRight, MapPin, Building2, GraduationCap, Star 
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ------------------ 💡 Type Definitions ------------------
interface AlumniProfile {
    id: string | number;
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

interface Event {
    title: string;
    date: string; 
    location: string;
    attendees: number;
}

// ------------------ 💡 Client-Side Date Formatting Utility ------------------
const formatDate = (dateString: string): string => {
    // Handling the raw string sent by the Python API
    if (dateString.includes('Timestamp')) {
        return "Date Pending Format";
    }
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString || "Date N/A"; 
        }
        
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
        return dateString;
    }
};

// ------------------ 💡 Fallback Dummy Data ------------------
const DUMMY_ALUMNI: AlumniProfile[] = [
    { id: 'dummy-1', name: 'Sarah Chen', title: 'Senior Software Engineer', company: 'Google', batch: '2019', department: 'Computer Science', location: 'San Francisco', avatar: '/placeholder-avatar.jpg', rating: 4.9, mentees: 12, expertise: ['Software Engineering', 'Career Growth', 'Technical Leadership', 'System Design'], bio: 'I have 8+ years of experience in tech, having worked at Google, Facebook, and startups. I love helping fellow alumni navigate their tech careers.', availability: 'Weekends', responseTime: '24 hours', languages: ['English', 'Mandarin'] },
    { id: 'dummy-2', name: 'Michael Rodriguez', title: 'Product Director', company: 'Tesla', batch: '2020', department: 'Mechanical Eng', location: 'Austin', avatar: '/placeholder-avatar.jpg', rating: 4.8, mentees: 8, expertise: ['Product Management', 'Engineering Leadership', 'Automotive Industry', 'Innovation'], bio: 'Leading product teams in the automotive space. Passionate about clean energy and helping engineers transition to product roles.', availability: 'Evenings', responseTime: '12 hours', languages: ['English', 'Spanish'] },
    { id: 'dummy-3', name: 'Emma Thompson', title: 'Marketing Director', company: 'Microsoft', batch: '2018', department: 'Business Admin', location: 'Seattle', avatar: '/placeholder-avatar.jpg', rating: 4.9, mentees: 15, expertise: ['Digital Marketing', 'Brand Strategy', 'Leadership', 'B2B Marketing'], bio: 'Leading marketing initiatives for enterprise products. Happy to share insights on marketing strategy and career progression.', availability: 'Flexible', responseTime: '6 hours', languages: ['English'] }
];

const DUMMY_EVENTS: Event[] = [
    { title: 'Annual Alumni Meetup 2024', date: 'October 25, 2025', location: 'Main Campus', attendees: 245 },
    { title: 'Tech Talk: AI in Industry', date: 'November 1, 2025', location: 'Virtual Event', attendees: 89 },
    { title: 'Career Fair 2024', date: 'November 15, 2025', location: 'Convention Center', attendees: 156 }
];


// ------------------ 💡 Component ------------------
const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [recentAlumni, setRecentAlumni] = useState<AlumniProfile[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/dashboard';

    // ------------------ 💡 Auth Guard ------------------
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) navigate("/auth");
            else setUser(currentUser);
        });
        return () => unsubscribe();
    }, [navigate]);

    // ------------------ 💡 Data Fetch with Fallback ------------------
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setIsDataLoading(true);

            try {
                // Fetch from API
                const [alumniRes, eventsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/alumni`),
                    fetch(`${API_BASE_URL}/events`)
                ]);

                let alumniData: AlumniProfile[] = [];
                let eventData: Event[] = [];

                if (alumniRes.ok) {
                    const alumniResult = await alumniRes.json();
                    alumniData = alumniResult.data || [];
                }
                if (eventsRes.ok) {
                    const eventsResult = await eventsRes.json();
                    eventData = eventsResult.data || [];
                }

                // Fallback: Use live data if present, otherwise use dummy data
                setRecentAlumni(alumniData.length ? alumniData : DUMMY_ALUMNI);
                setUpcomingEvents(eventData.length ? eventData : DUMMY_EVENTS);
            } catch (err) {
                console.error("❌ API Error, falling back to dummy data:", err);
                setRecentAlumni(DUMMY_ALUMNI);
                setUpcomingEvents(DUMMY_EVENTS);
            } finally {
                setIsDataLoading(false);
            }
        };

        if (user) fetchData();
    }, [user, API_BASE_URL]);

    const stats = [
        { label: 'Total Alumni', value: '2,847', icon: Users, color: 'text-blue-500' },
        { label: 'Upcoming Events', value: '12', icon: Calendar, color: 'text-green-500' },
        { label: 'Active Discussions', value: '89', icon: MessageSquare, color: 'text-purple-500' },
        { label: 'This Month Donations', value: '$12.5K', icon: TrendingUp, color: 'text-orange-500' }
    ];

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/auth");
    };

    if (!user) return <p className="text-center mt-20">Checking authentication...</p>;
    if (isDataLoading) return <p className="text-center mt-20 text-lg text-primary">Loading dashboard data...</p>;

    // ------------------ 💡 Render ------------------
    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Top Bar */}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">
                        Logged in as <span className="text-primary">{user.email}</span>
                    </h2>
                    <Button variant="outline" onClick={handleLogout}>Logout</Button>
                </div>

                {/* Hero Section */}
                <div className="text-center space-y-4 animate-fade-in">
                    <h1 className="text-4xl md:text-6xl font-bold">
                        Welcome to{' '}
                        <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
                            AlumniNet
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Connect, collaborate, and grow with your alumni network. Stay updated with events, 
                        find mentors, and contribute to your alma mater's future.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button size="lg" className="bg-gradient-primary hover:opacity-90" onClick={() => navigate("/directory")}> 
                            Explore Directory
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => navigate("/update-profile")}> 
                            Update Profile
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="glass-card hover-glow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                        <p className="text-3xl font-bold">{stat.value}</p>
                                    </div>
                                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Recent Alumni */}
                    <div className="lg:col-span-2">
                        <Card className="glass-card animate-scale-in">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    Recently Joined Alumni
                                </CardTitle>
                                <CardDescription>Welcome our newest community members</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {recentAlumni.map((alumni) => (
                                    <div key={alumni.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => {
                                        setSelectedAlumni(alumni);
                                        setIsProfileOpen(true);
                                    }}>
                                        <Avatar>
                                            <AvatarImage src={alumni.avatar} />
                                            <AvatarFallback>{alumni.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium">{alumni.name}</h4>
                                                <Badge variant="secondary">{alumni.batch}</Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{alumni.department}</span>
                                                <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{alumni.company}</span>
                                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{alumni.location}</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm">Connect</Button>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full">View All Alumni</Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Events */}
                    <div>
                        <Card className="glass-card animate-scale-in">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    Upcoming Events
                                </CardTitle>
                                <CardDescription>Don't miss these exciting events</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {upcomingEvents.map((event, index) => (
                                    <div key={index} className="space-y-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <h4 className="font-medium text-sm">{event.title}</h4>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            {/* 💡 Use the formatting utility here */}
                                            <div>{formatDate(event.date)}</div> 
                                            <div className="flex items-center justify-between">
                                                <span>{event.location}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {event.attendees} attending
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="outline" className="w-full" size="sm">View All Events</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Alumni Dialog */}
            {selectedAlumni && (
                <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <DialogContent className="sm:max-w-2xl w-full">
                        <DialogHeader>
                            <div className="flex items-start space-x-4">
                                <Avatar className="h-24 w-24 border-2 border-primary">
                                    <AvatarImage src={selectedAlumni.avatar} />
                                    <AvatarFallback className="text-3xl">
                                        {selectedAlumni.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <DialogTitle className="text-2xl font-bold">{selectedAlumni.name}</DialogTitle>
                                    <DialogDescription className="text-md">
                                        {selectedAlumni.title} at <span className="font-semibold text-primary">{selectedAlumni.company}</span>
                                    </DialogDescription>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                                        <span className="flex items-center gap-1.5">
                                            <GraduationCap className="h-4 w-4" />
                                            Batch of {selectedAlumni.batch}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" />
                                            {selectedAlumni.location}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="py-4 space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Bio</h3>
                                <p className="text-muted-foreground">{selectedAlumni.bio}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2">Expertise</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedAlumni.expertise.map((skill) => (
                                        <Badge key={skill} variant="secondary">{skill}</Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <div><h4 className="font-semibold">Department</h4><p className="text-muted-foreground">{selectedAlumni.department}</p></div>
                                <div><h4 className="font-semibold">Rating</h4><div className="flex items-center gap-1"><Star className="h-5 w-5 text-yellow-500 fill-current" /><span className="font-medium text-muted-foreground">{selectedAlumni.rating}</span></div></div>
                                <div><h4 className="font-semibold">Mentees</h4><p className="text-muted-foreground">{selectedAlumni.mentees}</p></div>
                                <div><h4 className="font-semibold">Availability</h4><p className="text-muted-foreground">{selectedAlumni.availability}</p></div>
                                <div><h4 className="font-semibold">Response Time</h4><p className="text-muted-foreground">{selectedAlumni.responseTime}</p></div>
                                <div><h4 className="font-semibold">Languages</h4><p className="text-muted-foreground">{selectedAlumni.languages.join(', ')}</p></div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsProfileOpen(false)}>Close</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default Dashboard;