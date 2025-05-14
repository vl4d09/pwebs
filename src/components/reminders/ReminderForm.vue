// filepath: /Users/vladsmac/Coding/pwebs/src/components/reminders/ReminderForm.vue
<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-4 sm:p-6 mx-2 my-4">
      <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {{ task.id ? 'Edit Reminder' : 'New Reminder' }}
      </h2>
      <form @submit.prevent="saveTask">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input 
            type="text" 
            v-model="formData.title" 
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            placeholder="What do you need to do?"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
          <textarea 
            v-model="formData.notes" 
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            placeholder="Add notes"
            rows="2"
          ></textarea>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
            <input 
              type="date" 
              v-model="formData.dueDate" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Time</label>
            <input 
              type="time" 
              v-model="formData.dueTime" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div class="mb-5">
          <label class="flex items-center">
            <input 
              type="checkbox" 
              v-model="formData.priority" 
              class="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 mr-2"
            />
            <span class="text-sm text-gray-700 dark:text-gray-300">Mark as priority</span>
          </label>
        </div>
        <div class="flex justify-end gap-2">
          <button 
            type="button" 
            @click="cancel" 
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {{ task.id ? 'Save' : 'Add' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
  
  <script>
  import { reactive, watch } from 'vue';
  
  export default {
    name: 'ReminderForm',
    props: {
      show: {
        type: Boolean,
        required: true
      },
      task: {
        type: Object,
        default: () => ({
          id: null,
          title: '',
          notes: '',
          dueDate: '',
          dueTime: '',
          priority: false,
          completed: false
        })
      }
    },
    emits: ['update:show', 'save'],
    setup(props, { emit }) {
      const formData = reactive({
        id: null,
        title: '',
        notes: '',
        dueDate: '',
        dueTime: '',
        priority: false,
        completed: false
      });
      
      // Watch for task changes to update the form
      watch(() => props.task, (newTask) => {
        Object.keys(formData).forEach(key => {
          formData[key] = newTask[key];
        });
      }, { immediate: true, deep: true });
      
      const saveTask = () => {
        emit('save', { ...formData });
        emit('update:show', false);
      };
      
      const cancel = () => {
        emit('update:show', false);
      };
      
      return {
        formData,
        saveTask,
        cancel
      };
    }
  }
  </script>