"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
// UI Imports (Shadcn UI assumed)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    Users, Loader2
} from 'lucide-react';

// Firestore Imports
import { db } from "@/firebase";
import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    updateDoc,
    addDoc,
    Timestamp,
    QueryDocumentSnapshot,
} from "firebase/firestore";

// --- TYPE DEFINITIONS ---

interface Campaign {
    id: string;
    title: string;
    description: string;
    category: string;
    organizer: string;
    organizerAvatar: string;
    goal: number;
    raised: number;
    donors: number; // Aggregated unique donor count
    ends: Timestamp; 
    starts: Timestamp; 
    image: string;
    isFeatured: boolean;
    isUrgent: boolean;
    updates: number;
}

interface EditableCampaign extends Campaign {
    endDateString: string; 
    startDateString: string;
    status: 'Active' | 'Complete' | 'Draft' | 'Upcoming'; 
}

interface CampaignFormState extends Omit<Campaign, 'id' | 'ends' | 'starts'> {
    id?: string;
    endDateString: string; 
    startDateString: string;
    status: 'Active' | 'Complete' | 'Draft' | 'Upcoming';
}

// --- CORE COMPONENT ---

const FundManager = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [campaignToEdit, setCampaignToEdit] = useState<EditableCampaign | null>(null);
    const [campaignToMessage, setCampaignToMessage] = useState<Campaign | null>(null);
    const [totalDonationsRaised, setTotalDonationsRaised] = useState(0);

    const primaryGradientStyle = {
        background: 'linear-gradient(90deg, #9333ea 0%, #d946ef 100%)',
        color: 'white',
        fontWeight: '600',
    };

    // --- FIRESTORE DATA FETCHING & AGGREGATION ---

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const [campaignsSnapshot, donationsSnapshot] = await Promise.all([
                getDocs(collection(db, "fundraising_campaigns")),
                getDocs(collection(db, "fundraising_donations")),
            ]);

            // 1. Calculate Total Donations Raised
            const totalRaised = donationsSnapshot.docs.reduce((sum, doc) => {
                return sum + (doc.data().amount || 0); 
            }, 0);
            setTotalDonationsRaised(totalRaised);

            // 2. Aggregate UNIQUE Donors using campaignId and userId (CORRECTED LOGIC)
            const uniqueDonorsByCampaign = new Map<string, Set<string>>();

            donationsSnapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
                const data = doc.data();
                // 💡 Correctly reads static fields from the donation document
                const campaignId = data.campaignId as string; 
                const userId = data.userId as string; 

                if (campaignId && userId) {
                    if (!uniqueDonorsByCampaign.has(campaignId)) {
                        uniqueDonorsByCampaign.set(campaignId, new Set());
                    }
                    // Add the unique user ID to the set for the campaign matching campaignId
                    uniqueDonorsByCampaign.get(campaignId)!.add(userId); 
                }
            });

            // 3. Process Campaigns and overwrite the 'donors' count
            const fetchedCampaigns = campaignsSnapshot.docs.map(doc => {
                const data = doc.data();
                const campaignId = doc.id;
                
                // Retrieve the calculated count (size of the Set)
                const uniqueDonorCount = uniqueDonorsByCampaign.get(campaignId)?.size || 0;
                
                return {
                    id: campaignId,
                    ...data,
                    donors: uniqueDonorCount, // Overwritten with the correct count
                };
            }) as Campaign[];

            setCampaigns(fetchedCampaigns);

        } catch (error) {
            console.error("Error fetching fundraising data:", error);
            setCampaigns([]);
            setTotalDonationsRaised(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // --- LOGIC: Metrics & Formatting (Unchanged) ---

    const metrics = useMemo(() => {
        const totalGoal = campaigns.reduce((sum, c) => sum + c.goal, 0);
        const now = new Date();
        
        const activeCampaigns = campaigns.filter(c => 
            c.starts.toDate() <= now && c.ends.toDate() > now && c.raised < c.goal
        ).length;
        
        return { 
            totalRaised: totalDonationsRaised, 
            totalGoal, 
            activeCampaigns: activeCampaigns
        };
    }, [campaigns, totalDonationsRaised]);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
    };

    const getProgress = (raised: number, goal: number) => Math.min(100, Math.round((raised / goal) * 100));

    // --- LOGIC: Campaign Handlers (CRUD) ---

    const handleSaveCampaign = async (data: CampaignFormState) => {
        setLoading(true);
        try {
            const startDate = new Date(data.startDateString);
            const endDate = new Date(data.endDateString);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error("Invalid start or end date.");
            }
            
            // NOTE: We rely on the next fetchAllData() call to update the 'donors' field accurately.
            // We just write the current data to Firestore.

            // --- Prepare Base Data for Firestore Write ---
            const baseData = {
                title: data.title,
                description: data.description,
                category: data.category,
                organizer: data.organizer,
                organizerAvatar: data.organizerAvatar,
                goal: data.goal,
                image: data.image,
                isFeatured: data.isFeatured,
                isUrgent: data.isUrgent,
                updates: data.updates,
                starts: Timestamp.fromDate(startDate),
                ends: Timestamp.fromDate(endDate),
                raised: data.raised ?? 0,
                // We keep the provided 'donors' value or 0, which will be corrected on fetchAllData()
                donors: data.donors ?? 0, 
            };

            if (data.id) {
                // UPDATE
                const campaignRef = doc(db, "fundraising_campaigns", data.id);
                await updateDoc(campaignRef, baseData);
                alert(`Campaign "${data.title}" updated successfully!`);
            } else {
                // CREATE
                await addDoc(collection(db, "fundraising_campaigns"), baseData);
                alert(`Campaign "${data.title}" created successfully!`);
            }

            await fetchAllData(); 
            setIsFormOpen(false);
            setCampaignToEdit(null);
        } catch (error) {
            console.error("Error saving campaign:", error);
            alert(`Failed to save campaign. Error: ${error instanceof Error ? error.message : 'Unknown'}`);
            setLoading(false);
        }
    };

    const handleDeleteCampaign = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete the campaign: "${title}"? This cannot be undone.`)) {
            return;
        }

        setLoading(true);
        try {
            await deleteDoc(doc(db, "fundraising_campaigns", id));
            await fetchAllData();
            alert(`Campaign "${title}" deleted successfully.`);
        } catch (error) {
            console.error("Error deleting campaign:", error);
            alert("Failed to delete campaign. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEdit = (campaign: Campaign) => {
        const now = new Date();
        let status: EditableCampaign['status'];
        
        if (campaign.ends.toDate() < now) {
            status = 'Complete';
        } else if (campaign.starts.toDate() > now) {
            status = 'Upcoming';
        } else {
            status = 'Active';
        }

        setCampaignToEdit({
            ...campaign,
            startDateString: campaign.starts.toDate().toISOString().split('T')[0],
            endDateString: campaign.ends.toDate().toISOString().split('T')[0],
            status: status
        });
        setIsFormOpen(true);
    };

    const handleOpenMessageModal = (campaign: Campaign) => {
        setCampaignToMessage(campaign);
        setIsEmailModalOpen(true);
    };

    const handleSendDonorEmail = (subject: string, body: string) => {
        if (campaignToMessage) {
            console.log(`Sending update to ${campaignToMessage.donors} donors of: ${campaignToMessage.title}`);
            setIsEmailModalOpen(false);
            setCampaignToMessage(null);
            alert(`Email queued for ${campaignToMessage.donors} donors!`);
        }
    };

    // ------------------ MODAL COMPONENTS (Unchanged) ------------------

    const CampaignFormModal = () => {
        const initialDraft: CampaignFormState = {
            id: campaignToEdit?.id,
            title: campaignToEdit?.title || '',
            description: campaignToEdit?.description || '',
            category: campaignToEdit?.category || 'General',
            organizer: campaignToEdit?.organizer || 'Alumni Association',
            organizerAvatar: campaignToEdit?.organizerAvatar || '/placeholder-avatar.jpg',
            image: campaignToEdit?.image || '/placeholder-campaign.jpg',
            goal: campaignToEdit?.goal || 100000,
            raised: campaignToEdit?.raised || 0,
            donors: campaignToEdit?.donors || 0,
            updates: campaignToEdit?.updates || 0,
            isFeatured: campaignToEdit?.isFeatured || false,
            isUrgent: campaignToEdit?.isUrgent || false,
            endDateString: campaignToEdit?.endDateString || '', 
            startDateString: campaignToEdit?.startDateString || '',
            status: campaignToEdit?.status || 'Draft',
        };

        const [formData, setFormData] = useState<CampaignFormState>(initialDraft);
        const [isSubmitting, setIsSubmitting] = useState(false);
        const isEditing = !!campaignToEdit;

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!formData.title || !formData.goal || !formData.endDateString || !formData.startDateString || !formData.category) {
                alert("Please fill all required fields.");
                return;
            }
            
            setIsSubmitting(true);
            await handleSaveCampaign(formData);
            setIsSubmitting(false);
        };

        const handleFormChange = (field: keyof CampaignFormState, value: string | number | boolean) => {
            if (field === 'goal' || field === 'raised' || field === 'donors' || field === 'updates') {
                 value = Number(value);
            }
            setFormData(p => ({ ...p, [field]: value }));
        };

        return (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-primary">{isEditing ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
                        <DialogDescription>Define the goal, title, and timeline for your fundraising initiative.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="space-y-2"><Label htmlFor="title">Campaign Title*</Label><Input id="title" value={formData.title} onChange={(e) => handleFormChange('title', e.target.value)} required /></div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label htmlFor="goal">Goal Amount (₹)*</Label><Input id="goal" type="number" value={formData.goal} onChange={(e) => handleFormChange('goal', e.target.value)} required min={100} /></div>
                            <div className="space-y-2"><Label htmlFor="category">Category*</Label><Input id="category" value={formData.category} onChange={(e) => handleFormChange('category', e.target.value)} required /></div>
                        </div>

                        <div className="space-y-2"><Label htmlFor="description">Short Description*</Label><Textarea id="description" value={formData.description} onChange={(e) => handleFormChange('description', e.target.value)} required rows={2} /></div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label htmlFor="startDate">Start Date*</Label><Input id="startDate" type="date" value={formData.startDateString} onChange={(e) => handleFormChange('startDateString', e.target.value)} required /></div>
                            <div className="space-y-2"><Label htmlFor="endDate">End Date*</Label><Input id="endDate" type="date" value={formData.endDateString} onChange={(e) => handleFormChange('endDateString', e.target.value)} required /></div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(v) => handleFormChange('status', v as CampaignFormState['status'])}>
                                <SelectTrigger><SelectValue placeholder="Set Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active (Visible)</SelectItem>
                                    <SelectItem value="Draft">Draft (Invisible)</SelectItem>
                                    <SelectItem value="Complete">Complete (Closed)</SelectItem>
                                    <SelectItem value="Upcoming">Upcoming (Schedule)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <Button type="submit" style={primaryGradientStyle} disabled={isSubmitting} className="mt-4">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
                            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="ml-2 h-4 w-4" />}
                            {isSending ? 'Sending...' : `Send to ${campaignToMessage.donors} Donors`}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        );
    };

    // ------------------ MAIN RENDER ------------------
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="ml-3 text-lg text-muted-foreground">Loading fundraising data...</p>
            </div>
        );
    }

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
                    {/* Total Raised */}
                    <Card className="glass-card shadow-lg bg-primary/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <DollarSign className="h-8 w-8 text-green-500" />
                                <div><p className="text-sm font-medium text-muted-foreground">Total Raised (All Time)</p><p className="text-3xl font-bold text-green-400">{formatCurrency(metrics.totalRaised)}</p></div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Active Campaigns */}
                    <Card className="glass-card shadow-lg bg-primary/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <Goal className="h-8 w-8 text-primary" />
                                <div><p className="text-sm font-medium text-muted-foreground">Active Campaigns</p><p className="text-3xl font-bold">{metrics.activeCampaigns}</p></div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Total Goal */}
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
                            All Campaigns ({campaigns.length})
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0 divide-y divide-primary/10">
                        {campaigns.map((campaign) => {
                            const progressValue = getProgress(campaign.raised, campaign.goal);
                            const now = new Date();
                            
                            // Determine status for display
                            let status: 'Complete' | 'Upcoming' | 'Active' | 'Draft' = 'Draft';
                            if (campaign.ends.toDate() < now) {
                                status = 'Complete';
                            } else if (campaign.starts.toDate() > now) {
                                status = 'Upcoming';
                            } else {
                                status = 'Active';
                            }

                            return (
                                <div key={campaign.id} className="p-4 hover:bg-primary/5 transition-colors">
                                    <div className="flex justify-between items-start">
                                        
                                        {/* Campaign Details & Progress */}
                                        <div className="space-y-2 w-3/5">
                                            <div className="flex items-center gap-3">
                                                <Badge className={status === 'Active' ? 'bg-green-600' : status === 'Upcoming' ? 'bg-yellow-600' : 'bg-red-600'}>
                                                    {status}
                                                </Badge>
                                                <h3 className="font-bold text-xl text-foreground">{campaign.title}</h3>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
                                            
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <p>{formatCurrency(campaign.raised)} raised</p>
                                                <span>/</span>
                                                <p>{formatCurrency(campaign.goal)} goal</p>
                                            </div>
                                            
                                            <Progress 
                                                value={progressValue} 
                                                className="h-2 w-full"
                                            />
                                        </div>

                                        {/* Stats and Actions */}
                                        <div className="flex flex-col items-end space-y-2 min-w-[200px]">
                                            <div className="flex gap-4 text-sm font-medium">
                                                <p className="text-muted-foreground flex items-center">
                                                    <Clock className="h-4 w-4 mr-1" /> Ends: {campaign.ends.toDate().toLocaleDateString()}
                                                </p>
                                                <p className="text-primary flex items-center">
                                                    <Users className="h-4 w-4 mr-1" /> {campaign.donors} Donors
                                                </p>
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
                            );
                        })}

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