import React from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const upcomingEvents = [
  {
    id: 1,
    title: 'Alumni Tech Meetup',
    date: '2024-01-15',
    time: '18:00',
    location: 'San Francisco, CA',
    attendees: 45,
    maxAttendees: 50,
    type: 'Networking'
  },
  {
    id: 2,
    title: 'Career Development Workshop',
    date: '2024-01-18',
    time: '14:00',
    location: 'Virtual Event',
    attendees: 23,
    maxAttendees: 30,
    type: 'Workshop'
  },
  {
    id: 3,
    title: 'Annual Fundraising Gala',
    date: '2024-01-25',
    time: '19:00',
    location: 'New York, NY',
    attendees: 120,
    maxAttendees: 150,
    type: 'Fundraising'
  }
];

export function UpcomingEvents() {
  return (
    <div className="mentor-card p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gradient">Upcoming Events</h3>
            <p className="text-sm text-muted-foreground">Next alumni gatherings</p>
          </div>
          <Button variant="glow" size="sm">
            View All
          </Button>
        </div>

        <div className="space-y-4">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="p-4 rounded-lg glow-border hover:bg-accent/20 transition-all duration-200 group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-foreground group-hover:text-gradient transition-colors">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {event.type}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{event.attendees}/{event.maxAttendees} attending</span>
                    </div>
                  </div>

                  {/* Attendance Progress */}
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-300"
                      style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}