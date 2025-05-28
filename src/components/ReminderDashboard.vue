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
            @click="openNewReminderForm" 
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center w-full sm:w-auto justify-center sm:justify-start"
          >
            <span class="mr-1">+</span> New Reminder
          </button>
        </div>
        
        <!-- Filters -->
        <ReminderFilters v-model="filter" />
        
        <!-- Error Alert -->
        <div v-if="error" class="mb-6 p-4 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
          {{ error }}
        </div>
        
        <!-- Loading Indicator -->
        <div v-if="loading" class="mb-6 p-4 text-center">
          <div class="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
        
        <!-- Task List -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow">
          <div v-if="!loading && filteredTasks.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">
            No reminders to display
          </div>
          <div v-else>
            <ReminderItem 
              v-for="task in filteredTasks" 
              :key="task._id || task.id" 
              :task="task"
              @toggle-status="toggleTaskStatus"
              @toggle-priority="toggleTaskPriority"
              @edit="editTask"
              @delete="deleteTask"
            />
          </div>
        </div>
        
        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="mt-6 flex justify-center">
          <div class="join">
            <button 
              v-for="page in pagination.totalPages" 
              :key="page"
              @click="changePage(page)"
              :class="[
                'join-item btn',
                page === pagination.page ? 'btn-active' : ''
              ]"
            >
              {{ page }}
            </button>
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
      :key="formKey" 
      @save="saveTask"
    />
  </div>
</template>
  
<script>
import { ref, reactive, onMounted, watch } from 'vue';
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
    } = useReminders();
    
    const showFormModal = ref(false);
    const formKey = ref(0); // Add a key to force re-render of the form
    const defaultTask = {
      _id: null,
      title: '',
      notes: '',
      dueDate: '',
      dueTime: '',
      priority: false,
      completed: false
    };
    
    const currentTask = reactive({...defaultTask});
    
    // Open form for creating a new reminder
    const openNewReminderForm = () => {
      // Reset the current task to default values
      Object.keys(currentTask).forEach(key => {
        currentTask[key] = defaultTask[key];
      });
      formKey.value++; // Increment the key to force re-render
      showFormModal.value = true;
    };
    
    // Handle editing a task
    const editTask = (task) => {
      Object.assign(currentTask, task);
      formKey.value++; // Increment the key to force re-render
      showFormModal.value = true;
    };
    
    // Save a task (new or edited)
    const saveTask = async (taskData) => {
      if (taskData._id) {
        await updateTask(taskData);
      } else {
        await addTask(taskData);
      }
      
      // No need to reset currentTask here as we'll do it when opening the form
    };
    
    onMounted(() => {
      loadTasks();
    });
    
    // Reload tasks when filter changes
    watch(filter, () => {
      loadTasks(1);
    });
    
    return {
      filter,
      filteredTasks,
      loading,
      error,
      pagination,
      showFormModal,
      currentTask,
      formKey, // Expose the key
      toggleTaskStatus,
      toggleTaskPriority,
      openNewReminderForm, // New method to open form with reset
      editTask,
      deleteTask,
      saveTask,
      changePage
    };
  }
}
</script>