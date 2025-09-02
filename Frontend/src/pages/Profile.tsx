import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  User,
  MapPin,
  Building2,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  Linkedin,
  Globe,
  Edit,
  Plus,
  X,
  Camera,
  Save,
  Bell,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);

  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    batch: '2018',
    department: 'Computer Science',
    degree: 'Bachelor of Science',
    currentPosition: 'Senior Software Engineer',
    currentCompany: 'Tech Innovations Inc.',
    location: 'San Francisco, CA',
    bio: 'Passionate software engineer with 6+ years of experience in full-stack development. I enjoy mentoring junior developers and contributing to open-source projects. Always excited to connect with fellow alumni and share knowledge about the tech industry.',
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    websiteUrl: 'https://johndoe.dev',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
    interests: ['Machine Learning', 'Open Source', 'Startups', 'Mentoring']
  });

  const [careerHistory, setCareerHistory] = useState([
    {
      id: 1,
      position: 'Senior Software Engineer',
      company: 'Tech Innovations Inc.',
      location: 'San Francisco, CA',
      startDate: '2022-01',
      endDate: null,
      isCurrent: true,
      description: 'Leading development of microservices architecture and mentoring junior developers.'
    },
    {
      id: 2,
      position: 'Software Engineer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      startDate: '2020-06',
      endDate: '2021-12',
      isCurrent: false,
      description: 'Full-stack development using React and Node.js. Built scalable web applications.'
    },
    {
      id: 3,
      position: 'Junior Developer',
      company: 'WebCorp Solutions',
      location: 'Austin, TX',
      startDate: '2018-08',
      endDate: '2020-05',
      isCurrent: false,
      description: 'Frontend development and bug fixes. Learned modern web development practices.'
    }
  ]);

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    eventReminders: true,
    mentorshipRequests: true,
    forumReplies: false,
    donationReceipts: true,
    monthlyNewsletter: true
  });

  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showPhone: false,
    showLinkedIn: true,
    showCareerHistory: true,
    allowMentorshipRequests: true,
    showInDirectory: true
  });

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !profile.skills.includes(skill)) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 animate-fade-in">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">
              My{' '}
              <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
                Profile
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Manage your profile information and preferences
            </p>
          </div>
          
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
            className={!isEditing ? "bg-gradient-primary hover:opacity-90" : ""}
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        {/* Profile Overview Card */}
        <Card className="glass-card animate-slide-up">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback className="text-2xl">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <h2 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h2>
                <p className="text-lg text-muted-foreground">{profile.currentPosition}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {profile.currentCompany}
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    Class of {profile.batch} • {profile.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {profile.skills.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                  {profile.skills.length > 4 && (
                    <Badge variant="outline">
                      +{profile.skills.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-scale-in">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="career">Career History</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your basic information and bio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batch">Graduation Year</Label>
                    <Select value={profile.batch} disabled={!isEditing}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => 2024 - i).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="linkedin"
                        value={profile.linkedinUrl}
                        onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Personal Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        value={profile.websiteUrl}
                        onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="space-y-4">
                  <Label>Skills & Expertise</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => handleSkillRemove(skill)}
                            className="ml-1 h-3 w-3 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                          >
                            <X className="h-2 w-2" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => {
                          const skill = prompt('Enter a new skill:');
                          if (skill) handleSkillAdd(skill);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Skill
                      </Button>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end">
                    <Button className="bg-gradient-primary hover:opacity-90">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Career History Tab */}
          <TabsContent value="career" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Career History</CardTitle>
                    <CardDescription>
                      Track your professional journey and share your experience
                    </CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Position
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {careerHistory.map((job, index) => (
                    <div key={job.id} className="relative">
                      {index !== careerHistory.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
                      )}
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{job.position}</h4>
                            {job.isCurrent && (
                              <Badge className="bg-green-100 text-green-800">Current</Badge>
                            )}
                          </div>
                          <div className="text-muted-foreground">
                            <div className="font-medium">{job.company}</div>
                            <div className="text-sm">{job.location}</div>
                            <div className="text-sm">
                              {new Date(job.startDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                year: 'numeric' 
                              })} - {job.isCurrent ? 'Present' : new Date(job.endDate!).toLocaleDateString('en-US', { 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </div>
                          </div>
                          {job.description && (
                            <p className="text-sm text-muted-foreground pt-2">
                              {job.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose what notifications you'd like to receive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {key === 'emailUpdates' && 'Receive general updates via email'}
                          {key === 'eventReminders' && 'Get reminded about upcoming events'}
                          {key === 'mentorshipRequests' && 'Notifications for mentorship requests'}
                          {key === 'forumReplies' && 'When someone replies to your forum posts'}
                          {key === 'donationReceipts' && 'Receipt confirmations for donations'}
                          {key === 'monthlyNewsletter' && 'Monthly alumni newsletter'}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => handleNotificationChange(key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control what information is visible to other alumni
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {value ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                        <div>
                          <h4 className="font-medium">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {key === 'showEmail' && 'Display your email address on your profile'}
                            {key === 'showPhone' && 'Display your phone number on your profile'}
                            {key === 'showLinkedIn' && 'Display your LinkedIn profile link'}
                            {key === 'showCareerHistory' && 'Show your work experience to other alumni'}
                            {key === 'allowMentorshipRequests' && 'Allow others to send you mentorship requests'}
                            {key === 'showInDirectory' && 'Appear in the alumni directory search results'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => handlePrivacyChange(key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;