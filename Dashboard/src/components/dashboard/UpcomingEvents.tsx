"use client";

import React from "react";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const upcomingEvents = [
  {
    id: 1,
    title: "Alumni Tech Meetup",
    date: "2024-01-15",
    time: "18:00",
    location: "San Francisco, CA",
    attendees: 45,
    maxAttendees: 50,
    type: "Networking",
  },
  {
    id: 2,
    title: "Career Development Workshop",
    date: "2024-01-18",
    time: "14:00",
    location: "Virtual Event",
    attendees: 23,
    maxAttendees: 30,
    type: "Workshop",
  },
  {
    id: 3,
    title: "Annual Fundraising Gala",
    date: "2024-01-25",
    time: "19:00",
    location: "New York, NY",
    attendees: 120,
    maxAttendees: 150,
    type: "Fundraising",
  },
];

export function UpcomingEvents() {
  return (
    <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
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
        >
          View All
        </Button>
      </div>

      {/* Event List */}
      <div className="space-y-5">
        {upcomingEvents.map((event) => (
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
                    <span>
                      {new Date(event.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                </div>
              </div>

              {/* Location + Attendance + Progress */}
              <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-x-4 gap-y-3">
                {/* Location + Attendees */}
                <div className="flex flex-wrap md:flex-nowrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5 min-w-[130px]">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full md:w-28 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 via-purple-500 to-white"
                    style={{
                      width: `${(event.attendees / event.maxAttendees) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
