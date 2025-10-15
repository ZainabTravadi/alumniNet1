import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
    DollarSign, Heart, Target, Users, Award, TrendingUp, Search, CreditCard, 
    CheckCircle, Gift, Loader2, ArrowLeft,
    // Import additional Lucide icons to use as placeholders for brands
    IndianRupee, Zap, Wallet, QrCode
} from 'lucide-react';
import { auth } from "@/firebase"; 

// ------------------ 💡 INTERFACE DEFINITIONS ------------------
interface Campaign {
    id: number | string; title: string; description: string; category: string;
    goal: number; raised: number; donors: number; daysLeft: number;
    organizer: string; organizerAvatar: string; image: string; isFeatured: boolean;
    isUrgent: boolean; updates: number; 
    qrCode: string; // Image URL for the QR code
}
interface Donation { campaign: string; amount: number; date: string; status: string; }
interface Donor { name: string; amount: number; timeAgo: string; }

// ⚠️ UPI CONFIGURATION ⚠️
const PAYEE_VPA = 'alumnifund@ybl'; // Replace with your actual Merchant/Alumni VPA
const PAYEE_NAME = 'Alumni Trust';

// ⭐️ UPDATED: Mapping app names to Lucide icons (placeholders) ⭐️
const UPI_APPS = [
    { name: 'Google Pay', scheme: 'tez://upi/pay?', icon: Wallet }, // Wallet placeholder
    { name: 'PhonePe', scheme: 'phonepe://pay?', icon: IndianRupee }, // IndianRupee placeholder
    { name: 'Paytm', scheme: 'paytmmp://pay?', icon: Zap }, // Zap placeholder
    { name: 'Other UPI', scheme: 'upi://pay?', icon: QrCode }, // QrCode placeholder
];

// ------------------ 💡 FALLBACK DUMMY DATA (Unchanged) ------------------
const DUMMY_CAMPAIGNS: Campaign[] = [
    { id: 1, title: 'Student Emergency Fund 2024', description: 'Supporting students...', category: 'Student Support', goal: 100000, raised: 67500, donors: 234, daysLeft: 45, organizer: 'Alumni Association', organizerAvatar: '/placeholder-campaign.jpg', image: '/placeholder-campaign.jpg', isFeatured: true, isUrgent: false, updates: 8, qrCode: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=QR1'},
    { id: 2, title: 'New Engineering Lab Equipment', description: 'Upgrading our engineering facilities...', category: 'Infrastructure', goal: 250000, raised: 189750, donors: 89, daysLeft: 22, organizer: 'Engineering Department', organizerAvatar: '/placeholder-campaign.jpg', image: '/placeholder-campaign.jpg', isFeatured: false, isUrgent: true, updates: 12, qrCode: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=QR2' },
    { id: 3, title: 'Scholarship for Underrepresented Students', description: 'Creating opportunities...', category: 'Scholarships', goal: 150000, raised: 92300, donors: 156, daysLeft: 67, organizer: 'Diversity & Inclusion Committee', organizerAvatar: '/placeholder-campaign.jpg', image: '/placeholder-campaign.jpg', isFeatured: true, isUrgent: false, updates: 6, qrCode: 'https://via.placeholder.com/150/008000/FFFFFF?text=QR3' },
    { id: 5, title: 'Mental Health Support Center', description: 'Establishing a comprehensive mental health...', category: 'Health & Wellness', goal: 200000, raised: 134500, donors: 198, daysLeft: 34, organizer: 'Student Affairs', organizerAvatar: '/placeholder-campaign.jpg', image: '/placeholder-campaign.jpg', isFeatured: false, isUrgent: true, updates: 9, qrCode: 'https://via.placeholder.com/150/800080/FFFFFF?text=QR4' }
];

const DUMMY_RECENT_DONORS: Donor[] = [
    { name: 'Anonymous', amount: 5000, timeAgo: '2 hours ago' },
    { name: 'Sarah Chen', amount: 500, timeAgo: '5 hours ago' },
    { name: 'Michael R.', amount: 250, timeAgo: '8 hours ago' }
];

const DUMMY_MY_DONATIONS: Donation[] = [
    { campaign: 'Student Emergency Fund 2024', amount: 250, date: '2024-03-01', status: 'completed' },
    { campaign: 'Engineering Lab Equipment', amount: 500, date: '2024-02-15', status: 'completed' }
];


const Fundraising = () => {
    
    const donationTiers = [
        { amount: 25, label: 'Supporter', benefits: ['Thank you email', 'Campaign updates'] },
        { amount: 100, label: 'Contributor', benefits: ['Digital certificate', 'Exclusive updates', 'Tax receipt'] },
        { amount: 500, label: 'Advocate', benefits: ['All previous benefits', 'Annual report', 'Priority event invites'] },
        { amount: 1000, label: 'Champion', benefits: ['All previous benefits', 'Recognition in materials', 'Meet with organizers'] },
        { amount: 2500, label: 'Leader', benefits: ['All previous benefits', 'Naming opportunities', 'VIP event access'] }
    ];

    const [activeTab, setActiveTab] = useState('campaigns');
    const [searchTerm, setSearchTerm] = useState('');
    const [isDonateOpen, setIsDonateOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [donationAmount, setDonationAmount] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Controls the dialog view
    const [paymentStage, setPaymentStage] = useState<'amount' | 'selectApp'>('amount'); 

    // LIVE STATE
    const [campaigns, setCampaigns] = useState<Campaign[]>(DUMMY_CAMPAIGNS);
    const [recentDonors, setRecentDonors] = useState<Donor[]>(DUMMY_RECENT_DONORS);
    const [myDonations, setMyDonations] = useState<Donation[]>(DUMMY_MY_DONATIONS);

    const API_BASE_URL = import.meta.env.VITE_API_FUNDRAISING || 'http://localhost:5000/api/fundraising/data';

    // ------------------ 💡 DATA FETCHING ------------------
    useEffect(() => {
        const fetchFundraisingData = async () => {
            setIsLoading(true);
            const user = auth.currentUser;
            const userId = user ? user.uid : 'anonymous'; 

            try {
                const response = await fetch(`${API_BASE_URL}?user_id=${userId}`);
                const result = await response.json();

                let liveCampaigns: Campaign[] = DUMMY_CAMPAIGNS; 
                let liveDonors: Donor[] = DUMMY_RECENT_DONORS;
                let liveMyDonations: Donation[] = DUMMY_MY_DONATIONS;

                if (response.ok && result.data) {
                    const data = result.data;
                    
                    // Safely map campaign data and ensure 'qrCode' exists
                    liveCampaigns = (data.campaigns || []).map((c: any) => ({
                        ...c,
                        qrCode: c.qrCode || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=QR+Code+Missing', 
                    })) as Campaign[];
                    
                    liveDonors = data.recentDonors || [];
                    liveMyDonations = data.myDonations || [];
                }

                setCampaigns(liveCampaigns.length ? liveCampaigns : DUMMY_CAMPAIGNS);
                setRecentDonors(liveDonors.length ? liveDonors : DUMMY_RECENT_DONORS);
                setMyDonations(liveMyDonations.length ? liveMyDonations : DUMMY_MY_DONATIONS);

            } catch (error) {
                console.error("Network error fetching fundraising data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFundraisingData();
    }, [API_BASE_URL]);


    // ------------------ 🚀 PAYMENT LOGIC ------------------

    // Generates the UPI Deep-Link URL
    const generateUpiUrl = useCallback((amount: number, campaign: Campaign, scheme: string): string => {
        
        const transactionRefId = `ALUMNI_${campaign.id}_${Date.now()}`; 
        const campaignNote = encodeURIComponent(`Donation for: ${campaign.title}`);
        
        const baseParams = `pa=${PAYEE_VPA}&pn=${PAYEE_NAME}&tr=${transactionRefId}&am=${amount.toFixed(2)}&cu=INR&tn=${campaignNote}`;

        const separator = scheme.includes('?') ? '' : '?';
        return `${scheme}${separator}${baseParams}`;

    }, []);

    // STEP 2 Handler: Initiates the redirect after app selection
    const initiateUpiPayment = useCallback((appScheme: string) => {
        const amount = parseFloat(donationAmount);
        if (!selectedCampaign || isProcessing) return;

        setIsProcessing(true);

        const upiUrl = generateUpiUrl(amount, selectedCampaign, appScheme);

        console.log("Redirecting to UPI URL:", upiUrl);
        
        // Initiate the redirect in a new window/tab
        window.open(upiUrl, '_blank', 'noopener,noreferrer');

        // Client-side tracking for UX (stop spinner after a short delay)
        setTimeout(() => {
            setIsProcessing(false);
            setIsDonateOpen(false); // Close the selector dialog
            alert("Redirect complete. Please check your UPI app to finalize the payment.");
        }, 1500);

    }, [donationAmount, selectedCampaign, isProcessing, generateUpiUrl]);

    // STEP 1 Handler: Confirms the amount and moves to app selection
    const handleAmountConfirm = () => {
        const amount = parseFloat(donationAmount);
        if (isNaN(amount) || amount <= 0 || !selectedCampaign) {
            alert("Please enter a valid donation amount.");
            return;
        }

        // Move to the app selection stage
        setPaymentStage('selectApp');
    };


    // ------------------ UTILITIES ------------------

    const filteredCampaigns = campaigns.filter(campaign => {
        const term = searchTerm.toLowerCase();
        return (campaign.title || '').toLowerCase().includes(term) ||
               (campaign.description || '').toLowerCase().includes(term) ||
               (campaign.category || '').toLowerCase().includes(term);
    });

    const getProgressPercentage = (raised: number, goal: number) => {
        return Math.min((raised / goal) * 100, 100);
    };

    const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { // 'en-IN' locale for Indian Rupee
        style: 'currency',
        currency: 'INR', // INR currency code
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount).replace('₹', '₹'); // Ensure the symbol is present
};

    const getCategoryColor = (category: string) => {
        const colors = {
            'Student Support': 'bg-blue-100 text-blue-800', 'Infrastructure': 'bg-green-100 text-green-800',
            'Scholarships': 'bg-purple-100 text-purple-800', 'Environment': 'bg-teal-100 text-teal-800',
            'Health & Wellness': 'bg-pink-100 text-pink-800'
        };
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    // Helper function to dynamically select the icon component based on the app name
    const getAppIconComponent = (appName: string) => {
        switch (appName) {
            case 'Google Pay': return Wallet;
            case 'PhonePe': return IndianRupee; // Using Indian Rupee symbol as a unique placeholder
            case 'Paytm': return Zap;
            case 'Other UPI': return QrCode;
            default: return CreditCard;
        }
    };


    // ------------------ RENDER HELPER: DONATION DIALOG CONTENT ------------------

    const renderDonationContent = () => {
        if (!selectedCampaign) return null;

        const amount = parseFloat(donationAmount);
        const isAmountValid = !isNaN(amount) && amount > 0;
        const formattedAmount = isAmountValid ? formatCurrency(amount) : '$0';
        const confirmButtonText = isAmountValid ? `Proceed with ${formattedAmount}` : 'Enter Amount';
        const isConfirmButtonDisabled = !isAmountValid || isProcessing;
        
        // Correct access to the fetched qrCode field
        const qrCodeUrl = selectedCampaign.qrCode;


        if (paymentStage === 'amount') {
            return (
                <>
                    <DialogHeader>
                        <DialogTitle>Support {selectedCampaign.title}</DialogTitle>
                        <DialogDescription>Your contribution makes a real difference. Choose an amount below or enter a custom amount.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        {/* Quick Amount Buttons */}
                        <div className="grid grid-cols-5 gap-2">
                            {[25, 50, 100, 250, 500].map((amt) => (
                                 <Button 
    key={amt} 
    variant={donationAmount === amt.toString() ? "default" : "outline"} 
    onClick={() => setDonationAmount(amt.toString())} 
    className="text-sm">
    ₹{amt}
</Button>
                            ))}
                        </div>
                        {/* Custom Amount */}
                        <div className="space-y-2">
                            <Label htmlFor="custom-amount">Custom Amount (₹)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="custom-amount" type="number" placeholder="Enter amount (e.g., 500)" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} className="pl-10" />
                            </div>
                        </div>
                        {/* Donation Tiers Info */}
                        {isAmountValid && (
                            <div className="bg-muted/30 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Your Impact & Benefits</h4>
                                {(() => {
                                    const amount = parseInt(donationAmount);
                                    const tier = donationTiers.slice().reverse().find(t => amount >= t.amount); 
                                    if (tier) {
                                        return (
                                            <div>
                                                <Badge className="mb-2">{tier.label} Level</Badge>
                                                <ul className="text-sm text-muted-foreground space-y-1">
                                                    {tier.benefits.map((benefit, index) => (
                                                        <li key={index} className="flex items-center gap-2">
                                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                                            {benefit}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        )}
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsDonateOpen(false)}>Cancel</Button>
                            <Button 
                                onClick={handleAmountConfirm}
                                disabled={isConfirmButtonDisabled}
                                className="bg-gradient-primary hover:opacity-90"
                            >
                                {confirmButtonText}
                            </Button>
                        </div>
                    </div>
                </>
            );
        }

        if (paymentStage === 'selectApp') {
            return (
                <>
                    <DialogHeader>
                        <DialogTitle>Finalize Payment of {formattedAmount}</DialogTitle>
                        <DialogDescription>
                            Confirm payment for **{selectedCampaign.title}**. Select your preferred UPI application or scan the QR code.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        {/* 1. DESKTOP QR CODE SECTION (Minimal Size) */}
                        <Card className="p-3 border-2 border-dashed border-primary/50 text-center">
                            <CardTitle className="text-base mb-2 flex items-center justify-center gap-2">
                                <span className="text-primary">Scan to Pay</span>
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mb-3">Use any UPI app on your phone to scan this code.</p>
                            
                            <div className="w-28 h-28 bg-white p-1 border mx-auto flex items-center justify-center rounded overflow-hidden">
                                <img 
                                    src={qrCodeUrl} 
                                    alt={`QR Code for ${selectedCampaign.title}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className='text-sm font-semibold text-primary mt-3 block'>Amount: {formattedAmount}</span>
                        </Card>

                        {/* 2. MOBILE DEEP-LINK BUTTONS */}
                        <div className="pt-4 space-y-3">
                            <h3 className="font-semibold text-center text-sm text-muted-foreground">OR Tap to Open App on Mobile</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {UPI_APPS.map((app) => {
                                    const IconComponent = getAppIconComponent(app.name);
                                    return (
                                        <Button
                                            key={app.name}
                                            variant="outline"
                                            size="lg"
                                            onClick={() => initiateUpiPayment(app.scheme)}
                                            className="h-auto flex flex-col p-3 space-y-1 text-center"
                                            disabled={isProcessing}
                                        >
                                            <div className="w-8 h-8 bg-muted rounded-full mx-auto flex items-center justify-center">
                                                <IconComponent className="h-5 w-5 text-primary" />
                                            </div>
                                            <span className="font-semibold text-xs">{app.name}</span>
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between border-t pt-4">
                        <Button variant="ghost" onClick={() => setPaymentStage('amount')} disabled={isProcessing}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Change Amount
                        </Button>
                        {isProcessing && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                    </div>
                </>
            );
        }
    };


    
    
    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header & Stats (Standard) */}
                <div className="text-center space-y-4 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold">Alumni{' '}<span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">Fundraising</span></h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Support your alma mater's future by contributing to meaningful campaigns that make a lasting impact.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
                    <Card className="glass-card"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total Raised</p><p className="text-3xl font-bold">{formatCurrency(campaigns.reduce((sum, campaign) => sum + campaign.raised, 0))}</p></div><IndianRupee className="h-8 w-8 text-green-500" /></div></CardContent></Card>
                    <Card className="glass-card"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Active Campaigns</p><p className="text-3xl font-bold">{campaigns.length}</p></div><Target className="h-8 w-8 text-primary" /></div></CardContent></Card>
                    <Card className="glass-card"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total Donors</p><p className="text-3xl font-bold">{campaigns.reduce((sum, campaign) => sum + campaign.donors, 0)}</p></div><Users className="h-8 w-8 text-blue-500" /></div></CardContent></Card>
                    <Card className="glass-card"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Your Contributions</p><p className="text-3xl font-bold">{formatCurrency(myDonations.reduce((sum, donation) => sum + donation.amount, 0))}</p></div><Heart className="h-8 w-8 text-red-500" /></div></CardContent></Card>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-scale-in">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
                        <TabsTrigger value="my-donations">My Donations</TabsTrigger>
                        <TabsTrigger value="impact">Impact Stories</TabsTrigger>
                    </TabsList>

                    {/* Active Campaigns Tab */}
                    <TabsContent value="campaigns" className="space-y-6">
                        <Card className="glass-card"><CardContent className="p-6"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search campaigns by name, description, or category..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></CardContent></Card>

                        {/* Campaigns Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredCampaigns.map((campaign) => (
                                <Card key={campaign.id} className={`glass-card hover-glow ${campaign.isFeatured ? 'ring-2 ring-primary/50' : ''}`}>
                                    {campaign.isFeatured && (<div className="flex items-center gap-2 p-3 bg-gradient-primary rounded-t-lg"><Award className="h-4 w-4 text-white" /><span className="text-white text-sm font-medium">Featured Campaign</span></div>)}
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2"><CardTitle className="text-lg">{campaign.title}</CardTitle>{campaign.isUrgent && (<Badge className="bg-red-100 text-red-800">Urgent</Badge>)}</div>
                                                <Badge className={getCategoryColor(campaign.category)}>{campaign.category}</Badge>
                                            </div>
                                        </div>
                                        <CardDescription className="text-sm">{campaign.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Progress */}
                                        <div className="space-y-2"><div className="flex justify-between text-sm"><span className="text-muted-foreground">{formatCurrency(campaign.raised)} raised</span><span className="font-medium">{formatCurrency(campaign.goal)} goal</span></div><Progress value={getProgressPercentage(campaign.raised, campaign.goal)} className="h-3" /><div className="text-sm text-muted-foreground">{Math.round(getProgressPercentage(campaign.raised, campaign.goal))}% of goal reached</div></div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-4 text-sm"><div><div className="font-medium">{campaign.donors}</div><div className="text-muted-foreground">Donors</div></div><div><div className="font-medium">{campaign.daysLeft}</div><div className="text-muted-foreground">Days Left</div></div><div><div className="font-medium">{campaign.updates}</div><div className="text-muted-foreground">Updates</div></div></div>

                                        {/* Organizer */}
                                        <div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarImage src={campaign.organizerAvatar} /><AvatarFallback>{campaign.organizer[0]}</AvatarFallback></Avatar><div className="text-sm"><div className="font-medium">Organized by</div><div className="text-muted-foreground">{campaign.organizer}</div></div></div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2">
                                            <Dialog open={isDonateOpen && selectedCampaign?.id === campaign.id} onOpenChange={(open) => { setSelectedCampaign(campaign); setIsDonateOpen(open); if (!open) setPaymentStage('amount'); }}>
                                                <DialogTrigger asChild>
                                                    <Button className="flex-1 bg-gradient-primary hover:opacity-90" onClick={() => { setSelectedCampaign(campaign); setIsDonateOpen(true); setPaymentStage('amount'); }}>
                                                        <Heart className="h-4 w-4 mr-2" /> Donate Now
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[600px] transition-transform duration-300">
                                                    {renderDonationContent()}
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* My Donations Tab */}
                    <TabsContent value="my-donations" className="space-y-6">
                        <div className="grid lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <Card className="glass-card">
                                    <CardHeader><CardTitle>Your Donation History</CardTitle><CardDescription>Thank you for your generous support over the years</CardDescription></CardHeader>
                                    <CardContent><div className="space-y-4">{DUMMY_MY_DONATIONS.map((donation, index) => (<div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30"><div><h4 className="font-medium">{donation.campaign}</h4><p className="text-sm text-muted-foreground">{new Date(donation.date).toLocaleDateString()}</p></div><div className="text-right"><div className="font-bold text-lg">{formatCurrency(donation.amount)}</div><Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />{donation.status}</Badge></div></div>))}</div></CardContent>
                                </Card>
                            </div>
                            <div>
                                <Card className="glass-card">
                                    <CardHeader><CardTitle>Recent Donations</CardTitle><CardDescription>See the latest contributions from our community</CardDescription></CardHeader>
                                    <CardContent><div className="space-y-3">{DUMMY_RECENT_DONORS.map((donor, index) => (<div key={index} className="flex items-center justify-between"><div><div className="font-medium text-sm">{donor.name}</div><div className="text-xs text-muted-foreground">{donor.timeAgo}</div></div><div className="font-bold">{formatCurrency(donor.amount)}</div></div>))}</div></CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Impact Stories Tab */}
                    <TabsContent value="impact" className="space-y-6">
                        <Card className="glass-card">
                            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Your Impact in Action</CardTitle><CardDescription>See how your contributions are making a real difference</CardDescription></CardHeader>
                            <CardContent className="space-y-6"><div className="text-center space-y-4"><Gift className="h-16 w-16 mx-auto text-primary" /><h3 className="text-2xl font-bold">Thank You for Your Generosity</h3><p className="text-muted-foreground max-w-2xl mx-auto">Your contributions have directly supported student success, campus improvements, and community initiatives that will benefit generations to come.</p></div>
                                <div className="grid md:grid-cols-2 gap-6"><div className="space-y-4"><h4 className="text-lg font-semibold">Students Supported</h4><div className="text-4xl font-bold text-primary">347</div><p className="text-muted-foreground">Students have received emergency financial assistance thanks to alumni donations</p></div><div className="space-y-4"><h4 className="text-lg font-semibold">Scholarships Awarded</h4><div className="text-4xl font-bold text-green-500">89</div><p className="text-muted-foreground">Merit-based scholarships funded by our alumni community</p></div></div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Fundraising;