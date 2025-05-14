<template>
  <div class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
    <!-- Header -->
    <AppHeader title="Reminders" />
    
    <!-- Main Content -->
    <div class="flex-grow">
      <div class="max-w-4xl mx-auto px-4 pb-20">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white">My Tasks</h2>
          <button 
            @click="showFormModal = true" 
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center w-full sm:w-auto justify-center sm:justify-start"
          >
            <span class="mr-1">+</span> New Reminder
          </button>
        </div>
        
        <!-- Filters -->
        <ReminderFilters v-model="filter" />
        
        <!-- Task List -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow">
          <div v-if="filteredTasks.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">
            No reminders to display
          </div>
          <div v-else>
            <ReminderItem 
              v-for="task in filteredTasks" 
              :key="task.id" 
              :task="task"
              @toggle-status="toggleTaskStatus"
              @toggle-priority="toggleTaskPriority"
              @edit="editTask"
              @delete="deleteTask"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <AppFooter />
    
    <!-- Task Form Modal -->
    <ReminderForm
      v-model:show="showFormModal"
      :task="currentTask"
      @save="saveTask"
    />
  </div>
</template>
  
  <script>
  import { ref, reactive, onMounted } from 'vue';
  import { useReminders } from '../composables/useReminders';
  import AppHeader from './layout/AppHeader.vue';
  import AppFooter from './layout/AppFooter.vue';
  import ReminderItem from './reminders/ReminderItem.vue';
  import ReminderFilters from './reminders/ReminderFilters.vue';
  import ReminderForm from './reminders/ReminderForm.vue';
  
  export default {
    name: 'ReminderDashboard',
    components: {
      AppHeader,
      AppFooter,
      ReminderItem,
      ReminderFilters,
      ReminderForm
    },
    setup() {
      const { 
        tasks, 
        filter, 
        filteredTasks, 
        loadTasks, 
        addTask, 
        updateTask,
        deleteTask,
        toggleTaskStatus,
        toggleTaskPriority
      } = useReminders();
      
      const showFormModal = ref(false);
      const currentTask = reactive({
        id: null,
        title: '',
        notes: '',
        dueDate: '',
        dueTime: '',
        priority: false,
        completed: false
      });
      
      // Handle editing a task
      const editTask = (task) => {
        Object.assign(currentTask, task);
        showFormModal.value = true;
      };
      
      // Save a task (new or edited)
      const saveTask = (taskData) => {
        if (taskData.id) {
          updateTask(taskData);
        } else {
          addTask(taskData);
        }
        
        // Reset the current task
        Object.assign(currentTask, {
          id: null,
          title: '',
          notes: '',
          dueDate: '',
          dueTime: '',
          priority: false,
          completed: false
        });
      };
      
      onMounted(() => {
        loadTasks();
      });
      
      return {
        filter,
        filteredTasks,
        showFormModal,
        currentTask,
        toggleTaskStatus,
        toggleTaskPriority,
        editTask,
        deleteTask,
        saveTask
      };
    }
  }
  </script>