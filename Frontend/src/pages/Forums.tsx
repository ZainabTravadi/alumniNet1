import { useState, useEffect, useMemo, useCallback } from 'react'; // 💡 FIX: Added necessary hooks
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    MessageSquare,
    Plus,
    Search,
    Heart,
    Reply,
    Eye,
    Clock,
    Users,
    Pin,
    Flame,
    TrendingUp
} from 'lucide-react';

// ------------------ 💡 API DATA INTERFACES ------------------

interface ForumCategory {
    id: string;
    name: string;
    count: number; // Number of posts
    color: string; // Tailwind color class
}

interface ForumThread {
    id: number | string;
    title: string;
    author: string;
    authorAvatar: string;
    category: string; // categoryId
    replies: number;
    views: number;
    likes: number;
    lastActivity: string; // Raw date/time string from Python API
    isPinned: boolean;
    isHot: boolean;
    content: string;
}

// Placeholder for the full list (used for fallback if API fails)
const DUMMY_DISCUSSIONS: ForumThread[] = [
    { id: 1, title: 'Welcome New Alumni to Our Growing Network!', author: 'Sarah Chen', authorAvatar: '/placeholder-avatar.jpg', category: 'general', replies: 23, views: 156, likes: 45, lastActivity: '2 hours ago', isPinned: true, isHot: false, content: 'Hi everyone! Welcome to our official alumni forum...' },
    { id: 2, title: 'Software Engineering Opportunities at FAANG Companies', author: 'Michael Rodriguez', authorAvatar: '/placeholder-avatar.jpg', category: 'career', replies: 67, views: 342, likes: 89, lastActivity: '4 hours ago', isPinned: false, isHot: true, content: 'I wanted to share some insights about landing software engineering roles...' },
];

const DUMMY_CATEGORIES: ForumCategory[] = [
    { id: 'general', name: 'General Discussion', count: 145, color: 'bg-blue-500' },
    { id: 'career', name: 'Career & Jobs', count: 89, color: 'bg-green-500' },
    { id: 'batch2024', name: 'Class of 2024', count: 56, color: 'bg-purple-500' },
];


const Forums = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isNewPostOpen, setIsNewPostOpen] = useState(false);

    // 💡 STATE FOR LIVE DATA
    const [categories, setCategories] = useState<ForumCategory[]>(DUMMY_CATEGORIES);
    const [discussions, setDiscussions] = useState<ForumThread[]>(DUMMY_DISCUSSIONS);
    const [isLoading, setIsLoading] = useState(true);

    const API_CATEGORIES = import.meta.env.VITE_API_FORUM_CATEGORIES || 'http://localhost:5000/api/forum/categories';
    const API_THREADS = import.meta.env.VITE_API_FORUM_THREADS || 'http://localhost:5000/api/forum/threads';

    // ------------------ 💡 DATA FETCHING ------------------
    useEffect(() => {
        const fetchForumData = async () => {
            setIsLoading(true);
            try {
                const [categoriesRes, threadsRes] = await Promise.all([
                    fetch(API_CATEGORIES),
                    fetch(API_THREADS)
                ]);

                // Handle Categories
                if (categoriesRes.ok) {
                    const data = await categoriesRes.json();
                    if (data.data && data.data.length > 0) {
                        setCategories(data.data as ForumCategory[]);
                    }
                }

                // Handle Threads
                if (threadsRes.ok) {
                    const data = await threadsRes.json();
                    if (data.data && data.data.length > 0) {
                        // NOTE: Data from API is used if available, otherwise it remains DUMMY_DISCUSSIONS
                        setDiscussions(data.data as ForumThread[]);
                    }
                }

            } catch (error) {
                console.error("Network error fetching forum data:", error);
                // Keep dummy data initialized in state if network fails
            } finally {
                setIsLoading(false);
            }
        };

        fetchForumData();
    }, [API_CATEGORIES, API_THREADS]);


    // ------------------ UTILITIES ------------------

    const getCategoryName = useCallback((categoryId: string) => {
        return categories.find(cat => cat.id === categoryId)?.name || 'General';
    }, [categories]);

    const getCategoryColor = useCallback((categoryId: string) => {
        // This function now uses the dynamically fetched categories
        return categories.find(cat => cat.id === categoryId)?.color || 'bg-gray-500';
    }, [categories]);

    // 💡 Filtering Logic (using useMemo for performance)
    const filteredDiscussions = useMemo(() => {
        // 1. Filter by Search Term (Title or Content)
        const searched = discussions.filter(discussion => {
            const term = searchTerm.toLowerCase();
            return discussion.title.toLowerCase().includes(term) ||
                   discussion.content.toLowerCase().includes(term);
        });

        // 2. Filter by Active Tab (Categories)
        if (activeTab === 'all') {
            return searched;
        } 
        
        // In a real app, 'hot' and 'pinned' might be separate fields, 
        // but here we assume 'all' is the only dynamic filter for the moment
        // and rely on the initial API query order.
        return searched;

    }, [discussions, searchTerm, activeTab]);

    // Pre-calculate total posts for stats
    const totalPosts = useMemo(() => {
        return categories.reduce((sum, cat) => sum + cat.count, 0);
    }, [categories]);

    // This is static data, but it might eventually be fetched from the backend
    const trendingTopics = [
        { topic: 'Remote Work Tips', count: 45 },
        { topic: 'Career Transitions', count: 38 },
        { topic: 'Networking Events', count: 32 },
        { topic: 'Alumni Mentorship', count: 28 },
        { topic: 'Startup Funding', count: 25 }
    ];

    // ------------------ RENDER ------------------
    if (isLoading) {
        return <p className="text-center mt-20 text-lg text-primary">Loading forum data...</p>;
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div className="animate-fade-in">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            Alumni{' '}
                            <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
                                Forums
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground mt-2">
                            Connect through discussions, share experiences, and build lasting relationships
                        </p>
                    </div>
                    
                    <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                                <Plus className="h-4 w-4 mr-2" />
                                New Discussion
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Start a New Discussion</DialogTitle>
                                <DialogDescription>
                                    Share your thoughts, ask questions, or start a conversation with your fellow alumni.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input id="title" placeholder="What's your discussion about?" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content">Content</Label>
                                    <Textarea 
                                        id="content" 
                                        placeholder="Share your thoughts..." 
                                        className="min-h-[120px]"
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setIsNewPostOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={() => setIsNewPostOpen(false)}>
                                        Post Discussion
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search & Stats */}
                <div className="grid lg:grid-cols-4 gap-6 animate-slide-up">
                    <div className="lg:col-span-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search discussions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 lg:grid-cols-1">
                        <Card className="glass-card">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium">Total Posts</p>
                                        <p className="text-2xl font-bold">{totalPosts.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Categories */}
                        <Card className="glass-card animate-scale-in">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    Discussion Categories
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {categories.map((category) => (
                                        <div
                                            key={category.id}
                                            className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                                            onClick={() => setActiveTab(category.id)} // Set active tab to filter by category
                                        >
                                            <div className={`w-3 h-3 rounded-full ${category.color}`} />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm">{category.name}</h4>
                                                <p className="text-xs text-muted-foreground">{category.count} posts</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Discussions */}
                        <div className="space-y-4">
                            {filteredDiscussions.length > 0 ? (
                                filteredDiscussions.map((discussion) => (
                                    <Card key={discussion.id} className="glass-card hover-glow group cursor-pointer">
                                        <CardContent className="p-6">
                                            <div className="flex items-start space-x-4">
                                                <Avatar>
                                                    <AvatarImage src={discussion.authorAvatar} />
                                                    <AvatarFallback>
                                                        {discussion.author.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                {discussion.isPinned && (
                                                                    <Pin className="h-4 w-4 text-primary" />
                                                                )}
                                                                {discussion.isHot && (
                                                                    <Flame className="h-4 w-4 text-orange-500" />
                                                                )}
                                                                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                                                    {discussion.title}
                                                                </h3>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <span>by {discussion.author}</span>
                                                                <span>•</span>
                                                                <Badge 
                                                                    variant="outline" 
                                                                    className={`text-xs ${getCategoryColor(discussion.category)} text-white`}
                                                                >
                                                                    {getCategoryName(discussion.category)}
                                                                </Badge>
                                                                <span>•</span>
                                                                <Clock className="h-3 w-3" />
                                                                <span>{discussion.lastActivity}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <p className="text-muted-foreground text-sm line-clamp-2">
                                                        {discussion.content}
                                                    </p>
                                                    
                                                    <div className="flex items-center justify-between pt-2">
                                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Reply className="h-4 w-4" />
                                                                <span>{discussion.replies} replies</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Eye className="h-4 w-4" />
                                                                <span>{discussion.views} views</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Heart className="h-4 w-4" />
                                                                <span>{discussion.likes} likes</span>
                                                            </div>
                                                        </div>
                                                        <Button variant="outline" size="sm">
                                                            Join Discussion
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground pt-4">No discussions found matching your criteria.</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Trending Topics */}
                        <Card className="glass-card animate-scale-in">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    Trending Topics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {trendingTopics.map((topic, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 cursor-pointer">
                                        <span className="text-sm font-medium">#{topic.topic}</span>
                                        <Badge variant="secondary" className="text-xs">
                                            {topic.count}
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="text-lg">Forum Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Active Members</span>
                                        <span className="font-medium">2,847</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Total Discussions</span>
                                        <span className="font-medium">{totalPosts.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">This Week</span>
                                        <span className="font-medium">89 new posts</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Forums;