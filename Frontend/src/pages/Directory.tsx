import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter,
  MapPin,
  Building2,
  GraduationCap,
  Calendar,
  Linkedin,
  Mail
} from 'lucide-react';

const Directory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const alumni = [
    {
      id: 1,
      name: 'Sarah Chen',
      batch: '2019',
      department: 'Computer Science',
      company: 'Google',
      position: 'Senior Software Engineer',
      location: 'San Francisco, CA',
      avatar: '/placeholder-avatar.jpg',
      skills: ['React', 'Python', 'Machine Learning'],
      linkedin: 'https://linkedin.com/in/sarahchen'
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      batch: '2020',
      department: 'Mechanical Engineering',
      company: 'Tesla',
      position: 'Product Design Engineer',
      location: 'Austin, TX',
      avatar: '/placeholder-avatar.jpg',
      skills: ['CAD', 'Manufacturing', 'Sustainability'],
      linkedin: 'https://linkedin.com/in/michaelrodriguez'
    },
    {
      id: 3,
      name: 'Emma Thompson',
      batch: '2018',
      department: 'Business Administration',
      company: 'Microsoft',
      position: 'Product Manager',
      location: 'Seattle, WA',
      avatar: '/placeholder-avatar.jpg',
      skills: ['Strategy', 'Leadership', 'Analytics'],
      linkedin: 'https://linkedin.com/in/emmathompson'
    },
    {
      id: 4,
      name: 'David Kim',
      batch: '2021',
      department: 'Electrical Engineering',
      company: 'Apple',
      position: 'Hardware Engineer',
      location: 'Cupertino, CA',
      avatar: '/placeholder-avatar.jpg',
      skills: ['Circuit Design', 'IoT', 'Embedded Systems'],
      linkedin: 'https://linkedin.com/in/davidkim'
    },
    {
      id: 5,
      name: 'Lisa Patel',
      batch: '2017',
      department: 'Marketing',
      company: 'Adobe',
      position: 'Marketing Director',
      location: 'San Jose, CA',
      avatar: '/placeholder-avatar.jpg',
      skills: ['Digital Marketing', 'Brand Strategy', 'Content Creation'],
      linkedin: 'https://linkedin.com/in/lisapatel'
    },
    {
      id: 6,
      name: 'James Wilson',
      batch: '2019',
      department: 'Finance',
      company: 'Goldman Sachs',
      position: 'Investment Analyst',
      location: 'New York, NY',
      avatar: '/placeholder-avatar.jpg',
      skills: ['Financial Analysis', 'Risk Management', 'Portfolio Management'],
      linkedin: 'https://linkedin.com/in/jameswilson'
    }
  ];

  const departments = ['All Departments', 'Computer Science', 'Mechanical Engineering', 'Business Administration', 'Electrical Engineering', 'Marketing', 'Finance'];
  const batches = ['All Batches', '2017', '2018', '2019', '2020', '2021', '2022'];

  const filteredAlumni = alumni.filter(alumnus => {
    const matchesSearch = alumnus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alumnus.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alumnus.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch = !selectedBatch || selectedBatch === 'All Batches' || alumnus.batch === selectedBatch;
    const matchesDepartment = !selectedDepartment || selectedDepartment === 'All Departments' || alumnus.department === selectedDepartment;
    
    return matchesSearch && matchesBatch && matchesDepartment;
  });

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold">
            Alumni{' '}
            <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
              Directory
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with fellow alumni from your university. Find mentors, collaborators, and lifelong friends.
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="glass-card animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Search Alumni
            </CardTitle>
            <CardDescription>
              Use filters to find alumni by batch, department, or search by name/company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, company, or position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch} value={batch}>
                      {batch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Found {filteredAlumni.length} Alumni
            </h2>
            <Badge variant="secondary" className="text-sm">
              {alumni.length} Total Members
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-scale-in">
            {filteredAlumni.map((alumnus) => (
              <Card key={alumnus.id} className="glass-card hover-glow group">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={alumnus.avatar} />
                      <AvatarFallback className="text-lg">
                        {alumnus.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <CardTitle className="text-lg">{alumnus.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {alumnus.department} • {alumnus.batch}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{alumnus.company}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {alumnus.position}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {alumnus.location}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {alumnus.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <Mail className="h-3 w-3 mr-2" />
                      Message
                    </Button>
                    <Button size="sm" variant="outline">
                      <Linkedin className="h-3 w-3 mr-2" />
                      LinkedIn
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Directory;