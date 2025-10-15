"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Users, Shield, Star, Search, Trash2, Lock, CheckCircle, Clock, Send, MessageSquare, X, BarChart, Loader2
} from 'lucide-react';
import { db } from "@/firebase";
import {
    collection,
    getDocs,
    query,
    where,
    Timestamp,
    updateDoc,
    doc,
    deleteDoc,
} from "firebase/firestore";

// --- TYPE DEFINITIONS ---

interface FirestoreUser {
    id: string;
    displayName?: string;
    email: string;
    title?: string;
    company?: string;
    isMentor?: boolean;
    isVerified?: boolean;
}

interface UserRow extends FirestoreUser {
    name: string;
    currentTitle: string;
    adminRole: 'Super Admin' | 'Event Admin' | 'Fundraising Admin' | 'Default';
    status: 'Active' | 'Suspended';
    engagementScore: number;
    isPendingMentor: boolean;
    isSelected: boolean;
    
    // Processed strings for rendering
    lastActiveStr: string;
    signedUpDateStr: string;
    
    // Raw Timestamps for internal metric calculation
    lastActive?: Timestamp;
    createdAt?: Timestamp; 
}

const MAX_ENGAGEMENT_SCORE = 100;
const BASE_ENGAGEMENT_FACTOR = 5;
const REPLY_VALUE = 2;

// --- CORE COMPONENT ---

const UserControlPanel = () => {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOptions, setFilterOptions] = useState({ role: 'All', status: 'All', batch: 'All' });
    const [users, setUsers] = useState<UserRow[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const primaryGradientStyle = {
        background: 'linear-gradient(90deg, #9333ea 0%, #d946ef 100%)',
        color: 'white',
        fontWeight: '600',
    };

    // --- FIRESTORE DATA FETCHING AND PROCESSING ---

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const [
                    usersSnapshot,
                    mentorAppSnapshot,
                    threadsSnapshot,
                ] = await Promise.all([
                    getDocs(collection(db, "users")),
                    getDocs(collection(db, "mentorApplications")),
                    getDocs(collection(db, "forum_threads")),
                ]);

                // 1. Process Mentor Applications (User ID -> App Doc ID)
                const pendingMentorUsers = new Map<string, string>();
                mentorAppSnapshot.docs.forEach(doc => {
                    const userId = doc.data().userId;
                    if (userId) {
                        pendingMentorUsers.set(userId, doc.id);
                    }
                });
                
                // 2. Process Forum Replies (User ID -> Reply Count)
                const replyCounts = new Map<string, number>();
                
                for (const threadDoc of threadsSnapshot.docs) {
                    const repliesCollectionRef = collection(db, "forum_threads", threadDoc.id, "thread_replies");
                    const repliesSnapshot = await getDocs(repliesCollectionRef);
                    
                    repliesSnapshot.docs.forEach(replyDoc => {
                        const authorId = replyDoc.data().authorId;
                        if (authorId) {
                            replyCounts.set(authorId, (replyCounts.get(authorId) || 0) + 1);
                        }
                    });
                }
                
                // 3. Assemble User Rows
                const fetchedUsers: UserRow[] = usersSnapshot.docs.map(doc => {
                    const data = doc.data() as Omit<FirestoreUser, 'id'> & { 
                        createdAt: Timestamp; 
                        lastActive?: Timestamp;
                    }; 
                    const userId = doc.id;
                    const replyCount = replyCounts.get(userId) || 0;
                    
                    const engagementScore = Math.min(MAX_ENGAGEMENT_SCORE, BASE_ENGAGEMENT_FACTOR + replyCount * REPLY_VALUE);
                    const status: UserRow['status'] = 'Active'; 
                    
                    const signedUpDateStr = data.createdAt ? data.createdAt.toDate().toLocaleDateString() : 'N/A';
                    const lastActiveStr = data.lastActive ? data.lastActive.toDate().toISOString().split('T')[0] : 'N/A';

                    return {
                        id: userId,
                        name: data.displayName || 'Unnamed User',
                        email: data.email,
                        currentTitle: data.title || 'Alumni Member',
                        company: data.company || 'Independent',
                        isMentor: data.isMentor === true,
                        adminRole: 'Default',
                        status: status,
                        engagementScore: engagementScore,
                        isVerified: data.isMentor === true,
                        isPendingMentor: pendingMentorUsers.has(userId),
                        lastActiveStr: lastActiveStr, 
                        signedUpDateStr: signedUpDateStr,
                        createdAt: data.createdAt,
                        lastActive: data.lastActive,
                        isSelected: false,
                    } as UserRow;
                });
                
                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // --- LOGIC: User Actions (Firestore Writes) ---

    const handleToggleMentor = useCallback(async (user: UserRow, isMentor: boolean) => {
        // Optimistic UI update
        setUsers(prev => prev.map(u => 
            u.id === user.id ? { 
                ...u, 
                isMentor, 
                isVerified: isMentor, 
                isPendingMentor: false 
            } : u
        ));

        try {
            const userRef = doc(db, "users", user.id);
            await updateDoc(userRef, {
                isMentor: isMentor,
                isVerified: isMentor,
            });

            // 💡 NEW LOGIC: Delete mentor application if approval (isMentor=true) and application exists
            if (isMentor) {
                const applicationQuery = query(
                    collection(db, "mentorApplications"),
                    where("userId", "==", user.id)
                );
                const applicationSnapshot = await getDocs(applicationQuery);
                
                if (!applicationSnapshot.empty) {
                    const appId = applicationSnapshot.docs[0].id;
                    await deleteDoc(doc(db, "mentorApplications", appId));
                    console.log(`Deleted mentor application for user ${user.id} (${appId}).`);
                }
            }
        } catch (error) {
            console.error("Error toggling mentor status or deleting application:", error);
            alert("Failed to update mentor status. Please reload and try again.");
            // Revert state change on failure (in a more robust app)
        }
    }, []);

    const handleSuspendUser = useCallback(async (user: UserRow) => {
        if (!window.confirm(`Are you sure you want to permanently delete ${user.name}? This is permanent and deletes the user document.`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, "users", user.id));
            setUsers(prev => prev.filter(u => u.id !== user.id));
            alert(`${user.name} has been permanently deleted.`);
        } catch (error) {
            console.error(`Failed to delete user ${user.id}:`, error);
            alert(`Failed to delete ${user.name}. Check console.`);
        }
    }, []);
    
    // --- LOGIC: Select/Bulk Actions (Memoization starts here) ---

    const handleSelectUser = useCallback((userId: string, isSelected: boolean) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isSelected } : u));
    }, []);

    const handleSelectAll = useCallback((checked: boolean) => {
        setUsers(prev => prev.map(u => ({ ...u, isSelected: checked })));
    }, []);

    const selectedUsers = useMemo(() => users.filter(u => u.isSelected), [users]);
    
    const handleBulkSuspend = useCallback(async () => {
        if (!window.confirm(`Are you sure you want to PERMANENTLY delete (suspend) ${selectedUsers.length} user account(s)? This action is irreversible.`)) {
            return;
        }

        setLoading(true);
        const successfulDeletions: string[] = [];
        
        for (const user of selectedUsers) {
            try {
                await deleteDoc(doc(db, "users", user.id));
                successfulDeletions.push(user.id);
            } catch (error) {
                console.error(`Failed to delete user ${user.id}:`, error);
            }
        }
        
        setUsers(prev => prev.filter(u => !successfulDeletions.includes(u.id)));
        
        alert(`Successfully suspended ${successfulDeletions.length} accounts.`);
        setLoading(false);
    }, [selectedUsers]);
    
    const handleBulkEmail = useCallback(() => {
        alert(`Simulating bulk email sent to ${selectedUsers.length} user(s). (Recipients: ${selectedUsers.map(u => u.email).join(', ')})`);
    }, [selectedUsers.length]);


    // --- LOGIC: Filtering & Metrics ---
    
    const filteredUsers = useMemo(() => {
        let list = users;

        // 💡 FIX: Added null/undefined checks for all optional user fields
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(user => 
                (user.name || '').toLowerCase().includes(term) || 
                (user.email || '').toLowerCase().includes(term) ||
                (user.currentTitle || '').toLowerCase().includes(term) ||
                (user.company || '').toLowerCase().includes(term)
            );
        }
        
        // Apply Filters
        if (filterOptions.role !== 'All') {
            list = list.filter(user => user.adminRole === filterOptions.role);
        }
        if (filterOptions.status !== 'All') {
            list = list.filter(user => user.status === filterOptions.status);
        }

        return list;
    }, [users, searchTerm, filterOptions]);
    
    const metrics = useMemo(() => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const suspendedAccounts = users.filter(u => u.status === 'Suspended').length; 
        
        const newSignups = users.filter(u => {
            // Check if createdAt (raw Timestamp) exists and if its Date is within the last week
            return u.createdAt?.toDate() && u.createdAt.toDate() >= oneWeekAgo;
        }).length;

        return {
            totalUsers: users.length,
            verifiedUsers: users.filter(u => u.isMentor).length,
            suspendedAccounts: suspendedAccounts,
            newSignups: newSignups, 
        };
    }, [users]);


    // --- RENDER HELPERS ---

    const handleViewProfile = (user: UserRow) => {
        setSelectedUser(user);
        setIsProfileModalOpen(true);
    };

    const getRoleColor = (role: UserRow['adminRole']) => {
        switch (role) {
            case 'Super Admin': return 'bg-red-600';
            case 'Event Admin': return 'bg-yellow-600';
            case 'Fundraising Admin': return 'bg-blue-600';
            default: return 'bg-primary/50';
        }
    };

    const UserProfileModal = () => {
        if (!selectedUser) return null;
        return (
            <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-background/90"
                    style={{ backdropFilter: "blur(20px)", border: "1px solid rgba(147, 51, 234, 0.2)" }}
                >
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold text-primary">{selectedUser.name}</DialogTitle>
                        <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    </DialogHeader>
                    
                    <div className="space-y-4 pt-4 border-t border-primary/20">
                        <h4 className="text-lg font-semibold text-foreground">Detailed Status:</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <p>Title: <span className="font-medium text-foreground">{selectedUser.currentTitle}</span></p>
                            <p>Engagement: <span className="font-medium text-green-400">{selectedUser.engagementScore}%</span></p>
                            <p>Last Active: <span className="font-medium text-foreground">{selectedUser.lastActiveStr}</span></p>
                            <p>Verified: <span className="font-medium text-foreground">{selectedUser.isVerified ? 'Yes' : 'No'}</span></p>
                            <p>Signed Up: <span className="font-medium text-foreground">{selectedUser.signedUpDateStr}</span></p> 
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button variant="outline" onClick={() => setIsProfileModalOpen(false)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    const BulkActionPanel = () => (
        <Card className="glass-card p-4 shadow-2xl border-2 border-primary/50 bg-background/50">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="font-bold text-lg text-primary">
                    {selectedUsers.length} Users Selected
                </div>
                
                {/* Bulk Action Controls */}
                <div className="flex gap-3">
                    <Button variant="outline" className="text-sm flex items-center gap-2" disabled={loading}>
                        <Shield className="w-4 h-4" /> Bulk Role
                    </Button>
                    <Button variant="outline" className="text-sm flex items-center gap-2" onClick={handleBulkEmail} disabled={loading}>
                        <MessageSquare className="w-4 h-4" /> Bulk Email
                    </Button>
                    <Button variant="destructive" className="text-sm flex items-center gap-2" onClick={handleBulkSuspend} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />} Suspend
                    </Button>
                </div>

                <Button variant="ghost" onClick={() => handleSelectAll(false)} disabled={loading}>
                    Deselect All
                </Button>
            </div>
        </Card>
    );

    // ------------------ MAIN RENDER ------------------

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="ml-3 text-lg text-muted-foreground">Loading user data...</p>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen p-6 text-foreground bg-background"> 
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center pt-4 border-b border-primary/20 pb-4">
                <h1 className="text-5xl font-extrabold flex items-center">
                    <span className="text-white">User&nbsp;</span>
                    <span
                        className="bg-gradient-to-r from-purple-600 via-purple-500 to-white bg-clip-text text-transparent"
                    >
                        Management
                    </span>
                </h1> </div>
                <p className="text-muted-foreground">Master control panel for user access, roles, and engagement tracking.</p>

                {/* 1. Metric Cards - UPDATED GRID LAYOUT */}
<div className="grid grid-cols-2 md:grid-cols-3 gap-6">
    {/* Total Users */}
    <Card className="glass-card shadow-lg bg-primary/5">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <Users className="h-8 w-8 text-primary" />
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold">{metrics.totalUsers}</p>
                </div>
            </div>
        </CardContent>
    </Card>
    
    {/* Verified Users (isMentor: True) */}
    <Card className="glass-card shadow-lg bg-primary/5">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Verified (Mentors)</p>
                    <p className="text-3xl font-bold">{metrics.verifiedUsers}</p>
                </div>
            </div>
        </CardContent>
    </Card>
    
    {/* New Signups (Last 7D) */}
    <Card className="glass-card shadow-lg bg-primary/5">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                    <p className="text-sm font-medium text-muted-foreground">New (7D)</p>
                    <p className="text-3xl font-bold">{metrics.newSignups}</p>
                </div>
            </div>
        </CardContent>
    </Card>
</div>
                {/* 2. Global Filters & Bulk Actions Panel */}
                {selectedUsers.length > 0 ? (
                    <BulkActionPanel />
                ) : (
                    <Card className="glass-card p-6 shadow-lg">
                        <div className="flex flex-wrap md:flex-nowrap gap-4 items-center justify-between">
                            {/* Search */}
                            <div className="relative w-full md:w-1/3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search user..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full" />
                            </div>

                            {/* Role Filter */}
                            <Select value={filterOptions.role} onValueChange={(v) => setFilterOptions(p => ({ ...p, role: v as UserRow['adminRole'] }))}>
                                <SelectTrigger className="w-full md:w-1/4"><SelectValue placeholder="Filter by Admin Role" /></SelectTrigger>
                                <SelectContent><SelectItem value="All">All Roles</SelectItem><SelectItem value="Super Admin">Super Admin</SelectItem><SelectItem value="Default">Default</SelectItem></SelectContent>
                            </Select>

                            {/* Status Filter */}
                            <Select value={filterOptions.status} onValueChange={(v) => setFilterOptions(p => ({ ...p, status: v as UserRow['status'] }))}>
                                <SelectTrigger className="w-full md:w-1/4"><SelectValue placeholder="Filter by Status" /></SelectTrigger>
                                <SelectContent><SelectItem value="All">All Statuses</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Suspended">Suspended</SelectItem></SelectContent>
                            </Select>

                            {/* Bulk Import Button */}
                            <Button style={primaryGradientStyle} className="w-full md:w-auto">
                                Bulk Import 
                            </Button>
                        </div>
                    </Card>
                )}

                {/* 3. User Management Table */}
                <Card className="glass-card shadow-2xl p-0 overflow-hidden">
                    <div className="w-full">
                        <div className="grid grid-cols-12 p-4 font-semibold border-b border-primary/20 bg-primary/10 text-primary text-sm">
                            <span className="col-span-1 flex justify-center"><Switch checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0} onCheckedChange={handleSelectAll} /></span>
                            <span className="col-span-3">User & Title</span>
                            <span className="col-span-1 text-center">Verified</span>
                            <span className="col-span-1 text-center">Mentor</span>
                            <span className="col-span-2 text-center">Engagement</span>
                            <span className="col-span-2 text-center">Admin Role</span>
                            <span className="col-span-2 text-right">Actions</span>
                        </div>

                        <div className="divide-y divide-primary/10">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="grid grid-cols-12 items-center p-4 hover:bg-primary/5 transition-colors">
                                    
                                    {/* Select Row */}
                                    <div className="col-span-1 flex justify-center">
                                        <Switch 
                                            checked={user.isSelected} 
                                            onCheckedChange={(checked) => handleSelectUser(user.id, checked)}
                                        />
                                    </div>
                                    
                                    {/* User Info (Link to Modal) */}
                                    <div className="col-span-3 flex items-center space-x-3 cursor-pointer" onClick={() => handleViewProfile(user)}>
                                        <Avatar><AvatarFallback className="bg-primary/20 text-primary text-xs">{user.name[0]}</AvatarFallback></Avatar>
                                        <div>
                                            <p className="font-medium text-foreground text-sm">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.currentTitle}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Verification Status */}
                                    <div className="col-span-1 flex justify-center">
                                        <Badge className={user.isVerified ? 'bg-green-600' : 'bg-yellow-600'}><CheckCircle className="h-3 w-3" /></Badge>
                                    </div>

                                    {/* Mentor Toggle */}
                                    <div className="col-span-1 flex flex-col justify-center items-center">
                                        <Switch
                                            checked={user.isMentor || user.isPendingMentor}
                                            onCheckedChange={(checked) => handleToggleMentor(user, checked)}
                                            style={{ 
                                                backgroundColor: user.isPendingMentor ? '#fde047' : (user.isMentor ? '#4ade80' : undefined),
                                                opacity: user.isPendingMentor ? 0.7 : 1,
                                            }}
                                        />
                                        {user.isPendingMentor && <span className="text-[10px] text-yellow-500 mt-1">Pending</span>}
                                    </div>

                                    {/* Engagement Score */}
                                    <div className="col-span-2 text-center text-sm">
                                        <Badge className="bg-primary/20 text-primary flex items-center justify-center mx-auto w-16">
                                            <BarChart className="h-3 w-3 mr-1" /> {user.engagementScore}%
                                        </Badge>
                                    </div>

                                    {/* Admin Role Selector */}
                                    <div className="col-span-2 text-center">
                                        <Select
                                            value={user.adminRole}
                                            onValueChange={(newRole) => {
                                                if (newRole !== user.adminRole) {
                                                    alert(`Role change for ${user.name} to ${newRole} triggered. (Firestore update logic pending)`);
                                                    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, adminRole: newRole as UserRow['adminRole'] } : u));
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="h-8 text-xs font-medium w-[120px] mx-auto bg-background">
                                                <Badge style={{ backgroundColor: getRoleColor(user.adminRole), color: 'white' }}>
                                                    {user.adminRole}
                                                </Badge>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Super Admin">Super Admin</SelectItem>
                                                <SelectItem value="Event Admin">Event Admin</SelectItem>
                                                <SelectItem value="Fundraising Admin">Fundraising Admin</SelectItem>
                                                <SelectItem value="Default">Default</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="col-span-2 flex justify-end space-x-1">
                                        <Button variant="ghost" size="icon" title="Reset Password" disabled={loading}><Lock className="h-4 w-4 text-muted-foreground" /></Button>
                                        
                                        {/* Individual Suspend - Calls single user deletion handler */}
                                        <Button variant="ghost" size="icon" title="Suspend Account" onClick={() => handleSuspendUser(user)} disabled={loading}>
                                            <X className="h-4 w-4 text-red-400" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {filteredUsers.length === 0 && (
                                <p className="text-center p-6 text-muted-foreground">No users match the current filter or search criteria.</p>
                            )}
                        </div>
                    </div>
                </Card>
                
                <UserProfileModal />
            </div>
        </div>
    );
};

export default UserControlPanel;