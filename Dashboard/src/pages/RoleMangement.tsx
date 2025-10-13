import { useState, useMemo } from 'react';
// Assuming these UI components exist in your project:
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch'; 

import {
    Users, Shield, Star, Search, Trash2, ArrowRight, Lock, MessageSquare
} from 'lucide-react';

// --- DUMMY DATA STRUCTURE ---
interface UserRow {
    id: string;
    name: string;
    email: string;
    currentTitle: string;
    company: string; // 💡 FIXED: Added the missing 'company' property
    isMentor: boolean;
    adminRole: 'Super Admin' | 'Event Admin' | 'Fundraising Admin' | 'Default' | 'Suspended';
    status: 'Active' | 'Suspended';
}

const DUMMY_USERS: UserRow[] = [
    // 💡 FIXED: Added 'company' to all dummy user objects
    { id: '1', name: 'Alfie Bate', email: 'alfie@corp.com', currentTitle: 'CEO', company: 'Nexus Global', isMentor: true, adminRole: 'Super Admin', status: 'Active' },
    { id: '2', name: 'Brenda Chen', email: 'brenda@alum.com', currentTitle: 'Product Manager', company: 'Innovate Labs', isMentor: true, adminRole: 'Event Admin', status: 'Active' },
    { id: '3', name: 'Charlie Dean', email: 'charlie@alum.com', currentTitle: 'Analyst', company: 'Capital Fund', isMentor: false, adminRole: 'Fundraising Admin', status: 'Active' },
    { id: '4', name: 'Diana Evans', email: 'diana@alum.com', currentTitle: 'UX Designer', company: 'Design Co.', isMentor: true, adminRole: 'Default', status: 'Suspended' },
    { id: '5', name: 'Ethan Fox', email: 'ethan@alum.com', currentTitle: 'Data Scientist', company: 'Quant AI', isMentor: false, adminRole: 'Default', status: 'Active' },
];

const RoleManager = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('All');
    const [users, setUsers] = useState<UserRow[]>(DUMMY_USERS);
    // You would manage modal state here for Bulk Actions, etc.

    // ------------------ LOGIC: Filtering & Metrics ------------------

    const filteredUsers = useMemo(() => {
        let list = users.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterRole !== 'All') {
            list = list.filter(user => {
                if (filterRole === 'Mentor') return user.isMentor;
                if (filterRole === 'Admin') return user.adminRole !== 'Default' && user.adminRole !== 'Suspended';
                return user.adminRole === filterRole;
            });
        }
        return list;
    }, [users, searchTerm, filterRole]);
    
    const metrics = useMemo(() => ({
        totalUsers: users.length,
        totalMentors: users.filter(u => u.isMentor).length,
        totalAdmins: users.filter(u => u.adminRole !== 'Default' && u.adminRole !== 'Suspended').length,
    }), [users]);

    // ------------------ LOGIC: Handlers ------------------

    const handleRoleChange = (userId: string, newRole: UserRow['adminRole']) => {
        if (newRole === 'Super Admin' && !window.confirm("WARNING: Granting Super Admin access is a critical action. Proceed?")) {
            return;
        }
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, adminRole: newRole } : u));
    };

    const handleMentorToggle = (userId: string, isMentor: boolean) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isMentor: isMentor } : u));
    };

    const getRoleColor = (role: UserRow['adminRole']) => {
        switch (role) {
            case 'Super Admin': return 'bg-red-600';
            case 'Event Admin': return 'bg-yellow-600';
            case 'Fundraising Admin': return 'bg-blue-600';
            case 'Suspended': return 'bg-gray-500';
            default: return 'bg-primary/50';
        }
    };
    
    // Custom style for the primary gradient button (Vibrant Dark Purple/Indigo theme)
    const primaryGradientStyle = {
        background: 'linear-gradient(90deg, #9333ea 0%, #d946ef 100%)', // from-violet-600 to-fuchsia-500
        color: 'white',
        fontWeight: '600',
    };

    // ------------------ RENDER ------------------

    return (
        <div className="min-h-screen p-6 text-foreground bg-background"> {/* Assume Dark Theme classes */}
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center pt-4 border-b border-primary/20 pb-4">
                <h1 className="text-5xl font-extrabold flex items-center">
  <span className="text-white">Role&nbsp;</span>
  <span
    className="bg-gradient-to-r from-purple-600 via-purple-500 to-white bg-clip-text text-transparent"
  >
    Management
  </span>
</h1> </div>
                <p className="text-muted-foreground">Centralized control panel for defining permissions and managing user access across AlumniNet.</p>

                {/* --- 1. Metric Cards --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="glass-card shadow-lg bg-primary/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <Shield className="h-8 w-8 text-red-500" />
                                <div><p className="text-sm font-medium text-muted-foreground">Total Admins</p><p className="text-3xl font-bold">{metrics.totalAdmins}</p></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card shadow-lg bg-primary/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <Users className="h-8 w-8 text-primary" />
                                <div><p className="text-sm font-medium text-muted-foreground">Total Users</p><p className="text-3xl font-bold">{metrics.totalUsers}</p></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card shadow-lg bg-primary/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <Star className="h-8 w-8 text-yellow-500" />
                                <div><p className="text-sm font-medium text-muted-foreground">Active Mentors</p><p className="text-3xl font-bold">{metrics.totalMentors}</p></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* --- 2. Global Filters & Actions --- */}
                <Card className="glass-card p-6 shadow-lg">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search Input */}
                        <div className="relative flex-1 w-full md:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full"
                            />
                        </div>

                        {/* Role Filter */}
                        <Select value={filterRole} onValueChange={setFilterRole}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Filter by Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Roles ({users.length})</SelectItem>
                                <SelectItem value="Admin">All Admins ({metrics.totalAdmins})</SelectItem>
                                <SelectItem value="Super Admin">Super Admin</SelectItem>
                                <SelectItem value="Event Admin">Event Admin</SelectItem>
                                <SelectItem value="Fundraising Admin">Fundraising Admin</SelectItem>
                                <SelectItem value="Mentor">Active Mentors ({metrics.totalMentors})</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Bulk Action Button (Styled with Primary Gradient) */}
                        <Button style={primaryGradientStyle} className="w-full md:w-auto">
                            Bulk Actions / Import <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </Card>

                {/* --- 3. User Management Table --- */}
                <Card className="glass-card shadow-2xl p-0 overflow-hidden">
                    <div className="w-full">
                        <div className="grid grid-cols-10 p-4 font-semibold border-b border-primary/20 bg-primary/10 text-primary">
                            <span className="col-span-3">User & Title</span>
                            <span className="col-span-1 text-center">Mentor</span>
                            <span className="col-span-3">Administrative Role</span>
                            <span className="col-span-1 text-center">Status</span>
                            <span className="col-span-2 text-right">Actions</span>
                        </div>

                        <div className="divide-y divide-primary/10">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="grid grid-cols-10 items-center p-4 hover:bg-primary/5 transition-colors">
                                    
                                    {/* User Info */}
                                    <div className="col-span-3 flex items-center space-x-3">
                                        <Avatar><AvatarFallback className="bg-primary/20 text-primary">{user.name[0]}</AvatarFallback></Avatar>
                                        <div>
                                            <p className="font-medium text-foreground">{user.name}</p>
                                            {/* Accessing the now-present 'company' field */}
                                            <p className="text-xs text-muted-foreground truncate">{user.currentTitle} at {user.company}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Mentor Toggle */}
                                    <div className="col-span-1 flex justify-center">
                                        <Switch
                                            checked={user.isMentor}
                                            onCheckedChange={(checked) => handleMentorToggle(user.id, checked)}
                                            style={user.isMentor ? { backgroundColor: '#4ade80' } : {}} // Using a visible color for ON state
                                        />
                                    </div>

                                    {/* Admin Role Selector */}
                                    <div className="col-span-3">
                                        <Select
                                            value={user.adminRole}
                                            onValueChange={(newRole) => handleRoleChange(user.id, newRole as UserRow['adminRole'])}
                                        >
                                            <SelectTrigger className="h-8 text-xs font-medium w-[150px] bg-background">
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
                                    
                                    {/* Status */}
                                    <div className="col-span-1 text-center">
                                        <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className={user.status === 'Active' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
                                            {user.status}
                                        </Badge>
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-2 flex justify-end space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => console.log('Reset Password triggered')}>
                                            <Lock className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => console.log('Delete Account triggered')}>
                                            <Trash2 className="h-4 w-4 text-red-400" />
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
            </div>
        </div>
    );
};

export default RoleManager;