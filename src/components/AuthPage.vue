<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Welcome to Reminders</h2>
          <p class="text-gray-600 dark:text-gray-300 mt-2">Sign in to manage your tasks</p>
        </div>
        
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input 
              type="email" 
              v-model="email" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              v-model="password" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              required
            />
          </div>
          <button 
            type="submit" 
            class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
          >
            Sign In
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            For demo purposes, any email and password will work
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AuthPage',
    data() {
      return {
        email: '',
        password: ''
      };
    },
    methods: {
      handleLogin() {

        localStorage.setItem('user-authenticated', 'true');
        this.$router.push('/reminders');
      }
    }
  }
  </script>