import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from "firebase/auth";
// UI Imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Bell, MessageSquare, Calendar, Users, DollarSign, BookOpen, Check, X, 
    MoreVertical, Trash2, Clock 
} from 'lucide-react';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// Firestore Imports
import { 
    doc, 
    updateDoc, 
    arrayUnion, 
    arrayRemove, 
    deleteDoc, 
    Timestamp,
    collection, 
    getDocs,    
    query,      
    orderBy, 
    writeBatch 
} from "firebase/firestore"; 
import { auth , db} from "@/firebase"; 


// ------------------ 💡 INTERFACE DEFINITION ------------------
interface NotificationItem {
    id: string; // The Firestore Document ID of the notification
    type: 'mentorship' | 'event' | 'forum' | 'donation' | 'connection' | 'announcement';
    title: string;
    message: string;
    avatar: string | null;
    timestamp: string; 
    isRead: boolean;
    actionable: boolean;
    category: string;
    linkToId?: string; // Sender's UID (used for connection/mentorship)
    senderName?: string;
}

// ------------------ 💡 FALLBACK DUMMY DATA ------------------
const DUMMY_NOTIFICATIONS: NotificationItem[] = [
    { 
        id: '0K0Dk32T3KEfwTfeh7K', 
        type: 'mentorship', 
        title: 'Mentorship Request from Sarah', 
        message: 'Sarah Chen has requested mentorship with you.', 
        avatar: '/placeholder-avatar.jpg', 
        timestamp: '3 October 2025 at 00:00:00 UTC+5:30', 
        isRead: false, 
        actionable: true, 
        category: 'mentorship', 
        linkToId: 'sender_UID_for_Sarah_123',
        senderName: 'Sarah Chen'
    },
    // Event Registration Notification
    { id: 'notif_event_reg', type: 'event', title: 'New Event Registration', message: 'User John Doe just registered for the Annual Alumni Meetup 2024.', avatar: null, timestamp: '1 minute ago', isRead: false, actionable: true, category: 'events', linkToId: 'registrant_user_id', senderName: 'John Doe' },
    
    // Event Reminder (Non-actionable, should show up under 'events' tab)
    { id: 'notif_def456', type: 'event', title: 'Event Reminder', message: 'Annual Alumni Meetup 2024 is tomorrow!', avatar: null, timestamp: '4 hours ago', isRead: false, actionable: false, category: 'events' },
    
    { id: 'notif_ghi789', type: 'connection', title: 'Connection Request from David', message: 'David Lee wants to connect with you.', avatar: '/placeholder-avatar.jpg', timestamp: '1 hour ago', isRead: false, actionable: true, category: 'connections', linkToId: 'sender_UID_for_David_456', senderName: 'David Lee' },
];


const NotificationCenter = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [notifications, setNotifications] = useState<NotificationItem[]>([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // ------------------ 💡 AUTH CHECK ------------------
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (!user) setIsLoading(false);
        });
        return () => unsubscribe(); 
    }, []);

    // ------------------ 💡 DATA FETCHING (LIVE FROM FIRESTORE) ------------------
    const fetchNotifications = async (userId: string) => {
         setIsLoading(true);

         try {
            const notifRef = collection(db, "users", userId, "notifications");
            const q = query(notifRef, orderBy('timestamp', 'desc'));

            const snapshot = await getDocs(q);
            
            const liveNotifications: NotificationItem[] = snapshot.docs.map(doc => {
                const data = doc.data();
                
                const timestampString = data.timestamp instanceof Timestamp 
                                        ? data.timestamp.toDate().toLocaleString() 
                                        : data.timestamp || 'Just now'; 

                return {
                    id: doc.id, 
                    type: data.type || 'announcement',
                    title: data.title || 'Notification',
                    message: data.message || 'New activity.',
                    avatar: data.avatar || null,
                    timestamp: timestampString,
                    isRead: data.isRead || false,
                    actionable: data.actionable || false,
                    category: data.category || 'announcement',
                    linkToId: data.linkToId || undefined,
                    senderName: data.senderName || undefined
                } as NotificationItem;
            });
            
            if (liveNotifications.length > 0) {
                setNotifications(liveNotifications);
            } else {
                setNotifications([]);
            }
         } catch (error) {
            console.error("❌ Firestore read error (notifications):", error);
            setNotifications(DUMMY_NOTIFICATIONS); 
         } finally {
             setIsLoading(false);
         }
    };
    
    // 💡 Trigger fetch when user status changes
    useEffect(() => {
        if (currentUser) {
            fetchNotifications(currentUser.uid);
        } else if (currentUser === null) {
            setNotifications([]); 
            setIsLoading(false);
        }
    }, [currentUser]); 

    // ------------------ 💡 ACTION HANDLER (Accept/Decline - Firestore Write Logic) ------------------
    const handleAction = async (
        notification: NotificationItem, 
        action: 'accept' | 'decline'
    ) => {
        if (!currentUser) return alert("Authentication required to perform this action.");
        
        const senderId = notification.linkToId; 
        if (!senderId && (notification.type === 'connection' || notification.type === 'mentorship')) {
            return alert("Action failed. Sender ID is missing."); 
        }

        const recipientUid = currentUser.uid;

        // 1. References
        const notificationRef = doc(db, "users", recipientUid, "notifications", notification.id);
        const recipientRef = doc(db, "users", recipientUid);
        const senderRef = doc(db, "users", senderId || 'dummy'); 

        try {
            if (action === 'accept') {
                if (notification.type === 'connection' || notification.type === 'mentorship') {
                    // --- WRITE 1: ESTABLISH TWO-WAY CONNECTION ---
                    await updateDoc(recipientRef, { isConnectedTo: arrayUnion(senderId) });
                    await updateDoc(senderRef, { isConnectedTo: arrayUnion(recipientUid) });
                    
                    alert(`Successfully connected with ${notification.senderName || 'the sender'}!`);
                }
                
                if (notification.type === 'event') {
                    // --- EVENT ACKNOWLEDGEMENT ---
                    alert(`Acknowledged event registration for ${notification.senderName || 'a user'}.`);
                }
            }
            
            // --- WRITE 2: CLEANUP SENDER'S PENDING LIST (if applicable) ---
            if (notification.type === 'connection' || notification.type === 'mentorship') {
                 const pendingArrayField = notification.type === 'mentorship' 
                                          ? 'pendingMentorshipRequests' 
                                          : 'pendingSentRequests';
                 
                 await updateDoc(senderRef, {
                     [pendingArrayField]: arrayRemove(recipientUid) 
                 });
            }

            // --- WRITE 3: DELETE NOTIFICATION ---
            await deleteDoc(notificationRef);
            
            if (action === 'decline' && (notification.type === 'connection' || notification.type === 'mentorship')) {
                 const pendingArrayField = notification.type === 'mentorship' 
                                           ? 'pendingMentorshipRequests' 
                                           : 'pendingSentRequests';
                 
                 await updateDoc(senderRef, {
                     [pendingArrayField]: arrayRemove(recipientUid) 
                 });

                 alert(`Successfully ignored the request.`);
            }

            // Re-run fetch after action to synchronize UI
            await fetchNotifications(currentUser.uid);

        } catch (err) {
            console.error(`❌ Firestore write failed during ${action} action:`, err);
            alert("Failed to process action. Ensure all user documents exist in the /users collection and check your security rules.");
        }
    };

    // ------------------ 💡 SIMPLE WRITE UTILITIES ------------------

    const markAsRead = async (id: string) => {
        if (!currentUser) return;
        
        try {
            const notificationRef = doc(db, "users", currentUser.uid, "notifications", id);
            await updateDoc(notificationRef, { isRead: true });
            
            await fetchNotifications(currentUser.uid);

        } catch (e) {
            console.error("Failed to mark as read in Firestore:", e);
        }
    };

    const deleteNotification = async (id: string) => {
        if (!currentUser) return;

        try {
            const notificationRef = doc(db, "users", currentUser.uid, "notifications", id);
            await deleteDoc(notificationRef);

            await fetchNotifications(currentUser.uid);
            
        } catch (e) {
            console.error("Failed to delete notification from Firestore:", e);
        }
    };
    
    // ------------------ UTILITIES ------------------
    
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'mentorship': return <BookOpen className="h-4 w-4 text-blue-500" />;
            case 'event': return <Calendar className="h-4 w-4 text-green-500" />;
            case 'forum': return <MessageSquare className="h-4 w-4 text-purple-500" />;
            case 'donation': return <DollarSign className="h-4 w-4 text-orange-500" />;
            case 'connection': return <Users className="h-4 w-4 text-pink-500" />;
            default: return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    const markAllAsRead = async () => {
        if (!currentUser) return;
        
        if (notifications.length > 0) {
            const batch = writeBatch(db); 
            
            notifications.forEach(notif => {
                if (!notif.isRead) {
                    const ref = doc(db, "users", currentUser.uid, "notifications", notif.id);
                    batch.update(ref, { isRead: true });
                }
            });
            await batch.commit();
        }
        
        await fetchNotifications(currentUser.uid); 
    };


    const filteredNotifications = notifications.filter(notification => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unread') return !notification.isRead;
        
        // This relies on the notification.category matching the tab value exactly (e.g., 'events')
        return notification.category === activeTab; 
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;


    // ------------------ RENDER ------------------


    if (!currentUser) {
        return <p className="text-center mt-20 text-lg text-red-500">Please sign in to view notifications.</p>;
    }


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

                {/* Stats Cards (Condensed for brevity) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
    {/* Total Notifications Card */}
    <Card className="glass-card">
        <CardContent className="p-4">
            <div className="flex justify-between items-start"> {/* <-- FIX: Added flex container */}
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{notifications.length}</p>
                </div>
                <Bell className="h-5 w-5 text-primary" /> {/* <-- Icon now aligned right */}
            </div>
        </CardContent>
    </Card>

    {/* Mentorship Card */}
    <Card className="glass-card">
        <CardContent className="p-4">
            <div className="flex justify-between items-start"> {/* <-- FIX: Added flex container */}
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Mentorship</p>
                    <p className="text-2xl font-bold">{notifications.filter(n => n.category === 'mentorship').length}</p>
                </div>
                <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
        </CardContent>
    </Card>

    {/* Events Card */}
    <Card className="glass-card">
        <CardContent className="p-4">
            <div className="flex justify-between items-start"> {/* <-- FIX: Added flex container */}
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Events</p>
                    <p className="text-2xl font-bold">{notifications.filter(n => n.category === 'events').length}</p>
                </div>
                <Calendar className="h-5 w-5 text-green-500" />
            </div>
        </CardContent>
    </Card>

    {/* Forums Card */}
    <Card className="glass-card">
        <CardContent className="p-4">
            <div className="flex justify-between items-start"> {/* <-- FIX: Added flex container */}
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Forums</p>
                    <p className="text-2xl font-bold">{notifications.filter(n => n.category === 'forums').length}</p>
                </div>
                <MessageSquare className="h-5 w-5 text-purple-500" />
            </div>
        </CardContent>
    </Card>
</div>

                {/* Notifications */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-scale-in">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
                        <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
                        <TabsTrigger value="events">Events</TabsTrigger>
                        <TabsTrigger value="forums">Forums</TabsTrigger>
                        <TabsTrigger value="connections">Connections</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="space-y-4">
                        {filteredNotifications.length === 0 ? (
                            <Card className="glass-card"><CardContent className="p-8 text-center"><Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-medium mb-2">No notifications</h3><p className="text-muted-foreground">{activeTab === 'unread' ? "You're all caught up! No unread notifications." : `No notifications in the ${activeTab} category.`}</p></CardContent></Card>
                        ) : (
                            <div className="space-y-3">
                                {filteredNotifications.map((notification) => (
                                    <Card 
                                        key={notification.id} 
                                        className={`glass-card hover-glow cursor-pointer transition-all ${!notification.isRead ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
                                        onClick={() => !notification.isRead && markAsRead(notification.id)} 
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start space-x-4">
                                                {/* Avatar/Icon rendering */}
                                                {notification.avatar ? (
                                                    <Avatar className="h-10 w-10"><AvatarImage src={notification.avatar} /><AvatarFallback>{notification.senderName ? notification.senderName.split(' ')[0][0] : 'U'}</AvatarFallback></Avatar>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                )}

                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-start justify-between">
                                                        <h4 className="font-medium text-sm">{notification.title}</h4>
                                                        <div className="flex items-center gap-2">
                                                            {!notification.isRead && (<div className="w-2 h-2 rounded-full bg-primary" />)}
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><MoreVertical className="h-4 w-4" /></Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    {!notification.isRead && (<DropdownMenuItem onClick={(e) => {e.stopPropagation(); markAsRead(notification.id);}}><Check className="h-4 w-4 mr-2" />Mark as read</DropdownMenuItem>)}
                                                                    <DropdownMenuItem onClick={(e) => {e.stopPropagation(); deleteNotification(notification.id);}} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                    
                                                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                                                    
                                                    <div className="flex items-center justify-between pt-2">
                                                        <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                                                        
                                                        {notification.actionable && (
                                                            <div className="flex gap-2">
                                                                {/* Mentorship Action Buttons */}
                                                                {notification.type === 'mentorship' && (
                                                                    <>
                                                                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleAction(notification, 'decline'); }}><X className="h-3 w-3 mr-1" />Decline</Button>
                                                                        <Button size="sm" onClick={(e) => { e.stopPropagation(); handleAction(notification, 'accept'); }}><Check className="h-3 w-3 mr-1" />Accept</Button>
                                                                    </>
                                                                )}
                                                                {/* Connection Action Buttons */}
                                                                {notification.type === 'connection' && (
                                                                    <>
                                                                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleAction(notification, 'decline'); }}>Ignore</Button>
                                                                        <Button size="sm" onClick={(e) => { e.stopPropagation(); handleAction(notification, 'accept'); }}>Connect</Button>
                                                                    </>
                                                                )}
                                                                {/* Event Registration Action Buttons (Acknowledge/Clear) */}
                                                                {notification.type === 'event' && (
                                                                    <>
                                                                        <Button size="sm" onClick={(e) => { e.stopPropagation(); handleAction(notification, 'accept'); }}>Acknowledge</Button>
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