"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
// UI Imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Calendar, MapPin, Users, Send, Trash2, PlusCircle, Clock, Search, Loader2
} from 'lucide-react';

// Firestore Imports
import { db } from "@/firebase";
import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    addDoc,
    Timestamp,
    query,
    where,
    documentId,
} from "firebase/firestore";

// --- TYPE DEFINITIONS ---

// Expanded Event interface to match the Firestore schema and UI needs
interface Event {
    id: string;
    title: string;
    description: string;
    fullDescription: string;
    date: Timestamp; // Raw Timestamp for sorting/logic
    location: string;
    time: string; // "6:30 PM - 8:30 PM"
    category: string;
    organizer: string;
    attendeeCount: number; // Stored in Firestore
    maxAttendees: number; // Stored in Firestore
    registrants: string[]; // Array of User IDs
    // Added fields needed for the form but not necessarily in the UI list:
    contactEmail: string;
    registrationLink: string;
    isVirtual: boolean;
    image: string;
}

// --- DUMMY/FALLBACK DATA ---
const FALLBACK_EVENTS: Event[] = []; // Start with an empty list on error

const EventsManager = () => {
    const [events, setEvents] = useState<Event[]>(FALLBACK_EVENTS);
    const [loading, setLoading] = useState(true);
    const [isEventFormOpen, setIsEventFormOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [eventToEmail, setEventToEmail] = useState<Event | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const primaryGradientStyle = {
        background: 'linear-gradient(90deg, #9333ea 0%, #d946ef 100%)',
        color: 'white',
        fontWeight: '600',
    };

    // --- FIRESTORE DATA FETCHING ---
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const eventsSnapshot = await getDocs(collection(db, "events"));
            const fetchedEvents = eventsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Event[];

            // Sort by date ascending (upcoming events first)
            fetchedEvents.sort((a, b) => a.date.seconds - b.date.seconds);

            setEvents(fetchedEvents);
        } catch (error) {
            console.error("Error fetching events:", error);
            setEvents(FALLBACK_EVENTS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);


    // --- LOGIC: Event Management (Firestore Writes) ---

    // TASK 1: Add Event
    const handleAddEvent = useCallback(async (newEventData: Omit<Event, 'id' | 'attendeeCount' | 'date' | 'registrants'> & { date: Date }) => {
        try {
            // Prepare data for Firestore, converting Date back to Timestamp
            const dataToWrite = {
                ...newEventData,
                date: Timestamp.fromDate(newEventData.date),
                attendeeCount: 0,
                registrants: [],
            };

            const docRef = await addDoc(collection(db, "events"), dataToWrite);
            
            // Update local state by re-fetching (simplest reliable method)
            await fetchEvents(); 
            
            setIsEventFormOpen(false);
            alert(`Event "${newEventData.title}" published successfully!`);
        } catch (error) {
            console.error("Error adding event:", error);
            alert("Failed to publish event. Check console.");
        }
    }, [fetchEvents]);

    // TASK 2: Delete Event
    const handleDeleteEvent = useCallback(async (eventId: string, eventTitle: string) => {
        if (!window.confirm(`Are you sure you want to delete the event: "${eventTitle}"? This cannot be undone.`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, "events", eventId));

            // Optimistically update local state
            setEvents(prev => prev.filter(e => e.id !== eventId));
            alert(`Event "${eventTitle}" deleted successfully.`);
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Failed to delete event. Check console.");
        }
    }, []);

    // TASK 3: Send Email
    const handleOpenEmailForm = useCallback((event: Event) => {
        setEventToEmail(event);
        setIsEmailModalOpen(true);
    }, []);

    const handleSendEmail = useCallback(async (subject: string, body: string) => {
        if (!eventToEmail) return;

        setIsSendingEmail(true);
        const registrantIds = eventToEmail.registrants;
        
        try {
            if (registrantIds.length === 0) {
                alert(`Email was not sent: ${eventToEmail.title} has no registered attendees.`);
                setIsSendingEmail(false);
                setIsEmailModalOpen(false);
                return;
            }

            // Query the 'users' collection for all registrants' emails
            const usersQuery = query(
                collection(db, "users"),
                where(documentId(), 'in', registrantIds.slice(0, 10)) // Firestore 'in' query limit is 10
            );
            const usersSnapshot = await getDocs(usersQuery);
            const attendeeEmails = usersSnapshot.docs.map(doc => doc.data().email).filter(Boolean);

            if (attendeeEmails.length === 0) {
                alert(`Could not find valid email addresses for the ${registrantIds.length} registrants.`);
                setIsSendingEmail(false);
                setIsEmailModalOpen(false);
                return;
            }

            // --- API CALL PLACEHOLDER ---
            console.log(`--- Email Details ---`);
            console.log(`Event: ${eventToEmail.title}`);
            console.log(`Subject: ${subject}`);
            console.log(`Recipients (${attendeeEmails.length}): ${attendeeEmails.join(', ')}`);
            console.log(`Body: ${body.substring(0, 50)}...`);

            // Mock successful API call
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            // --- END PLACEHOLDER ---

            alert(`Email successfully queued for ${attendeeEmails.length} attendees.`);
            
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Failed to queue email job. Check console.");
        } finally {
            setIsSendingEmail(false);
            setIsEmailModalOpen(false);
            setEventToEmail(null);
        }
    }, [eventToEmail]);

    // --- LOGIC: Filtering ---

    const filteredEvents = useMemo(() => {
        const term = searchTerm.toLowerCase();
        // Inside filteredEvents useMemo
return events.filter(event =>
    event.title.toLowerCase().includes(term) ||
    event.location.toLowerCase().includes(term) ||
    event.description.toLowerCase().includes(term) ||
    event.category.toLowerCase().includes(term) ||
    event.organizer.toLowerCase().includes(term)
).sort((a, b) => a.date.seconds - b.date.seconds);
    }, [events, searchTerm]);


    // ------------------ MODALS (Forms) ------------------

    const EventFormModal = () => {
        const [title, setTitle] = useState('');
        const [date, setDate] = useState(''); // Date and time input string
        const [location, setLocation] = useState('');
        const [time, setTime] = useState('');
        const [category, setCategory] = useState('');
        const [organizer, setOrganizer] = useState('');
        const [maxAttendees, setMaxAttendees] = useState(350);
        const [description, setDescription] = useState('');
        const [fullDescription, setFullDescription] = useState('');
        const [contactEmail, setContactEmail] = useState('');
        const [registrationLink, setRegistrationLink] = useState('');
        const [isVirtual, setIsVirtual] = useState(false);
        const [image, setImage] = useState('');
        const [submitting, setSubmitting] = useState(false);


        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!title || !date || !location || !description || !category || !time) {
                alert("Please fill in all required fields (marked with *).");
                return;
            }
            
            setSubmitting(true);
            
            // NOTE: The date input will need to be parsed robustly in a real app.
            // For now, we rely on the Date object parsing to create a Firestore Timestamp.
            const dateObject = new Date(date);
            if (isNaN(dateObject.getTime())) {
                alert("Invalid Date format. Please use a standard format (e.g., MM/DD/YYYY).");
                setSubmitting(false);
                return;
            }

            handleAddEvent({ 
                title, 
                date: dateObject, 
                location, 
                time, 
                category, 
                organizer: organizer || 'Alumni Network',
                maxAttendees,
                description, 
                fullDescription,
                contactEmail: contactEmail || 'events@alumninet.org',
                registrationLink: registrationLink || 'N/A',
                isVirtual,
                image: image || '/default.jpg',
            }).finally(() => setSubmitting(false));
            
            // Clear fields on successful submit is done within handleAddEvent logic.
        };

        return (
            <Dialog open={isEventFormOpen} onOpenChange={setIsEventFormOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-primary">Create New Event</DialogTitle>
                        <DialogDescription>Use this form to schedule and publish a new event for the community. (* denotes required field)</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="space-y-2"><Label htmlFor="title">Title *</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label htmlFor="date">Date (e.g., 2026-10-25) *</Label><Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
                            <div className="space-y-2"><Label htmlFor="time">Time Range (e.g., 7:00 PM - 9:00 PM) *</Label><Input id="time" value={time} onChange={(e) => setTime(e.target.value)} required /></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label htmlFor="category">Category *</Label><Input id="category" placeholder="Social, Career, Fundraising..." value={category} onChange={(e) => setCategory(e.target.value)} required /></div>
                            <div className="space-y-2"><Label htmlFor="organizer">Organizer</Label><Input id="organizer" placeholder="Alumni Group / Department" value={organizer} onChange={(e) => setOrganizer(e.target.value)} /></div>
                        </div>

                        <div className="space-y-2"><Label htmlFor="location">Location (Venue or Virtual Link) *</Label><Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required /></div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label htmlFor="maxAttendees">Max Attendees</Label><Input id="maxAttendees" type="number" value={maxAttendees} onChange={(e) => setMaxAttendees(Number(e.target.value))} /></div>
                            <div className="space-y-2"><Label htmlFor="contactEmail">Contact Email</Label><Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="events@alumninet.org" /></div>
                        </div>

                        <div className="space-y-2"><Label htmlFor="description">Short Description *</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={2} /></div>
                        <div className="space-y-2"><Label htmlFor="fullDescription">Full Details</Label><Textarea id="fullDescription" value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} rows={4} /></div>
                        <div className="space-y-2"><Label htmlFor="registrationLink">Registration Link (URL)</Label><Input id="registrationLink" value={registrationLink} onChange={(e) => setRegistrationLink(e.target.value)} /></div>
                        <div className="space-y-2"><Label htmlFor="image">Image URL</Label><Input id="image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="/placeholders/mixer.jpg" /></div>
                        
                        <Button type="submit" disabled={submitting} style={primaryGradientStyle} className="mt-4">
                            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="ml-2 h-4 w-4" />} 
                            {submitting ? 'Publishing...' : 'Publish Event'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        );
    };

    const AttendeeEmailModal = () => {
        const [subject, setSubject] = useState(`Update: ${eventToEmail?.title || 'Event'}`);
        const [body, setBody] = useState('');

        if (!eventToEmail) return null;

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!subject || !body) {
                alert("Subject and message body are required.");
                return;
            }
            if (eventToEmail.registrants.length === 0) {
                alert("This event has no registrants to email.");
                return;
            }
            
            setIsSendingEmail(true);
            await handleSendEmail(subject, body);
            setIsSendingEmail(false);
        };

        return (
            <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-primary">Email Attendees: {eventToEmail.title}</DialogTitle>
                        <DialogDescription>Sending email to the {eventToEmail.registrants.length} registered attendees.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="space-y-2"><Label htmlFor="subject">Subject</Label><Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required /></div>
                        <div className="space-y-2"><Label htmlFor="body">Message Body</Label><Textarea id="body" placeholder="Your event update here..." value={body} onChange={(e) => setBody(e.target.value)} required rows={8} /></div>
                        
                        <Button type="submit" disabled={isSendingEmail} style={primaryGradientStyle} className="mt-4">
                            {isSendingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="ml-2 h-4 w-4" />}
                            {isSendingEmail ? 'Sending...' : `Send to ${eventToEmail.registrants.length} Attendees`}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        );
    };


    // ------------------ MAIN RENDER ------------------

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="ml-3 text-lg text-muted-foreground">Loading events...</p>
            </div>
        );
    }

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
                                        <div className="flex flex-wrap items-center space-x-4 text-sm pt-2">
                                            <Badge variant="outline" className="flex items-center gap-1 text-primary">
                                                <Calendar className="h-3 w-3" /> 
                                                {event.date.toDate().toLocaleDateString()}
                                            </Badge>
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> 
                                                {event.time}
                                            </Badge>
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> 
                                                {event.location}
                                            </Badge>
                                            <Badge variant="default" className="text-xs bg-purple-600/20 text-purple-400 border border-purple-600">
                                                {event.category}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Stats and Actions */}
                                    <div className="flex flex-col items-end space-y-2 w-1/5 min-w-[150px]">
                                        <div className="flex items-center text-sm font-medium text-green-400">
                                            <Users className="h-4 w-4 mr-1" />
                                            {event.registrants.length} / {event.maxAttendees} Attending
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