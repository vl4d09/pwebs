<template>
    <div 
      :class="[
        'border-b border-gray-200 dark:border-gray-700 last:border-b-0 p-4 flex items-center',
        task.priority ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
      ]"
    >
      <!-- Checkbox -->
      <input 
        type="checkbox" 
        :checked="task.completed" 
        @change="$emit('toggle-status', task)"
        class="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
      />
      
      <!-- Task Content -->
      <div class="ml-3 flex-grow">
        <div class="flex items-center">
          <p :class="[
            'text-sm font-medium', 
            task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 
              isExpired(task) ? 'text-red-600 dark:text-red-400' : 
              'text-gray-800 dark:text-white'
          ]">
            {{ task.title }}
          </p>
          <!-- Priority star icon -->
          <span v-if="task.priority" class="ml-2 text-yellow-500">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </span>
        </div>
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
        <button @click="$emit('toggle-priority', task)" 
                :class="[
                  'text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400',
                  task.priority ? 'text-yellow-500 dark:text-yellow-400' : ''
                ]">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
        <button @click="$emit('edit', task)" class="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button @click="$emit('delete', task.id)" class="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import { useDateTime } from '../../composables/useDateTime';
  
  export default {
    name: 'ReminderItem',
    props: {
      task: {
        type: Object,
        required: true
      }
    },
    setup() {
      const { formatDate, formatTime, isExpired, truncateText } = useDateTime();
      
      return {
        formatDate,
        formatTime,
        isExpired,
        truncateText
      };
    },
    emits: ['toggle-status', 'toggle-priority', 'edit', 'delete']
  }
  </script>