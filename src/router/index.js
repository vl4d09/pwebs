import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../components/Dashboard.vue';
import AuthPage from '../components/AuthPage.vue';
import ReminderDashboard from '../components/ReminderDashboard.vue';

const routes = [
  {
    path: '/',
    redirect: '/auth',
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthPage,
    meta: { requiresNoAuth: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/reminders',
    name: 'Reminders',
    component: ReminderDashboard,
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('user-authenticated') === 'true';
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/auth');
  } else if (to.meta.requiresNoAuth && isAuthenticated) {
    next('/reminders');
  } else {
    next();
  }
});

export default router;