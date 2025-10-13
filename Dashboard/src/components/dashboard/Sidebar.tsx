import React from 'react';
// 💡 REQUIRED: Import the Link and useLocation component for navigation
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
    Home, 
    Users, 
    Calendar, 
    Megaphone, 
    TrendingUp, 
    DollarSign,
    Bell,
    Settings,
    Shield,
    FileText,
    Award,
    UserCheck
} from 'lucide-react';

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    userRole: 'admin' | 'superadmin';
}

const navigationItems = {
    admin: [
        { icon: Home, label: 'Dashboard', href: '/' }, // Removed 'active: true'
        { icon: Users, label: 'User Management', href: '/users' },
        { icon: Calendar, label: 'Events', href: '/events' },
        { icon: Megaphone, label: 'Announcements', href: '/announcements' },
        { icon: TrendingUp, label: 'Analytics', href: '/analytics' },
        { icon: DollarSign, label: 'Fundraising', href: '/fundraising' },
        { icon: Bell, label: 'Notifications', href: '/notifications' },
    ],
    superadmin: [
        { icon: Home, label: 'Dashboard', href: '/' }, // Removed 'active: true'
        { icon: Shield, label: 'Role Management', href: '/roles' },
        { icon: Users, label: 'User Management', href: '/users' },
        { icon: Calendar, label: 'Events', href: '/events' },
        { icon: DollarSign, label: 'Fundraising', href: '/fundraising' },
        { icon: Bell, label: 'Notifications', href: '/notifications' },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ]
};

export function Sidebar({ collapsed, onToggle, userRole }: SidebarProps) {
    const items = navigationItems[userRole];
    // 1. Get the current URL path
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <aside className={cn(
            "fixed left-0 top-0 z-40 h-screen gradient-card border-r transition-all duration-300",
            collapsed ? "w-16" : "w-64"
        )}>
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-border-subtle">
                    {!collapsed && (
                        <h2 className="text-2xl font-semibold text-gradient">
                            AlumniNet 
                        </h2>
                    )}
                    <button
                        onClick={onToggle}
                        className="p-2 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                        {/* Collapse/Toggle Icon */}
                        <div className="w-4 h-4 border-2 border-current rounded"></div>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-2">
                    {items.map((item) => {
                        // 2. Check if the item's href matches the current path
                        const isActive = item.href === currentPath || 
                                         (item.href === '/' && currentPath === '/'); // Special handling for the root path '/'

                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                    // 3. Apply active styles based on the check
                                    isActive 
                                        ? "fancy-button text-white" 
                                        : "text-foreground hover:bg-accent/50 hover:glow-effect"
                                )}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                {!collapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Role Badge */}
                {!collapsed && (
                    <div className="p-4 border-t border-border-subtle">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full glow-border flex items-center justify-center">
                                {userRole === 'superadmin' ? <Shield className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gradient">
                                    {userRole === 'superadmin' ? 'Super Administrator' : 'Administrator'}
                                </p>
                                <p className="text-xs text-muted-foreground">Full Access</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}