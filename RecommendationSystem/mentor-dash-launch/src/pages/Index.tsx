import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Target, Users, MapPin, Clock, Search, Heart, MessageCircle, TrendingUp, Calendar, Award } from 'lucide-react';

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState({
    field: '',
    goals: '',
    mentorType: '',
    location: '',
    availability: ''
  });

  const steps = [
    { title: 'Field of Interest', icon: Target },
    { title: 'Career Goals', icon: Sparkles },
    { title: 'Mentor Type', icon: Users },
    { title: 'Preferences', icon: MapPin }
  ];

  const fields = [
    'Software Engineering', 'Data Science', 'Product Management', 
    'Marketing', 'Design', 'Finance', 'Consulting', 'Healthcare'
  ];

  const goals = [
    'Join a Startup', 'Corporate Leadership', 'Research & Academia', 
    'Entrepreneurship', 'Career Transition', 'Skill Development'
  ];

  const mentorTypes = [
    'Peer Mentor', 'Industry Expert', 'Leadership Coach', 'Technical Specialist'
  ];

  const mockMentors = [
    {
      id: 1,
      name: 'Sarah Chen',
      batch: 'Class of 2018',
      role: 'Senior Product Manager at Google',
      avatar: 'SC',
      match: 92,
      strengths: ['Product Strategy', 'User Research', 'Team Leadership'],
      company: 'Google',
      location: 'San Francisco',
      whyMatch: 'Strong alignment in product management goals and startup experience'
    },
    {
      id: 2,
      name: 'Marcus Rodriguez',
      batch: 'Class of 2015',
      role: 'CTO & Co-founder at TechFlow',
      avatar: 'MR',
      match: 88,
      strengths: ['Startup Leadership', 'Full-Stack Dev', 'Team Building'],
      company: 'TechFlow',
      location: 'Austin',
      whyMatch: 'Entrepreneurial background matches your startup aspirations'
    },
    {
      id: 3,
      name: 'Dr. Priya Patel',
      batch: 'Class of 2012',
      role: 'AI Research Lead at Microsoft',
      avatar: 'PP',
      match: 85,
      strengths: ['Machine Learning', 'Research', 'Publications'],
      company: 'Microsoft',
      location: 'Seattle',
      whyMatch: 'Deep AI expertise aligns with your technical interests'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
            <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold mb-2">What field interests you most?</h3>
              <p className="text-muted-foreground">Choose your primary area of focus</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {fields.map(field => (
                <Button
                  key={field}
                  variant={formData.field === field ? "gradient" : "glow"}
                  className="h-auto py-4 px-6 relative overflow-hidden"
                  onClick={() => updateFormData('field', field)}
                >
                  <span className="relative z-10">{field}</span>
                  {formData.field === field && (
                    <div className="absolute inset-0 shimmer" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold mb-2">What are your career goals?</h3>
              <p className="text-muted-foreground">Select your primary objective</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map(goal => (
                <Button
                  key={goal}
                  variant={formData.goals === goal ? "gradient" : "glow"}
                  className="h-auto py-4 px-6 relative overflow-hidden"
                  onClick={() => updateFormData('goals', goal)}
                >
                  <span className="relative z-10">{goal}</span>
                  {formData.goals === goal && (
                    <div className="absolute inset-0 shimmer" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold mb-2">What type of mentor do you prefer?</h3>
              <p className="text-muted-foreground">Choose your ideal mentorship style</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mentorTypes.map(type => (
                <Button
                  key={type}
                  variant={formData.mentorType === type ? "gradient" : "glow"}
                  className="h-auto py-4 px-6 relative overflow-hidden"
                  onClick={() => updateFormData('mentorType', type)}
                >
                  <span className="relative z-10">{type}</span>
                  {formData.mentorType === type && (
                    <div className="absolute inset-0 shimmer" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold mb-2">Additional Preferences</h3>
              <p className="text-muted-foreground">Help us find the perfect match</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Location</label>
                <Select value={formData.location} onValueChange={(value) => updateFormData('location', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="san-francisco">San Francisco</SelectItem>
                    <SelectItem value="new-york">New York</SelectItem>
                    <SelectItem value="austin">Austin</SelectItem>
                    <SelectItem value="seattle">Seattle</SelectItem>
                    <SelectItem value="remote">Remote/Virtual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Availability</label>
                <Select value={formData.availability} onValueChange={(value) => updateFormData('availability', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly sessions</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly sessions</SelectItem>
                    <SelectItem value="monthly">Monthly sessions</SelectItem>
                    <SelectItem value="flexible">Flexible schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (showResults) {
  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center pulse-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Perfect <span className="text-gradient">Matches</span> Found!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our AI analyzed thousands of profiles to find your ideal mentors
          </p>
        </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search mentors by name, company, or expertise..." 
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="microsoft">Microsoft</SelectItem>
                  <SelectItem value="startup">Startups</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mentor Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockMentors.map((mentor, index) => (
              <Card 
                key={mentor.id} 
                className={`mentor-card animate-fade-in-up`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold glow-effect">
                        {mentor.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold">{mentor.name}</h3>
                        <p className="text-sm text-muted-foreground">{mentor.batch}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{mentor.role}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{mentor.location}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Match Score */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">AI Match Score</span>
                      <span className="text-sm font-bold text-primary">{mentor.match}%</span>
                    </div>
                    <Progress value={mentor.match} className="h-2" />
                  </div>

                  {/* Strengths */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Expertise</span>
                    <div className="flex flex-wrap gap-1">
                      {mentor.strengths.map(strength => (
                        <Badge key={strength} variant="secondary" className="text-xs">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Why Match */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Why this match?</span>
                    <p className="text-xs text-muted-foreground">{mentor.whyMatch}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="gradient" size="sm" className="flex-1">
                      Request Session
                    </Button>
                    <Button size="sm" variant="glow">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Back Button */}
          <div className="text-center mt-12">
            <Button 
              variant="glow" 
              onClick={() => setShowResults(false)}
              className="px-8"
            >
              Refine Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in">
              Find Your <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">Mentor</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tell us about yourself, and we'll recommend the right mentors from our alumni network.
            </p>
            
            {/* Stats */}
            <div className="flex justify-center space-x-8 mb-12">
  {/* Alumni Mentors */}
  <div className="text-center">
    <div className="text-3xl font-bold">
      <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
        2,500+
      </span>
    </div>
    <div className="text-sm text-muted-foreground">Alumni Mentors</div>
  </div>

  {/* Match Success */}
  <div className="text-center">
    <div className="text-3xl font-bold">
      <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
        95%
      </span>
    </div>
    <div className="text-sm text-muted-foreground">Match Success</div>
  </div>

  {/* Industries */}
  <div className="text-center">
    <div className="text-3xl font-bold">
      <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
        50+
      </span>
    </div>
    <div className="text-sm text-muted-foreground">Industries</div>
  </div>
</div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${index <= currentStep 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'border-border text-muted-foreground'
                    }
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-24 h-0.5 mx-4 transition-all duration-300
                      ${index < currentStep ? 'bg-primary' : 'bg-border'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-2 bg-border rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="max-w-4xl mx-auto gradient-card border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Step {currentStep + 1}: {steps[currentStep].title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            {renderStepContent()}
            
            {/* Navigation */}
            <div className="flex justify-between mt-12">
              <Button 
                variant="glow" 
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              <Button 
                onClick={handleNext}
                disabled={!Object.values(formData)[currentStep]}
                className="px-8"
                variant="gradient"
              >
                {currentStep === steps.length - 1 ? 'Find Mentors' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="max-w-6xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="gradient-card border-0 text-center p-6 glow-border">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 pulse-glow">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Matching</h3>
            <p className="text-muted-foreground text-sm">Advanced algorithms find your perfect mentor based on compatibility and goals.</p>
          </Card>
          
          <Card className="gradient-card border-0 text-center p-6 glow-border">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 pulse-glow">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Verified Alumni</h3>
            <p className="text-muted-foreground text-sm">Connect with successful graduates across industries and career stages.</p>
          </Card>
          
          <Card className="gradient-card border-0 text-center p-6 glow-border">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 pulse-glow">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Flexible Sessions</h3>
            <p className="text-muted-foreground text-sm">Schedule mentoring sessions that fit your busy lifestyle and timezone.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;