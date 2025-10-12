import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Building2, Calendar, MapPin } from 'lucide-react';

interface ExperienceItem {
    position: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    description: string;
}

interface ExperienceEditorProps {
    // Optional prop to pass initial data for editing existing entry
    initialData?: ExperienceItem;
    // Function to handle saving the new or updated item
    onSave: (data: ExperienceItem) => void;
    // Function to close the editor without saving
    onCancel: () => void;
}

const defaultExperience: ExperienceItem = {
    position: '',
    company: '',
    location: '',
    startDate: new Date().toISOString().substring(0, 7), // YYYY-MM format
    endDate: null,
    isCurrent: true,
    description: '',
};

const ExperienceEditorCard = ({ initialData, onSave, onCancel }: ExperienceEditorProps) => {
    const [formData, setFormData] = useState<ExperienceItem>(initialData || defaultExperience);

    const handleInputChange = (field: keyof ExperienceItem, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCurrentToggle = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            isCurrent: checked,
            endDate: checked ? null : prev.endDate || new Date().toISOString().substring(0, 7),
        }));
    };

    const handleSubmit = () => {
        if (!formData.position || !formData.company || !formData.startDate) {
            alert("Please fill in Position, Company, and Start Date.");
            return;
        }
        onSave(formData);
    };

    return (
        <Card
            className="w-full glass-card p-6 border-2 border-primary/20 shadow-2xl"
            style={{
                backdropFilter: "blur(15px)",
                background: "rgba(255, 255, 255, 0.05)",
            }}
        >
            <CardHeader className="pb-4 border-b border-border/50">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    {initialData ? 'Edit Experience' : 'Add New Experience'}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="position">Title / Position</Label>
                    <Input
                        id="position"
                        placeholder="e.g., Senior Software Engineer"
                        value={formData.position}
                        onChange={(e) => handleInputChange('position', e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                            id="company"
                            placeholder="e.g., Tech Innovations Inc."
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="location"
                                placeholder="e.g., San Francisco, CA"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                            id="startDate"
                            type="month"
                            value={formData.startDate}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endDate" className="flex items-center gap-2">
                            End Date
                        </Label>
                        <Input
                            id="endDate"
                            type="month"
                            value={formData.endDate || ''}
                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                            disabled={formData.isCurrent}
                        />
                    </div>
                </div>
                
                {/* Current Role Checkbox (Simplified Switch/Checkbox logic) */}
                <div className="flex items-center space-x-3 pt-2">
                    <input 
                        type="checkbox" 
                        id="isCurrent" 
                        checked={formData.isCurrent} 
                        onChange={(e) => handleCurrentToggle(e.target.checked)} 
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <Label htmlFor="isCurrent" className="font-medium text-sm">
                        I currently work here
                    </Label>
                </div>

                <div className="space-y-2 pt-4">
                    <Label htmlFor="description">Description / Key Achievements</Label>
                    <Textarea
                        id="description"
                        placeholder="e.g., Leading microservices architecture development..."
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="outline" onClick={onCancel} className="min-w-24">
                        <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                    <Button onClick={handleSubmit} className="bg-gradient-primary hover:opacity-90 min-w-24">
                        <Plus className="h-4 w-4 mr-2" /> {initialData ? 'Update' : 'Add'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ExperienceEditorCard;