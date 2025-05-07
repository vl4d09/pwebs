<template>
    <div class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <!-- Header with navigation -->
      <header class="bg-white dark:bg-gray-800 shadow mb-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Reminders</h1>
            <nav class="flex space-x-4">
              <router-link to="/home" class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2 rounded-md">Home</router-link>
              <router-link to="/reminders" class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2 rounded-md">Reminders</router-link>
              <button @click="logout" class="text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 px-3 py-2 rounded-md">Logout</button>
            </nav>
          </div>
        </div>
      </header>
    
      <!-- Main Content -->
      <div class="flex-grow">
        <div class="max-w-4xl mx-auto px-4 pb-20">
          <!-- Header -->
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">My Tasks</h2>
            <button 
              @click="showNewTaskModal = true" 
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <span class="mr-1">+</span> New Reminder
            </button>
          </div>
          
          <!-- Filters -->
          <div class="flex gap-4 mb-6 flex-wrap">
            <button 
              @click="filter = 'all'" 
              :class="['px-3 py-1 rounded-md', filter === 'all' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300']"
            >
              All
            </button>
            <button 
              @click="filter = 'today'" 
              :class="['px-3 py-1 rounded-md', filter === 'today' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300']"
            >
              Today
            </button>
            <button 
              @click="filter = 'upcoming'" 
              :class="['px-3 py-1 rounded-md', filter === 'upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300']"
            >
              Upcoming
            </button>
            <button 
              @click="filter = 'expired'" 
              :class="['px-3 py-1 rounded-md', filter === 'expired' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300']"
            >
              Expired
            </button>
            <button 
              @click="filter = 'completed'" 
              :class="['px-3 py-1 rounded-md', filter === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300']"
            >
              Completed
            </button>
          </div>
          
          <!-- Task List -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow">
            <div v-if="filteredTasks.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">
              No reminders to display
            </div>
            <div v-else>
              <div v-for="task in filteredTasks" :key="task.id" 
                class="border-b border-gray-200 dark:border-gray-700 last:border-b-0 p-4 flex items-center">
                <!-- Checkbox -->
                <input 
                  type="checkbox" 
                  :checked="task.completed" 
                  @change="toggleTaskStatus(task)"
                  class="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                
                <!-- Task Content -->
                <div class="ml-3 flex-grow">
                  <p :class="[
                    'text-sm font-medium', 
                    task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 
                      isExpired(task) ? 'text-red-600 dark:text-red-400' : 
                      'text-gray-800 dark:text-white'
                  ]">
                    {{ task.title }}
                  </p>
                  <div class="mt-1">
                    <!-- Date and time -->
                    <div 
                      :class="[
                        'text-xs flex items-center', 
                        isExpired(task) ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                      ]" 
                      v-if="task.dueDate"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ formatDate(task.dueDate) }}
                      <span v-if="task.dueTime" class="ml-1">
                        at {{ formatTime(task.dueTime) }}
                      </span>
                      <span v-if="isExpired(task)" class="ml-1 font-bold">(Overdue)</span>
                    </div>
                    
                    <!-- Notes if present -->
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1" v-if="task.notes">
                      <p class="italic">{{ truncateText(task.notes, 50) }}</p>
                    </div>
                  </div>
                </div>
                
                <!-- Actions -->
                <div class="flex space-x-2">
                  <button @click="editTask(task)" class="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="deleteTask(task.id)" class="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <footer class="bg-white dark:bg-gray-800 shadow mt-auto py-4">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <div class="text-sm text-gray-500 dark:text-gray-400 mb-2 md:mb-0">
              &copy; {{ new Date().getFullYear() }} Reminder Dashboard. All rights reserved.
            </div>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm">Privacy Policy</a>
              <a href="#" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm">Terms of Service</a>
              <a href="#" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm">Contact</a>
            </div>
          </div>
        </div>
      </footer>
      
      <!-- New Task Modal -->
      <div v-if="showNewTaskModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {{ editingTask ? 'Edit Reminder' : 'New Reminder' }}
          </h2>
          <form @submit.prevent="saveTask">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input 
                type="text" 
                v-model="newTask.title" 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="What do you need to do?"
                required
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
              <textarea 
                v-model="newTask.notes" 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Add notes"
                rows="2"
              ></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                <input 
                  type="date" 
                  v-model="newTask.dueDate" 
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Time</label>
                <input 
                  type="time" 
                  v-model="newTask.dueTime" 
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div class="mb-5">
              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  v-model="newTask.priority" 
                  class="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 mr-2"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">Mark as priority</span>
              </label>
            </div>
            <div class="flex justify-end gap-2">
              <button 
                type="button" 
                @click="showNewTaskModal = false" 
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {{ editingTask ? 'Save' : 'Add' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ReminderDashboard',
    data() {
      return {
        tasks: [],
        filter: 'all',
        showNewTaskModal: false,
        newTask: {
          id: null,
          title: '',
          notes: '',
          dueDate: '',
          dueTime: '',
          priority: false,
          completed: false,
        },
        editingTask: null,
      };
    },
    computed: {
      filteredTasks() {
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch (this.filter) {
          case 'today':
            return this.tasks.filter(task => {
              if (!task.dueDate) return false;
              const dueDate = new Date(task.dueDate);
              dueDate.setHours(0, 0, 0, 0);
              return dueDate.getTime() === today.getTime() && !task.completed;
            });
          case 'upcoming':
            return this.tasks.filter(task => {
              if (!task.dueDate || task.completed) return false;
              const dueDate = new Date(task.dueDate);
              dueDate.setHours(0, 0, 0, 0);
              return dueDate.getTime() > today.getTime();
            });
          case 'expired':
            return this.tasks.filter(task => {
              if (!task.dueDate || task.completed) return false;
              return this.isExpired(task);
            });
          case 'completed':
            return this.tasks.filter(task => task.completed);
          default: // 'all'
            return this.tasks.filter(task => !task.completed);
        }
      }
    },
    methods: {
      saveTask() {
        if (this.editingTask) {
          // Update existing task
          const index = this.tasks.findIndex(t => t.id === this.newTask.id);
          if (index !== -1) {
            this.tasks[index] = { ...this.newTask };
          }
        } else {
          // Create new task
          const taskId = Date.now().toString();
          this.tasks.push({
            ...this.newTask,
            id: taskId,
          });
        }
        
        // Save to local storage
        this.saveTasks();
        
        // Reset form and close modal
        this.resetForm();
      },
      
      editTask(task) {
        this.editingTask = task;
        this.newTask = { ...task };
        this.showNewTaskModal = true;
      },
      
      deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
          this.tasks = this.tasks.filter(task => task.id !== taskId);
          this.saveTasks();
        }
      },
      
      toggleTaskStatus(task) {
        task.completed = !task.completed;
        this.saveTasks();
      },
      
      resetForm() {
        this.newTask = {
          id: null,
          title: '',
          notes: '',
          dueDate: '',
          dueTime: '',
          priority: false,
          completed: false,
        };
        this.editingTask = null;
        this.showNewTaskModal = false;
      },
      
      isExpired(task) {
        if (!task.dueDate || task.completed) return false;
        
        const now = new Date();
        const dueDateTime = this.getTaskDateTime(task);
        
        return dueDateTime < now;
      },
      
      getTaskDateTime(task) {
        const dateTime = new Date(task.dueDate);
        
        if (task.dueTime) {
          const timeParts = task.dueTime.split(':');
          dateTime.setHours(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), 0, 0);
        } else {
          // If no time specified, set to end of day
          dateTime.setHours(23, 59, 59, 999);
        }
        
        return dateTime;
      },
      
      formatDate(dateString) {
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
      },
      
      formatTime(timeString) {
        if (!timeString) return '';
        
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);
        
        // Format in 12-hour time with AM/PM
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
        const formattedMinute = minute.toString().padStart(2, '0');
        
        return `${formattedHour}:${formattedMinute} ${period}`;
      },
      
      truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
      },
      
      loadTasks() {
        const savedTasks = localStorage.getItem('reminder-tasks');
        if (savedTasks) {
          this.tasks = JSON.parse(savedTasks);
        }
      },
      
      saveTasks() {
        localStorage.setItem('reminder-tasks', JSON.stringify(this.tasks));
      },
      
      logout() {
        localStorage.removeItem('user-authenticated');
        this.$router.push('/auth');
      }
    },
    mounted() {
      this.loadTasks();
    }
  }
  </script>