import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  ArrowRight,
  MapPin,
  Building2,
  GraduationCap
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { label: 'Total Alumni', value: '2,847', icon: Users, color: 'text-blue-500' },
    { label: 'Upcoming Events', value: '12', icon: Calendar, color: 'text-green-500' },
    { label: 'Active Discussions', value: '89', icon: MessageSquare, color: 'text-purple-500' },
    { label: 'This Month Donations', value: '$12.5K', icon: TrendingUp, color: 'text-orange-500' }
  ];

  const recentAlumni = [
    {
      name: 'Sarah Chen',
      batch: '2019',
      department: 'Computer Science',
      company: 'Google',
      location: 'San Francisco',
      avatar: '/placeholder-avatar.jpg'
    },
    {
      name: 'Michael Rodriguez',
      batch: '2020',
      department: 'Mechanical Eng',
      company: 'Tesla',
      location: 'Austin',
      avatar: '/placeholder-avatar.jpg'
    },
    {
      name: 'Emma Thompson',
      batch: '2018',
      department: 'Business Admin',
      company: 'Microsoft',
      location: 'Seattle',
      avatar: '/placeholder-avatar.jpg'
    }
  ];

  const upcomingEvents = [
    {
      title: 'Annual Alumni Meetup 2024',
      date: 'March 15, 2024',
      location: 'Main Campus',
      attendees: 245
    },
    {
      title: 'Tech Talk: AI in Industry',
      date: 'March 20, 2024',
      location: 'Virtual Event',
      attendees: 89
    },
    {
      title: 'Career Fair 2024',
      date: 'March 25, 2024',
      location: 'Convention Center',
      attendees: 156
    }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
              AlumniNet
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect, collaborate, and grow with your alumni network. Stay updated with events, 
            find mentors, and contribute to your alma mater's future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90">
              Explore Directory
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Update Profile
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="glass-card hover-glow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Alumni */}
          <div className="lg:col-span-2">
            <Card className="glass-card animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Recently Joined Alumni
                </CardTitle>
                <CardDescription>
                  Welcome our newest community members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentAlumni.map((alumni, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Avatar>
                      <AvatarImage src={alumni.avatar} />
                      <AvatarFallback>{alumni.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{alumni.name}</h4>
                        <Badge variant="secondary">{alumni.batch}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {alumni.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {alumni.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {alumni.location}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Connect
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Alumni
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div>
            <Card className="glass-card animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>
                  Don't miss these exciting events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="space-y-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>{event.date}</div>
                      <div className="flex items-center justify-between">
                        <span>{event.location}</span>
                        <Badge variant="outline" className="text-xs">
                          {event.attendees} attending
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" size="sm">
                  View All Events
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;