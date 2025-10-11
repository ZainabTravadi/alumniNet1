import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
    Calendar, MapPin, Clock, Users, CheckCircle, 
    Loader2, ChevronLeft, MessageCircle, Star, Mail, Tag, Link, NotebookPen
} from 'lucide-react';

// ------------------ 💡 FIREBASE INTEGRATION ------------------
import { db, auth } from '@/firebase'; 
import { doc, getDoc } from 'firebase/firestore'; 

// ⭐️ IMPORT UTILITIES ⭐️
import { 
    formatDate, 
    getCategoryColor, 
    formatDuration 
} from '@/utils/eventUtils'; 
// Adjust the import path for your specific project structure if needed!

const EVENTS_COLLECTION_NAME = 'events'; 
const DUMMY_FALLBACK_URL = '/placeholder-avatar.jpg'; 

// ------------------ 💡 INTERFACE DEFINITION ------------------
// This interface must match the fields you created in Firestore
interface EventData {
    id: number | string; title: string; description: string; date: string; time: string; 
    location: string; isVirtual: boolean; attendees: number; maxAttendees: number | null; 
    organizer: string; organizerAvatar: string; category: string; isRegistered: boolean; 
    isFeatured: boolean; image: string; directContact: string | null;
    
    // NEW FIELDS
    registrationLink: string;
    contactEmail: string;
    fullDescription: string;
    tags: string[];
    prerequisites: string;
    durationMinutes: number;
    googleMapsEmbed: string;
    speakerName: string;
}

// Helper component for clean detail display (kept outside the main component)
const DetailItem = ({ icon: Icon, label, value, badge }: { icon: any, label: string, value: string, badge?: string }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-6 w-6 text-primary mt-1" />
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">{value}</p>
                {badge && <Badge variant="outline" className="text-xs">{badge}</Badge>}
            </div>
        </div>
    </div>
);

// Helper component for small detail cards
const SmallDetailCard = ({ icon: Icon, title, value }: { icon: any, title: string, value: string }) => (
    <Card>
        <CardContent className="p-4 flex items-start gap-3">
            <Icon className="h-5 w-5 text-secondary-foreground mt-0.5" />
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="font-semibold">{value}</p>
            </div>
        </CardContent>
    </Card>
);


// ------------------ 🌟 MAIN COMPONENT ------------------

const EventDetailPage = () => {
    // Requires React Router setup (e.g., <Route path="/events/:eventId" />)
    const { eventId } = useParams<{ eventId: string }>(); 
    const navigate = useNavigate(); 
    const [event, setEvent] = useState<EventData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentUserId = auth.currentUser?.uid || null;

    useEffect(() => {
        if (!eventId) {
            setError("Event ID is missing from the URL.");
            setLoading(false);
            return;
        }

        const fetchEvent = async () => {
            try {
                const eventRef = doc(db, EVENTS_COLLECTION_NAME, eventId);
                const docSnap = await getDoc(eventRef);

                if (!docSnap.exists()) {
                    setError(`Event with ID "${eventId}" not found.`);
                    return;
                }

                const data = docSnap.data() as any;
                const eventDate = data.date && data.date.toDate ? data.date.toDate() : new Date();

                const fetchedEvent: EventData = {
                    id: docSnap.id,
                    title: data.title || 'Untitled Event',
                    description: data.description || 'No description provided.',
                    date: eventDate.toISOString(), 
                    time: data.time || 'TBD',
                    location: data.location || 'Unknown',
                    isVirtual: data.isVirtual || false,
                    attendees: data.attendeeCount || 0, 
                    maxAttendees: data.maxAttendees || null,
                    organizer: data.organizer || 'N/A',
                    organizerAvatar: data.organizerAvatar || DUMMY_FALLBACK_URL,
                    category: data.category || 'General',
                    isFeatured: data.isFeatured || false,
                    image: data.image || '/placeholder-event.jpg',
                    isRegistered: currentUserId ? data.registrants?.includes(currentUserId) : false,
                    
                    // ⭐️ MAPPING NEW FIELDS ⭐️
                    registrationLink: data.registrationLink || '',
                    contactEmail: data.contactEmail || '',
                    fullDescription: data.fullDescription || data.description || '',
                    tags: data.tags || [],
                    prerequisites: data.prerequisites || 'None specified.',
                    durationMinutes: data.durationMinutes || 0,
                    googleMapsEmbed: data.googleMapsEmbed || '',
                    speakerName: data.speakerName || 'TBD',
                    directContact: data.directContact || '',
                };
                
                setEvent(fetchedEvent);
            } catch (err) {
                console.error("Error fetching single event:", err);
                setError("Failed to load event details. Please check network/permissions.");
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [eventId, currentUserId]); 

    if (loading) {
        return (
            <div className="text-center mt-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-lg text-muted-foreground mt-2">Loading event details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center mt-20 p-6 max-w-xl mx-auto border rounded-lg bg-red-50/50">
                <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={() => navigate(-1)} className="mt-6">
                    <ChevronLeft className="h-4 w-4 mr-2" /> Go Back
                </Button>
            </div>
        );
    }

    if (!event) return null; 

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Back Button */}
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ChevronLeft className="h-5 w-5 mr-2" /> Back to Events
                </Button>

                {/* Event Hero Section */}
                <Card className="shadow-lg">
                    <CardHeader className="p-0">
                        <div className="relative h-64 overflow-hidden rounded-t-lg">
                            <img 
                                src={event.image} 
                                alt={event.title} 
                                className="w-full h-full object-cover"
                            />
                            {event.isFeatured && (
                                <div className="absolute top-4 right-4 bg-primary px-3 py-1 rounded-full text-white flex items-center gap-1 text-sm font-medium">
                                    <Star className="h-4 w-4 fill-white" /> Featured
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/60 to-transparent w-full">
                                <CardTitle className="text-3xl font-bold text-white leading-tight">
                                    {event.title}
                                </CardTitle>
                                <CardDescription className="text-white/80">{event.description}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-8">
                        
                        {/* Summary Block */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-b pb-6">
                            <DetailItem icon={Calendar} label="Date" value={formatDate(event.date)} />
                            <DetailItem icon={Clock} label="Time" value={event.time} />
                            {event.durationMinutes > 0 && 
                                <DetailItem icon={Clock} label="Duration" value={formatDuration(event.durationMinutes)} />
                            }
                            <DetailItem icon={MapPin} label="Location" 
                                value={event.location} 
                                badge={event.isVirtual ? "Virtual" : undefined}
                            />
                        </div>

                        {/* FULL DESCRIPTION */}
                        <div>
                            <h3 className="text-xl font-semibold mb-3">Event Details & Agenda</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{event.fullDescription}</p>
                        </div>

                        {/* Speaker/Prerequisites/Contact Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                            <SmallDetailCard icon={Users} title="Main Speaker" value={event.speakerName} />
                            <SmallDetailCard icon={NotebookPen} title="Prerequisites" value={event.prerequisites} />
                            <SmallDetailCard icon={Mail} title="Contact Email" value={event.contactEmail} />
                            
                            {/* Registration Link Card */}
                            {event.registrationLink && (
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Link className="h-5 w-5 text-primary" />
                                            {/* Add Google form link here for registration. */}
                                            <span className="font-semibold text-primary">Google Form Link</span>
                                        </div>
                                        <Button asChild>
                                            <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                                                Register Here
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Map Embed (Optional) */}
                        {event.googleMapsEmbed && (
                            <div className='pt-4'>
                                <h3 className="text-xl font-semibold mb-3">Venue Location</h3>
                                {/* Placeholder for Map/Iframe */}
                                <div className='w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center'>
                                    <p className='text-muted-foreground'>Map Embed/Coordinates: {event.googleMapsEmbed}</p>
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {event.tags.length > 0 && (
                            <div className="pt-4 border-t">
                                <h3 className="text-xl font-semibold mb-3">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {event.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-sm flex items-center gap-1">
                                            <Tag className="h-3 w-3" /> {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Attendee Stats & Action Block (Final Action Section) */}
                        <div className="pt-4 border-t flex flex-col sm:flex-row gap-4 justify-between items-center">
                            
                            {/* Organizer */}
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={event.organizerAvatar} />
                                    <AvatarFallback>{event.organizer[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">Organized by</div>
                                    <div className="text-muted-foreground">{event.organizer}</div>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-3 w-full sm:w-auto">
                                {/* 1. DIRECT CONTACT BUTTON */}
                                {event.directContact && (
                                    <Button asChild variant="default" className="flex-1">
                                        <a href={`mailto:${event.directContact}`} target="_blank" rel="noopener noreferrer">
                                            <Mail className="h-4 w-4 mr-2" /> Contact Organizer
                                        </a>
                                    </Button>
                                )}
                            </div> 
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EventDetailPage;