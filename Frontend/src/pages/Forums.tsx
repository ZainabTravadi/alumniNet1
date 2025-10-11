import { useState, useEffect, useMemo, useCallback } from 'react';
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
    MessageSquare, Plus, Search, Heart, Reply, Eye, Clock, Users, Pin, Flame, TrendingUp, Loader2
} from 'lucide-react';

// ------------------ 💡 FIREBASE INTEGRATION ------------------
import { db, auth } from '@/firebase'; 
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore'; 

const FORUM_THREADS_COLLECTION = 'forum_threads';
const FORUM_CATEGORIES_COLLECTION = 'forum_categories';
const USERS_COLLECTION = 'users';

// ------------------ 💡 DATA INTERFACES ------------------

interface ForumCategory {
    // We use the 'name' field for lookup since it holds the unique value
    id: string; 
    name: string; // The filterable/displayable name (e.g., 'Career & Jobs')
    count: number;
    color: string; 
}

interface ForumThread {
    id: number | string;
    title: string;
    author: string; // Mapped from authorName
    authorAvatar: string;
    // ⭐️ This is the exact value from the Firestore 'categoryId' field ⭐️
    category: string; 
    replies: number; // Mapped from repliesCount
    views: number; // Mapped from viewsCount
    likes: number; // Mapped from likesCount
    lastActivity: string; // Time difference string for display
    isPinned: boolean;
    isHot: boolean;
    content: string;
    lastActivityTimestamp: Date; // Converted from Firestore Timestamp
}

interface ForumStats {
    activeMembers: number;
    thisWeekPosts: number;
}


const Forums = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    // New Post States (Placeholder/Future Implementation)
    const [isNewPostOpen, setIsNewPostOpen] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostCategory, setNewPostCategory] = useState('');
    
    // 💡 STATE FOR LIVE DATA
    const [categories, setCategories] = useState<ForumCategory[]>([]);
    const [discussions, setDiscussions] = useState<ForumThread[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [forumStats, setForumStats] = useState<ForumStats>({ activeMembers: 0, thisWeekPosts: 0 });
    const [trendingTopics, setTrendingTopics] = useState<{ topic: string, count: number }[]>([]);


    // ------------------ UTILITIES ------------------

    const formatTimeAgo = (date: Date): string => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return `${seconds} seconds ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minutes ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        return `${days} days ago`;
    };

    const getCategoryName = useCallback((categoryName: string) => {
        // Since categoryName is the display value, we just return it.
        return categoryName;
    }, []);

    // ⭐️ FIX: Category Color Utility matches thread's category value against category.name ⭐️
    const getCategoryColor = useCallback((categoryDisplayValue: string) => {
        // Find the color based on the exact category name/ID stored in the thread
        const category = categories.find(cat => cat.name === categoryDisplayValue);
        
        return category?.color || 'bg-gray-500';
    }, [categories]);

    const totalPosts = useMemo(() => {
        return discussions.length;
    }, [discussions]);
    
    const calculateTrendingTopics = (threads: ForumThread[]) => {
        const keywordCounts: { [key: string]: number } = {};
        const commonWords = new Set(['the', 'and', 'a', 'is', 'of', 'to', 'in', 'at', 'i', 'for', 'it', 'on', 'what', 'some', 'about', 'this', 'that', 'with']);
        
        threads.forEach(thread => {
            const text = `${thread.title} ${thread.content}`.toLowerCase();
            const words = text.match(/\b\w{4,}\b/g) || []; 

            words.forEach(word => {
                if (!commonWords.has(word)) {
                    keywordCounts[word] = (keywordCounts[word] || 0) + 1;
                }
            });
        });

        const sortedKeywords = Object.keys(keywordCounts)
            .map(key => ({ topic: key, count: keywordCounts[key] }))
            .sort((a, b) => b.count - a.count);

        return sortedKeywords.slice(0, 5);
    };


    // 💡 FILTERING LOGIC 
    const filteredDiscussions = useMemo(() => {
        let list = discussions;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(discussion => 
                discussion.title.toLowerCase().includes(term) ||
                discussion.content.toLowerCase().includes(term)
            );
        }

        if (activeTab !== 'all') {
             // ⭐️ Filtering must use the exact category name saved in Firestore ⭐️
             list = list.filter(discussion => discussion.category === activeTab);
        }
        
        list.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return b.lastActivityTimestamp.getTime() - a.lastActivityTimestamp.getTime();
        });

        return list;
    }, [discussions, searchTerm, activeTab]);

    // ------------------ 🚀 FIREBASE DATA FETCHING ------------------
    const fetchForumData = useCallback(async () => {
        setIsLoading(true);
        try {
            const threadsCollection = collection(db, FORUM_THREADS_COLLECTION);
            const categoriesCollection = collection(db, FORUM_CATEGORIES_COLLECTION);
            const usersCollection = collection(db, USERS_COLLECTION);

            const [threadsSnapshot, categoriesSnapshot, usersSnapshot] = await Promise.all([
                getDocs(query(threadsCollection, orderBy('lastActivity', 'desc'))),
                getDocs(categoriesCollection),
                getDocs(usersCollection)
            ]);

            // --- 1. PROCESS CATEGORIES ---
            const fetchedCategories: ForumCategory[] = categoriesSnapshot.docs.map(doc => {
                const data = doc.data() as any;
                return {
                    // Use the category name as the unique ID for filtering/display consistency
                    id: data.name || doc.id, 
                    name: data.name || doc.id, 
                    count: data.count || 0,
                    color: data.color || 'bg-gray-500',
                };
            });
            
            setCategories(fetchedCategories);

            // --- 2. PROCESS THREADS & STATS ---
            const fetchedThreads: ForumThread[] = [];
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            let thisWeekCount = 0;

            threadsSnapshot.docs.forEach(doc => {
                const data = doc.data() as any;
                const lastActivityDate = data.lastActivity ? data.lastActivity.toDate() : new Date();

                if (lastActivityDate > oneWeekAgo) {
                    thisWeekCount++;
                }
                
                // ⭐️ CRITICAL FIX: Use the 'categoryId' field (which holds the display name) ⭐️
                const threadCategory = data.categoryId || 'General'; 
                
                fetchedThreads.push({
                    id: doc.id,
                    title: data.title || 'Untitled',
                    author: data.authorName || 'Anonymous',
                    authorAvatar: data.authorAvatar || '/placeholder-avatar.jpg',
                    category: threadCategory, 
                    replies: data.repliesCount || 0,
                    views: data.viewsCount || 0,
                    likes: data.likesCount || 0,
                    isPinned: data.isPinned || false,
                    isHot: data.isHot || false,
                    content: data.content || '',
                    lastActivityTimestamp: lastActivityDate,
                    lastActivity: formatTimeAgo(lastActivityDate),
                } as ForumThread);
            });
            
            setDiscussions(fetchedThreads);
            setTrendingTopics(calculateTrendingTopics(fetchedThreads));

            // 3. Update Final Stats
            setForumStats({
                activeMembers: usersSnapshot.docs.length,
                thisWeekPosts: thisWeekCount,
            });


        } catch (error) {
            console.error("Firestore error fetching forum data:", error);
            setCategories([]);
            setDiscussions([]);
            setForumStats({ activeMembers: 0, thisWeekPosts: 0 });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchForumData();
    }, [fetchForumData]);

    // ------------------ POST HANDLER (Placeholder) ------------------
    const handleNewPostPlaceholder = () => {
        alert('New post functionality is pending user profile implementation.');
    };
    
    // ------------------ RENDER ------------------
    if (isLoading) {
        return (
            <div className="text-center mt-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-lg text-primary mt-2">Loading forum data...</p>
            </div>
        );
    }

    const finalTrendingTopics = trendingTopics.length > 0 ? trendingTopics : [
        { topic: 'Remote Work Tips', count: 45 }, { topic: 'Career Transitions', count: 38 },
        { topic: 'Networking Events', count: 32 }, { topic: 'Alumni Mentorship', count: 28 },
    ];


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
                    
                    {/* New Discussion Button (Placeholder Logic, Open Dialog) */}
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
                                    <Select onValueChange={setNewPostCategory} value={newPostCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                // Use the category name (e.g., 'Career & Jobs') as the value for the form submission
                                                <SelectItem key={category.id} value={category.name}> 
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input id="title" placeholder="What's your discussion about?" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content">Content</Label>
                                    <Textarea 
                                        id="content" 
                                        placeholder="Share your thoughts..." 
                                        className="min-h-[120px]"
                                        value={newPostContent} 
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setIsNewPostOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleNewPostPlaceholder}>
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
                    {/* Quick Stats (Total Discussions) */}
                    <div className="grid grid-cols-3 gap-4 lg:grid-cols-1">
                        <Card className="glass-card">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium">Total Discussions</p>
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
                                            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${activeTab === category.name ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted/30 hover:bg-muted/50'}`}
                                            onClick={() => setActiveTab(category.name === activeTab ? 'all' : category.name)} // Toggle filter by Name
                                        >
                                            <div className={`w-3 h-3 rounded-full ${category.color}`} />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-sm">{category.name}</h4>
                                                <p className="text-xs text-muted-foreground">{category.count} posts</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div
                                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${activeTab === 'all' ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted/30 hover:bg-muted/50'}`}
                                        onClick={() => setActiveTab('all')}
                                    >
                                        <div className={`w-3 h-3 rounded-full bg-gray-400`} />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-sm">View All</h4>
                                            <p className="text-xs text-muted-foreground">{totalPosts.toLocaleString()} total</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Discussions List */}
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
                                                                    {discussion.category}
                                                                </Badge>
                                                                <span>•</span>
                                                                <Clock className="h-3 w-3" />
                                                                <span>{discussion.lastActivity}</span>
                                                            </div>
                                                        </div>
                                                        <Button variant="outline" size="sm">
                                                            Join Discussion
                                                        </Button>
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
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground pt-4">No discussions found matching your criteria. Try adjusting your search term or category filter.</p>
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
                                {finalTrendingTopics.length > 0 ? (
                                    finalTrendingTopics.map((topic, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 cursor-pointer">
                                            <span className="text-sm font-medium">#{topic.topic}</span>
                                            <Badge variant="secondary" className="text-xs">
                                                {topic.count}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-muted-foreground">Analyze content after threads load...</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Forum Stats */}
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle className="text-lg">Forum Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Active Members</span>
                                        <span className="font-medium">{forumStats.activeMembers.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Total Discussions</span>
                                        <span className="font-medium">{totalPosts.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">This Week</span>
                                        <span className="font-medium">{forumStats.thisWeekPosts.toLocaleString()} new posts</span>
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