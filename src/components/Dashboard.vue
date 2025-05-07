<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header class="bg-white dark:bg-gray-800 shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
            <nav class="flex space-x-4">
              <router-link to="/home" class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2 rounded-md">Home</router-link>
              <router-link to="/reminders" class="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2 rounded-md">Reminders</router-link>
              <button @click="logout" class="text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 px-3 py-2 rounded-md">Logout</button>
            </nav>
          </div>
        </div>
      </header>
      
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Welcome to your Dashboard</h2>
          <p class="text-gray-600 dark:text-gray-400">
            You can access your reminders by clicking the "Reminders" link in the navigation.
          </p>
          <div class="mt-6">
            <router-link 
              to="/reminders" 
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Go to Reminders
            </router-link>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Dashboard',
    methods: {
      logout() {
        localStorage.removeItem('user-authenticated');
        this.$router.push('/auth');
      }
    }
  }
  </script>