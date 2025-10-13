import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: LucideIcon;
    description?: string;
    className?: string;
}

export function StatsCard({ 
    title, 
    value, 
    change, 
    changeType = 'neutral', 
    icon: Icon, 
    description,
    className 
}: StatsCardProps) {
    return (
        <div className={cn(
            "mentor-card p-6 space-y-4",
            className
        )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* MODIFICATION: Removed glow-border and pulse-glow classes */}
                    <div className="p-2 rounded-lg border border-border/50 bg-muted/20"> 
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                       <p className="text-sm font-medium bg-gradient-to-r from-purple-600 via-purple-500 to-white bg-clip-text text-transparent">
  {title}
</p>

                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="text-3xl font-bold text-gradient">{value}</div>
                {change && (
                    <div className="flex items-center gap-1">
                        <span className={cn(
                            "text-sm font-medium px-2 py-0.5 rounded-full",
                            changeType === 'positive' && "text-green-400 bg-green-400/10",
                            changeType === 'negative' && "text-red-400 bg-red-400/10",
                            changeType === 'neutral' && "text-muted-foreground bg-muted/20"
                        )}>
                            {change}
                        </span>
                        <span className="text-xs text-muted-foreground">vs last month</span>
                    </div>
                )}
            </div>
        </div>
    );
}