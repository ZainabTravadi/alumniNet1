import { useState } from 'react';
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

const Forums = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);

  const categories = [
    { id: 'general', name: 'General Discussion', count: 145, color: 'bg-blue-500' },
    { id: 'career', name: 'Career & Jobs', count: 89, color: 'bg-green-500' },
    { id: 'batch2024', name: 'Class of 2024', count: 56, color: 'bg-purple-500' },
    { id: 'batch2023', name: 'Class of 2023', count: 78, color: 'bg-orange-500' },
    { id: 'batch2022', name: 'Class of 2022', count: 92, color: 'bg-pink-500' },
    { id: 'tech', name: 'Technology', count: 134, color: 'bg-indigo-500' },
    { id: 'entrepreneurship', name: 'Entrepreneurship', count: 67, color: 'bg-red-500' },
    { id: 'location-sf', name: 'San Francisco Alumni', count: 45, color: 'bg-teal-500' },
    { id: 'location-ny', name: 'New York Alumni', count: 38, color: 'bg-yellow-500' }
  ];

  const discussions = [
    {
      id: 1,
      title: 'Welcome New Alumni to Our Growing Network!',
      author: 'Sarah Chen',
      authorAvatar: '/placeholder-avatar.jpg',
      category: 'general',
      replies: 23,
      views: 156,
      likes: 45,
      lastActivity: '2 hours ago',
      isPinned: true,
      isHot: false,
      content: 'Hi everyone! Welcome to our official alumni forum. This is a great space to connect, share opportunities, and support each other in our careers...'
    },
    {
      id: 2,
      title: 'Software Engineering Opportunities at FAANG Companies',
      author: 'Michael Rodriguez',
      authorAvatar: '/placeholder-avatar.jpg',
      category: 'career',
      replies: 67,
      views: 342,
      likes: 89,
      lastActivity: '4 hours ago',
      isPinned: false,
      isHot: true,
      content: 'I wanted to share some insights about landing software engineering roles at top tech companies. Here are some tips that helped me...'
    },
    {
      id: 3,
      title: 'Class of 2024 Reunion Planning Committee',
      author: 'Emma Thompson',
      authorAvatar: '/placeholder-avatar.jpg',
      category: 'batch2024',
      replies: 34,
      views: 198,
      likes: 56,
      lastActivity: '6 hours ago',
      isPinned: false,
      isHot: false,
      content: 'Hey Class of 2024! We\'re starting to plan our first reunion. Would love to get everyone\'s input on dates, location, and activities...'
    },
    {
      id: 4,
      title: 'Starting a Tech Startup - Lessons Learned',
      author: 'David Kim',
      authorAvatar: '/placeholder-avatar.jpg',
      category: 'entrepreneurship',
      replies: 45,
      views: 289,
      likes: 78,
      lastActivity: '8 hours ago',
      isPinned: false,
      isHot: true,
      content: 'After 2 years of building my startup, I wanted to share some hard-learned lessons with fellow entrepreneurs in our community...'
    },
    {
      id: 5,
      title: 'San Francisco Alumni Monthly Meetup - March 2024',
      author: 'Lisa Patel',
      authorAvatar: '/placeholder-avatar.jpg',
      category: 'location-sf',
      replies: 28,
      views: 167,
      likes: 42,
      lastActivity: '12 hours ago',
      isPinned: false,
      isHot: false,
      content: 'Our next SF meetup is scheduled for March 15th at 7 PM. We\'ll be at the usual spot downtown. Looking forward to seeing everyone...'
    }
  ];

  const trendingTopics = [
    { topic: 'Remote Work Tips', count: 45 },
    { topic: 'Career Transitions', count: 38 },
    { topic: 'Networking Events', count: 32 },
    { topic: 'Alumni Mentorship', count: 28 },
    { topic: 'Startup Funding', count: 25 }
  ];

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'General';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.color || 'bg-gray-500';
  };

  const filteredDiscussions = discussions.filter(discussion =>
    discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="grid grid-cols-3 gap-4 lg:grid-cols-1">
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Total Posts</p>
                    <p className="text-2xl font-bold">1,234</p>
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
              {filteredDiscussions.map((discussion) => (
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
              ))}
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
                    <span className="font-medium">1,234</span>
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