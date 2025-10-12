import { useState, KeyboardEvent, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// 💡 DUMMY MASTER SKILL LIST for suggestions
const MASTER_SKILLS = [
    "Corporate Law", "Financial Analysis", "Mergers & Acquisitions", 
    "Litigation", "Contract Negotiation", "Tax Law", "Python", 
    "Data Science", "Project Management", "Agile Leadership",
    "Product Management", "FinTech", "Cloud Computing", "AI/ML"
];

interface SkillInputProps {
    onAddSkill: (skill: string) => void;
    currentSkills: string[];
}

const SkillInputWithSuggestions = ({ onAddSkill, currentSkills }: SkillInputProps) => {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter master list: matches input AND is not already in the user's current list
    const suggestions = MASTER_SKILLS.filter(skill => 
        skill.toLowerCase().includes(inputValue.toLowerCase()) && 
        !currentSkills.includes(skill)
    ).slice(0, 8); // Limit suggestions

    const handleAdd = (skill: string) => {
        if (skill.trim()) {
            onAddSkill(skill.trim());
            setInputValue("");
            if (inputRef.current) inputRef.current.focus();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        // Handle 'Enter' key press to quickly add the current input text
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd(inputValue);
        }
    };

    return (
        <Card className="p-4 space-y-3 shadow-lg">
            <div className="relative">
                <Input
                    ref={inputRef}
                    placeholder="Search or type a skill (e.g., Python, M&A)"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 pr-24"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                
                <Button 
                    size="sm" 
                    onClick={() => handleAdd(inputValue)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                    disabled={inputValue.trim() === ''}
                >
                    <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
            </div>

            {/* Suggestions Panel */}
            {suggestions.length > 0 && (
                <CardContent className="p-0 pt-1">
                    <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((skill) => (
                            <Badge 
                                key={skill}
                                onClick={() => handleAdd(skill)}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
                            >
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

export default SkillInputWithSuggestions;