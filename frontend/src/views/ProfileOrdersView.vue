<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Мои заказы</h1>

      <div v-if="loading" class="text-center py-12">
        <i class='fa-solid fa-spinner fa-spin text-4xl text-gray-400 animate-spin'></i>
      </div>

      <div v-else-if="orders.length" class="space-y-4">
        <div v-for="order in orders" :key="order.id" 
             class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
             @click="viewOrder(order.orderNumber)">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <i class='fa-solid fa-box text-primary-600 text-xl'></i>
              </div>
              <div>
                <h3 class="font-bold text-lg">{{ order.orderNumber }}</h3>
                <p class="text-sm text-gray-500">{{ formatDate(order.createdAt) }}</p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <OrderStatusBadge :status="order.status" />
              <div class="text-right">
                <p class="text-sm text-gray-500">{{ order.itemsCount }} тов.</p>
                <p class="text-lg font-bold text-primary-600">{{ order.finalAmount.toFixed(2) }} ₽</p>
              </div>
              <i class='fa-solid fa-chevron-right text-gray-400 text-xl'></i>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="flex justify-center gap-2 mt-8">
          <button @click="currentPage--" :disabled="currentPage === 1"
                  class="px-4 py-2 rounded-lg border disabled:opacity-50">
            <i class='fa-solid fa-chevron-left'></i>
          </button>
          <span class="px-4 py-2">Стр. {{ currentPage }} из {{ pagination.pages }}</span>
          <button @click="currentPage++" :disabled="currentPage === pagination.pages"
                  class="px-4 py-2 rounded-lg border disabled:opacity-50">
            <i class='fa-solid fa-chevron-right'></i>
          </button>
        </div>
      </div>

      <div v-else class="bg-white rounded-xl shadow-md p-12 text-center">
        <i class='fa-solid fa-box text-6xl text-gray-300 mb-4'></i>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Нет заказов</h2>
        <p class="text-gray-600 mb-6">Сделайте первый заказ в нашем меню</p>
        <router-link to="/menu" class="btn-primary">
          <i class='fa-solid fa-utensils mr-2'></i>
          Перейти в меню
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';
import OrderStatusBadge from '@/components/OrderStatusBadge.vue';
import type { Order } from '@/types';

const router = useRouter();

const orders = ref<Order[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const pagination = ref({ page: 1, limit: 10, total: 0, pages: 1 });

watch(currentPage, () => loadOrders());

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const viewOrder = (orderNumber: string) => {
  router.push(`/order/${orderNumber}`);
};

async function loadOrders() {
  loading.value = true;
  try {
    const response = await api.get('/orders/my', {
      params: { page: currentPage.value, limit: 10 }
    });
    orders.value = response.data.orders;
    pagination.value = response.data.pagination;
  } catch (error) {
    console.error('Error loading orders:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadOrders();
});
</script>
