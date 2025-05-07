export function useDateTime() {
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      
      if (dateOnly.getTime() === today.getTime()) {
        return 'Today';
      } else if (dateOnly.getTime() === tomorrow.getTime()) {
        return 'Tomorrow';
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }
    };
    
    const formatTime = (timeString) => {
      if (!timeString) return '';
      
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      
      // Format in 12-hour time with AM/PM
      const period = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
      const formattedMinute = minute.toString().padStart(2, '0');
      
      return `${formattedHour}:${formattedMinute} ${period}`;
    };
    
    const getTaskDateTime = (task) => {
      const dateTime = new Date(task.dueDate);
      
      if (task.dueTime) {
        const timeParts = task.dueTime.split(':');
        dateTime.setHours(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), 0, 0);
      } else {
        // If no time specified, set to end of day
        dateTime.setHours(23, 59, 59, 999);
      }
      
      return dateTime;
    };
    
    const isExpired = (task) => {
      if (!task.dueDate || task.completed) return false;
      
      const now = new Date();
      const dueDateTime = getTaskDateTime(task);
      
      return dueDateTime < now;
    };
    
    const truncateText = (text, maxLength) => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };
  
    return {
      formatDate,
      formatTime,
      getTaskDateTime,
      isExpired,
      truncateText
    };
  }