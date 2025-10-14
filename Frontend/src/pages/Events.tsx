"use client";
import { useEffect, useState, useCallback } from "react";

// ------------------ UI COMPONENTS ------------------
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ------------------ ICONS ------------------
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ExternalLink,
  CheckCircle,
  Star,
  Share2,
  Loader2,
  Timer,
} from "lucide-react";

// ------------------ FIREBASE ------------------
import { db, auth } from "@/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  arrayUnion,
  arrayRemove,
  runTransaction,
  Timestamp,
  addDoc,
} from "firebase/firestore";

// ------------------ HELPERS ------------------
const getCurrentUserId = (): string | null => auth.currentUser?.uid || null;

const EVENTS_COLLECTION = "events";

// ------------------ INTERFACE ------------------
interface EventData {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  date: string;
  time: string;
  durationMinutes?: number;
  location: string;
  googleMapsEmbed?: string;
  isVirtual: boolean;
  attendees: number;
  maxAttendees: number | null;
  organizer: string;
  organizerAvatar: string;
  contactEmail?: string;
  directContact?: string;
  prerequisites?: string;
  registrationLink?: string;
  speakerName?: string;
  category: string;
  isFeatured: boolean;
  isRegistered: boolean;
  image: string;
}

// ------------------ COMPONENT ------------------
const Events = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([]);
  const [pastEvents, setPastEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState<string | null>(null);

  // Format date for UI
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Networking:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Educational:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Career:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Sports:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      Social:
        "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      General: "bg-gray-100 text-gray-800",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  // ------------------ FETCH FIRESTORE DATA ------------------
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    const now = new Date();
    const currentUserId = getCurrentUserId();

    try {
      const eventsCol = collection(db, EVENTS_COLLECTION);
      const snapshot = await getDocs(query(eventsCol, orderBy("date", "asc")));

      const events: EventData[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as any;
        const date = data.date?.toDate ? data.date.toDate() : new Date();

        return {
          id: docSnap.id,
          title: data.title || "Untitled Event",
          description: data.description || "No description available.",
          fullDescription: data.fullDescription || "",
          date: date.toISOString(),
          time: data.time || "TBD",
          durationMinutes: data.durationMinutes || 0,
          location: data.location || "Unknown",
          googleMapsEmbed: data.googleMapsEmbed || "",
          isVirtual: data.isVirtual || false,
          attendees: data.attendeeCount || 0,
          maxAttendees: data.maxAttendees || null,
          organizer: data.organizer || "N/A",
          organizerAvatar: data.organizerAvatar || "/placeholder-avatar.jpg",
          contactEmail: data.contactEmail || "",
          directContact: data.directContact || "",
          prerequisites: data.prerequisites || "",
          registrationLink: data.registrationLink || "",
          speakerName: data.speakerName || "",
          category: data.category || "General",
          isFeatured: data.isFeatured || false,
          isRegistered: currentUserId
            ? data.registrants?.includes(currentUserId)
            : false,
          image: data.image || "/placeholder-event.jpg",
        };
      });

      setUpcomingEvents(events.filter((e) => new Date(e.date) >= now));
      setPastEvents(events.filter((e) => new Date(e.date) < now));
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ------------------ REGISTRATION HANDLER ------------------
  const handleRegistration = useCallback(
    async (event: EventData) => {
      const currentUserId = getCurrentUserId();
      if (!currentUserId) {
        alert("Please log in to register for an event.");
        return;
      }
      if (isRegistering === event.id) return;

      setIsRegistering(event.id);
      const newStatus = !event.isRegistered;
      const change = newStatus ? 1 : -1;
      const eventRef = doc(db, EVENTS_COLLECTION, event.id);

      try {
        // 1️⃣ Update event registration in Firestore atomically
        await runTransaction(db, async (txn) => {
          const eventSnap = await txn.get(eventRef);
          if (!eventSnap.exists()) throw new Error("Event not found.");

          const currentCount = (eventSnap.data() as any).attendeeCount || 0;
          txn.update(eventRef, {
            attendeeCount: currentCount + change,
            registrants: newStatus
              ? arrayUnion(currentUserId)
              : arrayRemove(currentUserId),
          });
        });

        // 2️⃣ Send notification to the current user dynamically
        if (newStatus) {
          const sender =
            auth.currentUser?.displayName ||
            auth.currentUser?.email ||
            "Alumni User";

          const notification = {
            type: "event",
            category: "events",
            title: `New Registration: ${event.title}`,
            message: `You registered for ${event.title}.`,
            timestamp: Timestamp.now(),
            isRead: false,
            linkToId: event.id,
            senderName: sender,
          };

          // Dynamic path
          const notifPath = `users/${currentUserId}/notifications`;
          const notifRef = collection(db, notifPath);
          await addDoc(notifRef, notification);
        }

        // 3️⃣ Optimistic UI update
        setUpcomingEvents((prev) =>
          prev.map((e) =>
            e.id === event.id
              ? {
                  ...e,
                  isRegistered: newStatus,
                  attendees: e.attendees + change,
                }
              : e
          )
        );

        alert(
          newStatus
            ? `🎉 Registered for ${event.title}`
            : `Registration canceled for ${event.title}`
        );
      } catch (err) {
        console.error("Registration failed:", err);
        alert("Something went wrong. Try again later.");
      } finally {
        setIsRegistering(null);
      }
    },
    [isRegistering]
  );

  // ------------------ SHARE HANDLER ------------------
  const handleShare = (event: EventData) => {
    const url = `${window.location.origin}/events/${event.id}`;
    if (navigator.share) {
      navigator
        .share({ title: event.title, text: event.description, url })
        .catch(console.error);
    } else {
      navigator.clipboard
        .writeText(url)
        .then(() => alert("Copied link to clipboard!"));
    }
  };

  // ------------------ EVENT CARD ------------------
  const EventCard = ({ event, isPast = false }: { event: EventData; isPast?: boolean }) => (
    <Card className={`glass-card hover-glow ${event.isFeatured ? "ring-2 ring-primary/50" : ""}`}>
      {event.isFeatured && (
        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary to-primary/80 rounded-t-lg">
          <Star className="h-4 w-4 text-white fill-white" />
          <span className="text-white text-sm font-medium">Featured Event</span>
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{event.title}</CardTitle>
              {event.isRegistered && <CheckCircle className="h-5 w-5 text-green-500" />}
            </div>
            <Badge className={getCategoryColor(event.category)}>
              {event.category}
            </Badge>
          </div>
          {!isPast && (
            <Button variant="ghost" size="sm" onClick={() => handleShare(event)}>
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" /> {formatDate(event.date)}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" /> {event.time}
            </div>
            {event.durationMinutes && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Timer className="h-4 w-4" /> {event.durationMinutes} mins
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" /> {event.location}
              {event.isVirtual && <Badge variant="outline">Virtual</Badge>}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" /> {event.attendees} attending
              {event.maxAttendees && ` / ${event.maxAttendees}`}
            </div>
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
              ) : event.isRegistered ? (
                "Cancel Registration"
              ) : (
                "Register Now"
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = `/events/${event.id}`)}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ------------------ MAIN RENDER ------------------
  

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Alumni{" "}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Events
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay connected through exciting alumni meetups, workshops, and
            conferences.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Events</p>
                <p className="text-3xl font-bold">{upcomingEvents.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Attendees</p>
                <p className="text-3xl font-bold">
                  {upcomingEvents.reduce((a, e) => a + e.attendees, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Registrations</p>
                <p className="text-3xl font-bold">
                  {upcomingEvents.filter((e) => e.isRegistered).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {upcomingEvents.length ? (
                upcomingEvents.map((e) => <EventCard key={e.id} event={e} />)
              ) : (
                <p className="text-center text-muted-foreground">
                  No upcoming events found.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {pastEvents.length ? (
                pastEvents.map((e) => <EventCard key={e.id} event={e} isPast />)
              ) : (
                <p className="text-center text-muted-foreground">
                  No past events found.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Events;
