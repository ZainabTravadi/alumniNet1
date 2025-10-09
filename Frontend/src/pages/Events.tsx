import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Calendar,
    MapPin,
    Clock,
    Users,
    ExternalLink,
    CheckCircle,
    Star,
    Share2
} from 'lucide-react';

// ------------------ 💡 INTERFACE DEFINITION (for API data) ------------------
interface EventData {
    id: number | string;
    title: string;
    description: string;
    date: string; // Raw date string from Python API
    time: string; 
    location: string;
    isVirtual: boolean;
    attendees: number;
    maxAttendees: number | null;
    organizer: string;
    organizerAvatar: string;
    category: string;
    isRegistered: boolean;
    isFeatured: boolean;
    image: string;
}

// ------------------ 💡 FALLBACK DUMMY DATA ------------------
const DUMMY_UPCOMING: EventData[] = [
    { id: 1, title: 'Annual Alumni Meetup 2024', description: 'Join us for our biggest networking event of the year!', date: '2024-03-15', time: '6:00 PM - 10:00 PM', location: 'Main Campus Auditorium', isVirtual: false, attendees: 245, maxAttendees: 300, organizer: 'Alumni Association', organizerAvatar: '/placeholder-avatar.jpg', category: 'Networking', isRegistered: false, isFeatured: true, image: '/placeholder-event.jpg' },
    { id: 2, title: 'Tech Talk: AI in Modern Industry', description: 'Leading AI experts share insights on the future of artificial intelligence.', date: '2024-03-20', time: '7:00 PM - 8:30 PM', location: 'Virtual Event', isVirtual: true, attendees: 89, maxAttendees: 150, organizer: 'CS Alumni Chapter', organizerAvatar: '/placeholder-avatar.jpg', category: 'Educational', isRegistered: true, isFeatured: false, image: '/placeholder-event.jpg' },
];

const DUMMY_PAST: EventData[] = [
    { id: 5, title: 'Winter Alumni Gathering 2023', description: 'A cozy winter meetup with hot cocoa and networking.', date: '2023-12-15', time: '6:00 PM - 9:00 PM', location: 'Alumni Center', isVirtual: false, attendees: 128, maxAttendees: 200, organizer: 'Alumni Association', organizerAvatar: '/placeholder-avatar.jpg', category: 'Social', isRegistered: true, isFeatured: false, image: '/placeholder-event.jpg' },
];


const Events = () => {
    const [activeTab, setActiveTab] = useState('upcoming');
    
    // 💡 STATE FOR LIVE DATA
    const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>(DUMMY_UPCOMING);
    const [pastEvents, setPastEvents] = useState<EventData[]>(DUMMY_PAST);
    const [isLoading, setIsLoading] = useState(true); // Set to true to show loading state initially

    // Define API URLs (Must be set in your FE's .env file)
    const UPCOMING_API = import.meta.env.VITE_API_EVENTS_UPCOMING || 'http://localhost:5000/api/events/upcoming';
    const PAST_API = import.meta.env.VITE_API_EVENTS_PAST || 'http://localhost:5000/api/events/past';


    // ------------------ UTILITIES ------------------

    const formatDate = (dateStr: string) => {
        if (dateStr.includes('Timestamp')) {
            return "Date Pending Format";
        }
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            'Networking': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            'Educational': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            'Career': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
            'Sports': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
            'Social': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
        };
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    // ------------------ 💡 DATA FETCHING ------------------

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                // Fetch upcoming and past events simultaneously
                const [upcomingRes, pastRes] = await Promise.all([
                    fetch(UPCOMING_API),
                    fetch(PAST_API)
                ]);

                // Helper to safely get data or return an empty array
                const getEventData = async (res: Response): Promise<EventData[]> => {
                    if (res.ok) {
                        const data = await res.json();
                        // Filter for only valid events if necessary
                        return (data.data || []).filter((e: any) => e.title); 
                    }
                    return [];
                };

                const liveUpcoming = await getEventData(upcomingRes);
                const livePast = await getEventData(pastRes);

                // Use live data if available, otherwise keep dummy data
                setUpcomingEvents(liveUpcoming.length > 0 ? liveUpcoming : DUMMY_UPCOMING);
                setPastEvents(livePast.length > 0 ? livePast : DUMMY_PAST);

            } catch (error) {
                console.error("Network error fetching events:", error);
                // On total failure, keep the initial dummy state
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [UPCOMING_API, PAST_API]);


    // ------------------ EVENT CARD COMPONENT ------------------

    const EventCard = ({ event, isPast = false }: { event: EventData, isPast?: boolean }) => (
        <Card className={`glass-card hover-glow ${event.isFeatured ? 'ring-2 ring-primary/50' : ''}`}>
            {event.isFeatured && (
                <div className="flex items-center gap-2 p-3 bg-gradient-primary rounded-t-lg">
                    <Star className="h-4 w-4 text-white" />
                    <span className="text-white text-sm font-medium">Featured Event</span>
                </div>
            )}
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            {event.isRegistered && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                        </div>
                        <Badge className={getCategoryColor(event.category)}>
                            {event.category}
                        </Badge>
                    </div>
                    {!isPast && (
                        <Button size="sm" variant="ghost">
                            <Share2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <CardDescription className="text-sm">
                    {event.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(event.date)}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {event.time}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                            {event.isVirtual && (
                                <Badge variant="outline" className="text-xs">Virtual</Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {event.attendees} attending
                            {event.maxAttendees !== null && ` / ${event.maxAttendees}`}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={event.organizerAvatar} />
                        <AvatarFallback>{event.organizer[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                        <div className="font-medium">Organized by</div>
                        <div className="text-muted-foreground">{event.organizer}</div>
                    </div>
                </div>

                {!isPast && (
                    <div className="flex gap-2 pt-2">
                        <Button 
                            className="flex-1" 
                            variant={event.isRegistered ? "outline" : "default"}
                        >
                            {event.isRegistered ? "Registered" : "Register"}
                        </Button>
                        <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    // ------------------ MAIN RENDER ------------------
    
    if (isLoading) {
        return <p className="text-center mt-20 text-lg text-primary">Loading events calendar...</p>;
    }


    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold">
                        Alumni{' '}
                        <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
                            Events
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Stay connected through exciting events, workshops, and networking opportunities with your alumni community.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
                    <Card className="glass-card">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Upcoming Events</p>
                                    <p className="text-3xl font-bold">{upcomingEvents.length}</p>
                                </div>
                                <Calendar className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Attendees</p>
                                    <p className="text-3xl font-bold">
                                        {upcomingEvents.reduce((sum, event) => sum + event.attendees, 0)}
                                    </p>
                                </div>
                                <Users className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Your Registrations</p>
                                    <p className="text-3xl font-bold">
                                        {upcomingEvents.filter(event => event.isRegistered).length}
                                    </p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Events Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-scale-in">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
                        <TabsTrigger value="past">Past Events</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upcoming" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))
                            ) : (
                                <p className="col-span-2 text-center text-muted-foreground pt-4">No upcoming events found.</p>
                            )}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="past" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                             {pastEvents.length > 0 ? (
                                pastEvents.map((event) => (
                                    <EventCard key={event.id} event={event} isPast />
                                ))
                            ) : (
                                <p className="col-span-2 text-center text-muted-foreground pt-4">No past events recorded.</p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Events;