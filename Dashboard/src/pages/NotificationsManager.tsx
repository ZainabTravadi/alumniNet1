"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
// UI Imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Bell, UserPlus, DollarSign, MessageSquare, Check, X, Search, Clock, Shield, Loader2
} from 'lucide-react';

// Firestore Imports
import { db } from "@/firebase";
import {
    collection,
    getDocs,
    query,
    where,
    Timestamp,
    QueryDocumentSnapshot,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";

// --- TYPE DEFINITIONS ---
type NotificationType = 'User' | 'Mentorship' | 'Fundraising' | 'System' | 'Event';
type Priority = 'High' | 'Medium' | 'Low';
type NotificationStatus = 'Read' | 'Unread'; // Used only for local filtering

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    target: string;
    timestamp: string; // ISO date string
    priority: Priority;
    isRead: boolean; // 💡 New field for Firestore persistence
}

const NOTIFICATION_PERIOD_DAYS = 30;
const ADMIN_NOTIFS_COLLECTION = "adminNotifs"; // The new collection name

const NotificationsManager = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const primaryGradientStyle = {
        background: 'linear-gradient(90deg, #9333ea 0%, #d946ef 100%)',
        color: 'white',
        fontWeight: '600',
    };

    // --- FIRESTORE DATA SYNC & GENERATION ---

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        const now = new Date();
        const oneMonthAgo = Timestamp.fromDate(new Date(now.setDate(now.getDate() - NOTIFICATION_PERIOD_DAYS)));

        try {
            // --- STEP 1: Identify New Activity from Source Collections ---
            const sources = [
                { name: 'users', type: 'User', priority: 'High', dateField: 'createdAt', messageTemplate: (data: any) => `New user registration: ${data.displayName || 'Unnamed User'}`, targetField: 'displayName' },
                { name: 'mentorApplications', type: 'Mentorship', priority: 'High', dateField: 'timestamp', messageTemplate: (data: any) => `New mentor application submitted.`, targetField: 'fullName' },
                { name: 'fundraising_donations', type: 'Fundraising', priority: 'Medium', dateField: 'date', messageTemplate: (data: any) => `${data.userName || 'A donor'} donated ${data.amount ? `₹${data.amount}` : 'an amount'} to campaign ID ${data.campaignId}`, targetField: 'campaignId' },
                { name: 'events', type: 'Event', priority: 'Medium', dateField: 'date', messageTemplate: (data: any) => `New event scheduled: ${data.title}`, targetField: 'title' },
                { name: 'forum_threads', type: 'System', priority: 'Low', dateField: 'createdAt', messageTemplate: (data: any) => `New thread created: ${data.title}`, targetField: 'title' },
            ];
            
            // Get all existing unique source IDs from adminNotifs to prevent duplicates
            const existingNotifsSnapshot = await getDocs(collection(db, ADMIN_NOTIFS_COLLECTION));
            const existingSourceIds = new Set(existingNotifsSnapshot.docs.map(doc => doc.data().sourceId));
            
            const persistenceWrites = [];

            for (const source of sources) {
                const dateQuery = query(
                    collection(db, source.name),
                    where(source.dateField, '>=', oneMonthAgo)
                );
                const snapshot = await getDocs(dateQuery);

                snapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
                    const sourceId = `${source.name}-${doc.id}`;

                    if (!existingSourceIds.has(sourceId)) {
                        const data = doc.data();
                        const timestamp = (data[source.dateField] as Timestamp)?.toDate()?.toISOString() || new Date().toISOString();

                        // Prepare notification data for Firestore
                        persistenceWrites.push(addDoc(collection(db, ADMIN_NOTIFS_COLLECTION), {
                            sourceId: sourceId, // Unique ID for deduplication
                            type: source.type,
                            message: source.messageTemplate(data),
                            target: (data[source.targetField] as string) || doc.id,
                            timestamp: timestamp,
                            priority: source.priority,
                            isRead: false, // Always starts as unread
                        }));
                    }
                });
            }

            // Execute all pending writes for new activity
            await Promise.all(persistenceWrites);

            // --- STEP 2: Read All Notifications from adminNotifs Collection ---
            const finalNotifsSnapshot = await getDocs(collection(db, ADMIN_NOTIFS_COLLECTION));
            const fetchedNotifications: Notification[] = finalNotifsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isRead: doc.data().isRead || false, // Ensure boolean type
            })) as Notification[];

            setNotifications(fetchedNotifications);

        } catch (error) {
            console.error("Error fetching live notifications:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Set up polling to refresh data every 60 seconds (for a pseudo-realtime feel)
        const intervalId = setInterval(fetchNotifications, 60000);
        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, [fetchNotifications]);


    // --- LOGIC: Filtering ---

    const filteredNotifications = useMemo(() => {
        return notifications
            .filter(n => {
                const typeMatch = filterType === 'All' || n.type === filterType;
                
                const statusMatch = filterStatus === 'All' || 
                                    (filterStatus === 'Unread' && n.isRead === false) ||
                                    (filterStatus === 'Read' && n.isRead === true);
                
                const term = searchTerm.toLowerCase();
                const searchMatch = searchTerm.length < 1 || 
                                    n.message.toLowerCase().includes(term) || 
                                    n.target.toLowerCase().includes(term);
                
                return typeMatch && statusMatch && searchMatch;
            })
            // Sort: Unread first, then by priority (High to Low), then by timestamp (newest first)
            .sort((a, b) => {
                // Cast boolean to number for sorting (false = 0, true = 1)
                const statusA = a.isRead ? 1 : 0;
                const statusB = b.isRead ? 1 : 0;

                // Sort Unread (0) before Read (1)
                if (statusA !== statusB) return statusA - statusB; 
                
                const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                    return priorityOrder[b.priority] - priorityOrder[a.priority]; // Highest priority first
                }
                
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); // Newest first
            });
    }, [notifications, filterType, filterStatus, searchTerm]);

    // --- LOGIC: Handlers (Firestore Writes) ---

    // 💡 TASK: Mark as Read (Update Firestore)
    const handleMarkAsRead = useCallback(async (id: string) => {
        const notifRef = doc(db, ADMIN_NOTIFS_COLLECTION, id);
        
        // Optimistic UI Update
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        
        // Firestore Update
        try {
            await updateDoc(notifRef, { isRead: true });
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            // Revert state change on failure if needed
        }
    }, []);

    // 💡 TASK: Mark ALL as Read (Batch Update - simplified to map updates)
    const handleMarkAllAsRead = useCallback(async () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
        
        // Optimistic UI Update
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

        // Firestore Updates (Execute updates in parallel)
        const updatePromises = unreadIds.map(id => 
            updateDoc(doc(db, ADMIN_NOTIFS_COLLECTION, id), { isRead: true })
        );

        try {
            await Promise.all(updatePromises);
        } catch (error) {
            console.error("Failed to mark all notifications as read:", error);
            // fetchNotifications(); // Re-sync state on failure
        }
    }, [notifications]);

    // 💡 TASK: Delete Notification (Delete from Firestore)
    const handleDeleteNotification = useCallback(async (id: string) => {
        if (!window.confirm("Are you sure you want to permanently delete this notification?")) return;

        // Optimistic UI Update
        setNotifications(prev => prev.filter(n => n.id !== id));
        
        // Firestore Deletion
        try {
            await deleteDoc(doc(db, ADMIN_NOTIFS_COLLECTION, id));
        } catch (error) {
            console.error("Failed to delete notification:", error);
            // fetchNotifications(); // Re-sync state on failure
        }
    }, []);

    const getIconForType = (type: NotificationType) => {
        switch (type) {
            case 'User': return <UserPlus className="h-4 w-4 text-pink-500" />;
            case 'Mentorship': return <MessageSquare className="h-4 w-4 text-yellow-500" />;
            case 'Fundraising': return <DollarSign className="h-4 w-4 text-green-500" />;
            case 'Event': return <Clock className="h-4 w-4 text-blue-500" />;
            case 'System': return <Shield className="h-4 w-4 text-red-500" />;
            default: return <Bell className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getPriorityColor = (priority: Priority) => {
        switch (priority) {
            case 'High': return 'bg-red-600/70 text-white';
            case 'Medium': return 'bg-yellow-600/70 text-white';
            case 'Low': return 'bg-gray-500/70 text-white';
        }
    }

    const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

    // --- RENDER ---

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="ml-3 text-lg text-muted-foreground">Fetching new activities from all collections...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 text-foreground bg-background">
            <div className="max-w-7xl mx-auto space-y-8">
                
                <div className="flex justify-between items-center pt-4 border-b border-primary/20 pb-4">
                    <h1 className="text-5xl font-extrabold flex items-center">
                        <span className="text-white">Notifications&nbsp;</span>
                        <span
                            className="bg-gradient-to-r from-purple-600 via-purple-500 to-white bg-clip-text text-transparent"
                        >
                            Center
                        </span>
                    </h1>
                    <Button 
                        onClick={handleMarkAllAsRead} 
                        disabled={unreadCount === 0}
                        variant="outline"
                        className="border-green-500 text-green-500 hover:bg-green-500/10"
                    >
                        <Check className="mr-2 h-4 w-4" /> Mark All as Read ({unreadCount})
                    </Button>
                </div>
                
                {/* Global Filters */}
                <Card className="glass-card p-6 shadow-lg">
                    <div className="flex flex-wrap md:flex-nowrap gap-4 items-center justify-between">
                        
                        {/* Search Input */}
                        <div className="relative w-full md:w-2/5">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search message or target..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full"
                            />
                        </div>

                        {/* Type Filter */}
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-full md:w-1/4">
                                <SelectValue placeholder="Filter by Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Types</SelectItem>
                                <SelectItem value="User">User Accounts</SelectItem>
                                <SelectItem value="Mentorship">Mentorship</SelectItem>
                                <SelectItem value="Fundraising">Fundraising</SelectItem>
                                <SelectItem value="Event">Events</SelectItem>
                                <SelectItem value="System">System/Admin</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full md:w-1/4">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Statuses</SelectItem>
                                <SelectItem value="Unread">Unread ({unreadCount})</SelectItem>
                                <SelectItem value="Read">Read</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </Card>

                {/* Notifications List */}
                <Card className="glass-card shadow-2xl p-0 overflow-hidden">
                    <CardHeader className="border-b border-primary/20 bg-primary/10">
                        <CardTitle className="text-lg font-semibold text-primary">
                            {filterType} Alerts ({filteredNotifications.length})
                        </CardTitle>
                        <CardDescription>Showing recent activity from the last 30 days.</CardDescription>
                    </CardHeader>

                    <CardContent className="p-0 divide-y divide-primary/10">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((n) => (
                                <div 
                                    key={n.id} 
                                    className={`p-4 flex justify-between items-center transition-colors ${!n.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-primary/5'}`}
                                >
                                    
                                    {/* Icon and Message */}
                                    <div className="flex items-center space-x-4 w-3/4">
                                        <div className="p-2 rounded-full bg-primary/20 flex-shrink-0">
                                            {getIconForType(n.type)}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className={`font-medium ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {n.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Target: <span className="font-semibold">{n.target}</span> • {new Date(n.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status and Actions */}
                                    <div className="flex items-center space-x-3 flex-shrink-0">
                                        <Badge className={getPriorityColor(n.priority)}>
                                            {n.priority}
                                        </Badge>
                                        
                                        {!n.isRead && (
                                            <Button variant="ghost" size="icon" onClick={() => handleMarkAsRead(n.id)} title="Mark as Read">
                                                <Check className="h-4 w-4 text-green-500" />
                                            </Button>
                                        )}
                                        
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteNotification(n.id)} title="Delete">
                                            <X className="h-4 w-4 text-red-400" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center p-6 text-muted-foreground">
                                All clear! No notifications match the current filters or recent activity.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default NotificationsManager;