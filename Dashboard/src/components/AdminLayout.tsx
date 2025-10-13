import React, { useState, useCallback } from 'react'; // 💡 Import useState and useCallback
import { Outlet } from 'react-router-dom';
// NOTE: Assuming the Sidebar component is the one exported via named export
import { Sidebar } from './dashboard/Sidebar'; 
import { TopNavbar } from './dashboard/TopNavbar';

const AdminLayout = () => {
    // 💡 FIX 1: Add state for the sidebar's collapse status
    const [isCollapsed, setIsCollapsed] = useState(false);
     const [isDarkMode, setIsDarkMode] = useState(false);
    
    // 💡 FIX 2: Handler to toggle the status
    const handleToggle = useCallback(() => {
        setIsCollapsed(prev => !prev);
    }, []);
    const handleToggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => {
            // In a real app, you would toggle a 'dark' class on document.documentElement here
            document.documentElement.classList.toggle('dark', !prev);
            return !prev;
        });
    }, []);
    
    // 💡 FIX 3: Define the user role (Hardcoded for now, but should come from authentication later)
    const currentUserRole: 'admin' | 'superadmin' = 'superadmin'; 
    // Use 'superadmin' to show all links in the sidebar initially

    return (
        // Adjust main content margin/padding to account for the fixed sidebar width
        <div className="flex min-h-screen bg-background text-foreground">
            
            {/* Sidebar Container: Pass dynamic width class */}
            <aside 
                className={`flex-shrink-0 border-r border-primary/20 shadow-xl bg-primary/5 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}
            >
                {/* 💡 FIX 4: Pass all required props to the Sidebar */}
                <Sidebar 
                    collapsed={isCollapsed} 
                    onToggle={handleToggle} 
                    userRole={currentUserRole} 
                />
            </aside>
            {/* 2. Top Navbar (Fixed Position) */}
            <TopNavbar 
                sidebarCollapsed={isCollapsed}
                darkMode={isDarkMode}
                onToggleDarkMode={handleToggleDarkMode}
                // We don't need to pass the onToggle handler to the TopNavbar if the sidebar button is the only trigger.
            />
            
            {/* Main Content Area: Content shifts based on sidebar state */}
            <main className={`flex-1 p-8 lg:p-10 overflow-y-auto transition-all duration-300`}>
                <Outlet /> 
            </main>
        </div>
    );
};

export default AdminLayout;