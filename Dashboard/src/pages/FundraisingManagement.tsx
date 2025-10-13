import React, { useState, useMemo, useCallback } from 'react';
// UI Imports (Shadcn UI assumed)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import {
    DollarSign, Goal, TrendingUp, PlusCircle, Clock, Send, Trash2, Edit,
    Users 
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface Campaign {
    id: string;
    title: string;
    goal: number;
    raised: number;
    donors: number;
    status: 'Active' | 'Complete' | 'Draft';
    endDate: string; // Date string
}

// 💡 FIX 1: Define the type that represents the form's mutable state.
// We make 'id' optional for new campaigns, but include all required properties 
// of a new or edited campaign draft.
type CampaignFormState = {
    id?: string; // Optional for new campaigns
    title: string;
    goal: number;
    status: 'Active' | 'Complete' | 'Draft';
    endDate: string;
    // Include optional existing data fields if editing
    raised?: number;
    donors?: number;
};

// --- DUMMY DATA ---
const DUMMY_CAMPAIGNS: Campaign[] = [
    { id: 'c1', title: 'Scholarship Fund 2026', goal: 500000, raised: 350000, donors: 125, status: 'Active', endDate: '2026-03-31' },
    { id: 'c2', title: 'Innovation Hub Upgrade', goal: 100000, raised: 105000, donors: 80, status: 'Complete', endDate: '2025-12-31' },
    { id: 'c3', title: 'Alumni Mentorship Tech', goal: 50000, raised: 12000, donors: 40, status: 'Active', endDate: '22026-06-30' },
    { id: 'c4', title: 'Emergency Aid Fund', goal: 20000, raised: 18000, donors: 25, status: 'Draft', endDate: '2026-01-15' },
];

const FundManager = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>(DUMMY_CAMPAIGNS);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [campaignToEdit, setCampaignToEdit] = useState<Campaign | null>(null);
    const [campaignToMessage, setCampaignToMessage] = useState<Campaign | null>(null);

    // Custom style for the primary gradient button (Vibrant Dark Purple/Indigo theme)
    const primaryGradientStyle = {
        background: 'linear-gradient(90deg, #9333ea 0%, #d946ef 100%)', // Primary Gradient
        color: 'white',
        fontWeight: '600',
    };

    // --- LOGIC: Metrics & Formatting ---

    const metrics = useMemo(() => {
        const totalRaised = campaigns.reduce((sum, c) => sum + c.raised, 0);
        const totalGoal = campaigns.reduce((sum, c) => sum + c.goal, 0);
        const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
        return { totalRaised, totalGoal, activeCampaigns };
    }, [campaigns]);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
    };

    const getProgress = (raised: number, goal: number) => Math.min(100, Math.round((raised / goal) * 100));

    // --- LOGIC: Campaign Handlers ---

    // 💡 FIX 2: Update the function signature to correctly handle the CampaignFormState input.
    const handleSaveCampaign = (data: CampaignFormState) => {
        // Ensure all mandatory fields for the final Campaign type are present
        const baseCampaign: Campaign = {
            id: data.id || 'c' + Date.now(),
            title: data.title || '',
            goal: data.goal || 0,
            endDate: data.endDate || '',
            status: data.status || 'Draft',
            raised: data.raised ?? (data.id ? campaigns.find(c => c.id === data.id)?.raised || 0 : 0),
            donors: data.donors ?? (data.id ? campaigns.find(c => c.id === data.id)?.donors || 0 : 0),
        };

        if (data.id) {
            // Edit existing
            setCampaigns(prev => prev.map(c => c.id === data.id ? baseCampaign : c));
        } else {
            // Add new
            setCampaigns(prev => [...prev, baseCampaign]);
        }
        setIsFormOpen(false);
        setCampaignToEdit(null);
    };

    const handleDeleteCampaign = (id: string, title: string) => {
        if (window.confirm(`Are you sure you want to delete the campaign: "${title}"?`)) {
            setCampaigns(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleOpenEdit = (campaign: Campaign) => {
        setCampaignToEdit(campaign);
        setIsFormOpen(true);
    };

    // --- LOGIC: Messaging Handlers (Rest of these remain unchanged) ---

    const handleOpenMessageModal = (campaign: Campaign) => {
        setCampaignToMessage(campaign);
        setIsEmailModalOpen(true);
    };

    const handleSendDonorEmail = (subject: string, body: string) => {
        if (campaignToMessage) {
            console.log(`Sending update to ${campaignToMessage.donors} donors of: ${campaignToMessage.title}`);
            // API call to mail service goes here
            setIsEmailModalOpen(false);
            setCampaignToMessage(null);
            alert(`Email queued for ${campaignToMessage.donors} donors!`);
        }
    };

    // ------------------ MODAL COMPONENTS ------------------

    const CampaignFormModal = () => {
        // 💡 FIX 3: Initialize state correctly using a fully defined initial draft object.
        const initialDraft: CampaignFormState = { 
            id: undefined, // Explicitly undefined for new campaigns
            title: '', goal: 0, endDate: '', 
            status: 'Draft', raised: 0, donors: 0 
        };
        const [formData, setFormData] = useState<CampaignFormState>(campaignToEdit || initialDraft);
        
        const isEditing = !!campaignToEdit;

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            // Perform basic validation before saving (optional, but good practice)
            if (!formData.title || !formData.goal || !formData.endDate || !formData.status) {
                alert("Please fill all required fields.");
                return;
            }
            
            handleSaveCampaign(formData);
        };

        // Ensures form change handler handles all string/number inputs correctly
        const handleFormChange = (field: keyof CampaignFormState, value: string | number) => {
            setFormData(p => ({ ...p, [field]: value }));
        };

        return (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-primary">{isEditing ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
                        <DialogDescription>Define the goal, title, and timeline for your fundraising initiative.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="space-y-2"><Label htmlFor="title">Campaign Title*</Label><Input id="title" value={formData.title} onChange={(e) => handleFormChange('title', e.target.value)} required /></div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label htmlFor="goal">Goal Amount (₹)*</Label><Input id="goal" type="number" value={formData.goal} onChange={(e) => handleFormChange('goal', Number(e.target.value))} required min={100} /></div>
                            <div className="space-y-2"><Label htmlFor="endDate">End Date*</Label><Input id="endDate" placeholder="YYYY-MM-DD" value={formData.endDate} onChange={(e) => handleFormChange('endDate', e.target.value)} required /></div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(v) => handleFormChange('status', v as CampaignFormState['status'])}>
                                <SelectTrigger><SelectValue placeholder="Set Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active (Visible)</SelectItem>
                                    <SelectItem value="Draft">Draft (Invisible)</SelectItem>
                                    <SelectItem value="Complete">Complete (Closed)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <Button type="submit" style={primaryGradientStyle} className="mt-4">
                            {isEditing ? 'Save Changes' : 'Create Campaign'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        );
    };

    const DonorMessageModal = () => {
        const [subject, setSubject] = useState(`Update: ${campaignToMessage?.title || ''}`);
        const [body, setBody] = useState('');
        const [isSending, setIsSending] = useState(false);

        if (!campaignToMessage) return null;

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!subject || !body) {
                alert("Subject and message body are required.");
                return;
            }
            setIsSending(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            handleSendDonorEmail(subject, body);
            setIsSending(false);
        };

        return (
            <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-primary">Message Donors: {campaignToMessage.title}</DialogTitle>
                        <DialogDescription>Send an update, thank you, or final push email to {campaignToMessage.donors} donors.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="space-y-2"><Label htmlFor="subject">Subject</Label><Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required /></div>
                        <div className="space-y-2"><Label htmlFor="body">Message Body</Label><Textarea id="body" placeholder="Type your message here..." value={body} onChange={(e) => setBody(e.target.value)} required rows={8} /></div>
                        
                        <Button type="submit" disabled={isSending} style={primaryGradientStyle} className="mt-4">
                            {isSending ? 'Sending...' : `Send to ${campaignToMessage.donors} Donors`} <Send className="ml-2 h-4 w-4" />
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        );
    };

    // ------------------ MAIN RENDER ------------------

    return (
        <div className="min-h-screen p-6 text-foreground bg-background"> 
            <div className="max-w-7xl mx-auto space-y-8">
                
                <div className="flex justify-between items-center pt-4 border-b border-primary/20 pb-4">
                    <h1 className="text-5xl font-extrabold flex items-center">
  <span className="text-white">Fundraising&nbsp;</span>
  <span
    className="bg-gradient-to-r from-purple-600 via-purple-500 to-white bg-clip-text text-transparent"
  >
    Management
  </span>
</h1>
                    <Button onClick={() => { setCampaignToEdit(null); setIsFormOpen(true); }} style={primaryGradientStyle}>
                        <PlusCircle className="mr-2 h-4 w-4" /> New Campaign
                    </Button>
                </div>
                
                {/* Campaign Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="glass-card shadow-lg bg-primary/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <DollarSign className="h-8 w-8 text-green-500" />
                                <div><p className="text-sm font-medium text-muted-foreground">Total Raised (All Time)</p><p className="text-3xl font-bold text-green-400">{formatCurrency(metrics.totalRaised)}</p></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card shadow-lg bg-primary/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <Goal className="h-8 w-8 text-primary" />
                                <div><p className="text-sm font-medium text-muted-foreground">Active Campaigns</p><p className="text-3xl font-bold">{metrics.activeCampaigns}</p></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="glass-card shadow-lg bg-primary/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <TrendingUp className="h-8 w-8 text-yellow-500" />
                                <div><p className="text-sm font-medium text-muted-foreground">Total Goal</p><p className="text-3xl font-bold">{formatCurrency(metrics.totalGoal)}</p></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Campaign Management Table */}
                <Card className="glass-card shadow-2xl p-0 overflow-hidden">
                    <CardHeader className="border-b border-primary/20 bg-primary/10">
                        <CardTitle className="text-lg font-semibold text-primary">
                            Active & Upcoming Campaigns ({campaigns.length})
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0 divide-y divide-primary/10">
                        {campaigns.map((campaign) => (
                            <div key={campaign.id} className="p-4 hover:bg-primary/5 transition-colors">
                                <div className="flex justify-between items-start">
                                    
                                    {/* Campaign Details & Progress */}
                                    <div className="space-y-2 w-3/5">
                                        <div className="flex items-center gap-3">
                                            <Badge className={campaign.status === 'Active' ? 'bg-green-600' : campaign.status === 'Draft' ? 'bg-gray-500' : 'bg-red-600'}>
                                                {campaign.status}
                                            </Badge>
                                            <h3 className="font-bold text-xl text-foreground">{campaign.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <p>{formatCurrency(campaign.raised)} raised</p>
                                            <span>/</span>
                                            <p>{formatCurrency(campaign.goal)} goal</p>
                                        </div>
                                        
                                        <Progress 
                                            value={getProgress(campaign.raised, campaign.goal)} 
                                            className="h-2 w-full"
                                            // Progress component needs to be styled to match the purple gradient in your main app's CSS
                                        />
                                    </div>

                                    {/* Stats and Actions */}
                                    <div className="flex flex-col items-end space-y-2 min-w-[200px]">
                                        <div className="flex gap-4 text-sm font-medium">
                                            <p className="text-muted-foreground flex items-center"><Clock className="h-4 w-4 mr-1" /> Ends: {campaign.endDate}</p>
                                            <p className="text-primary flex items-center"><Users className="h-4 w-4 mr-1" /> {campaign.donors} Donors</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenMessageModal(campaign)} title="Email Donors">
                                                <Send className="h-4 w-4 mr-1" /> Message
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(campaign)} title="Edit Campaign">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteCampaign(campaign.id, campaign.title)} title="Delete Campaign">
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {campaigns.length === 0 && (
                            <p className="text-center p-6 text-muted-foreground">No campaigns currently set up.</p>
                        )}
                    </CardContent>
                </Card>

            </div>
            
            {/* Render Modals */}
            {isFormOpen && <CampaignFormModal />}
            {isEmailModalOpen && <DonorMessageModal />}
        </div>
    );
};

export default FundManager;