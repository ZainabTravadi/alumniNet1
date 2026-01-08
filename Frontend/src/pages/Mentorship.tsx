import { useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, User } from "firebase/auth";

// UI
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
  BookOpen, Search, Star, MapPin, Building2, GraduationCap,
  Clock, Users, MessageSquare, Send, CheckCircle, Calendar
} from 'lucide-react';

// Firebase
import { auth, db } from "@/firebase";
import { collection, addDoc, doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { Link } from "react-router-dom";

/* ------------------ TYPES ------------------ */

interface Mentor {
  id: string;
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

interface MentorshipRequest {
  id: string | number;
  mentorName: string;
  mentorAvatar: string;
  topic: string;
  status: 'pending' | 'accepted' | 'completed';
  requestDate: string;
  message: string;
}

/* ------------------ FALLBACK DATA ------------------ */

const DUMMY_MENTORS: Mentor[] = [
  {
    id: 'dummy-mentor-1',
    name: 'Sarah Chen',
    title: 'Senior Software Engineer',
    company: 'Google',
    batch: '2016',
    department: 'Computer Science',
    location: 'San Francisco',
    avatar: '/placeholder-avatar.jpg',
    rating: 4.9,
    mentees: 12,
    expertise: ['Software Engineering', 'System Design'],
    bio: 'Helping students break into big tech.',
    availability: 'Weekends',
    responseTime: '24 hours',
    languages: ['English']
  }
];

const DUMMY_REQUESTS: MentorshipRequest[] = [];

/* ------------------ API CONFIG ------------------ */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://alumninet-backend-8ab3a9de8aad.herokuapp.com';

const API_MENTORS = `${API_BASE}/api/mentorship/mentors`;
const API_REQUESTS = `${API_BASE}/api/mentorship/requests`;

/* ================== COMPONENT ================== */

const Mentorship = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [mentors, setMentors] = useState<Mentor[]>(DUMMY_MENTORS);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>(DUMMY_REQUESTS);

  const [activeTab, setActiveTab] = useState('find-mentors');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('All Areas');

  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [requestData, setRequestData] = useState({ topic: '', message: '' });

  /* ------------------ AUTH ------------------ */

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  /* ------------------ FETCH DATA ------------------ */

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [mentorsRes, requestsRes] = await Promise.all([
          fetch(API_MENTORS),
          fetch(`${API_REQUESTS}?user_id=${encodeURIComponent(currentUser.uid)}`)
        ]);

        const mentorsJson = await mentorsRes.json();
        const requestsJson = await requestsRes.json();

        setMentors(mentorsRes.ok && mentorsJson.data ? mentorsJson.data : DUMMY_MENTORS);
        setMentorshipRequests(requestsRes.ok && requestsJson.data ? requestsJson.data : DUMMY_REQUESTS);
      } catch (err) {
        console.error("Mentorship fetch failed:", err);
        setMentors(DUMMY_MENTORS);
        setMentorshipRequests(DUMMY_REQUESTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  /* ------------------ REQUEST HANDLER ------------------ */

  const handleSendMentorshipRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedMentor) return;

    try {
      await addDoc(
        collection(db, "users", selectedMentor.id, "notifications"),
        {
          type: 'mentorship',
          category: 'mentorship',
          title: `New Mentorship Request`,
          message: requestData.message,
          timestamp: Timestamp.now(),
          isRead: false,
          actionable: true,
          linkToId: currentUser.uid,
          senderName: currentUser.displayName || currentUser.email
        }
      );

      await updateDoc(doc(db, "users", currentUser.uid), {
        pendingMentorshipRequests: arrayUnion(selectedMentor.id)
      });

      alert("Mentorship request sent!");
      setIsRequestOpen(false);
      setSelectedMentor(null);
      setRequestData({ topic: '', message: '' });

    } catch (err) {
      console.error(err);
      alert("Failed to send request.");
    }
  };

  /* ------------------ FILTERING ------------------ */

  const expertiseAreas = useMemo(() => {
    const areas = mentors.flatMap(m => m.expertise);
    return ['All Areas', ...Array.from(new Set(areas))];
  }, [mentors]);

  const filteredMentors = useMemo(() => {
    return mentors.filter(m => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesExpertise =
        selectedExpertise === 'All Areas' ||
        m.expertise.includes(selectedExpertise);

      return matchesSearch && matchesExpertise;
    });
  }, [mentors, searchTerm, selectedExpertise]);

  /* ------------------ AUTH GUARD ------------------ */

  if (currentUser === null) {
    return (
      <p className="text-center mt-20 text-muted-foreground">
        Please sign in to access the Mentorship Hub.
      </p>
    );
  }

  /* ------------------ RENDER ------------------ */

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            Alumni <span className="text-primary">Mentorship</span>
          </h1>
          <p className="text-muted-foreground">
            Learn from experienced alumni mentors
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="find-mentors">Find Mentors</TabsTrigger>
            <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            <TabsTrigger value="become-mentor">Become a Mentor</TabsTrigger>
          </TabsList>

          {/* FIND MENTORS */}
          <TabsContent value="find-mentors" className="space-y-6">
            <Card>
              <CardContent className="p-4 grid md:grid-cols-3 gap-4">
                <Input
                  placeholder="Search mentors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expertiseAreas.map(area => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {filteredMentors.map(mentor => (
                <Card key={mentor.id}>
                  <CardHeader>
                    <CardTitle>{mentor.name}</CardTitle>
                    <CardDescription>{mentor.title} at {mentor.company}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{mentor.bio}</p>
                    <div className="flex gap-2">
                      <Button onClick={() => {
                        setSelectedMentor(mentor);
                        setIsRequestOpen(true);
                      }}>
                        <Send className="h-4 w-4 mr-2" /> Request
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setSelectedMentor(mentor);
                        setIsProfileOpen(true);
                      }}>
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* MY REQUESTS */}
          <TabsContent value="my-requests">
            <Card>
              <CardHeader>
                <CardTitle>Your Requests</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          {/* BECOME MENTOR */}
          <TabsContent value="become-mentor">
            <Card>
              <CardContent className="text-center space-y-4 p-6">
                <BookOpen className="h-12 w-12 mx-auto text-primary" />
                <p>Share your experience and guide students.</p>
                <Link to="/apply-to-mentor">
                  <Button>Apply to Become a Mentor</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* REQUEST DIALOG */}
        {selectedMentor && (
          <Dialog open={isRequestOpen} onOpenChange={(o) => !o && setIsRequestOpen(false)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request {selectedMentor.name}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSendMentorshipRequest} className="space-y-4">
                <Input
                  placeholder="Topic"
                  value={requestData.topic}
                  onChange={(e) => setRequestData({ ...requestData, topic: e.target.value })}
                />
                <Textarea
                  placeholder="Message"
                  value={requestData.message}
                  onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                />
                <Button type="submit">Send</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}

      </div>
    </div>
  );
};

export default Mentorship;
