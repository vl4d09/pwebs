<template>
  <div class="overflow-x-auto mb-6">
    <div class="flex gap-2 pb-2">
      <button 
        @click="$emit('update:modelValue', 'all')" 
        :class="['px-3 py-1 rounded-md whitespace-nowrap', modelValue === 'all' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300']"
      >
        All
      </button>
      <button 
        @click="$emit('update:modelValue', 'priority')" 
        :class="['px-3 py-1 rounded-md whitespace-nowrap', modelValue === 'priority' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300']"
      >
        Priority
      </button>
      <button 
        @click="$emit('update:modelValue', 'today')" 
        :class="['px-3 py-1 rounded-md whitespace-nowrap', modelValue === 'today' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300']"
      >
        Today
      </button>
      <button 
        @click="$emit('update:modelValue', 'upcoming')" 
        :class="['px-3 py-1 rounded-md whitespace-nowrap', modelValue === 'upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300']"
      >
        Upcoming
      </button>
      <button 
        @click="$emit('update:modelValue', 'expired')" 
        :class="['px-3 py-1 rounded-md whitespace-nowrap', modelValue === 'expired' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300']"
      >
        Expired
      </button>
      <button 
        @click="$emit('update:modelValue', 'completed')" 
        :class="['px-3 py-1 rounded-md whitespace-nowrap', modelValue === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300']"
      >
        Completed
      </button>
    </div>
  </div>
</template>
  
  <script>
  export default {
    name: 'ReminderFilters',
    props: {
      modelValue: {
        type: String,
        default: 'all'
      }
    },
    emits: ['update:modelValue']
  }
  </script>