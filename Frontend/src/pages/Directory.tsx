import { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom'; 
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Search, 
    MapPin,
    Building2,
    GraduationCap,
    Linkedin as LinkedinIcon, // Corrected Deprecation
    Mail
} from 'lucide-react';

// ------------------ 💡 Interface (Matching Firestore/Python structure) ------------------
interface Alumnus {
    id: string | number;
    name: string; 
    batch: string;
    department: string;
    company: string;
    position: string; 
    location: string;
    avatar: string; 
    skills: string[]; 
    linkedin: string; 
}

// ------------------ 💡 Fallback Dummy Data ------------------
const DUMMY_ALUMNI: Alumnus[] = [
    { id: 1, name: 'Sarah Chen', batch: '2019', department: 'Computer Science', company: 'Google', position: 'Senior Software Engineer', location: 'San Francisco, CA', avatar: '/placeholder-avatar.jpg', skills: ['React', 'Python', 'Machine Learning'], linkedin: 'https://linkedin.com/in/sarahchen' },
    { id: 2, name: 'Michael Rodriguez', batch: '2020', department: 'Mechanical Engineering', company: 'Tesla', position: 'Product Design Engineer', location: 'Austin, TX', avatar: '/placeholder-avatar.jpg', skills: ['CAD', 'Manufacturing', 'Sustainability'], linkedin: 'https://linkedin.com/in/michaelrodriguez' },
    { id: 3, name: 'Emma Thompson', batch: '2018', department: 'Business Administration', company: 'Microsoft', position: 'Product Manager', location: 'Seattle, WA', avatar: '/placeholder-avatar.jpg', skills: ['Strategy', 'Leadership', 'Analytics'], linkedin: 'https://linkedin.com/in/emmathompson' }
];


const Directory = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('All Batches');
    const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
    
    // Tracks if the user has performed any filtering or search action.
    const [hasSearched, setHasSearched] = useState(false); 
    
    const [alumniData, setAlumniData] = useState<Alumnus[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_DIRECTORY || 'http://localhost:5000/api/directory/alumni';

    // ------------------ 💡 Data Fetching (Full Directory) ------------------
    useEffect(() => {
        const fetchAlumni = async () => {
            try {
                // Ensure the fetch URL is correct based on your Python route fix
                const response = await fetch(API_BASE_URL); 
                const result = await response.json();

                if (response.ok && result.data) {
                    setAlumniData(result.data as Alumnus[]);
                } else {
                    console.error("Failed to fetch live directory data. Using dummy data.");
                    setAlumniData(DUMMY_ALUMNI);
                }
            } catch (error) {
                console.error("API connection failed. Using dummy data.", error);
                setAlumniData(DUMMY_ALUMNI);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAlumni();
    }, [API_BASE_URL]);


    // Extract unique filter options
    const departments = useMemo(() => {
        const list = ['All Departments', ...new Set(alumniData.map(a => a.department).filter(Boolean))];
        return [...new Set(list)];
    }, [alumniData]);

    const batches = useMemo(() => {
        const list = ['All Batches', ...new Set(alumniData.map(a => a.batch).filter(Boolean))];
        return [...new Set(list)];
    }, [alumniData]);


    // 💡 Filtering Logic (FINAL FIX: Null-Safe Checks)
    const filteredAlumni = useMemo(() => {
        return alumniData.filter(alumnus => {
            const term = searchTerm.toLowerCase();
            
            // ✅ CRITICAL FIX: Use (property || '') to safely handle null/undefined strings
            // This prevents the search from crashing when checking a missing field.
            const matchesSearch = 
                (alumnus.name || '').toLowerCase().includes(term) ||
                (alumnus.company || '').toLowerCase().includes(term) ||
                (alumnus.position || '').toLowerCase().includes(term) ||
                // Ensure skills is an array, then check each item safely
                (alumnus.skills || []).some(skill => (skill || '').toLowerCase().includes(term));
                
            const matchesBatch = selectedBatch === 'All Batches' || alumnus.batch === selectedBatch;
            const matchesDepartment = selectedDepartment === 'All Departments' || alumnus.department === selectedDepartment;
            
            return matchesSearch && matchesBatch && matchesDepartment;
        });
    }, [alumniData, searchTerm, selectedBatch, selectedDepartment]);


    // 💡 Logic to activate search when filters change
    const triggerSearch = useCallback((batch: string, department: string, search: string) => {
        const isDefault = 
            search === '' && 
            batch === 'All Batches' && 
            department === 'All Departments';
        
        setHasSearched(!isDefault);
    }, []);

    // 💡 Handle search input
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        triggerSearch(selectedBatch, selectedDepartment, newSearchTerm);
    };

    // 💡 Handle dropdown changes
    const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
        setter(value);
        const newBatch = setter === setSelectedBatch ? value : selectedBatch;
        const newDepartment = setter === setSelectedDepartment ? value : selectedDepartment;
        
        triggerSearch(newBatch, newDepartment, searchTerm);
    };


    // ------------------ RENDER LOGIC ------------------

    const showRecommendations = !hasSearched && alumniData.length > 0;
    const cardsToShow = hasSearched ? filteredAlumni : alumniData.slice(0, 6);


    if (isLoading) {
        return <p className="text-center mt-20 text-lg text-primary">Loading alumni directory...</p>;
    }


    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header (No change) */}
                <div className="text-center space-y-4 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold">
                        Alumni{' '}
                        <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
                            Directory
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Connect with fellow alumni from your university. Find mentors, collaborators, and lifelong friends.
                    </p>
                </div>

                {/* Search & Filters */}
                <Card className="glass-card animate-slide-up">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-primary" />
                            Search Alumni
                        </CardTitle>
                        <CardDescription>
                            Use filters to find alumni by batch, department, or search by name/company
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, company, position, or skills..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            {/* Batch Filter */}
                            <Select value={selectedBatch} onValueChange={(value) => handleFilterChange(setSelectedBatch, value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Batch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {batches.map((batch) => (
                                        <SelectItem key={batch} value={batch}>
                                            {batch}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {/* Department Filter */}
                            <Select value={selectedDepartment} onValueChange={(value) => handleFilterChange(setSelectedDepartment, value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">
                            {showRecommendations 
                                ? "Recommended Alumni" 
                                : `Found ${filteredAlumni.length} Alumni`
                            } 
                        </h2>
                        <Badge variant="secondary" className="text-sm">
                            {alumniData.length} Total Members
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-scale-in">
                        {cardsToShow.length > 0 ? (
                            cardsToShow.map((alumnus) => (
                                <Card key={alumnus.id} className="glass-card hover-glow group">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start space-x-4">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={alumnus.avatar} />
                                                <AvatarFallback className="text-lg">
                                                    {alumnus.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <CardTitle className="text-lg">{alumnus.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-1">
                                                    <GraduationCap className="h-3 w-3" />
                                                    {alumnus.department} • {alumnus.batch}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{alumnus.company}</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {alumnus.position}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4" />
                                                {alumnus.location}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">Skills</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {(alumnus.skills || []).map((skill) => ( 
                                                    <Badge key={skill} variant="outline" className="text-xs">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Button size="sm" className="flex-1" onClick={() => navigate(`/chat/${alumnus.id}`)}>
                                                <Mail className="h-3 w-3 mr-2" />
                                                Message
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => alumnus.linkedin && window.open(alumnus.linkedin, '_blank')}
                                                disabled={!alumnus.linkedin || alumnus.linkedin === '#'}
                                            >
                                                <LinkedinIcon className="h-3 w-3 mr-2" />
                                                LinkedIn
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <p className="md:col-span-3 text-center text-muted-foreground pt-4">No alumni found matching your criteria.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Directory;