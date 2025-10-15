"use client";

import React from "react";
import { Calendar, MapPin, Users, Clock, Loader2, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Timestamp } from "firebase/firestore"; // Import Timestamp for date handling
import { useNavigate } from "react-router-dom"; // 💡 Import useNavigate

// Define the shape of the event data, matching what was fetched in Dashboard.tsx
interface EventData {
    id: string;
    title: string;
    date: Timestamp; // Firestore Timestamp
    location: string;
    attendeeCount: number;
    maxAttendees: number;
    category: string;
    image: string;
    // NOTE: The time field is not available in the full data structure you provided
}

// Define the component's props interface
export interface UpcomingEventsProps {
    events: EventData[];
    loading: boolean;
}

// Helper to format date from Firestore Timestamp
const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const PLACEHOLDER_TIME = "TBD";


export function UpcomingEvents({ events, loading }: UpcomingEventsProps) {
    const navigate = useNavigate(); // 💡 Initialize useNavigate hook

    const handleViewAll = () => {
        navigate("/events"); // 💡 Navigate to the /events route
    };
    
    // ------------------ Loading State ------------------
    if (loading) {
        return (
            <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm min-h-[300px] flex flex-col justify-center items-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="mt-4 text-muted-foreground">Loading upcoming events...</p>
            </div>
        );
    }
    
    // ------------------ No Data State ------------------
    if (events.length === 0) {
        return (
            <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm min-h-[300px]">
                 {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div>
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 via-purple-500 to-white bg-clip-text text-transparent">
                            Upcoming Events
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Your next alumni gatherings
                        </p>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-sm font-medium border-border/50"
                        onClick={handleViewAll} // 💡 Added onClick handler
                    >
                        View All
                    </Button>
                </div>
                <div className="flex flex-col items-center justify-center h-[200px] border border-dashed border-muted-foreground/30 rounded-xl p-4">
                    <Frown className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-3 text-sm text-muted-foreground text-center">
                        No upcoming events found. Check back later!
                    </p>
                </div>
            </div>
        );
    }

    // ------------------ Data Display ------------------
    return (
        <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm min-h-[300px]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 via-purple-500 to-white bg-clip-text text-transparent">
                        Upcoming Events
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Your next alumni gatherings
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-sm font-medium hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 border-border/50"
                    onClick={handleViewAll} // 💡 Added onClick handler
                >
                    View All
                </Button>
            </div>

            {/* Event List */}
            <div className="space-y-5">
                {events.map((event) => {
                    const progress = event.maxAttendees > 0 ? (event.attendeeCount / event.maxAttendees) * 100 : 0;
                    
                    return (
                        <div
                            key={event.id}
                            className="p-5 rounded-xl border border-border/40 bg-background/40 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-300 cursor-pointer"
                        >
                            <div className="space-y-4">
                                {/* Title + Date/Time */}
                                <div>
                                    <h4 className="font-semibold text-base text-foreground leading-tight">
                                        {event.title}
                                    </h4>

                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground mt-1">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" />
                                            <span>{formatDate(event.date)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-4 w-4" />
                                            {/* Using placeholder time as explained above */}
                                            <span>{PLACEHOLDER_TIME}</span> 
                                        </div>
                                    </div>
                                </div>

                                {/* Location + Attendance + Progress */}
                                <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-x-4 gap-y-3">
                                    {/* Location + Attendees (Vertical Stack) */}
                                    <div className="flex flex-col gap-y-1 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5 min-w-[130px]">
                                            <MapPin className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{event.location}</span>
                                        </div>
                                        {/* Attendees count now below location, aligned to match the MapPin icon for a cleaner look */}
                                        <div className="flex items-center gap-1.5 ml-0 md:ml-6">
                                            <Users className="h-4 w-4 shrink-0" />
                                            <span>{event.attendeeCount} / {event.maxAttendees} Attendees</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full md:w-28 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-600 via-purple-500 to-white"
                                            style={{
                                                width: `${progress}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}