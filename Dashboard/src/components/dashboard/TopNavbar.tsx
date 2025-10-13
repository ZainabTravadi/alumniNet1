import React, { useState, useEffect } from 'react';
import { Search, Bell, Moon, Sun, User, Calendar, MessageSquare, Briefcase, GraduationCap } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ------------------ 💡 INTERFACE DEFINITIONS ------------------
interface SearchResult {
    id: string;
    name: string;
    title: string;
    company: string;
    avatar: string; 
    category: string; // e.g., 'user', 'event', 'post'
}

interface TopNavbarProps {
    sidebarCollapsed: boolean;
    darkMode: boolean;
    onToggleDarkMode: () => void; // This function is responsible for changing the theme state
}

// 💡 FIX: cn utility function definition (assumed implementation)
function cn(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

const SEARCH_API = import.meta.env.VITE_API_GLOBAL_SEARCH || 'http://localhost:5000/api/search/global';


export function TopNavbar({ sidebarCollapsed, darkMode, onToggleDarkMode }: TopNavbarProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResultsDropdown, setShowResultsDropdown] = useState(false); // Manages dropdown visibility

    // ------------------ 💡 DEBOUNCE AND FETCH LOGIC ------------------
    useEffect(() => {
        // Hide dropdown immediately if search term is cleared
        if (searchTerm.length === 0) {
            setSearchResults([]);
            setShowResultsDropdown(false);
            return;
        }

        setIsSearching(true);
        
        // Set up debounce timer
        const delaySearch = setTimeout(async () => {
            if (searchTerm.length < 3) {
                setIsSearching(false);
                return;
            }
            
            try {
                const response = await fetch(`${SEARCH_API}?q=${searchTerm}`);
                const result = await response.json();
                
                if (response.ok && result.data) {
                    setSearchResults(result.data);
                    setShowResultsDropdown(true); // Show dropdown if results exist
                } else {
                    setSearchResults([]);
                    setShowResultsDropdown(true); // Show dropdown even if results are empty
                }
            } catch (error) {
                console.error("Global search failed:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300); // 300ms debounce delay

        return () => clearTimeout(delaySearch); // Cleanup on fast typing or component unmount
    }, [searchTerm]);

    // Helper to determine the icon based on category (user, event, post, etc.)
    const getResultIcon = (category: string) => {
        switch (category) {
            case 'user': return <User className="h-4 w-4 text-primary" />;
            case 'event': return <Calendar className="h-4 w-4 text-green-500" />;
            case 'post': return <MessageSquare className="h-4 w-4 text-purple-500" />;
            default: return <Search className="h-4 w-4 text-muted-foreground" />;
        }
    }


    return (
        <header className={cn(
            "fixed top-0 z-30 h-16 gradient-card border-b border-border-subtle transition-all duration-300",
            sidebarCollapsed ? "left-16" : "left-64",
            "right-0"
        )}>
            <div className="flex h-full items-center justify-between px-6">
                
                {/* Search Bar (Functional Input and Results Dropdown) */}
                <div className="flex-1 max-w-xl relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search users, events, announcements..."
                        className="pl-10 glow-border"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                    
                    {/* 💡 LIVE RESULTS DROPDOWN */}
                    {showResultsDropdown && (searchTerm.length >= 3 || searchResults.length > 0) && (
                        <Card className="absolute top-full mt-2 w-full p-2 max-h-80 overflow-y-auto z-50 shadow-2xl">
                            {isSearching && (
                                <div className="p-2 text-center text-muted-foreground">Searching...</div>
                            )}
                            
                            {!isSearching && searchResults.length > 0 && (
                                <>
                                    <p className="text-xs font-semibold text-primary mb-1 p-2">
                                        Found {searchResults.length} Results
                                    </p>
                                    {searchResults.map((result) => (
                                        <DropdownMenuItem 
                                            key={result.id} 
                                            className="cursor-pointer flex items-center gap-3 justify-between hover:bg-muted/50 p-2 rounded-lg"
                                            // TODO: Add onClick navigation logic here
                                        >
                                            <div className="flex items-center gap-3">
                                                {getResultIcon(result.category)}
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{result.name}</p>
                                                    <p className="text-xs text-muted-foreground">{result.title} at {result.company}</p>
                                                </div>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </>
                            )}
                            
                            {!isSearching && searchResults.length === 0 && searchTerm.length >= 3 && (
                                <p className="p-2 text-center text-muted-foreground">No results found for "{searchTerm}"</p>
                            )}
                            
                            {/* If search term is too short, prompt the user */}
                            {searchTerm.length > 0 && searchTerm.length < 3 && (
                                <p className="p-2 text-center text-muted-foreground">Type 3 or more characters to search.</p>
                            )}

                        </Card>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {/* Dark Mode Toggle - Icon logic ensures proper display for white/dark background */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleDarkMode}
                        className="hover:glow-effect"
                    >
                        {/* 💡 If darkMode is TRUE (dark theme), show SUN (to switch to light/white theme) */}
                        {/* 💡 If darkMode is FALSE (light theme/white background), show MOON (to switch to dark theme) */}
                        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>

                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative hover:glow-effect">
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive flex items-center justify-center">
                            <span className="text-[8px] text-white font-bold">3</span>
                        </span>
                    </Button>

                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 hover:glow-effect">
                                <div className="w-8 h-8 rounded-full glow-border flex items-center justify-center">
                                    <User className="h-4 w-4" />
                                </div>
                                <div className="text-left hidden md:block">
                                    <p className="text-sm font-medium">Admin User</p>
                                    <p className="text-xs text-muted-foreground">admin@alumninet.com</p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 gradient-card">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                            <DropdownMenuItem>Preferences</DropdownMenuItem>
                            <DropdownMenuItem>Activity Log</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Sign Out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}