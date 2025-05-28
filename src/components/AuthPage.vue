<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
    <!-- Theme toggle in top-right corner -->
    <div class="absolute top-4 right-4">
      <ThemeToggle />
    </div>
    
    <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
      <div class="text-center mb-6 sm:mb-8">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Welcome to Reminders</h2>
        <p class="text-gray-600 dark:text-gray-300 mt-2">Sign in to manage your tasks</p>
      </div>
      
      <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
        {{ error }}
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
          :disabled="loading"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md disabled:opacity-50"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
      
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account? <button @click="toggleRegister" class="text-blue-500 hover:underline">Register</button>
        </p>
      </div>
      
      <div class="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Demo Tokens</h3>
        <div class="flex space-x-2">
          <button 
            @click="getDemoToken('USER')" 
            class="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
          >
            User Token
          </button>
          <button 
            @click="getDemoToken('ADMIN')" 
            class="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
          >
            Admin Token
          </button>
        </div>
      </div>
    </div>
    
    <!-- Registration Modal -->
    <div v-if="showRegister" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Register</h2>
        
        <div v-if="registerError" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {{ registerError }}
        </div>
        
        <form @submit.prevent="handleRegister">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input 
              type="email" 
              v-model="registerEmail" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              v-model="registerPassword" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div class="flex justify-end gap-2">
            <button 
              type="button" 
              @click="showRegister = false"
              class="px-4 py-2 border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="registerLoading"
              class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50"
            >
              {{ registerLoading ? 'Registering...' : 'Register' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
  
<script>
import ThemeToggle from './ui/ThemeToggle.vue';
  
export default {
  name: 'AuthPage',
  components: {
    ThemeToggle
  },
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      error: '',
      showRegister: false,
      registerEmail: '',
      registerPassword: '',
      registerLoading: false,
      registerError: ''
    };
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = '';
      
      try {
        const response = await fetch('http://localhost:5001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Login failed');
        }
        
        const data = await response.json();
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('user-authenticated', 'true');
        localStorage.setItem('user-data', JSON.stringify(data.user));
        
        this.$router.push('/reminders');
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    
    async handleRegister() {
      this.registerLoading = true;
      this.registerError = '';
      
      try {
        const response = await fetch('http://localhost:5001/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.registerEmail,
            password: this.registerPassword
          })
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Registration failed');
        }
        
        this.showRegister = false;
        this.email = this.registerEmail;
        this.password = this.registerPassword;
      } catch (err) {
        this.registerError = err.message;
      } finally {
        this.registerLoading = false;
      }
    },
    
    toggleRegister() {
      this.showRegister = !this.showRegister;
      this.registerError = '';
    },
    
    async getDemoToken(role) {
      try {
        const response = await fetch(`http://localhost:5001/api/auth/token?role=${role}`);
        
        if (!response.ok) {
          throw new Error('Failed to get demo token');
        }
        
        const data = await response.json();
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('user-authenticated', 'true');
        localStorage.setItem('user-data', JSON.stringify({
          email: 'demo@example.com',
          role: role
        }));
        
        this.$router.push('/reminders');
      } catch (err) {
        this.error = err.message;
      }
    }
  }
}
</script>
