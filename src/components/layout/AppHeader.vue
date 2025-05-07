<template>
    <header class="bg-white dark:bg-gray-800 shadow mb-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">{{ title }}</h1>
          <nav class="flex items-center space-x-4">
            <router-link to="/home" class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2 rounded-md">Home</router-link>
            <router-link to="/reminders" class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2 rounded-md">Reminders</router-link>
            <ThemeToggle />
            <button @click="logout" class="text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 px-3 py-2 rounded-md">Logout</button>
          </nav>
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
    methods: {
      logout() {
        localStorage.removeItem('user-authenticated');
        this.$router.push('/auth');
      }
    }
  }
  </script>