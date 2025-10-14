// src/pages/MentorApplicationPage.tsx
import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom'; 
import { auth, db } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

import { 
    Card, CardContent, CardHeader 
} from '@/components/ui/card';
import { 
    Button 
} from '@/components/ui/button';
import { 
    Input 
} from '@/components/ui/input';
import { 
    Label 
} from '@/components/ui/label';
import { 
    Textarea 
} from '@/components/ui/textarea';
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
    Checkbox 
} from '@/components/ui/checkbox';
import { 
    Badge 
} from '@/components/ui/badge';

import {
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    User,
    Briefcase,
    BookOpen,
    Send,
    Award,
    Upload
} from 'lucide-react';

interface MentorApplication {
    fullName: string;
    email: string;
    phone: string;
    currentTitle: string;
    company: string;
    yearsExperience: string;
    linkedinUrl: string;
    certifications: string;
    expertiseAreas: string[];
    mentorshipFrequency: string;
    preferredTopics: string;
    bio: string;
    agreedToTerms: boolean;
    userId?: string;
    timestamp?: any;
}

const DUMMY_EXPERTISE = [
    'Career Development & Planning',
    'Financial Planning & Budgeting',
    'Digital Marketing',
    'Data Analysis',
    'Small Business/Startups',
    'Technical Skills (General)',
    'Leadership & Management',
    'Communication & Networking',
    'Time Management & Productivity',
    'UX/UI Design'
];

const MentorApplicationPage = () => {
    const [user] = useAuthState(auth);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<MentorApplication>>({
        expertiseAreas: [],
        agreedToTerms: false,
        email: user?.email || ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);

    // -------- Validation --------
    const isStep1Valid = useMemo(() => 
        !!formData.fullName && 
        !!formData.email && 
        !!formData.currentTitle && 
        !!formData.company
    , [formData]);

    const isStep2Valid = useMemo(() => 
        !!formData.yearsExperience && 
        (!!formData.linkedinUrl)
    , [formData]);

    const isStep3Valid = useMemo(() => 
        (formData.expertiseAreas?.length ?? 0) > 0 && 
        !!formData.mentorshipFrequency && 
        !!formData.bio
    , [formData]);

    // -------- Handlers --------
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.agreedToTerms) {
            alert("Please agree to the terms before submitting.");
            return;
        }

        if (!user) {
            alert("You must be logged in to submit the application.");
            return;
        }

        setIsSubmitting(true);
        try {
            const docRef = doc(db, "mentorApplications", user.uid);
            await setDoc(docRef, {
                ...formData,
                userId: user.uid,
                timestamp: serverTimestamp(),
            });
            setSubmissionSuccess(true);
            setStep(4);
        } catch (error) {
            console.error("Error saving mentor application:", error);
            alert("There was an issue submitting your application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // -------- UI Steps --------
    const renderStepContent = () => {
        switch (step) {
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
                                <Label htmlFor="email">Email*</Label>
                                <Input id="email" type="email" value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} required disabled={!!user?.email} />
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
                        <div className="space-y-2">
                            <Label htmlFor="linkedinUrl">LinkedIn Profile URL*</Label>
                            <Input id="linkedinUrl" type="url" placeholder="https://linkedin.com/in/yourname" value={formData.linkedinUrl || ''} onChange={(e) => handleChange('linkedinUrl', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="certifications">Certifications / Awards</Label>
                            <Textarea id="certifications" value={formData.certifications || ''} onChange={(e) => handleChange('certifications', e.target.value)} placeholder="List any notable certifications or awards" />
                        </div>
                    </div>
                );
            
            case 3:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                            <BookOpen className="h-5 w-5" /> Expertise & Commitment
                        </h3>
                        <div className="space-y-2">
                            <Label>Areas of Expertise*</Label>
                            <Card className="p-4 border-dashed bg-muted/20">
                                <div className="flex flex-wrap gap-2">
                                    {DUMMY_EXPERTISE.map(area => (
                                        <Badge
                                            key={area}
                                            variant={formData.expertiseAreas?.includes(area) ? "default" : "outline"}
                                            onClick={() => handleExpertiseToggle(area)}
                                            className="cursor-pointer"
                                        >
                                            {area}
                                        </Badge>
                                    ))}
                                </div>
                            </Card>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="mentorshipFrequency">Preferred Mentoring Frequency*</Label>
                                <Select value={formData.mentorshipFrequency || ''} onValueChange={(v) => handleChange('mentorshipFrequency', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="as-needed">As Needed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="preferredTopics">Preferred Topics</Label>
                                <Input id="preferredTopics" placeholder="e.g., System Design, Leadership" value={formData.preferredTopics || ''} onChange={(e) => handleChange('preferredTopics', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Mentor Bio*</Label>
                            <Textarea id="bio" value={formData.bio || ''} onChange={(e) => handleChange('bio', e.target.value)} placeholder="Write a short 3–5 sentence bio" className="min-h-[120px]" />
                        </div>
                    </div>
                );

            case 4:
                return submissionSuccess ? (
                    <div className="text-center p-8 space-y-4">
                        <Award className="h-20 w-20 text-green-500 mx-auto" />
                        <h3 className="text-2xl font-bold">Application Submitted Successfully!</h3>
                        <p className="text-muted-foreground">
                            Thank you for offering to mentor! We’ll review your application and reach out soon.
                        </p>
                        <Link to="/mentorship">
                            <Button className="mt-4">Return to Mentorship Hub</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
                            <Send className="h-5 w-5" /> Review & Submit
                        </h3>
                        <Card className="p-4 bg-muted/20 space-y-2">
                            <p><strong>Name:</strong> {formData.fullName}</p>
                            <p><strong>Title:</strong> {formData.currentTitle} @ {formData.company}</p>
                            <p><strong>Experience:</strong> {formData.yearsExperience} years</p>
                        </Card>
                        <div className="flex items-start space-x-2 pt-4">
                            <Checkbox id="terms" checked={formData.agreedToTerms} onCheckedChange={(c) => handleChange('agreedToTerms', c)} />
                            <Label htmlFor="terms" className="text-sm">
                                I agree to the <span className="text-primary underline cursor-pointer">Mentor Program Terms</span>.
                            </Label>
                        </div>
                    </div>
                );
        }
    };

    const renderButtons = () => {
        if (step === 4 && submissionSuccess) return null;
        return (
            <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => setStep(p => Math.max(1, p - 1))} disabled={step === 1}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                </Button>

                {step < 3 && (
                    <Button onClick={() => setStep(p => p + 1)} disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}>
                        Next <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                )}
                {step === 3 && (
                    <Button onClick={() => setStep(4)} disabled={!isStep3Valid}>
                        Review <ArrowRight className="h-4 w-4 ml-2" />
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
                <div className="text-center space-y-2">
                    <h1 className="text-4xl md:text-6xl font-bold">
                        <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
                            Mentor Application
                        </span>
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        We’re thrilled you want to share your expertise. Please complete the 4-step application below.
                    </p>
                </div>

                <Card className="shadow-2xl">
                    <CardHeader className="p-6 border-b">
                        <div className="flex justify-between items-center w-full">
                            {[1,2,3,4].map(s => (
                                <div key={s} className="flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                                        step === s ? 'bg-primary text-white border-primary' :
                                        step > s ? 'bg-green-500 text-white border-green-500' :
                                        'bg-white text-gray-500 border-gray-300'
                                    }`}>
                                        {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                                    </div>
                                    <span className={`text-sm mt-1 font-medium ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {s===1?'Personal Info':s===2?'Credentials':s===3?'Expertise':'Review'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardHeader>

                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit}>
                            {renderStepContent()}
                            {renderButtons()}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MentorApplicationPage;
