import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  UserPlus, 
  Calendar, 
  Megaphone, 
  FileText, 
  TrendingUp 
} from 'lucide-react';

const quickActions = [
  {
    icon: UserPlus,
    label: 'Add User',
    description: 'Create new alumni account',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Calendar,
    label: 'Create Event',
    description: 'Schedule new gathering',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Megaphone,
    label: 'Send Announcement',
    description: 'Broadcast to network',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: FileText,
    label: 'Generate Report',
    description: 'Export analytics data',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: TrendingUp,
    label: 'View Analytics',
    description: 'Check engagement metrics',
    color: 'from-indigo-500 to-purple-500'
  }
];

export function QuickActions() {
  return (
    <div className="mentor-card p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gradient">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">Common administrative tasks</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              className="h-auto p-4 flex flex-col items-start gap-2 hover:glow-effect transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-foreground group-hover:text-gradient transition-colors">
                    {action.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}