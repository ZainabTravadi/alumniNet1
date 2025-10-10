import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/firebase";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";

// UI Imports
import { 
    Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
    Users, MapPin, GraduationCap, Star, MessageSquare
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ------------------ 💡 Type Definitions (Matches Mapped Firestore Fields) ------------------
interface AlumniProfile {
    id: string; // Firestore UID
    name: string; // Mapped from 'displayName'
    title: string; // Mapped from 'title'
    company: string; // Mapped from 'company'
    batch: string;
    department: string;
    location: string;
    avatar: string; // Mapped from 'avatarUrl'
    rating: number;
    mentees: number; // Mapped from 'menteesCount'
    expertise: string[];
    bio: string;
    availability: string;
    responseTime: string;
    languages: string[];
    createdAt: Timestamp; 
}

// ------------------ 💡 Fallback Dummy Data ------------------
const DUMMY_ALUMNI: AlumniProfile[] = [
    { 
        id: 'fallback-1', 
        name: 'Alex Johnson', 
        title: 'Senior Product Manager', 
        company: 'Stripe', 
        batch: '2015', 
        department: 'Business Administration', 
        location: 'New York, NY', 
        avatar: '/placeholder-avatar.jpg', 
        rating: 5, 
        mentees: 3, 
        expertise: ['Product Management', 'FinTech', 'Agile Leadership'], 
        bio: 'Senior PM passionate about mentoring new grads in the FinTech space.', 
        availability: 'Evenings & Weekends', 
        responseTime: 'Under 8 hours', 
        languages: ['English', 'French'], 
        createdAt: Timestamp.fromDate(new Date('2024-01-01')) 
    },
    { 
        id: 'fallback-2', 
        name: 'Sarah Chen', 
        title: 'Software Engineer', 
        company: 'Google', 
        batch: '2019', 
        department: 'Computer Science', 
        location: 'San Francisco', 
        avatar: '/placeholder-avatar.jpg', 
        rating: 4.9, 
        mentees: 12, 
        expertise: ['Software Engineering'], 
        bio: 'I love helping fellow alumni navigate their tech careers.', 
        availability: 'Weekends', 
        responseTime: '24 hours', 
        languages: ['English', 'Mandarin'], 
        createdAt: Timestamp.fromDate(new Date('2024-02-01')) 
    },
];

// ------------------ 💡 Component ------------------
const RecentAlumniPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // ------------------ 💡 Auth Guard ------------------
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) navigate("/auth");
            else setUser(currentUser);
        });
        return () => unsubscribe();
    }, [navigate]);

    // ------------------ 💡 Data Fetch from Firestore (Fixed Query and Mapping) ------------------
    useEffect(() => {
        const fetchRecentAlumni = async () => {
            if (!user) return;
            setIsDataLoading(true);

            try {
                // 💡 FIX: Define the query completely in one step to resolve TypeScript error (2739)
                const alumniQuery = query(
                    collection(db, "users"),
                    orderBy("createdAt", "asc") // Oldest to Recent
                );

                const querySnapshot = await getDocs(alumniQuery);
                const fetchedAlumni: AlumniProfile[] = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    
                    // MAPPING FIRESTORE FIELDS TO ALUMNIPROFILE INTERFACE 
                    fetchedAlumni.push({
                        id: doc.id,
                        name: data.displayName || 'Alumnus Name Pending',
                        title: data.title || 'N/A Title',
                        company: data.company || 'N/A Company',
                        batch: data.batch || 'N/A',
                        department: data.department || 'N/A Dept.',
                        location: data.location || 'Unknown',
                        avatar: data.avatarUrl || '/placeholder-avatar.jpg', // avatarUrl -> avatar
                        rating: data.rating || 0,
                        mentees: data.menteesCount || 0, // menteesCount -> mentees
                        expertise: data.expertise || [],
                        bio: data.bio || 'Alumni profile details pending.',
                        availability: data.availability || 'Flexible',
                        responseTime: data.responseTime || '48 hours',
                        languages: data.languages || ['English'],
                        createdAt: data.createdAt, 
                    } as AlumniProfile);
                });

                setAlumniList(fetchedAlumni.length ? fetchedAlumni : DUMMY_ALUMNI);

            } catch (err) {
                console.error("❌ Firestore fetch error for recent alumni:", err);
                setAlumniList(DUMMY_ALUMNI);
            } finally {
                setIsDataLoading(false);
            }
        };

        if (user) fetchRecentAlumni();
    }, [user]);

    // Loading and Auth checks
    if (!user) return <p className="text-center mt-20">Checking authentication...</p>;
    if (isDataLoading) return <p className="text-center mt-20 text-lg text-primary">Loading recent alumni...</p>;

    // ------------------ 💡 Render ------------------
    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex justify-between items-center pb-4 border-b">
                    <h1 className="text-4xl md:text-5xl font-extrabold flex items-center gap-3">
                        <Users className="h-8 w-8 text-primary" />
                        {/* Gradient Title */}
                        <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
                            Recently Joined Alumni
                        </span>
                    </h1>
                    <Button variant="outline" onClick={() => navigate("/dashboard")}>
                        Back to Dashboard
                    </Button>
                </div>

                <p className="text-xl text-muted-foreground">
                    Say hello to our newest members, ordered by their join date (oldest first).
                </p>

                {/* Alumni Grid (Uses Mapped Data) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {alumniList.length > 0 ? (
                        alumniList.map((alumni) => (
                            <Card 
                                key={alumni.id} 
                                className="glass-card transition-all duration-300 hover:shadow-lg hover:border-primary cursor-pointer"
                                onClick={() => {
                                    setSelectedAlumni(alumni);
                                    setIsProfileOpen(true);
                                }}
                            >
                                <CardContent className="p-6 space-y-4 text-center">
                                    <Avatar className="h-20 w-20 mx-auto border-2 border-primary/50">
                                        <AvatarImage src={alumni.avatar} /> 
                                        <AvatarFallback className="text-xl">{alumni.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl">{alumni.name}</CardTitle> 
                                        <CardDescription className="text-sm">
                                            {alumni.title} at <span className="font-medium">{alumni.company}</span>
                                        </CardDescription>
                                    </div>
                                    
                                    <div className="flex justify-center flex-wrap gap-2 pt-2">
                                        <Badge variant="secondary" className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{alumni.batch}</Badge>
                                        <Badge variant="outline" className="flex items-center gap-1"><MapPin className="h-3 w-3" />{alumni.location}</Badge>
                                    </div>

                                    <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500 fill-current" />{alumni.rating}</div>
                                    </div>
                                    <Button variant="outline" size="sm" className='mt-2'>Connect</Button>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground col-span-full py-10">No recent alumni found at this time.</p>
                    )}
                </div>

            </div>

            {/* Reused Alumni Dialog Component (Profile View - ALL DATA USED) */}
            {selectedAlumni && (
                <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                    <DialogContent className="sm:max-w-2xl w-full">
                        <DialogHeader>
                            <div className="flex items-start space-x-4">
                                <Avatar className="h-24 w-24 border-2 border-primary">
                                    <AvatarImage src={selectedAlumni.avatar} /> 
                                    <AvatarFallback className="text-3xl">
                                        {selectedAlumni.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <DialogTitle className="text-2xl font-bold">{selectedAlumni.name}</DialogTitle>
                                    <DialogDescription className="text-md">
                                        {selectedAlumni.title} at <span className="font-semibold text-primary">{selectedAlumni.company}</span>
                                    </DialogDescription>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                                        <span className="flex items-center gap-1.5">
                                            <GraduationCap className="h-4 w-4" />
                                            Batch of {selectedAlumni.batch}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" />
                                            {selectedAlumni.location}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="py-4 space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Bio</h3>
                                <p className="text-muted-foreground">{selectedAlumni.bio}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2">Expertise</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedAlumni.expertise.map((skill) => (
                                        <Badge key={skill} variant="secondary">{skill}</Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <div><h4 className="font-semibold">Department</h4><p className="text-muted-foreground">{selectedAlumni.department}</p></div>
                                <div><h4 className="font-semibold">Rating</h4><div className="flex items-center gap-1"><Star className="h-5 w-5 text-yellow-500 fill-current" /><span className="font-medium text-muted-foreground">{selectedAlumni.rating}</span></div></div>
                                <div><h4 className="font-semibold">Mentees</h4><p className="text-muted-foreground">{selectedAlumni.mentees}</p></div>
                                <div><h4 className="font-semibold">Availability</h4><p className="text-muted-foreground">{selectedAlumni.availability}</p></div>
                                <div><h4 className="font-semibold">Response Time</h4><p className="text-muted-foreground">{selectedAlumni.responseTime}</p></div>
                                <div><h4 className="font-semibold">Languages</h4><p className="text-muted-foreground">{selectedAlumni.languages.join(', ')}</p></div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button className="bg-gradient-primary hover:opacity-90">Connect Now</Button>
                            <Button variant="outline" onClick={() => setIsProfileOpen(false)}>Close</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default RecentAlumniPage;