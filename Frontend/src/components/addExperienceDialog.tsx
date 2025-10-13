// src/components/AddExperienceDialog.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Save } from 'lucide-react';

// Interface matching the career object in Firestore
export interface NewCareerItem {
    company: string;
    endDate: string | null;
    isCurrent: boolean;
    position: string;
    startDate: string;
}

interface AddExperienceDialogProps {
    isOpen: boolean;
    onClose: () => void;
    // onSave handler accepts the new item, excluding any client-side ID
    onSave: (newJob: NewCareerItem) => void;
}

const initialNewJob: NewCareerItem = {
    position: '',
    company: '',
    startDate: '',
    endDate: null,
    isCurrent: false,
};

export const AddExperienceDialog: React.FC<AddExperienceDialogProps> = ({ isOpen, onClose, onSave }) => {
    const [newJob, setNewJob] = useState<NewCareerItem>(initialNewJob);

    const handleInputChange = (field: keyof NewCareerItem, value: string | boolean) => {
        setNewJob(prev => {
            const updated = { 
                ...prev, 
                [field]: value,
            };

            // Custom logic for isCurrent switch
            if (field === 'isCurrent') {
                updated.endDate = value === true ? null : prev.endDate;
            }
            
            return updated;
        });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if (!newJob.position || !newJob.company || !newJob.startDate) {
            alert("Please fill in Position, Company, and Start Date.");
            return;
        }

        // Validate End Date if not current
        if (!newJob.isCurrent && !newJob.endDate) {
            alert("Please specify the End Date or mark as current.");
            return;
        }

        const jobToSave: NewCareerItem = {
            ...newJob,
            // Ensure endDate is null if it is current
            endDate: newJob.isCurrent ? null : newJob.endDate,
        };
        
        onSave(jobToSave);
        setNewJob(initialNewJob); // Reset form
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) setNewJob(initialNewJob); onClose(); }}>
            <DialogContent className="sm:max-w-[425px] md:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5"/> Add New Position</DialogTitle>
                    <DialogDescription>
                        Enter the details of your new professional experience.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSave} className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input id="position" value={newJob.position} onChange={(e) => handleInputChange('position', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" value={newJob.company} onChange={(e) => handleInputChange('company', e.target.value)} required />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date (Month/Year)</Label>
                            <Input id="startDate" type="month" value={newJob.startDate} onChange={(e) => handleInputChange('startDate', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="current">Currently Employed?</Label>
                            <Switch 
                                id="current"
                                checked={newJob.isCurrent} 
                                onCheckedChange={(checked) => handleInputChange('isCurrent', checked)} 
                                className="mt-3 block"
                            />
                        </div>
                    </div>
                    
                    {!newJob.isCurrent && (
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date (Month/Year)</Label>
                            <Input 
                                id="endDate" 
                                type="month" 
                                value={newJob.endDate || ''} 
                                onChange={(e) => handleInputChange('endDate', e.target.value)} 
                                required={!newJob.isCurrent}
                            />
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <Label htmlFor="description">Job Description (Optional)</Label>
                        <Textarea 
                            id="description" 
                            // Note: Your Firestore structure doesn't include 'description' but it's good practice. 
                            // If you use it, ensure you update the CareerItem type in Profile.tsx too.
                            value={(newJob as any).description || ''} 
                            onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value } as NewCareerItem))}
                            rows={3} 
                        />
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="submit">
                            <Save className="w-4 h-4 mr-2" />
                            Save Position
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};