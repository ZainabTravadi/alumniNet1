// Re-use the EventData interface if possible, or define necessary types
interface EventDataForUtils {
    category: string;
}

export const formatDate = (dateStr: string): string => {
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    } catch (e) {
        return dateStr;
    }
};

export const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
        'Networking': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', 
        'Educational': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'Career': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', 
        'Sports': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        'Social': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
};

export const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hr ${mins > 0 ? `${mins} min` : ''}`.trim();
};