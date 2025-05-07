import { ref, computed } from 'vue';
import { useDateTime } from './useDateTime';

export function useReminders() {
  const { isExpired } = useDateTime();
  const tasks = ref([]);
  const filter = ref('all');
  
  // Load tasks from localStorage
  const loadTasks = () => {
    const savedTasks = localStorage.getItem('reminder-tasks');
    if (savedTasks) {
      tasks.value = JSON.parse(savedTasks);
    }
  };
  
  // Save tasks to localStorage
  const saveTasks = () => {
    localStorage.setItem('reminder-tasks', JSON.stringify(tasks.value));
  };
  
  // Add new task
  const addTask = (task) => {
    const taskId = Date.now().toString();
    tasks.value.push({
      ...task,
      id: taskId,
    });
    saveTasks();
  };
  
  // Update existing task
  const updateTask = (task) => {
    const index = tasks.value.findIndex(t => t.id === task.id);
    if (index !== -1) {
      tasks.value[index] = { ...task };
      saveTasks();
    }
  };
  
  // Delete a task
  const deleteTask = (taskId) => {
    if (confirm('Are you sure you want to delete this task?')) {
      tasks.value = tasks.value.filter(task => task.id !== taskId);
      saveTasks();
    }
  };
  
  // Toggle task status
  const toggleTaskStatus = (task) => {
    task.completed = !task.completed;
    saveTasks();
  };
  
  // Toggle task priority
  const toggleTaskPriority = (task) => {
    task.priority = !task.priority;
    saveTasks();
  };
  
  // Sort tasks with priority first
  const sortedTasks = computed(() => {
    return [...tasks.value].sort((a, b) => {
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return 0;
    });
  });
  
  // Computed filtered tasks based on current filter
  const filteredTasks = computed(() => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let filtered;
    
    switch (filter.value) {
      case 'today':
        filtered = sortedTasks.value.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === today.getTime() && !task.completed;
        });
        break;
      case 'upcoming':
        filtered = sortedTasks.value.filter(task => {
          if (!task.dueDate || task.completed) return false;
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() > today.getTime();
        });
        break;
      case 'expired':
        filtered = sortedTasks.value.filter(task => {
          if (!task.dueDate || task.completed) return false;
          return isExpired(task);
        });
        break;
      case 'completed':
        filtered = sortedTasks.value.filter(task => task.completed);
        break;
      case 'priority':
        filtered = sortedTasks.value.filter(task => task.priority && !task.completed);
        break;
      default: // 'all'
        filtered = sortedTasks.value.filter(task => !task.completed);
        break;
    }
    
    return filtered;
  });

  return {
    tasks,
    filter,
    filteredTasks,
    loadTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    toggleTaskPriority
  };
}