<template>
  <header class="bg-white dark:bg-gray-800 shadow mb-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <h1 
          class="text-xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-500 dark:hover:text-blue-400"
          @click="goToHome"
        >{{ title }}</h1>
        
        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen" 
            class="text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-4">
          <router-link to="/home" class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2 rounded-md">Home</router-link>
          <router-link to="/reminders" class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2 rounded-md">Reminders</router-link>
          <div class="text-gray-700 dark:text-gray-300 px-3 py-2" v-if="userData">
            <span class="text-sm">{{ userData.email }} ({{ userData.role }})</span>
          </div>
          <ThemeToggle />
          <button @click="logout" class="text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 px-3 py-2 rounded-md">Logout</button>
        </nav>
      </div>
      
      <!-- Mobile Navigation -->
      <div 
        v-if="mobileMenuOpen" 
        class="md:hidden bg-white dark:bg-gray-800 pb-3 pt-2"
      >
        <div class="flex flex-col space-y-2">
          <router-link 
            to="/home" 
            class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2 rounded-md"
            @click="mobileMenuOpen = false"
          >
            Home
          </router-link>
          <router-link 
            to="/reminders" 
            class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2 rounded-md"
            @click="mobileMenuOpen = false"
          >
            Reminders
          </router-link>
          <div class="px-3 py-2 text-gray-700 dark:text-gray-300" v-if="userData">
            <span class="text-sm">{{ userData.email }} ({{ userData.role }})</span>
          </div>
          <div class="flex items-center justify-between px-3 py-2">
            <span class="text-gray-700 dark:text-gray-300">Theme</span>
            <ThemeToggle />
          </div>
          <button 
            @click="logout" 
            class="text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 px-3 py-2 rounded-md text-left"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
    
    <!-- Token Expiration Alert -->
    <div v-if="showTokenAlert" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-md shadow-lg max-w-sm mx-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Session Expired</h3>
        <p class="text-gray-700 dark:text-gray-300 mb-4">Your session has expired. Please log in again.</p>
        <button 
          @click="handleTokenExpired" 
          class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
        >
          Return to Login
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import ThemeToggle from '../ui/ThemeToggle.vue';

export default {
  name: 'AppHeader',
  components: {
    ThemeToggle
  },
  props: {
    title: {
      type: String,
      default: 'Reminders'
    }
  },
  setup(props, { emit }) {
    const mobileMenuOpen = ref(false);
    const showTokenAlert = ref(false);
    const userData = ref(null);
    
    // Handle JWT token expiration
    const handleJwtError = (event) => {
      if (event.detail?.status === 403 || event.detail?.message?.includes('token')) {
        showTokenAlert.value = true;
      }
    };
    
    onMounted(() => {
      // Load user data if available
      try {
        const userDataString = localStorage.getItem('user-data');
        if (userDataString) {
          userData.value = JSON.parse(userDataString);
        }
      } catch (err) {
        console.error('Error parsing user data', err);
      }
      
      // Listen for JWT errors
      window.addEventListener('jwt-error', handleJwtError);
    });
    
    onBeforeUnmount(() => {
      window.removeEventListener('jwt-error', handleJwtError);
    });
    
    const logout = () => {
      localStorage.removeItem('user-authenticated');
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-data');
      mobileMenuOpen.value = false;
      window.location.href = '/auth';
    };
    
    const goToHome = () => {
      mobileMenuOpen.value = false;
      window.location.href = '/home';
    };
    
    const handleTokenExpired = () => {
      localStorage.removeItem('user-authenticated');
      localStorage.removeItem('auth-token');
      showTokenAlert.value = false;
      window.location.href = '/auth';
    };
    
    return {
      mobileMenuOpen,
      showTokenAlert,
      userData,
      logout,
      goToHome,
      handleTokenExpired
    };
  }
}
</script>