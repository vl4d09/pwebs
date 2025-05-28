import { ref, computed } from 'vue';
import { useDateTime } from './useDateTime';

export function useReminders() {
  const { isExpired } = useDateTime();
  const tasks = ref([]);
  const filter = ref('all');
  const loading = ref(false);
  const error = ref(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0
  });
  
  const API_URL = 'http://localhost:5001/api';
  
  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('auth-token');
  };
  
  // Load tasks from API with pagination
  const loadTasks = async (page = 1, limit = 10) => {
    loading.value = true;
    error.value = null;
    const token = getToken();
    
    if (!token) {
      error.value = 'Authentication required';
      loading.value = false;
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/reminders?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Check if it's a token expiration issue
        if (response.status === 403) {
          const errorData = await response.json();
          if (errorData.message && errorData.message.includes('token')) {
            window.dispatchEvent(new CustomEvent('jwt-error', { 
              detail: { status: response.status, message: 'Token expired or invalid' }
            }));
            return;
          }
        }
        throw new Error(`Failed to load tasks: ${response.statusText}`);
      }
      
      const data = await response.json();
      tasks.value = data.reminders;
      pagination.value = {
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        totalItems: data.totalItems
      };
    } catch (err) {
      error.value = err.message;
      console.error('Error loading tasks:', err);
    } finally {
      loading.value = false;
    }
  };
  
  // Add new task via API
  const addTask = async (task) => {
    loading.value = true;
    error.value = null;
    const token = getToken();
    
    if (!token) {
      error.value = 'Authentication required';
      loading.value = false;
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(task)
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          const errorData = await response.json();
          if (errorData.message && errorData.message.includes('token')) {
            window.dispatchEvent(new CustomEvent('jwt-error', { 
              detail: { status: response.status, message: 'Token expired or invalid' }
            }));
            return;
          }
        }
        throw new Error(`Failed to add task: ${response.statusText}`);
      }
      
      const savedTask = await response.json();
      tasks.value.push(savedTask);
    } catch (err) {
      error.value = err.message;
      console.error('Error adding task:', err);
    } finally {
      loading.value = false;
    }
  };
  
  // Update existing task via API
  const updateTask = async (task) => {
    loading.value = true;
    error.value = null;
    const token = getToken();
    
    if (!token) {
      error.value = 'Authentication required';
      loading.value = false;
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/reminders/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(task)
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          const errorData = await response.json();
          if (errorData.message && errorData.message.includes('token')) {
            window.dispatchEvent(new CustomEvent('jwt-error', { 
              detail: { status: response.status, message: 'Token expired or invalid' }
            }));
            return;
          }
        }
        throw new Error(`Failed to update task: ${response.statusText}`);
      }
      
      const updatedTask = await response.json();
      const index = tasks.value.findIndex(t => t._id === task._id);
      if (index !== -1) {
        tasks.value[index] = updatedTask;
      }
    } catch (err) {
      error.value = err.message;
      console.error('Error updating task:', err);
    } finally {
      loading.value = false;
    }
  };
  
  // Delete a task via API
  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    loading.value = true;
    error.value = null;
    const token = getToken();
    
    if (!token) {
      error.value = 'Authentication required';
      loading.value = false;
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/reminders/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Only dispatch JWT error if it's actually a 403 error related to token
        if (response.status === 403) {
          const errorData = await response.json();
          if (errorData.message && errorData.message.includes('token')) {
            window.dispatchEvent(new CustomEvent('jwt-error', { 
              detail: { status: response.status, message: 'Token expired or invalid' }
            }));
            return;
          } else {
            // This is likely a permission error, not a token error
            throw new Error(errorData.message || 'You do not have permission to delete this item');
          }
        } else {
          throw new Error(`Failed to delete task: ${response.statusText}`);
        }
      } else {
        // Successful delete
        tasks.value = tasks.value.filter(task => task._id !== taskId);
      }
    } catch (err) {
      error.value = err.message;
      console.error('Error deleting task:', err);
    } finally {
      loading.value = false;
    }
  };
  
  // Toggle task status and update via API
  const toggleTaskStatus = async (task) => {
    const updatedTask = { ...task, completed: !task.completed };
    await updateTask(updatedTask);
  };
  
  // Toggle task priority and update via API
  const toggleTaskPriority = async (task) => {
    const updatedTask = { ...task, priority: !task.priority };
    await updateTask(updatedTask);
  };
  
  // Change page
  const changePage = (newPage) => {
    loadTasks(newPage, pagination.value.limit);
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
    loading,
    error,
    pagination,
    loadTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    toggleTaskPriority,
    changePage
  };
}