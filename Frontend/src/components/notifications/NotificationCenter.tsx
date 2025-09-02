import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell,
  MessageSquare,
  Calendar,
  Users,
  DollarSign,
  BookOpen,
  Check,
  X,
  MoreVertical,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NotificationCenter = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'mentorship',
      title: 'New Mentorship Request',
      message: 'Sarah Chen has requested mentorship for "Career transition to tech"',
      avatar: '/placeholder-avatar.jpg',
      time: '2 hours ago',
      isRead: false,
      actionable: true,
      category: 'mentorship'
    },
    {
      id: 2,
      type: 'event',
      title: 'Event Reminder',
      message: 'Annual Alumni Meetup 2024 is tomorrow at 6:00 PM',
      avatar: null,
      time: '4 hours ago',
      isRead: false,
      actionable: false,
      category: 'events'
    },
    {
      id: 3,
      type: 'forum',
      title: 'Forum Reply',
      message: 'Michael Rodriguez replied to your post in "Career Opportunities"',
      avatar: '/placeholder-avatar.jpg',
      time: '6 hours ago',
      isRead: true,
      actionable: false,
      category: 'forums'
    },
    {
      id: 4,
      type: 'donation',
      title: 'Donation Received',
      message: 'Thank you for your $250 donation to the Student Emergency Fund',
      avatar: null,
      time: '1 day ago',
      isRead: true,
      actionable: false,
      category: 'donations'
    },
    {
      id: 5,
      type: 'connection',
      title: 'New Alumni Connection',
      message: 'Emma Thompson wants to connect with you',
      avatar: '/placeholder-avatar.jpg',
      time: '2 days ago',
      isRead: false,
      actionable: true,
      category: 'connections'
    },
    {
      id: 6,
      type: 'announcement',
      title: 'New Alumni Newsletter',
      message: 'The March 2024 alumni newsletter is now available',
      avatar: null,
      time: '3 days ago',
      isRead: true,
      actionable: false,
      category: 'announcements'
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mentorship':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'forum':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'donation':
        return <DollarSign className="h-4 w-4 text-orange-500" />;
      case 'connection':
        return <Users className="h-4 w-4 text-pink-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    return notification.category === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center animate-fade-in">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
                Notifications
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Stay updated with your alumni network activity
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {unreadCount} unread
            </Badge>
            <Button 
              variant="outline" 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Mentorship</p>
                  <p className="text-2xl font-bold">
                    {notifications.filter(n => n.type === 'mentorship').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Events</p>
                  <p className="text-2xl font-bold">
                    {notifications.filter(n => n.type === 'event').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Forums</p>
                  <p className="text-2xl font-bold">
                    {notifications.filter(n => n.type === 'forum').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-scale-in">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="forums">Forums</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notifications</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'unread' 
                      ? "You're all caught up! No unread notifications."
                      : `No notifications in the ${activeTab} category.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`glass-card hover-glow cursor-pointer transition-all ${
                      !notification.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''
                    }`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        {notification.avatar ? (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={notification.avatar} />
                            <AvatarFallback>
                              {notification.title.split(' ')[0][0]}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <div className="flex items-center gap-2">
                              {!notification.isRead && (
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!notification.isRead && (
                                    <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                      <Check className="h-4 w-4 mr-2" />
                                      Mark as read
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={() => deleteNotification(notification.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-muted-foreground">
                              {notification.time}
                            </span>
                            
                            {notification.actionable && (
                              <div className="flex gap-2">
                                {notification.type === 'mentorship' && (
                                  <>
                                    <Button size="sm" variant="outline">
                                      <X className="h-3 w-3 mr-1" />
                                      Decline
                                    </Button>
                                    <Button size="sm">
                                      <Check className="h-3 w-3 mr-1" />
                                      Accept
                                    </Button>
                                  </>
                                )}
                                {notification.type === 'connection' && (
                                  <>
                                    <Button size="sm" variant="outline">
                                      Ignore
                                    </Button>
                                    <Button size="sm">
                                      Connect
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationCenter;