<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Admin Header -->
    <header class="bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <router-link to="/" class="flex items-center space-x-2">
              <i class='fas fa-restaurant text-2xl'></i>
              <span class="font-bold">OrderShop Admin</span>
            </router-link>
          </div>

          <nav class="flex items-center space-x-4">
            <router-link to="/admin" class="px-3 py-2 rounded-lg hover:bg-gray-800">Дашборд</router-link>
            <router-link to="/admin/orders" class="px-3 py-2 rounded-lg hover:bg-gray-800">Заказы</router-link>
            <router-link to="/admin/products" class="px-3 py-2 rounded-lg hover:bg-gray-800">Товары</router-link>
            <router-link to="/admin/categories" class="px-3 py-2 rounded-lg hover:bg-gray-800">Категории</router-link>
            <router-link to="/admin/users" v-if="isAdmin" class="px-3 py-2 rounded-lg hover:bg-gray-800">Пользователи</router-link>
            <router-link to="/" class="px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-400">
              <i class='fa-solid fa-home mr-1'></i>
              На сайт
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <main class="py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Заказов сегодня</p>
                <p class="text-3xl font-bold text-gray-900">{{ stats.todayOrders || 0 }}</p>
              </div>
              <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <i class='fa-solid fa-box text-primary-600 text-2xl'></i>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Выручка сегодня</p>
                <p class="text-3xl font-bold text-gray-900">{{ formatMoney(stats.todayRevenue) }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i class='fa fa-dollar text-green-600 text-2xl'></i>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Ожидают</p>
                <p class="text-3xl font-bold text-yellow-600">{{ stats.pendingOrders || 0 }}</p>
              </div>
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <i class='fa-regular fa-clock text-yellow-600 text-2xl'></i>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Товаров</p>
                <p class="text-3xl font-bold text-gray-900">{{ stats.activeProducts || 0 }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i class='fa fa-box text-blue-600 text-2xl'></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="bg-white rounded-xl shadow-md">
          <div class="p-6 border-b flex justify-between items-center">
            <h2 class="text-xl font-bold">Последние заказы</h2>
            <router-link to="/admin/orders" class="text-primary-600 hover:text-primary-700 font-medium">
              Все заказы
              <i class='fa fa-right-arrow-alt ml-1'></i>
            </router-link>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Заказ</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="order in recentOrders" :key="order.id"
                    class="hover:bg-gray-50 cursor-pointer"
                    @click="router.push(`/admin/orders/${order.id}`)">
                  <td class="px-6 py-4 whitespace-nowrap font-medium">{{ order.orderNumber }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ order.customerName || order.guestName }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ formatMoney(order.finalAmount) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <OrderStatusBadge :status="order.status" />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(order.createdAt) }}
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-if="!recentOrders.length" class="text-center py-8 text-gray-500">Заказов нет</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/api';
import OrderStatusBadge from '@/components/OrderStatusBadge.vue';

const router = useRouter();
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);

const stats = ref<any>({});
const recentOrders = ref<any[]>([]);

const formatMoney = (amount: any) => {
  if (amount === undefined || amount === null) return '0.00 ₽';
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  return num.toFixed(2) + ' ₽';
};

const formatDate = (dateString: any) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(async () => {
  try {
    const [statsRes, ordersRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/orders?limit=5&sortBy=created_at&sortOrder=DESC')
    ]);

    stats.value = statsRes.data;
    recentOrders.value = ordersRes.data.orders || [];
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
});
</script>
