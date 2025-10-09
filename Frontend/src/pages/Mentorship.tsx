import { useEffect, useState, useMemo, useCallback } from 'react'; // 💡 Added necessary hooks
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
    BookOpen,
    Search,
    Star,
    MapPin,
    Building2,
    GraduationCap,
    Clock,
    Users,
    MessageSquare,
    Send,
    CheckCircle,
    Calendar,
    Award
} from 'lucide-react';
// Assuming Firebase Auth is imported here
import { auth } from "@/firebase"; 

// ------------------ 💡 API DATA INTERFACES ------------------
interface Mentor {
    id: number | string;
    name: string;
    title: string; // Mapped from Firestore 'title'
    company: string;
    batch: string;
    department: string;
    location: string;
    avatar: string; // Mapped from 'avatarUrl'
    rating: number;
    mentees: number; // Mapped from 'menteesCount'
    expertise: string[]; // Mapped from 'expertise'
    bio: string;
    availability: string;
    responseTime: string;
    languages: string[];
}

interface MentorshipRequest {
    id: number | string;
    mentorName: string;
    mentorAvatar: string;
    topic: string;
    status: 'pending' | 'accepted' | 'completed';
    requestDate: string; // Raw date string from Python API
    message: string;
}

// ------------------ 💡 FALLBACK DUMMY DATA ------------------
const DUMMY_MENTORS: Mentor[] = [
    { id: 1, name: 'Sarah Chen', title: 'Senior Software Engineer', company: 'Google', batch: '2016', department: 'Computer Science', location: 'San Francisco, CA', avatar: '/placeholder-avatar.jpg', rating: 4.9, mentees: 12, expertise: ['Software Engineering', 'Career Growth', 'Technical Leadership', 'System Design'], bio: 'I have 8+ years of experience in tech...', availability: 'Weekends', responseTime: '24 hours', languages: ['English', 'Mandarin'] },
    { id: 4, name: 'David Kim', title: 'Investment Partner', company: 'Sequoia Capital', batch: '2012', department: 'Finance', location: 'Menlo Park, CA', avatar: '/placeholder-avatar.jpg', rating: 5.0, mentees: 6, expertise: ['Venture Capital', 'Startup Funding', 'Financial Analysis', 'Entrepreneurship'], bio: 'Investing in early-stage startups...', availability: 'Mornings', responseTime: '48 hours', languages: ['English', 'Korean'] }
];

const DUMMY_REQUESTS: MentorshipRequest[] = [
    { id: 1, mentorName: 'Sarah Chen', mentorAvatar: '/placeholder-avatar.jpg', topic: 'Career transition to tech', status: 'pending', requestDate: '2024-03-10', message: 'Hi Sarah, I\'m interested in transitioning...' },
    { id: 2, mentorName: 'Michael Rodriguez', mentorAvatar: '/placeholder-avatar.jpg', topic: 'Product management career', status: 'accepted', requestDate: '2024-03-08', message: 'Hello Michael, I\'m currently an engineer...' }
]; 


const Mentorship = () => {
    const [activeTab, setActiveTab] = useState('find-mentors');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedExpertise, setSelectedExpertise] = useState('All Areas');
    const [isRequestOpen, setIsRequestOpen] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // 💡 Added loading state

    // 💡 LIVE STATE
    const [mentors, setMentors] = useState<Mentor[]>(DUMMY_MENTORS);
    const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>(DUMMY_REQUESTS);
    
    // API Endpoints
    const API_MENTORS = import.meta.env.VITE_API_MENTORS || 'http://localhost:5000/api/mentorship/mentors';
    const API_REQUESTS = import.meta.env.VITE_API_REQUESTS || 'http://localhost:5000/api/mentorship/requests';

    // ------------------ 💡 DATA FETCHING ------------------

    useEffect(() => {
        const fetchMentorshipData = async () => {
            setIsLoading(true);
            
            // 1. Get the current user's UID (Required for 'My Requests' tab)
            const user = auth.currentUser;
            // CRITICAL: Use the actual UID, or the specific placeholder ID from your DB
            const userId = user?.uid || 'Mentee_UID_A123'; 

            try {
                // Fetch Mentors List
                const mentorsRes = await fetch(API_MENTORS);
                const mentorsResult = await mentorsRes.json();
                
                // Fetch User's Requests (using the correct user_id query parameter)
                const requestsRes = await fetch(`${API_REQUESTS}?user_id=${userId}`);
                const requestsResult = await requestsRes.json();
                
                // Update Mentor State
                if (mentorsRes.ok && mentorsResult.data) {
                    setMentors(mentorsResult.data as Mentor[]);
                } else {
                    setMentors(DUMMY_MENTORS); // Fallback
                }
                
                // Update Requests State
                if (requestsRes.ok && requestsResult.data) {
                    setMentorshipRequests(requestsResult.data as MentorshipRequest[]);
                } else {
                    setMentorshipRequests(DUMMY_REQUESTS); // Fallback
                }

            } catch (error) {
                console.error("Network error fetching mentorship data:", error);
                // State remains initialized with DUMMY data on network failure
            } finally {
                setIsLoading(false);
            }
        };

        fetchMentorshipData();
    }, [API_MENTORS, API_REQUESTS]); // Dependency array ensures hook runs once


    // ------------------ UTILITIES ------------------

    // Consolidated list of expertise areas (for the Select dropdown)
    const expertiseAreas = useMemo(() => {
        const allAreas = mentors.flatMap(m => m.expertise);
        const uniqueAreas = [...new Set(allAreas)].filter(Boolean).sort();
        return ['All Areas', ...uniqueAreas];
    }, [mentors]);

    // Filtering logic (uses useMemo for performance)
    const filteredMentors = useMemo(() => {
        return mentors.filter(mentor => {
            const term = searchTerm.toLowerCase();
            
            // Null-safe search across key fields
            const matchesSearch = 
                (mentor.name || '').toLowerCase().includes(term) ||
                (mentor.company || '').toLowerCase().includes(term) ||
                (mentor.title || '').toLowerCase().includes(term);
                
            const matchesExpertise = selectedExpertise === 'All Areas' || 
                                     (mentor.expertise || []).some(exp => exp.includes(selectedExpertise));
            
            return matchesSearch && matchesExpertise;
        });
    }, [mentors, searchTerm, selectedExpertise]);


    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'accepted': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'accepted': return <CheckCircle className="h-4 w-4" />;
            case 'completed': return <Star className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    // ------------------ RENDER ------------------

    if (isLoading) {
        return <p className="text-center mt-20 text-lg text-primary">Loading mentorship portal...</p>;
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold">
                        Alumni{' '}
                        <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
                            Mentorship
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Connect with experienced alumni mentors or share your expertise by becoming a mentor yourself.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
                    <Card className="glass-card">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Available Mentors</p>
                                    <p className="text-3xl font-bold">{mentors.length}</p>
                                </div>
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Mentorships</p>
                                    <p className="text-3xl font-bold">89</p> {/* Static stat */}
                                </div>
                                <MessageSquare className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Success Stories</p>
                                    <p className="text-3xl font-bold">156</p> {/* Static stat */}
                                </div>
                                <Star className="h-8 w-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Your Requests</p>
                                    <p className="text-3xl font-bold">{mentorshipRequests.length}</p>
                                </div>
                                <BookOpen className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-scale-in">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="find-mentors">Find Mentors</TabsTrigger>
                        <TabsTrigger value="my-requests">My Requests</TabsTrigger>
                        <TabsTrigger value="become-mentor">Become a Mentor</TabsTrigger>
                    </TabsList>

                    {/* Find Mentors Tab */}
                    <TabsContent value="find-mentors" className="space-y-6">
                        {/* Search & Filters */}
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="h-5 w-5 text-primary" />
                                    Find Your Perfect Mentor
                                </CardTitle>
                                <CardDescription>
                                    Search by expertise, company, or name to find the right mentor for your goals
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search by name, company, or title..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Expertise" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {expertiseAreas.map((area) => (
                                                <SelectItem key={area} value={area}>
                                                    {area}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Mentors Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredMentors.map((mentor) => (
                                <Card key={mentor.id} className="glass-card hover-glow">
                                    <CardHeader>
                                        <div className="flex items-start space-x-4">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={mentor.avatar} />
                                                <AvatarFallback className="text-lg">
                                                    {mentor.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <CardTitle className="text-lg">{mentor.name}</CardTitle>
                                                <CardDescription>{mentor.title}</CardDescription>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" />
                                                        {mentor.company}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <GraduationCap className="h-3 w-3" />
                                                        {mentor.batch}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                    <span className="font-medium">{mentor.rating}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {mentor.mentees} mentees
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {mentor.bio}
                                        </p>

                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">Expertise Areas</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {mentor.expertise.map((skill) => (
                                                    <Badge key={skill} variant="outline" className="text-xs">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <span className="text-muted-foreground">Location:</span>
                                                <p className="font-medium">{mentor.location}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Response Time:</span>
                                                <p className="font-medium">{mentor.responseTime}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Availability:</span>
                                                <p className="font-medium">{mentor.availability}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Languages:</span>
                                                <p className="font-medium">{mentor.languages.join(', ')}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Dialog open={isRequestOpen && selectedMentor?.id === mentor.id} onOpenChange={setIsRequestOpen}>
                                                <DialogTrigger asChild>
                                                    <Button 
                                                        className="flex-1" 
                                                        onClick={() => {
                                                            setSelectedMentor(mentor);
                                                            setIsRequestOpen(true);
                                                        }}
                                                    >
                                                        <Send className="h-3 w-3 mr-2" />
                                                        Request Mentorship
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[500px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Request Mentorship from {mentor.name}</DialogTitle>
                                                        <DialogDescription>
                                                            Send a personalized message explaining what you'd like to learn and your goals.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="topic">Mentorship Topic</Label>
                                                            <Input id="topic" placeholder="e.g., Career transition to tech" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="message">Personal Message</Label>
                                                            <Textarea 
                                                                id="message" 
                                                                placeholder="Introduce yourself and explain what you hope to learn..."
                                                                className="min-h-[100px]"
                                                            />
                                                        </div>
                                                        <div className="flex justify-end space-x-2">
                                                            <Button variant="outline" onClick={() => setIsRequestOpen(false)}>
                                                                Cancel
                                                            </Button>
                                                            <Button onClick={() => setIsRequestOpen(false)}>
                                                                Send Request
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
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

                    {/* My Requests Tab */}
                    <TabsContent value="my-requests" className="space-y-6">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Your Mentorship Requests</CardTitle>
                                <CardDescription>
                                    Track the status of your mentorship requests and manage ongoing relationships
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mentorshipRequests.map((request) => (
                                        <div key={request.id} className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30">
                                            <Avatar>
                                                <AvatarImage src={request.mentorAvatar} />
                                                <AvatarFallback>
                                                    {request.mentorName.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium">{request.mentorName}</h4>
                                                    <Badge className={getStatusColor(request.status)}>
                                                        {getStatusIcon(request.status)}
                                                        <span className="ml-1 capitalize">{request.status}</span>
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-medium text-muted-foreground">{request.topic}</p>
                                                <p className="text-sm text-muted-foreground line-clamp-2">{request.message}</p>
                                                <div className="flex items-center justify-between pt-2">
                                                    <span className="text-xs text-muted-foreground">
                                                        Requested on {new Date(request.requestDate).toLocaleDateString()}
                                                    </span>
                                                    <div className="flex gap-2">
                                                        {request.status === 'accepted' && (
                                                            <Button size="sm">
                                                                <MessageSquare className="h-3 w-3 mr-1" />
                                                                Message
                                                            </Button>
                                                        )}
                                                        <Button variant="outline" size="sm">
                                                            View Details
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Become a Mentor Tab */}
                    <TabsContent value="become-mentor" className="space-y-6">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Become a Mentor</CardTitle>
                                <CardDescription>
                                    Share your expertise and help fellow alumni grow in their careers
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="text-center space-y-4">
                                    <BookOpen className="h-16 w-16 mx-auto text-primary" />
                                    <h3 className="text-2xl font-bold">Ready to Make a Difference?</h3>
                                    <p className="text-muted-foreground max-w-2xl mx-auto">
                                        Join our community of mentors and help shape the next generation of professionals. 
                                        Share your knowledge, build meaningful connections, and give back to your alma mater.
                                    </p>
                                </div>
                                
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="text-center space-y-2">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                            <Users className="h-6 w-6 text-primary" />
                                        </div>
                                        <h4 className="font-semibold">Impact Lives</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Help fellow alumni navigate their career challenges and achieve their goals
                                        </p>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                            <Star className="h-6 w-6 text-primary" />
                                        </div>
                                        <h4 className="font-semibold">Build Network</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Expand your professional network and create lasting relationships
                                        </p>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                            <Calendar className="h-6 w-6 text-primary" />
                                        </div>
                                        <h4 className="font-semibold">Flexible Schedule</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Mentor on your own schedule with as much or as little time as you can offer
                                        </p>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                                        Apply to Become a Mentor
                                    </Button>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Application review typically takes 2-3 business days
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {selectedMentor && (
                <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <DialogContent className="sm:max-w-2xl w-full">
                        <DialogHeader>
                            <div className="flex items-start space-x-4">
                                <Avatar className="h-24 w-24 border-2 border-primary">
                                    <AvatarImage src={selectedMentor.avatar} />
                                    <AvatarFallback className="text-3xl">
                                        {selectedMentor.name.split(' ').map((n: string) => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <DialogTitle className="text-2xl font-bold">{selectedMentor.name}</DialogTitle>
                                    <DialogDescription className="text-md">
                                        {selectedMentor.title} at <span className="font-semibold text-primary">{selectedMentor.company}</span>
                                    </DialogDescription>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                                        <span className="flex items-center gap-1.5">
                                            <GraduationCap className="h-4 w-4" />
                                            Batch of {selectedMentor.batch}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" />
                                            {selectedMentor.location}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="py-4 space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Bio</h3>
                                <p className="text-muted-foreground">{selectedMentor.bio}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2">Expertise</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedMentor.expertise.map((skill: string) => (
                                        <Badge key={skill} variant="secondary">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <div>
                                    <h4 className="font-semibold">Department</h4>
                                    <p className="text-muted-foreground">{selectedMentor.department}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Rating</h4>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                                        <span className="font-medium text-muted-foreground">{selectedMentor.rating}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Mentees</h4>
                                    <p className="text-muted-foreground">{selectedMentor.mentees}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Availability</h4>
                                    <p className="text-muted-foreground">{selectedMentor.availability}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Response Time</h4>
                                    <p className="text-muted-foreground">{selectedMentor.responseTime}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Languages</h4>
                                    <p className="text-muted-foreground">{selectedMentor.languages.join(', ')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsProfileOpen(false)}>Close</Button>
                            <Button onClick={() => {
                                setIsProfileOpen(false);
                                setIsRequestOpen(true);
                            }}>
                                <Send className="h-4 w-4 mr-2" />
                                Request Mentorship
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
                )}
            </div>
        </div>
    );
};

export default Mentorship;