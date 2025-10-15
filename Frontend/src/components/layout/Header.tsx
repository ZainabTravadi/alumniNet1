import { useState, useRef, useEffect } from 'react';
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
  IndianRupee,
  Settings,
  User,
  MessageCircle
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

import { useNavigate } from 'react-router-dom'; 
// 🔹 Firebase imports
import { auth, db } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [userData, setUserData] = useState<any>(null); // 🔹 store Firestore user data
  const [loadingUser, setLoadingUser] = useState(true); // 🔹 show loading while fetching user
  const searchRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Users },
    { name: 'Directory', href: '/directory', icon: Users },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Forums', href: '/forums', icon: MessageSquare },
    { name: 'Mentorship', href: '/mentorship', icon: BookOpen },
    { name: 'Fundraising', href: '/fundraising', icon: IndianRupee },
  ];

  // 🔹 Listen for authenticated user and fetch Firestore profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoadingUser(true);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData({ uid: user.uid, ...userSnap.data() });
        } else {
          console.warn('⚠️ No user profile found in Firestore');
        }
      } else {
        setUserData(null);
      }
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/auth"); // Redirect to the authentication route on successful sign-out
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
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

          {/* Desktop Nav */}
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

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden lg:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchRef}
                placeholder="Search alumni..."
                className="pl-10 w-64 bg-muted/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              />
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

            {/* 🔹 Profile Dropdown */}
            {loadingUser ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : userData ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={userData.avatarUrl || '/placeholder-avatar.jpg'}
                        alt={userData.displayName || 'User'}
                      />
                      <AvatarFallback>
                        {userData.displayName
                          ? userData.displayName[0].toUpperCase()
                          : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userData.displayName || 'Unnamed User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userData.batch ? `Class of ${userData.batch}` : ''}{' '}
                        {userData.department ? `• ${userData.department}` : ''}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/chat" className="flex items-center">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
            )}

            {/* Mobile Menu */}
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
      </div>
    </header>
  );
};

export default Header;
