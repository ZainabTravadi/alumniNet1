import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Bell,
  Moon,
  Sun,
  User,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

/* ------------------ TYPES ------------------ */

interface SearchResult {
  id: string;
  name: string;
  title?: string;
  company?: string;
  avatar?: string;
  category: 'user' | 'event' | 'post';
}

interface TopNavbarProps {
  sidebarCollapsed: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

/* ------------------ UTILS ------------------ */

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

/* ✅ IMPORTANT: backend base URL only */
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://alumninet-backend-8ab3a9de8aad.herokuapp.com';

const SEARCH_API = `${API_BASE}/api/search/global`;

/* ------------------ COMPONENT ------------------ */

export function TopNavbar({
  sidebarCollapsed,
  darkMode,
  onToggleDarkMode,
}: TopNavbarProps) {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  /* ------------------ HANDLERS ------------------ */

  const handleSignOut = () => {
    // 🔐 plug Firebase signOut later
    navigate('/');
  };

  const handleViewNotifications = () => {
    navigate('/notifications');
  };

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      setShowDropdown(false);
      setSearchTerm('');

      switch (result.category) {
        case 'user':
          navigate(`/profile/${result.id}`);
          break;
        case 'event':
          navigate(`/events/${result.id}`);
          break;
        case 'post':
          navigate(`/forum/${result.id}`);
          break;
        default:
          break;
      }
    },
    [navigate]
  );

  /* ------------------ SEARCH EFFECT ------------------ */

  useEffect(() => {
    if (searchTerm.trim().length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${SEARCH_API}?q=${encodeURIComponent(searchTerm)}`,
          { signal: controller.signal }
        );

        const json = await res.json();

        if (res.ok && Array.isArray(json.data)) {
          setSearchResults(json.data);
        } else {
          setSearchResults([]);
        }

        setShowDropdown(true);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Global search failed:', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchTerm]);

  /* ------------------ ICON HELPERS ------------------ */

  const getResultIcon = (category: string) => {
    switch (category) {
      case 'user':
        return <User className="h-4 w-4 text-primary" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'post':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  /* ------------------ RENDER ------------------ */

  return (
    <header
      className={cn(
        'fixed top-0 z-30 h-16 border-b bg-background/80 backdrop-blur transition-all',
        sidebarCollapsed ? 'left-16' : 'left-64',
        'right-0'
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* SEARCH */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users, events, posts..."
            className="pl-10"
          />

          {showDropdown && (
            <Card className="absolute top-full mt-2 w-full max-h-80 overflow-y-auto z-50 p-2">
              {isSearching && (
                <p className="text-center text-sm text-muted-foreground p-2">
                  Searching…
                </p>
              )}

              {!isSearching && searchResults.length === 0 && (
                <p className="text-center text-sm text-muted-foreground p-2">
                  No results found
                </p>
              )}

              {searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted"
                >
                  {getResultIcon(result.category)}
                  <div>
                    <p className="text-sm font-medium">{result.name}</p>
                    {result.title && (
                      <p className="text-xs text-muted-foreground">
                        {result.title}
                        {result.company ? ` · ${result.company}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onToggleDarkMode}>
            {darkMode ? <Sun /> : <Moon />}
          </Button>

          <Button variant="ghost" size="icon" onClick={handleViewNotifications}>
            <Bell />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User />
                <span className="hidden md:block text-sm">Admin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleSignOut}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
