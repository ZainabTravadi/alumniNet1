import { useEffect, useState, useCallback } from 'react';

// Components from shadcn/ui
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons from lucide-react
import { 
    Calendar, MapPin, Clock, Users, ExternalLink,
    CheckCircle, Star, Share2, Loader2 
} from 'lucide-react';

// ------------------ 💡 FIREBASE INTEGRATION ------------------
import { db, auth } from '@/firebase'; 
import { 
    collection, getDocs, query, orderBy, 
    doc, arrayUnion, arrayRemove, runTransaction 
} from 'firebase/firestore'; 

// Utility to get the current user ID
const getCurrentUserId = (): string | null => {
    return auth.currentUser ? auth.currentUser.uid : null; 
};

const EVENTS_COLLECTION_NAME = 'events'; 


// ------------------ 💡 INTERFACE DEFINITION (Final, stable structure) ------------------
interface EventData {
    id: number | string;
    title: string;
    description: string;
    date: string; // ISO string converted from Firestore Timestamp
    time: string; 
    location: string;
    isVirtual: boolean;
    attendees: number; // Mapped from Firestore's 'attendeeCount'
    maxAttendees: number | null;
    organizer: string;
    organizerAvatar: string;
    // ⭐️ FINAL PROP NAME USED IN COMPONENT (maps to Firestore's categoryId)
    category: string; 
    isRegistered: boolean; 
    isFeatured: boolean;
    image: string;
}

// ------------------ 💡 FALLBACK DUMMY DATA ------------------
const DUMMY_UPCOMING: EventData[] = [
    { id: 'mock1', title: 'Annual Alumni Meetup 2024', description: 'Join us for our biggest networking event of the year!', date: new Date('2024-03-15').toISOString(), time: '6:00 PM - 10:00 PM', location: 'Main Campus Auditorium', isVirtual: false, attendees: 245, maxAttendees: 300, organizer: 'Alumni Association', organizerAvatar: '/placeholder-avatar.jpg', category: 'Networking', isRegistered: false, isFeatured: true, image: '/placeholder-event.jpg' },
    { id: 'mock2', title: 'Tech Talk: AI in Modern Industry', description: 'Leading AI experts share insights on the future of artificial intelligence.', date: new Date('2024-03-20').toISOString(), time: '7:00 PM - 8:30 PM', location: 'Virtual Event', isVirtual: true, attendees: 89, maxAttendees: 150, organizer: 'CS Alumni Chapter', organizerAvatar: '/placeholder-avatar.jpg', category: 'Educational', isRegistered: true, isFeatured: false, image: '/placeholder-event.jpg' },
    { id: 'mock3', title: 'Career Workshop: LinkedIn Mastery', description: 'Learn how to optimize your LinkedIn profile for success.', date: new Date('2024-04-10').toISOString(), time: '1:00 PM - 2:00 PM', location: 'Virtual', isVirtual: true, attendees: 112, maxAttendees: null, organizer: 'Career Services', organizerAvatar: '/placeholder-avatar.jpg', category: 'Career', isRegistered: false, isFeatured: false, image: '/placeholder-event.jpg' },
];

const DUMMY_PAST: EventData[] = [
    { id: 'mock5', title: 'Winter Alumni Gathering 2023', description: 'A cozy winter meetup with hot cocoa and networking.', date: new Date('2023-12-15').toISOString(), time: '6:00 PM - 9:00 PM', location: 'Alumni Center', isVirtual: false, attendees: 128, maxAttendees: 200, organizer: 'Alumni Association', organizerAvatar: '/placeholder-avatar.jpg', category: 'Social', isRegistered: true, isFeatured: false, image: '/placeholder-event.jpg' },
    { id: 'mock6', title: 'Summer Sports Day 2023', description: 'Friendly sports competition for all alumni families.', date: new Date('2023-08-05').toISOString(), time: '9:00 AM - 3:00 PM', location: 'University Field', isVirtual: false, attendees: 310, maxAttendees: 400, organizer: 'Sports Alumni', organizerAvatar: '/placeholder-avatar.jpg', category: 'Sports', isRegistered: true, isFeatured: false, image: '/placeholder-event.jpg' },
];


const Events = () => {
    const [activeTab, setActiveTab] = useState('upcoming');
    
    // Initialize states with dummy data
    const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>(DUMMY_UPCOMING);
    const [pastEvents, setPastEvents] = useState<EventData[]>(DUMMY_PAST);
    const [isLoading, setIsLoading] = useState(true); 
    const [isRegistering, setIsRegistering] = useState<number | string | null>(null); 

    // ------------------ UTILITIES ------------------

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
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

    // ------------------ 🚀 FIREBASE DATA FETCHING ------------------

    const fetchEventsFromFirestore = useCallback(async () => {
        setIsLoading(true);
        const now = new Date();
        const currentUserId = getCurrentUserId();
        
        try {
            const eventsCollection = collection(db, EVENTS_COLLECTION_NAME);
            const eventQuery = query(eventsCollection, orderBy('date', 'asc')); 
            const snapshot = await getDocs(eventQuery);
            
            // Transform and map Firestore documents to the EventData interface
            const fetchedEvents: EventData[] = snapshot.docs.map(doc => {
                const data = doc.data() as any; 
                
                // Handle Firestore Timestamp conversion
                const eventDate = data.date && data.date.toDate 
                                 ? data.date.toDate() 
                                 : new Date(); 
                
                return {
                    id: doc.id,
                    title: data.title || 'Untitled Event',
                    description: data.description || 'No description provided.',
                    date: eventDate.toISOString(), 
                    time: data.time || 'TBD',
                    location: data.location || 'Unknown',
                    isVirtual: data.isVirtual || false,
                    attendees: data.attendeeCount || 0, // Mapped from attendeeCount
                    maxAttendees: data.maxAttendees || null,
                    organizer: data.organizer || 'N/A',
                    organizerAvatar: data.organizerAvatar || '/placeholder-avatar.jpg',
                    // ⭐️ FIX: Map Firestore's 'categoryId' field to component's 'category' prop
                    category: data.categoryId || 'General', 
                    isFeatured: data.isFeatured || false,
                    image: data.image || '/placeholder-event.jpg',
                    
                    // Determine registration status
                    isRegistered: currentUserId ? data.registrants?.includes(currentUserId) : false, 
                } as EventData;
            });
            
            // Separate events based on date
            const upcoming = fetchedEvents.filter(e => new Date(e.date) >= now);
            const past = fetchedEvents.filter(e => new Date(e.date) < now);
            
            setUpcomingEvents(upcoming);
            setPastEvents(past);

        } catch (error) {
            console.error("Firestore fetch failed. Check connection, rules, and collection name.", error);
            // Fallback to dummy data on actual fetch failure
            setUpcomingEvents(DUMMY_UPCOMING);
            setPastEvents(DUMMY_PAST);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEventsFromFirestore();
    }, [fetchEventsFromFirestore]);

    // ------------------ 🚀 FUNCTIONALITY HANDLERS ------------------

    const handleShare = useCallback((event: EventData) => {
        const eventUrl = `${window.location.origin}/events/${event.id}`; 
        
        if (navigator.share) {
            navigator.share({
                title: event.title, text: `Join the ${event.title} alumni event!`, url: eventUrl,
            }).catch((error) => console.error('Error sharing:', error));
        } else {
            navigator.clipboard.writeText(eventUrl)
                .then(() => alert('Event link copied to clipboard!'))
                .catch(err => alert('Could not copy link.'));
        }
    }, []);

    const handleRegistration = useCallback(async (event: EventData) => {
        const currentUserId = getCurrentUserId();
        if (isRegistering === event.id || !currentUserId) {
            if (!currentUserId) alert('You must be logged in to register for an event.');
            return;
        }

        setIsRegistering(event.id);
        const newRegistrationStatus = !event.isRegistered;
        const change = newRegistrationStatus ? 1 : -1;
        const eventRef = doc(db, EVENTS_COLLECTION_NAME, String(event.id));
        
        try {
            // Use a Transaction for atomic updates (Attendee count + Registrant list)
            await runTransaction(db, async (transaction) => {
                const eventDoc = await transaction.get(eventRef);
                if (!eventDoc.exists()) {
                    throw new Error("Event does not exist!");
                }
                
                const currentAttendeeCount = (eventDoc.data() as any).attendeeCount || 0;
                
                transaction.update(eventRef, {
                    attendeeCount: currentAttendeeCount + change,
                    registrants: newRegistrationStatus 
                        ? arrayUnion(currentUserId) 
                        : arrayRemove(currentUserId)
                });
            });

            // Optimistic UI Update after successful transaction
            setUpcomingEvents(prev => prev.map(e =>
                e.id === event.id 
                    ? { ...e, isRegistered: newRegistrationStatus, attendees: e.attendees + change } 
                    : e
            ));
            
        } catch (error) {
            console.error("Registration Transaction failed:", error);
            alert(`Registration failed. Please try again.`);
        } finally {
            setIsRegistering(null);
        }
    }, [isRegistering]);

    // ------------------ EVENT CARD COMPONENT ------------------

    const EventCard = ({ event, isPast = false }: { event: EventData, isPast?: boolean }) => (
        <Card className={`glass-card hover-glow ${event.isFeatured ? 'ring-2 ring-primary/50' : ''}`}>
            {event.isFeatured && (
                <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary to-primary/80 rounded-t-lg">
                    <Star className="h-4 w-4 text-white fill-white" />
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
                        <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleShare(event)} 
                        >
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
                            onClick={() => handleRegistration(event)} 
                            disabled={isRegistering === event.id}
                        >
                            {isRegistering === event.id ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {event.isRegistered ? "Canceling..." : "Joining..."}
                                </>
                            ) : (
                                event.isRegistered ? "Registered" : "Register"
                            )}
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                                // Navigate to the detail page
                                window.location.href = `/events/${event.id}`;
                            }}
                            aria-label={`View details for ${event.title}`}
                        >
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    // ------------------ MAIN RENDER ------------------
    
    if (isLoading) {
        return (
            <div className="text-center mt-20">
                <p className="text-lg text-primary">
                    <Loader2 className="h-6 w-6 inline animate-spin mr-2" /> 
                    Loading events calendar...
                </p>
            </div>
        );
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

                {/* Stats (Uses live data) */}
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