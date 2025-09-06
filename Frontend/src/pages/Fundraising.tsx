import { useState } from 'react';
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
  DollarSign,
  Heart,
  Target,
  Users,
  Calendar,
  Award,
  TrendingUp,
  Search,
  CreditCard,
  CheckCircle,
  Gift
} from 'lucide-react';

const Fundraising = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [donationAmount, setDonationAmount] = useState('');

  const campaigns = [
    {
      id: 1,
      title: 'Student Emergency Fund 2024',
      description: 'Supporting students facing unexpected financial hardships to continue their education without interruption.',
      category: 'Student Support',
      goal: 100000,
      raised: 67500,
      donors: 234,
      daysLeft: 45,
      organizer: 'Alumni Association',
      organizerAvatar: '/placeholder-avatar.jpg',
      image: '/placeholder-campaign.jpg',
      isFeatured: true,
      isUrgent: false,
      updates: 8
    },
    {
      id: 2,
      title: 'New Engineering Lab Equipment',
      description: 'Upgrading our engineering facilities with state-of-the-art equipment to enhance hands-on learning experiences.',
      category: 'Infrastructure',
      goal: 250000,
      raised: 189750,
      donors: 89,
      daysLeft: 22,
      organizer: 'Engineering Department',
      organizerAvatar: '/placeholder-avatar.jpg',
      image: '/placeholder-campaign.jpg',
      isFeatured: false,
      isUrgent: true,
      updates: 12
    },
    {
      id: 3,
      title: 'Scholarship for Underrepresented Students',
      description: 'Creating opportunities for talented students from underrepresented communities to access higher education.',
      category: 'Scholarships',
      goal: 150000,
      raised: 92300,
      donors: 156,
      daysLeft: 67,
      organizer: 'Diversity & Inclusion Committee',
      organizerAvatar: '/placeholder-avatar.jpg',
      image: '/placeholder-campaign.jpg',
      isFeatured: true,
      isUrgent: false,
      updates: 6
    },
    {
      id: 4,
      title: 'Campus Sustainability Initiative',
      description: 'Installing solar panels and implementing green technologies to make our campus carbon neutral by 2030.',
      category: 'Environment',
      goal: 300000,
      raised: 45600,
      donors: 67,
      daysLeft: 89,
      organizer: 'Green Campus Committee',
      organizerAvatar: '/placeholder-avatar.jpg',
      image: '/placeholder-campaign.jpg',
      isFeatured: false,
      isUrgent: false,
      updates: 4
    },
    {
      id: 5,
      title: 'Mental Health Support Center',
      description: 'Establishing a comprehensive mental health and wellness center to support student wellbeing.',
      category: 'Health & Wellness',
      goal: 200000,
      raised: 134500,
      donors: 198,
      daysLeft: 34,
      organizer: 'Student Affairs',
      organizerAvatar: '/placeholder-avatar.jpg',
      image: '/placeholder-campaign.jpg',
      isFeatured: false,
      isUrgent: true,
      updates: 9
    }
  ];

  const recentDonors = [
    { name: 'Anonymous', amount: 5000, timeAgo: '2 hours ago' },
    { name: 'Sarah Chen', amount: 500, timeAgo: '5 hours ago' },
    { name: 'Michael R.', amount: 250, timeAgo: '8 hours ago' },
    { name: 'Anonymous', amount: 1000, timeAgo: '12 hours ago' },
    { name: 'Emma Thompson', amount: 750, timeAgo: '1 day ago' }
  ];

  const myDonations = [
    {
      campaign: 'Student Emergency Fund 2024',
      amount: 250,
      date: '2024-03-01',
      status: 'completed'
    },
    {
      campaign: 'Engineering Lab Equipment',
      amount: 500,
      date: '2024-02-15',
      status: 'completed'
    },
    {
      campaign: 'Scholarship Fund',
      amount: 1000,
      date: '2024-01-20',
      status: 'completed'
    }
  ];

  const donationTiers = [
    { amount: 25, label: 'Supporter', benefits: ['Thank you email', 'Campaign updates'] },
    { amount: 100, label: 'Contributor', benefits: ['Digital certificate', 'Exclusive updates', 'Tax receipt'] },
    { amount: 500, label: 'Advocate', benefits: ['All previous benefits', 'Annual report', 'Priority event invites'] },
    { amount: 1000, label: 'Champion', benefits: ['All previous benefits', 'Recognition in materials', 'Meet with organizers'] },
    { amount: 2500, label: 'Leader', benefits: ['All previous benefits', 'Naming opportunities', 'VIP event access'] }
  ];

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Student Support': 'bg-blue-100 text-blue-800',
      'Infrastructure': 'bg-green-100 text-green-800',
      'Scholarships': 'bg-purple-100 text-purple-800',
      'Environment': 'bg-teal-100 text-teal-800',
      'Health & Wellness': 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold">
            Alumni{' '}
            <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
              Fundraising
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Support your alma mater's future by contributing to meaningful campaigns that make a lasting impact.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Raised</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(campaigns.reduce((sum, campaign) => sum + campaign.raised, 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                  <p className="text-3xl font-bold">{campaigns.length}</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Donors</p>
                  <p className="text-3xl font-bold">
                    {campaigns.reduce((sum, campaign) => sum + campaign.donors, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Your Contributions</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(myDonations.reduce((sum, donation) => sum + donation.amount, 0))}
                  </p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
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
            {/* Search */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns by name, description, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className={`glass-card hover-glow ${campaign.isFeatured ? 'ring-2 ring-primary/50' : ''}`}>
                  {campaign.isFeatured && (
                    <div className="flex items-center gap-2 p-3 bg-gradient-primary rounded-t-lg">
                      <Award className="h-4 w-4 text-white" />
                      <span className="text-white text-sm font-medium">Featured Campaign</span>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{campaign.title}</CardTitle>
                          {campaign.isUrgent && (
                            <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                          )}
                        </div>
                        <Badge className={getCategoryColor(campaign.category)}>
                          {campaign.category}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {campaign.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {formatCurrency(campaign.raised)} raised
                        </span>
                        <span className="font-medium">
                          {formatCurrency(campaign.goal)} goal
                        </span>
                      </div>
                      <Progress 
                        value={getProgressPercentage(campaign.raised, campaign.goal)} 
                        className="h-3"
                      />
                      <div className="text-sm text-muted-foreground">
                        {Math.round(getProgressPercentage(campaign.raised, campaign.goal))}% of goal reached
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">{campaign.donors}</div>
                        <div className="text-muted-foreground">Donors</div>
                      </div>
                      <div>
                        <div className="font-medium">{campaign.daysLeft}</div>
                        <div className="text-muted-foreground">Days Left</div>
                      </div>
                      <div>
                        <div className="font-medium">{campaign.updates}</div>
                        <div className="text-muted-foreground">Updates</div>
                      </div>
                    </div>

                    {/* Organizer */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={campaign.organizerAvatar} />
                        <AvatarFallback>{campaign.organizer[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <div className="font-medium">Organized by</div>
                        <div className="text-muted-foreground">{campaign.organizer}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Dialog open={isDonateOpen && selectedCampaign?.id === campaign.id} onOpenChange={setIsDonateOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            className="flex-1 bg-gradient-primary hover:opacity-90"
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Donate Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Support {campaign.title}</DialogTitle>
                            <DialogDescription>
                              Your contribution makes a real difference. Choose an amount below or enter a custom amount.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6 py-4">
                            {/* Quick Amount Buttons */}
                            <div className="grid grid-cols-5 gap-2">
                              {[25, 50, 100, 250, 500].map((amount) => (
                                <Button
                                  key={amount}
                                  variant={donationAmount === amount.toString() ? "default" : "outline"}
                                  onClick={() => setDonationAmount(amount.toString())}
                                  className="text-sm"
                                >
                                  ${amount}
                                </Button>
                              ))}
                            </div>

                            {/* Custom Amount */}
                            <div className="space-y-2">
                              <Label htmlFor="custom-amount">Custom Amount</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="custom-amount"
                                  type="number"
                                  placeholder="Enter amount"
                                  value={donationAmount}
                                  onChange={(e) => setDonationAmount(e.target.value)}
                                  className="pl-10"
                                />
                              </div>
                            </div>

                            {/* Donation Tiers Info */}
                            {donationAmount && (
                              <div className="bg-muted/30 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Your Impact & Benefits</h4>
                                {(() => {
                                  const amount = parseInt(donationAmount);
                                  const tier = donationTiers.reverse().find(t => amount >= t.amount);
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
                              <Button variant="outline" onClick={() => setIsDonateOpen(false)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={() => setIsDonateOpen(false)}
                                disabled={!donationAmount}
                                className="bg-gradient-primary hover:opacity-90"
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Donate ${donationAmount}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* My Donations Tab */}
          <TabsContent value="my-donations" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Donation History */}
              <div className="lg:col-span-2">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Your Donation History</CardTitle>
                    <CardDescription>
                      Thank you for your generous support over the years
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {myDonations.map((donation, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                          <div>
                            <h4 className="font-medium">{donation.campaign}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(donation.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{formatCurrency(donation.amount)}</div>
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {donation.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Donors */}
              <div>
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Recent Donations</CardTitle>
                    <CardDescription>
                      See the latest contributions from our community
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentDonors.map((donor, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{donor.name}</div>
                            <div className="text-xs text-muted-foreground">{donor.timeAgo}</div>
                          </div>
                          <div className="font-bold">{formatCurrency(donor.amount)}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Impact Stories Tab */}
          <TabsContent value="impact" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Your Impact in Action
                </CardTitle>
                <CardDescription>
                  See how your contributions are making a real difference
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <Gift className="h-16 w-16 mx-auto text-primary" />
                  <h3 className="text-2xl font-bold">Thank You for Your Generosity</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Your contributions have directly supported student success, campus improvements, 
                    and community initiatives that will benefit generations to come.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Students Supported</h4>
                    <div className="text-4xl font-bold text-primary">347</div>
                    <p className="text-muted-foreground">
                      Students have received emergency financial assistance thanks to alumni donations
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Scholarships Awarded</h4>
                    <div className="text-4xl font-bold text-green-500">89</div>
                    <p className="text-muted-foreground">
                      Merit-based scholarships funded by our alumni community
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Fundraising;