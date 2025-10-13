import { useState, useCallback, useMemo } from 'react';
// 💡 REQUIRED FOR NAVIGATION
import { Link } from 'react-router-dom'; 

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    User,
    Briefcase,
    BookOpen,
    Send,
    Award,
    Upload,
} from 'lucide-react';

// ------------------ 💡 APPLICATION DATA STRUCTURE ------------------
interface MentorApplication {
    fullName: string;
    email: string;
    phone: string;
    currentTitle: string;
    company: string;
    yearsExperience: string;
    linkedinUrl: string;
    resumeFile: File | null; 
    certifications: string;
    expertiseAreas: string[];
    mentorshipFrequency: string;
    preferredTopics: string;
    bio: string;
    agreedToTerms: boolean;
}

// ------------------ 💡 DUMMY DATA ------------------
const DUMMY_EXPERTISE = [
    'Software Engineering',
    'Venture Capital',
    'Financial Modeling',
    'Product Management',
    'UX/UI Design',
    'Marketing Strategy',
    'Technical Leadership',
    'Entrepreneurship'
];

// ---------------------------------------------------------------------

const MentorApplicationPage = () => {
    // We remove the unused `useNavigate` hook here
    
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<MentorApplication>>({
        expertiseAreas: [],
        agreedToTerms: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);

    // Validation logic 
    const isStep1Valid = useMemo(() => 
        !!formData.fullName && 
        !!formData.email && 
        !!formData.currentTitle && 
        !!formData.company
    , [formData]);

    const isStep2Valid = useMemo(() => 
        !!formData.yearsExperience && 
        (!!formData.resumeFile || !!formData.linkedinUrl) 
    , [formData]);

    const isStep3Valid = useMemo(() => 
        (formData.expertiseAreas?.length ?? 0) > 0 && 
        !!formData.mentorshipFrequency && 
        !!formData.bio
    , [formData]);

    // Handlers...
    const handleChange = useCallback((field: keyof MentorApplication, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleExpertiseToggle = useCallback((area: string) => {
        setFormData(prev => {
            const current = prev.expertiseAreas || [];
            const updated = current.includes(area) 
                ? current.filter(a => a !== area) 
                : [...current, area];
            return { ...prev, expertiseAreas: updated };
        });
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        handleChange('resumeFile', file);
    }, [handleChange]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.agreedToTerms) {
            alert("You must agree to the terms to submit your application.");
            return;
        }

        setIsSubmitting(true);
        console.log("Submitting mentor application:", formData);

        // --- Mock API Call (Simulate 1.5 seconds latency) ---
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setSubmissionSuccess(true);
        setStep(4);
        setIsSubmitting(false);
    };

    const renderStepContent = () => {
        switch (step) {
            // -------------------- STEP 1: Personal Info --------------------
            case 1:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                            <User className="h-5 w-5" /> Personal & Professional Snapshot
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name*</Label>
                                <Input id="fullName" value={formData.fullName || ''} onChange={(e) => handleChange('fullName', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address*</Label>
                                <Input id="email" type="email" value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} required />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="currentTitle">Current Job Title*</Label>
                                <Input id="currentTitle" value={formData.currentTitle || ''} onChange={(e) => handleChange('currentTitle', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company">Company/Organization*</Label>
                                <Input id="company" value={formData.company || ''} onChange={(e) => handleChange('company', e.target.value)} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" type="tel" value={formData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} />
                            </div>
                        </div>
                    </div>
                );

            // -------------------- STEP 2: Supporting Credentials --------------------
            case 2:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                            <Briefcase className="h-5 w-5" /> Professional Credentials
                        </h3>
                        
                        <div className="space-y-2">
                            <Label htmlFor="yearsExperience">Years of Professional Experience*</Label>
                            <Input id="yearsExperience" type="number" min="1" placeholder="e.g., 8" value={formData.yearsExperience || ''} onChange={(e) => handleChange('yearsExperience', e.target.value)} required />
                        </div>

                        <div className="space-y-4 pt-2 border-t border-dashed mt-4">
                            <h4 className="font-medium text-sm">Supporting Documents (Provide LinkedIn URL OR Upload Resume)*</h4>
                            
                            <div className="space-y-2">
                                <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
                                <Input id="linkedinUrl" type="url" placeholder="https://linkedin.com/in/yourname" value={formData.linkedinUrl || ''} onChange={(e) => handleChange('linkedinUrl', e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="resumeFile" className="flex items-center gap-2">
                                    <Upload className="h-4 w-4" /> Upload Resume (.pdf, .docx)
                                </Label>
                                <Input id="resumeFile" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="file:text-primary file:font-medium" />
                                {formData.resumeFile && <p className="text-xs text-green-600">File attached: {formData.resumeFile.name}</p>}
                                {!isStep2Valid && (step === 2) && <p className="text-sm text-red-500">Required: Please provide your LinkedIn URL or upload a resume.</p>}
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="certifications">Relevant Certifications/Awards</Label>
                                <Textarea 
                                    id="certifications" 
                                    value={formData.certifications || ''} 
                                    onChange={(e) => handleChange('certifications', e.target.value)} 
                                    placeholder="List notable certifications, awards, or publications (optional)" 
                                />
                            </div>
                        </div>
                    </div>
                );
            
            // -------------------- STEP 3: Expertise & Commitment --------------------
            case 3:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                            <BookOpen className="h-5 w-5" /> Expertise & Commitment
                        </h3>

                        <div className="space-y-2">
                            <Label>Areas of Expertise (Select 3-5 Areas)*</Label>
                            <Card className="p-4 border-dashed bg-muted/20">
                                <div className="flex flex-wrap gap-2">
                                    {DUMMY_EXPERTISE.map(area => (
                                        <Badge
                                            key={area}
                                            variant={formData.expertiseAreas?.includes(area) ? "default" : "outline"}
                                            onClick={() => handleExpertiseToggle(area)}
                                            className="cursor-pointer transition-colors"
                                        >
                                            {area}
                                        </Badge>
                                    ))}
                                </div>
                                {(formData.expertiseAreas?.length ?? 0) < 1 && <p className="text-sm text-red-500 mt-2">Please select at least one area.</p>}
                                {(formData.expertiseAreas?.length ?? 0) > 5 && <p className="text-sm text-yellow-600 mt-2">We recommend selecting a maximum of 5 focus areas.</p>}
                            </Card>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="mentorshipFrequency">Preferred Mentoring Frequency*</Label>
                                <Select value={formData.mentorshipFrequency || ''} onValueChange={(value) => handleChange('mentorshipFrequency', value)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="How often can you commit?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">Weekly (1 hour)</SelectItem>
                                        <SelectItem value="bi-weekly">Bi-weekly (30 min - 1 hour)</SelectItem>
                                        <SelectItem value="monthly">Monthly (1 hour)</SelectItem>
                                        <SelectItem value="as-needed">As Needed (Flexible)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="preferredTopics">Preferred Discussion Topics</Label>
                                <Input id="preferredTopics" placeholder="e.g., Job hunting, System Design, Leadership" value={formData.preferredTopics || ''} onChange={(e) => handleChange('preferredTopics', e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Mentor Profile Bio*</Label>
                            <Textarea 
                                id="bio" 
                                value={formData.bio || ''} 
                                onChange={(e) => handleChange('bio', e.target.value)} 
                                placeholder="Write a professional bio (3-5 sentences) that will appear on your public profile." 
                                required 
                                className="min-h-[120px]"
                            />
                        </div>
                    </div>
                );
            
            // -------------------- STEP 4: Review & Submit (UPDATED FOR LINK) --------------------
            case 4:
                return submissionSuccess ? (
                    <div className="text-center p-8 space-y-4">
                        <Award className="h-20 w-20 text-green-500 mx-auto" />
                        <h3 className="text-2xl font-bold">Application Submitted Successfully!</h3>
                        <p className="text-muted-foreground">
                            Thank you for your generous offer to serve as a mentor. We appreciate you sharing your valuable expertise. You will receive an email notification soon.
                        </p>
                        {/* 💡 LINK COMPONENT FOR REDIRECTION */}
                        <Link to="/mentorship">
                            <Button className="mt-4">
                                Return to Mentorship Hub
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                            <Send className="h-5 w-5" /> Review & Submit
                        </h3>
                        
                        <Card className="p-4 bg-muted/20 space-y-3">
                            <h4 className="font-bold text-lg">Application Summary</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <p><span className="font-medium">Name:</span> {formData.fullName}</p>
                                <p><span className="font-medium">Title:</span> {formData.currentTitle} at {formData.company}</p>
                                <p><span className="font-medium">Experience:</span> {formData.yearsExperience} Years</p>
                                <p><span className="font-medium">Frequency:</span> {formData.mentorshipFrequency?.charAt(0).toUpperCase() + formData.mentorshipFrequency?.slice(1)}</p>
                            </div>
                            <div className="space-y-1 pt-2">
                                <p className="font-medium">Expertise:</p>
                                <div className="flex flex-wrap gap-1">
                                    {formData.expertiseAreas?.map(area => <Badge key={area} variant="secondary">{area}</Badge>)}
                                </div>
                            </div>
                            <div className="space-y-1 pt-2">
                                <p className="font-medium">Bio:</p>
                                <p className="text-muted-foreground italic text-xs">{formData.bio}</p>
                            </div>
                        </Card>

                        <div className="flex items-start space-x-2 pt-4">
                            <Checkbox 
                                id="terms" 
                                checked={formData.agreedToTerms} 
                                onCheckedChange={(checked) => handleChange('agreedToTerms', checked)} 
                            />
                            <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                I agree to the <span className="text-primary hover:underline cursor-pointer">Mentor Program Terms and Conditions</span> and confirm that all information provided is accurate.
                            </Label>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const renderActionButtons = () => {
        if (step === 4 && submissionSuccess) return null;

        return (
            <div className="flex justify-between pt-6">
                {/* Previous Button */}
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(prev => Math.max(1, prev - 1))} 
                    disabled={step === 1}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                </Button>

                {/* Next/Submit Button */}
                {step < 3 && (
                    <Button 
                        type="button" 
                        onClick={() => setStep(prev => prev + 1)} 
                        disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
                    >
                        Next: {step === 1 ? 'Credentials' : 'Commitment'} <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                )}
                {step === 3 && (
                    <Button 
                        type="button" 
                        onClick={() => setStep(4)} 
                        disabled={!isStep3Valid}
                    >
                        Review & Submit <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                )}
                {step === 4 && !submissionSuccess && (
                    <Button type="submit" disabled={isSubmitting || !formData.agreedToTerms}>
                        {isSubmitting ? 'Submitting...' : 'Confirm and Submit'}
                    </Button>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-8">
            <div className="max-w-6xl mx-auto space-y-10 w-full">
                {/* Header Section */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl md:text-6xl font-bold">
                        <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
                            Mentor Application
                        </span>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        We are thrilled you want to share your expertise. Please complete the four-step application below.
                    </p>
                </div>

                {/* Application Card */}
                <Card className="shadow-2xl">
                    <CardHeader className="p-6 border-b">
                        {/* Step Indicator */}
                        <div className="flex justify-between items-center w-full">
                            {[1, 2, 3, 4].map(s => (
                                <div key={s} className="flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 border-2 ${
                                        step === s ? 'bg-primary text-white border-primary' : 
                                        step > s ? 'bg-green-500 text-white border-green-500' : 
                                        'bg-white text-gray-500 border-gray-300'
                                    }`}>
                                        {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                                    </div>
                                    <span className={`text-sm mt-1 font-medium text-center ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {s === 1 && "Personal Info"}
                                        {s === 2 && "Credentials"}
                                        {s === 3 && "Expertise"}
                                        {s === 4 && "Review"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardHeader>

                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit}>
                            {renderStepContent()}
                            {renderActionButtons()}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MentorApplicationPage;