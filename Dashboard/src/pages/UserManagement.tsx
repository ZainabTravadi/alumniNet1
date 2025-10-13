import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Users, Shield, Star, Search, Trash2, Lock, CheckCircle, Clock, Send, MessageSquare, X, BarChart
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface UserRow {
    id: string;
    name: string;
    email: string;
    currentTitle: string;
    company: string;
    isMentor: boolean;
    adminRole: 'Super Admin' | 'Event Admin' | 'Fundraising Admin' | 'Default';
    status: 'Active' | 'Suspended';
    engagementScore: number;
    isVerified: boolean;
    lastActive: string; // ISO date string
    isSelected: boolean;
}

// --- DUMMY DATA ---
const DUMMY_USERS: UserRow[] = [
    { id: '1', name: 'Alfie Bate', email: 'alfie@corp.com', currentTitle: 'CEO', company: 'Nexus', isMentor: true, adminRole: 'Super Admin', status: 'Active', engagementScore: 95, isVerified: true, lastActive: '2025-10-10', isSelected: false },
    { id: '2', name: 'Brenda Chen', email: 'brenda@alum.com', currentTitle: 'Product Manager', company: 'Labs Inc', isMentor: true, adminRole: 'Event Admin', status: 'Active', engagementScore: 40, isVerified: true, lastActive: '2025-10-12', isSelected: false },
    { id: '3', name: 'Charlie Dean', email: 'charlie@alum.com', currentTitle: 'Analyst', company: 'Fund X', isMentor: false, adminRole: 'Fundraising Admin', status: 'Active', engagementScore: 78, isVerified: false, lastActive: '2025-09-01', isSelected: false },
    { id: '4', name: 'Diana Evans', email: 'diana@alum.com', currentTitle: 'UX Designer', company: 'Design Co.', isMentor: true, adminRole: 'Default', status: 'Suspended', engagementScore: 10, isVerified: true, lastActive: '2025-05-15', isSelected: false },
    { id: '5', name: 'Ethan Fox', email: 'ethan@alum.com', currentTitle: 'Data Scientist', company: 'Quant AI', isMentor: false, adminRole: 'Default', status: 'Active', engagementScore: 62, isVerified: true, lastActive: '2025-10-01', isSelected: false },
];

const UserControlPanel = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOptions, setFilterOptions] = useState({ role: 'All', status: 'All', batch: 'All' });
    const [users, setUsers] = useState<UserRow[]>(DUMMY_USERS);
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Custom style for the primary gradient button (Vibrant Dark Purple/Indigo theme)
    const primaryGradientStyle = {
        background: 'linear-gradient(90deg, #9333ea 0%, #d946ef 100%)', // Primary Gradient
        color: 'white',
        fontWeight: '600',
    };

    // --- LOGIC: Select/Bulk Actions ---

    const handleSelectUser = useCallback((userId: string, isSelected: boolean) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isSelected } : u));
    }, []);

    const handleSelectAll = useCallback((checked: boolean) => {
        setUsers(prev => prev.map(u => ({ ...u, isSelected: checked })));
    }, []);

    const selectedUsers = useMemo(() => users.filter(u => u.isSelected), [users]);

    // --- LOGIC: Filtering & Metrics ---

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const term = searchTerm.toLowerCase();
            const matchesSearch = user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
            
            const matchesRole = filterOptions.role === 'All' || user.adminRole === filterOptions.role;
            const matchesStatus = filterOptions.status === 'All' || user.status === filterOptions.status;

            // Simple batch filter logic placeholder
            const matchesBatch = filterOptions.batch === 'All' || user.id === filterOptions.batch; 

            return matchesSearch && matchesRole && matchesStatus && matchesBatch;
        });
    }, [users, searchTerm, filterOptions]);
    
    const metrics = useMemo(() => ({
        totalUsers: users.length,
        verifiedUsers: users.filter(u => u.isVerified).length,
        suspendedAccounts: users.filter(u => u.status === 'Suspended').length,
        unassignedMentors: users.filter(u => u.isMentor && u.engagementScore < 50).length, // Example logic
        newSignups: 25, // Dummy value for last 7 days
    }), [users]);

    // --- LOGIC: Handlers for Inline Actions ---

    const handleToggleMentor = (userId: string, isMentor: boolean) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isMentor } : u));
    };

    const handleViewProfile = (user: UserRow) => {
        setSelectedUser(user);
        setIsProfileModalOpen(true);
    };

    // --- RENDER HELPERS ---

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
                    {/* Placeholder for Rich Modal Content with Tabs (Activity, Audit, etc.) */}
                    <div className="space-y-4 pt-4 border-t border-primary/20">
                        <h4 className="text-lg font-semibold text-foreground">Detailed Status:</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <p>Title: <span className="font-medium text-foreground">{selectedUser.currentTitle}</span></p>
                            <p>Engagement: <span className="font-medium text-green-400">{selectedUser.engagementScore}%</span></p>
                            <p>Last Active: <span className="font-medium text-foreground">{selectedUser.lastActive}</span></p>
                            <p>Verified: <span className="font-medium text-foreground">{selectedUser.isVerified ? 'Yes' : 'No'}</span></p>
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
                    <Button variant="outline" className="text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Bulk Role
                    </Button>
                    <Button variant="outline" className="text-sm flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Bulk Email
                    </Button>
                    <Button variant="destructive" className="text-sm flex items-center gap-2">
                        <X className="w-4 h-4" /> Suspend
                    </Button>
                </div>

                <Button variant="ghost" onClick={() => handleSelectAll(false)}>
                    Deselect All
                </Button>
            </div>
        </Card>
    );

    // ------------------ MAIN RENDER ------------------

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

                {/* 1. Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Total Users */}
                    <Card className="glass-card shadow-lg bg-primary/5"><CardContent className="p-6"><div className="flex items-center justify-between"><Users className="h-8 w-8 text-primary" /><div><p className="text-sm font-medium text-muted-foreground">Total Users</p><p className="text-3xl font-bold">{metrics.totalUsers}</p></div></div></CardContent></Card>
                    {/* Verified Users */}
                    <Card className="glass-card shadow-lg bg-primary/5"><CardContent className="p-6"><div className="flex items-center justify-between"><CheckCircle className="h-8 w-8 text-green-500" /><div><p className="text-sm font-medium text-muted-foreground">Verified</p><p className="text-3xl font-bold">{metrics.verifiedUsers}</p></div></div></CardContent></Card>
                    {/* Suspended Accounts */}
                    <Card className="glass-card shadow-lg bg-primary/5"><CardContent className="p-6"><div className="flex items-center justify-between"><X className="h-8 w-8 text-red-500" /><div><p className="text-sm font-medium text-muted-foreground">Suspended</p><p className="text-3xl font-bold">{metrics.suspendedAccounts}</p></div></div></CardContent></Card>
                    {/* New Signups */}
                    <Card className="glass-card shadow-lg bg-primary/5"><CardContent className="p-6"><div className="flex items-center justify-between"><Clock className="h-8 w-8 text-yellow-500" /><div><p className="text-sm font-medium text-muted-foreground">New (7D)</p><p className="text-3xl font-bold">{metrics.newSignups}</p></div></div></CardContent></Card>
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
                            <Select value={filterOptions.role} onValueChange={(v) => setFilterOptions(p => ({ ...p, role: v }))}>
                                <SelectTrigger className="w-full md:w-1/4"><SelectValue placeholder="Filter by Admin Role" /></SelectTrigger>
                                <SelectContent><SelectItem value="All">All Roles</SelectItem><SelectItem value="Super Admin">Super Admin</SelectItem><SelectItem value="Default">Default</SelectItem></SelectContent>
                            </Select>

                            {/* Status Filter */}
                            <Select value={filterOptions.status} onValueChange={(v) => setFilterOptions(p => ({ ...p, status: v }))}>
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
                                            <p className="text-xs text-muted-foreground truncate">{user.currentTitle} @ {user.company}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Verification Status */}
                                    <div className="col-span-1 flex justify-center">
                                        <Badge className={user.isVerified ? 'bg-green-600' : 'bg-yellow-600'}><CheckCircle className="h-3 w-3" /></Badge>
                                    </div>

                                    {/* Mentor Toggle */}
                                    <div className="col-span-1 flex justify-center">
                                        <Switch
                                            checked={user.isMentor}
                                            onCheckedChange={(checked) => handleToggleMentor(user.id, checked)}
                                            style={user.isMentor ? { backgroundColor: '#4ade80' } : {}} 
                                        />
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
                                                    // Trigger modal/confirmation dialog here in a real app
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
                                                <SelectItem value="Default">Default</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="col-span-2 flex justify-end space-x-1">
                                        <Button variant="ghost" size="icon" title="Reset Password"><Lock className="h-4 w-4 text-muted-foreground" /></Button>
                                        <Button variant="ghost" size="icon" title="Suspend Account"><X className="h-4 w-4 text-red-400" /></Button>
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