import React, { useState, useMemo, useCallback } from 'react';
// UI Imports (Assuming Shadcn UI components)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    Calendar, MapPin, Users, Send, Trash2, PlusCircle, Clock, ArrowRight, Search
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface Event {
    id: string;
    title: string;
    date: string; // Stored as a formatted string for display simplicity
    location: string;
    attendees: number;
    description: string;
}

// --- DUMMY DATA ---
const DUMMY_EVENTS: Event[] = [
    { id: 'e1', title: 'Annual Alumni Meetup 2026', date: 'October 25, 2026', location: 'Grand Ballroom, Campus Center', attendees: 245, description: "The biggest social event of the year, reconnect with old friends and make new professional contacts." },
    { id: 'e2', title: 'Tech Talk: AI in Industry', date: 'November 1, 2026', location: 'Virtual Event (Zoom)', attendees: 89, description: "A deep dive into the practical applications of AI and ML across various industries." },
    { id: 'e3', title: 'Career Fair 2026', date: 'November 15, 2026', location: 'Convention Center', attendees: 156, description: "Meet recruiters from 50+ top companies looking to hire our alumni." },
    { id: 'e4', title: 'Leadership Workshop', date: 'December 5, 2026', location: 'Alumni Hub, Room 301', attendees: 35, description: "Intensive workshop on developing critical leadership skills for mid-career professionals." },
];

const EventsManager = () => {
    const [events, setEvents] = useState<Event[]>(DUMMY_EVENTS);
    const [isEventFormOpen, setIsEventFormOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [eventToEmail, setEventToEmail] = useState<Event | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Custom style for the primary gradient button (Vibrant Dark Purple/Indigo theme)
    const primaryGradientStyle = {
        background: 'linear-gradient(90deg, #9333ea 0%, #d946ef 100%)', // Primary Gradient
        color: 'white',
        fontWeight: '600',
    };

    // --- LOGIC: Event Management ---

    const handleAddEvent = useCallback((newEventData: Omit<Event, 'id' | 'attendees'> & { attendees?: number }) => {
        const newEvent: Event = {
            ...newEventData,
            id: 'e' + Date.now(), // Generate unique ID (mock)
            attendees: newEventData.attendees || 0,
        };
        setEvents(prev => [...prev, newEvent]);
        setIsEventFormOpen(false);
    }, []);

    const handleDeleteEvent = useCallback((eventId: string, eventTitle: string) => {
        if (window.confirm(`Are you sure you want to delete the event: "${eventTitle}"? This cannot be undone.`)) {
            setEvents(prev => prev.filter(e => e.id !== eventId));
        }
    }, []);

    const handleOpenEmailForm = useCallback((event: Event) => {
        setEventToEmail(event);
        setIsEmailModalOpen(true);
    }, []);

    const handleSendEmail = useCallback((subject: string, body: string) => {
        if (eventToEmail) {
            console.log(`Email Sent to ${eventToEmail.attendees} attendees of "${eventToEmail.title}"`);
            // This is where you would call your API/Cloud Function
            setIsEmailModalOpen(false);
            setEventToEmail(null);
            alert(`Email successfully queued for ${eventToEmail.attendees} attendees.`);
        }
    }, [eventToEmail]);

    // --- LOGIC: Filtering ---

    const filteredEvents = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return events.filter(event =>
            event.title.toLowerCase().includes(term) ||
            event.location.toLowerCase().includes(term) ||
            event.description.toLowerCase().includes(term)
        ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [events, searchTerm]);


    // ------------------ MODALS (Forms) ------------------

    const EventFormModal = () => {
        const [title, setTitle] = useState('');
        const [date, setDate] = useState('');
        const [location, setLocation] = useState('');
        const [description, setDescription] = useState('');

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!title || !date || !location || !description) {
                alert("Please fill in all fields.");
                return;
            }
            handleAddEvent({ title, date, location, description });
            setTitle(''); setDate(''); setLocation(''); setDescription('');
        };

        return (
            <Dialog open={isEventFormOpen} onOpenChange={setIsEventFormOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-primary">Create New Event</DialogTitle>
                        <DialogDescription>Use this form to schedule and publish a new event for the community.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="space-y-2"><Label htmlFor="title">Title*</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label htmlFor="date">Date & Time*</Label><Input id="date" placeholder="October 25, 2026, 7PM" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
                            <div className="space-y-2"><Label htmlFor="location">Location*</Label><Input id="location" placeholder="Venue or Virtual Link" value={location} onChange={(e) => setLocation(e.target.value)} required /></div>
                        </div>
                        <div className="space-y-2"><Label htmlFor="description">Description*</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} /></div>
                        
                        <Button type="submit" style={primaryGradientStyle} className="mt-4">
                            Publish Event <PlusCircle className="ml-2 h-4 w-4" />
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        );
    };

    const AttendeeEmailModal = () => {
        const [subject, setSubject] = useState(`Update: ${eventToEmail?.title || 'Event'}`);
        const [body, setBody] = useState('');
        const [isSending, setIsSending] = useState(false);

        if (!eventToEmail) return null;

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!subject || !body) {
                alert("Subject and message body are required.");
                return;
            }
            setIsSending(true);
            // Mock delay for sending
            await new Promise(resolve => setTimeout(resolve, 1000));
            handleSendEmail(subject, body);
            setIsSending(false);
        };

        return (
            <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-primary">Email Attendees: {eventToEmail.title}</DialogTitle>
                        <DialogDescription>Sending email to the {eventToEmail.attendees} registered attendees.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="space-y-2"><Label htmlFor="subject">Subject</Label><Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required /></div>
                        <div className="space-y-2"><Label htmlFor="body">Message Body</Label><Textarea id="body" placeholder="Your event update here..." value={body} onChange={(e) => setBody(e.target.value)} required rows={8} /></div>
                        
                        <Button type="submit" disabled={isSending} style={primaryGradientStyle} className="mt-4">
                            {isSending ? 'Sending...' : `Send to ${eventToEmail.attendees} Attendees`} <Send className="ml-2 h-4 w-4" />
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        );
    };


    // ------------------ MAIN RENDER ------------------

    return (
        <div className="min-h-screen p-6 text-foreground bg-background"> 
            <div className="max-w-7xl mx-auto space-y-8">
                
                <div className="flex justify-between items-center pt-4 border-b border-primary/20 pb-4">
                    <h1 className="text-5xl font-extrabold flex items-center">
  <span className="text-white">Events&nbsp;</span>
  <span
    className="bg-gradient-to-r from-purple-600 via-purple-500 to-white bg-clip-text text-transparent"
  >
    Management
  </span>
</h1>
                    <Button onClick={() => setIsEventFormOpen(true)} style={primaryGradientStyle}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Schedule New Event
                    </Button>
                </div>
                
                {/* Search & Filter Bar */}
                <Card className="glass-card p-6 shadow-lg">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search events by title, location, or keyword..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full"
                        />
                    </div>
                </Card>

                {/* Event List */}
                <Card className="glass-card shadow-2xl p-0 overflow-hidden">
                    <CardHeader className="border-b border-primary/20 bg-primary/10">
                        <CardTitle className="text-lg font-semibold text-primary">
                            Upcoming Events ({filteredEvents.length})
                        </CardTitle>
                        <CardDescription>Manage, promote, and update your scheduled community events.</CardDescription>
                    </CardHeader>

                    <CardContent className="p-0 divide-y divide-primary/10">
                        {filteredEvents.map((event) => (
                            <div key={event.id} className="p-4 hover:bg-primary/5 transition-colors">
                                <div className="flex justify-between items-start">
                                    {/* Event Details */}
                                    <div className="space-y-1 w-4/5">
                                        <h3 className="font-bold text-lg text-foreground">{event.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                                        <div className="flex items-center space-x-4 text-sm pt-2">
                                            <Badge variant="outline" className="flex items-center gap-1 text-primary">
                                                <Calendar className="h-3 w-3" /> 
                                                {event.date}
                                            </Badge>
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> 
                                                {event.location}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Stats and Actions */}
                                    <div className="flex flex-col items-end space-y-2 w-1/5 min-w-[150px]">
                                        <div className="flex items-center text-sm font-medium text-green-400">
                                            <Users className="h-4 w-4 mr-1" />
                                            {event.attendees} Attending
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenEmailForm(event)} title="Email Attendees">
                                                <Send className="h-4 w-4" />
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id, event.title)} title="Delete Event">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredEvents.length === 0 && (
                            <p className="text-center p-6 text-muted-foreground">
                                No events found. Click "Schedule New Event" to start planning!
                            </p>
                        )}
                    </CardContent>
                </Card>

            </div>
            
            {/* Render Modals */}
            <EventFormModal />
            <AttendeeEmailModal />
        </div>
    );
};

export default EventsManager;