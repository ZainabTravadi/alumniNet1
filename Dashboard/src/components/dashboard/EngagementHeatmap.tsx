import React from 'react';

export function EngagementHeatmap() {
  // Generate mock heatmap data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const generateHeatmapData = () => {
    const data = [];
    for (let week = 0; week < 52; week++) {
      for (let day = 0; day < 7; day++) {
        data.push({
          week,
          day,
          value: Math.floor(Math.random() * 5), // 0-4 activity level
          date: new Date(2024, 0, week * 7 + day + 1)
        });
      }
    }
    return data;
  };

  const heatmapData = generateHeatmapData();

  const getColorIntensity = (value: number) => {
    const intensities = [
      'bg-muted/20',
      'bg-primary/20',
      'bg-primary/40', 
      'bg-primary/60',
      'bg-primary/80',
      'bg-primary'
    ];
    return intensities[value] || intensities[0];
  };

  return (
    <div className="mentor-card p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gradient">Alumni Engagement Heatmap</h3>
          <p className="text-sm text-muted-foreground">Activity patterns over the past year</p>
        </div>

        <div className="space-y-3">
          {/* Month labels */}
          <div className="flex justify-between text-xs text-muted-foreground pl-10">
            {months.map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col justify-between text-xs text-muted-foreground py-1">
              {days.map((day, index) => (
                <span key={day} className={index % 2 === 0 ? 'opacity-100' : 'opacity-0'}>
                  {day}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-52 gap-1">
              {heatmapData.map((cell, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-sm transition-all duration-200 hover:scale-125 hover:glow-effect cursor-pointer ${getColorIntensity(cell.value)}`}
                  title={`${cell.date.toDateString()}: ${cell.value} activities`}
                />
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Less active</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getColorIntensity(level)}`}
                />
              ))}
            </div>
            <span>More active</span>
          </div>
        </div>
      </div>
    </div>
  );
}