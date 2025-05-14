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
  </header>
</template>

<script>
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
  data() {
    return {
      mobileMenuOpen: false
    };
  },
  methods: {
    logout() {
      localStorage.removeItem('user-authenticated');
      this.$router.push('/auth');
    },
    goToHome() {
      this.$router.push('/home');
      this.mobileMenuOpen = false;
    }
  }
}
</script>