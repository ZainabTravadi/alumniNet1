import React, { useState } from 'react';
// UI Imports (Shadcn UI assumed)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator'; // Assuming you have a separator component
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Settings, Shield, Globe, Users, Database, Zap, Code, Mail, Lock, DollarSign
} from 'lucide-react';

// --- CONSTANTS ---
type SettingTab = 'general' | 'roles' | 'integrations' | 'security';

// --- DUMMY DATA ---
const INITIAL_SETTINGS = {
    siteStatus: true,
    maintenanceMessage: 'AlumniNet is undergoing scheduled maintenance.',
    siteName: 'AlumniNet',
};

const ROLE_PERMISSIONS = {
    'Super Admin': ['All System Access', 'Manage All Users', 'Define Roles'],
    'Event Admin': ['Create/Edit/Delete Events', 'Email Event Attendees'],
    'Fundraising Admin': ['Create/Edit Campaigns', 'View Donor Reports', 'Message Donors'],
    'Mentor': ['Accept/Decline Mentorship Requests', 'View Mentee Profiles'],
    'Default User': ['View Directory', 'RSVP to Events', 'Donate'],
};

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState<SettingTab>('general');
    const [settings, setSettings] = useState(INITIAL_SETTINGS);
    const [isSaving, setIsSaving] = useState(false);

    // Custom style for the primary gradient button (Vibrant Dark Purple/Indigo theme)
    const primaryGradientStyle = {
        background: 'linear-gradient(90deg, #9333ea 0%, #d946ef 100%)', // Primary Gradient
        color: 'white',
        fontWeight: '600',
    };

    // --- LOGIC: Handlers ---

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call to save settings
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Settings saved:", settings);
        setIsSaving(false);
        alert("System settings updated successfully!");
    };

    const handleDataAction = (action: string) => {
        if (window.confirm(`Are you sure you want to proceed with: ${action}?`)) {
            alert(`Simulating system ${action}...`);
            // In a real app, this triggers a backend job.
        }
    };

    // --- RENDER ---

    return (
        <div className="min-h-screen p-6 text-foreground bg-background"> 
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center pt-4 border-b border-primary/20 pb-4">
                <h1 className="text-5xl font-extrabold flex items-center">
  <span className="text-white">Admin&nbsp;</span>
  <span
    className="bg-gradient-to-r from-purple-600 via-purple-500 to-white bg-clip-text text-transparent"
  >
    Settings
  </span>
</h1> </div>

                
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingTab)} orientation="vertical" className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
                    
                    {/* Sidebar Tabs List */}
                    <TabsList className="flex flex-row lg:flex-col lg:w-48 h-auto bg-primary/10 p-2 rounded-lg shadow-lg">
                        <TabsTrigger value="general" className="w-full justify-start"><Globe className="mr-2 h-4 w-4" /> General</TabsTrigger>
                        <TabsTrigger value="roles" className="w-full justify-start"><Shield className="mr-2 h-4 w-4" /> Role Definitions</TabsTrigger>
                        <TabsTrigger value="integrations" className="w-full justify-start"><Zap className="mr-2 h-4 w-4" /> Integrations</TabsTrigger>
                        <TabsTrigger value="security" className="w-full justify-start"><Lock className="mr-2 h-4 w-4" /> Security & Data</TabsTrigger>
                    </TabsList>

                    {/* Content Area */}
                    <div className="flex-1">
                        
                        {/* --- 1. General Settings Tab --- */}
                        <TabsContent value="general">
                            <Card className="glass-card p-6 shadow-2xl">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-primary">General Configuration</CardTitle>
                                    <CardDescription>Control primary site status and branding elements.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSaveSettings} className="space-y-6">
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="siteName">Site Name / Branding</Label>
                                            <Input id="siteName" value={settings.siteName} onChange={(e) => setSettings(p => ({ ...p, siteName: e.target.value }))} />
                                        </div>

                                        <Separator className="bg-primary/20" />

                                        <div className="flex items-center justify-between p-3 border border-red-500/30 bg-red-500/5 rounded-lg">
                                            <div className="space-y-1">
                                                <Label htmlFor="siteStatus" className="text-lg font-semibold">Site Status</Label>
                                                <p className="text-sm text-muted-foreground">Toggle the entire site online or put it into maintenance mode.</p>
                                            </div>
                                            <Switch
                                                checked={settings.siteStatus}
                                                onCheckedChange={(checked) => setSettings(p => ({ ...p, siteStatus: checked }))}
                                            />
                                        </div>
                                        
                                        {!settings.siteStatus && (
                                            <div className="space-y-2">
                                                <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                                                <Textarea id="maintenanceMessage" value={settings.maintenanceMessage} onChange={(e) => setSettings(p => ({ ...p, maintenanceMessage: e.target.value }))} rows={3} />
                                            </div>
                                        )}

                                        <Button type="submit" style={primaryGradientStyle} className="mt-6 w-full" disabled={isSaving}>
                                            {isSaving ? 'Saving...' : 'Save General Settings'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        
                        {/* --- 2. Role Definitions Tab --- */}
                        <TabsContent value="roles">
                            <Card className="glass-card p-6 shadow-2xl">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-primary">Role Permissions Audit</CardTitle>
                                    <CardDescription>View the core capabilities assigned to each user role (read-only).</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => (
                                        <div key={role} className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                                            <h4 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-2">
                                                <Users className="h-5 w-5" /> {role}
                                            </h4>
                                            <ul className="list-disc list-inside text-sm text-muted-foreground ml-4 space-y-1">
                                                {permissions.map((perm, index) => (
                                                    <li key={index}>{perm}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                    <p className="text-xs text-red-400 mt-4">Note: Role modification must be done via the User Management panel for safety.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* --- 3. Integrations Tab --- */}
                        <TabsContent value="integrations">
                            <Card className="glass-card p-6 shadow-2xl">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-primary">External Integrations (API Keys)</CardTitle>
                                    <CardDescription>Manage keys and endpoints for essential external services.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    
                                    <div className="border border-primary/20 rounded-lg p-4 space-y-4">
                                        <h4 className="font-semibold flex items-center gap-2"><Mail className="h-5 w-5 text-yellow-500" /> Email/Notification Service</h4>
                                        <div className="space-y-2">
                                            <Label htmlFor="mailApiKey">Mail Service API Key</Label>
                                            <Input id="mailApiKey" type="password" defaultValue="************************kjasd" />
                                        </div>
                                        <Button variant="outline" className="w-full">Test Connection</Button>
                                    </div>
                                    
                                    <div className="border border-primary/20 rounded-lg p-4 space-y-4">
                                        <h4 className="font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5 text-green-500" /> Payment Gateway (Fundraising)</h4>
                                        <div className="space-y-2">
                                            <Label htmlFor="paymentKey">Payment Gateway Secret Key</Label>
                                            <Input id="paymentKey" type="password" defaultValue="************************934j" />
                                        </div>
                                        <Button variant="outline" className="w-full">Sync with Gateway</Button>
                                    </div>

                                </CardContent>
                            </Card>
                        </TabsContent>
                        
                        {/* --- 4. Security & Data Tab --- */}
                        <TabsContent value="security">
                            <Card className="glass-card p-6 shadow-2xl">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-primary">Security and Data Management</CardTitle>
                                    <CardDescription>Critical operations for system health and data integrity.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    
                                    {/* Data Backup */}
                                    <div className="space-y-4 p-4 border border-blue-500/30 bg-blue-500/5 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2"><Database className="h-5 w-5 text-blue-500" /> Database Backup</h4>
                                        <p className="text-sm text-muted-foreground">Execute a manual full backup of all user and campaign data to secure storage.</p>
                                        <Button onClick={() => handleDataAction('Manual Backup')} style={primaryGradientStyle} className="w-full">
                                            Run Full Backup Now
                                        </Button>
                                    </div>

                                    {/* System Logs */}
                                    <div className="space-y-4 p-4 border border-gray-500/30 bg-gray-500/5 rounded-lg">
                                        <h4 className="font-semibold flex items-center gap-2"><Code className="h-5 w-5 text-gray-400" /> View System Audit Logs</h4>
                                        <p className="text-sm text-muted-foreground">Access detailed logs of all administrative actions, changes, and errors.</p>
                                        <Button variant="outline" className="w-full">
                                            Open Audit Log Viewer
                                        </Button>
                                    </div>

                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminSettings;