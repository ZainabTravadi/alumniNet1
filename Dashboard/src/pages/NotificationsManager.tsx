import React, { useState, useMemo, useCallback } from 'react';
// UI Imports (Shadcn UI assumed)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Bell, UserPlus, DollarSign, MessageSquare, Check, X, Search, Clock, Shield
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
type NotificationType = 'User' | 'Mentorship' | 'Fundraising' | 'System';
type NotificationStatus = 'Read' | 'Unread';

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    target: string; // E.g., 'Brenda Chen', 'Scholarship Fund'
    timestamp: string; // ISO date string
    status: NotificationStatus;
    priority: 'High' | 'Medium' | 'Low';
}

// --- DUMMY DATA ---
const DUMMY_NOTIFICATIONS: Notification[] = [
    { id: 'n1', type: 'User', message: 'New user registration needs verification.', target: 'John Smith', timestamp: '2025-10-13T08:00:00Z', status: 'Unread', priority: 'High' },
    { id: 'n2', type: 'Mentorship', message: 'Sarah Chen declined mentorship request.', target: 'Mentee ID: M456', timestamp: '2025-10-13T07:30:00Z', status: 'Unread', priority: 'Medium' },
    { id: 'n3', type: 'Fundraising', message: 'Goal reached for Innovation Hub Campaign!', target: 'Campaign C2', timestamp: '2025-10-12T10:00:00Z', status: 'Unread', priority: 'High' },
    { id: 'n4', type: 'System', message: 'Database backup successful.', target: 'System', timestamp: '2025-10-11T23:00:00Z', status: 'Read', priority: 'Low' },
    { id: 'n5', type: 'User', message: 'Profile updated by Ethan Fox.', target: 'Ethan Fox', timestamp: '2025-10-11T14:30:00Z', status: 'Read', priority: 'Medium' },
];

const NotificationsManager = () => {
    const [notifications, setNotifications] = useState<Notification[]>(DUMMY_NOTIFICATIONS);
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Custom style for the primary gradient button (Vibrant Dark Purple/Indigo theme)
    const primaryGradientStyle = {
        background: 'linear-gradient(90deg, #9333ea 0%, #d946ef 100%)', // Primary Gradient
        color: 'white',
        fontWeight: '600',
    };

    // --- LOGIC: Filtering ---

    const filteredNotifications = useMemo(() => {
        return notifications
            .filter(n => {
                const typeMatch = filterType === 'All' || n.type === filterType;
                const statusMatch = filterStatus === 'All' || n.status === filterStatus;
                const searchMatch = searchTerm.length < 3 || n.message.toLowerCase().includes(searchTerm.toLowerCase()) || n.target.toLowerCase().includes(searchTerm.toLowerCase());
                return typeMatch && statusMatch && searchMatch;
            })
            // Sort: Unread first, then by priority (High to Low), then by timestamp (newest first)
            .sort((a, b) => {
                if (a.status === 'Unread' && b.status === 'Read') return -1;
                if (a.status === 'Read' && b.status === 'Unread') return 1;
                if (a.priority === 'High' && b.priority !== 'High') return -1;
                if (b.priority === 'High' && a.priority !== 'High') return 1;
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });
    }, [notifications, filterType, filterStatus, searchTerm]);

    // --- LOGIC: Handlers ---

    const handleMarkAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, status: 'Read' } : n)
        );
    }, []);

    const handleMarkAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, status: 'Read' }))
        );
    }, []);

    const handleDeleteNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const getIconForType = (type: NotificationType) => {
        switch (type) {
            case 'User': return <UserPlus className="h-4 w-4 text-primary" />;
            case 'Mentorship': return <MessageSquare className="h-4 w-4 text-yellow-500" />;
            case 'Fundraising': return <DollarSign className="h-4 w-4 text-green-500" />;
            case 'System': return <Shield className="h-4 w-4 text-red-500" />;
            default: return <Bell className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const unreadCount = useMemo(() => notifications.filter(n => n.status === 'Unread').length, [notifications]);

    // --- RENDER ---

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
                    </CardHeader>

                    <CardContent className="p-0 divide-y divide-primary/10">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((n) => (
                                <div 
                                    key={n.id} 
                                    className={`p-4 flex justify-between items-center transition-colors ${n.status === 'Unread' ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-primary/5'}`}
                                >
                                    
                                    {/* Icon and Message */}
                                    <div className="flex items-center space-x-4 w-3/4">
                                        <div className="p-2 rounded-full bg-primary/20 flex-shrink-0">
                                            {getIconForType(n.type)}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className={`font-medium ${n.status === 'Unread' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {n.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Target: <span className="font-semibold">{n.target}</span> • {new Date(n.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status and Actions */}
                                    <div className="flex items-center space-x-3 flex-shrink-0">
                                        <Badge variant="secondary" className={n.priority === 'High' ? 'bg-red-500' : n.priority === 'Medium' ? 'bg-yellow-500' : 'bg-gray-500'}>
                                            {n.priority}
                                        </Badge>
                                        
                                        {n.status === 'Unread' && (
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
                                All clear! No notifications match the current filters.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default NotificationsManager;