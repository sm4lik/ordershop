import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public routes
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/menu',
      name: 'menu',
      component: () => import('@/views/MenuView.vue')
    },
    {
      path: '/product/:slug',
      name: 'product',
      component: () => import('@/views/ProductView.vue')
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/CartView.vue')
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/CheckoutView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/order/:number',
      name: 'order-tracking',
      component: () => import('@/views/OrderTrackingView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue')
    },
    {
      path: '/delivery',
      name: 'delivery',
      component: () => import('@/views/DeliveryView.vue')
    },
    {
      path: '/contacts',
      name: 'contacts',
      component: () => import('@/views/ContactsView.vue')
    },
    
    // User routes
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile/orders',
      name: 'profile-orders',
      component: () => import('@/views/ProfileOrdersView.vue'),
      meta: { requiresAuth: true }
    },
    
    // Admin routes
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/AdminPanel.vue'),
      meta: { requiresAuth: true, requiresModerator: true }
    },
    {
      path: '/admin/orders/:id',
      name: 'admin-order-detail',
      component: () => import('@/views/admin/OrderDetailView.vue'),
      meta: { requiresAuth: true, requiresModerator: true }
    },
    {
      path: '/admin/products',
      name: 'admin-products',
      component: () => import('@/views/admin/ProductsView.vue'),
      meta: { requiresAuth: true, requiresModerator: true }
    },
    {
      path: '/admin/products/new',
      name: 'admin-products-new',
      component: () => import('@/views/admin/ProductFormView.vue'),
      meta: { requiresAuth: true, requiresModerator: true }
    },
    {
      path: '/admin/products/:id/edit',
      name: 'admin-products-edit',
      component: () => import('@/views/admin/ProductFormView.vue'),
      meta: { requiresAuth: true, requiresModerator: true }
    },
    {
      path: '/admin/accounting',
      name: 'admin-accounting',
      component: () => import('@/views/admin/AccountingView.vue'),
      meta: { requiresAuth: true, requiresModerator: true }
    },
    {
      path: '/payment/result',
      name: 'payment-result',
      component: () => import('@/views/PaymentView.vue')
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }
  
  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next({ name: 'home' });
    return;
  }
  
  if (to.meta.requiresModerator && !['admin', 'moderator', 'bartender'].includes(authStore.user?.role || '')) {
    next({ name: 'home' });
    return;
  }
  
  next();
});

export default router;
