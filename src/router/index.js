import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '../lib/supaBaseClient.js';
import Login from '../pages/login.vue';
import Register from '../pages/register.vue';

async function checkAuth() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch (error) {
    console.error('Error checking auth:', error);
    return false;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },
    {
      path: '/',
      component: () => import('../layouts/default.vue'),
      children: [
        {
          path: 'dashboard',
          component: () => import('../pages/dashboard.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'assignments',
          component: () => import('../pages/assignments.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'students',
          component: () => import('../pages/students.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'comingsoon2',
          component: () => import('../pages/comingsoon.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'account-settings',
          component: () => import('../pages/account-settings.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'announcements',
          component: () => import('../pages/announcements.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'typography',
          component: () => import('../pages/typography.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'icons',
          component: () => import('../pages/icons.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'cards',
          component: () => import('../pages/cards.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'tables',
          component: () => import('../pages/tables.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'form-layouts',
          component: () => import('../pages/form-layouts.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/',
      component: () => import('../layouts/blank.vue'),
      children: [
        {
          path: 'login',
          component: Login,
          
        },
        {
          path: 'register',
          component: Register,
          
        },
        {
          path: '/:pathMatch(.*)*',
          component: () => import('../pages/[...all].vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = await checkAuth();

  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } 
  else if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    next('/dashboard');
  } 
  // In all other cases, allow the navigation
  else {
    next();
  }
});

export default router
