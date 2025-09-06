import { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  Search, 
  Menu, 
  X, 
  Users, 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  DollarSign,
  Settings,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Users },
    { name: 'Directory', href: '/directory', icon: Users },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Forums', href: '/forums', icon: MessageSquare },
    { name: 'Mentorship', href: '/mentorship', icon: BookOpen },
    { name: 'Fundraising', href: '/fundraising', icon: DollarSign },
  ];

  // Example alumni data
  const alumniList = [
    {
      name: "Sarah Chen",
      year: 2019,
      department: "Computer Science",
      company: "Google",
      location: "San Francisco",
      email: "sarah.chen@gmail.com",
      bio: "AI enthusiast and mentor.",
      avatar: "/placeholder-avatar.jpg"
    },
    {
      name: "Michael Rodriguez",
      year: 2020,
      department: "Mechanical Eng",
      company: "Tesla",
      location: "Austin",
      email: "michael.r@tesla.com",
      bio: "EV design specialist.",
      avatar: "/placeholder-avatar.jpg"
    },
    {
      name: "Priya Patel",
      year: 2018,
      department: "Electrical Eng",
      company: "Apple",
      location: "Cupertino",
      email: "priya.patel@apple.com",
      bio: "Hardware engineer and speaker.",
      avatar: "/placeholder-avatar.jpg"
    },
    {
      name: "John Doe",
      year: 2017,
      department: "Civil Eng",
      company: "Amazon",
      location: "Seattle",
      email: "john.doe@amazon.com",
      bio: "Infrastructure project manager.",
      avatar: "/placeholder-avatar.jpg"
    },
    {
      name: "Aisha Khan",
      year: 2021,
      department: "Business Admin",
      company: "Meta",
      location: "Menlo Park",
      email: "aisha.khan@meta.com",
      bio: "Product manager and startup advisor.",
      avatar: "/placeholder-avatar.jpg"
    },
  ];

  const filteredAlumni = search.length > 0
    ? alumniList.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                AlumniNet
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-3 ml-6">
  {navigation.map((item) => (
    <Link
      key={item.name}
      to={item.href}
      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive(item.href)
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <item.icon className="h-4 w-4 mr-2" />
      <span>{item.name}</span>
    </Link>
  ))}
</nav>

          {/* Search & Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden lg:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchRef}
                placeholder="Search alumni..."
                className="pl-10 w-64 bg-muted/50"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              />
              {showDropdown && filteredAlumni.length > 0 && (
                <div className="absolute left-0 mt-1 w-full bg-background border rounded shadow-lg z-50 max-h-60 overflow-auto">
                  {filteredAlumni.map((alum, idx) => (
                    <div key={idx} className="px-4 py-2 hover:bg-accent cursor-pointer flex items-center gap-3">
                      <img src={alum.avatar} alt={alum.name} className="w-8 h-8 rounded-full object-cover border" />
                      <div>
                        <span className="font-medium">{alum.name}</span>
                        <div className="text-xs text-muted-foreground">
                          {alum.year} • {alum.department} • {alum.company} • {alum.location}
                        </div>
                        <div className="text-xs text-muted-foreground">{alum.email}</div>
                        <div className="text-xs text-muted-foreground italic">{alum.bio}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <Link to="/notifications" className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary">
                  3
                </Badge>
              </Button>
            </Link>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Class of 2018 • CSE
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border/50">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-lg text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4 inline mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;