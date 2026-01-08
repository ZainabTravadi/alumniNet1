import { useEffect, useState, useCallback } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Heart, Target, Users, Award, TrendingUp, Search,
  CheckCircle, Gift, Loader2, ArrowLeft,
  IndianRupee, Zap, Wallet, QrCode
} from 'lucide-react';
import { auth } from '@/firebase';

/* ---------------- TYPES ---------------- */

interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  goal: number;
  raised: number;
  donors: number;
  daysLeft: number;
  organizer: string;
  organizerAvatar: string;
  image: string;
  isFeatured: boolean;
  isUrgent: boolean;
  updates: number;
  qrCode: string;
}

interface Donation {
  campaign: string;
  amount: number;
  date: string;
  status: string;
}

interface Donor {
  name: string;
  amount: number;
  timeAgo: string;
}

/* ---------------- CONFIG ---------------- */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://alumninet-backend-8ab3a9de8aad.herokuapp.com';

const FUNDRAISING_API = `${API_BASE}/api/fundraising/data`;

const PAYEE_VPA = 'alumnifund@ybl';
const PAYEE_NAME = 'Alumni Trust';

const UPI_APPS = [
  { name: 'Google Pay', scheme: 'tez://upi/pay?', icon: Wallet },
  { name: 'PhonePe', scheme: 'phonepe://pay?', icon: IndianRupee },
  { name: 'Paytm', scheme: 'paytmmp://pay?', icon: Zap },
  { name: 'Other UPI', scheme: 'upi://pay?', icon: QrCode },
];

/* ---------------- COMPONENT ---------------- */

const Fundraising = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [recentDonors, setRecentDonors] = useState<Donor[]>([]);
  const [myDonations, setMyDonations] = useState<Donation[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [paymentStage, setPaymentStage] = useState<'amount' | 'selectApp'>('amount');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const userId = auth.currentUser?.uid ?? 'anonymous';

      try {
        const res = await fetch(
          `${FUNDRAISING_API}?user_id=${encodeURIComponent(userId)}`
        );
        const json = await res.json();

        if (res.ok && json.data) {
          setCampaigns(json.data.campaigns || []);
          setRecentDonors(json.data.recentDonors || []);
          setMyDonations(json.data.myDonations || []);
        }
      } catch (err) {
        console.error('Fundraising fetch failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ---------------- HELPERS ---------------- */

  const filteredCampaigns = campaigns.filter(c =>
    `${c.title} ${c.description} ${c.category}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);

  const progress = (r: number, g: number) =>
    Math.min((r / g) * 100, 100);

  const generateUpiUrl = useCallback(
    (amount: number, campaign: Campaign, scheme: string) => {
      const tr = `ALUMNI_${campaign.id}_${Date.now()}`;
      const note = encodeURIComponent(`Donation for ${campaign.title}`);
      return `${scheme}pa=${PAYEE_VPA}&pn=${PAYEE_NAME}&tr=${tr}&am=${amount}&cu=INR&tn=${note}`;
    },
    []
  );

  const startPayment = (scheme: string) => {
    if (!selectedCampaign) return;
    const amt = Number(donationAmount);
    if (!amt || amt <= 0) return;

    setIsProcessing(true);
    window.open(
      generateUpiUrl(amt, selectedCampaign, scheme),
      '_blank',
      'noopener'
    );

    setTimeout(() => {
      setIsProcessing(false);
      setIsDonateOpen(false);
      setDonationAmount('');
      setPaymentStage('amount');
    }, 1500);
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center">
          Alumni <span className="text-primary">Fundraising</span>
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="my-donations">My Donations</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
          </TabsList>

          {/* CAMPAIGNS */}
          <TabsContent value="campaigns">
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />

            <div className="grid lg:grid-cols-2 gap-6">
              {filteredCampaigns.map((c) => (
                <Card key={c.id}>
                  <CardHeader>
                    <CardTitle>{c.title}</CardTitle>
                    <CardDescription>{c.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={progress(c.raised, c.goal)} />
                    <div className="flex justify-between text-sm">
                      <span>{formatCurrency(c.raised)}</span>
                      <span>{formatCurrency(c.goal)}</span>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedCampaign(c);
                        setIsDonateOpen(true);
                      }}
                    >
                      <Heart className="mr-2 h-4 w-4" /> Donate
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* DONATION DIALOG */}
        <Dialog open={isDonateOpen} onOpenChange={setIsDonateOpen}>
          <DialogContent>
            {!selectedCampaign ? null : paymentStage === 'amount' ? (
              <>
                <DialogHeader>
                  <DialogTitle>Donate to {selectedCampaign.title}</DialogTitle>
                </DialogHeader>
                <Input
                  type="number"
                  placeholder="Enter amount (₹)"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                />
                <Button
                  onClick={() => setPaymentStage('selectApp')}
                  disabled={!donationAmount}
                >
                  Continue
                </Button>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Select UPI App</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  {UPI_APPS.map((app) => (
                    <Button
                      key={app.name}
                      variant="outline"
                      onClick={() => startPayment(app.scheme)}
                      disabled={isProcessing}
                    >
                      {app.name}
                    </Button>
                  ))}
                </div>
                {isProcessing && (
                  <Loader2 className="mx-auto animate-spin text-primary" />
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Fundraising;
