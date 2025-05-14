<template>
  <footer class="bg-white dark:bg-gray-800 shadow mt-auto py-4">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="text-sm text-gray-500 dark:text-gray-400 mb-2 md:mb-0 text-center md:text-left">
          &copy; {{ new Date().getFullYear() }} Reminder Dashboard. All rights reserved.
        </div>
        <div class="flex space-x-4">
          <a href="#" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm">Privacy</a>
          <a href="#" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm">Terms</a>
          <a href="#" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm">Contact</a>
        </div>
      </div>
    </div>
  </footer>
</template>
  
  <script>
  export default {
    name: 'AppFooter'
  }
  </script>