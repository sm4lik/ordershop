<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Admin Header -->
    <header class="bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <router-link to="/admin" class="flex items-center space-x-2 hover:text-gray-300">
            <i class='fa-solid fa-arrow-left'></i>
            <span>Админ-панель</span>
          </router-link>
          <h1 class="text-xl font-bold">Управление заказами</h1>
          <div class="flex items-center gap-3">
            <!-- Кнопка включения/выключения звука -->
            <button 
              @click="toggleSound" 
              class="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              :title="soundEnabled ? 'Звук включен' : 'Звук выключен'"
            >
              <i :class="soundEnabled ? 'fa-solid fa-bell' : 'fa-solid fa-bell-slash'" 
                 :class="soundEnabled ? 'text-green-400' : 'text-gray-400'"></i>
            </button>
            <!-- Тестовая кнопка звука -->
            <button 
              @click="handleTestSound" 
              class="p-2 rounded-lg hover:bg-gray-700 transition-colors text-blue-400"
              title="Проверить звук"
            >
              <i class='fa-solid fa-volume-high'></i>
            </button>
            <!-- Кнопка обновления -->
            <button @click="loadOrders" class="p-2 rounded-lg hover:bg-gray-700 transition-colors" title="Обновить">
              <i class='fa fa-refresh' :class="{'fa-spin': loading}"></i>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Уведомление о разрешении -->
        <div v-if="showNotificationPrompt" class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <i class='fa-solid fa-bell text-blue-500'></i>
            <span class="text-blue-800">Включите уведомления, чтобы слышать новые заказы и получать браузерные уведомления</span>
          </div>
          <button @click="enableNotifications" class="btn-primary text-sm">
            Включить
          </button>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-wrap gap-4">
          <select v-model="statusFilter" class="input-field w-auto">
            <option value="">Все статусы</option>
            <option value="pending">Ожидают</option>
            <option value="confirmed">Подтверждены</option>
            <option value="preparing">Готовятся</option>
            <option value="ready">Готовы</option>
            <option value="delivering">Доставляются</option>
            <option value="delivered">Доставлены</option>
            <option value="cancelled">Отменены</option>
          </select>

          <button @click="loadOrders" class="btn-primary">
            <i class='fa fa-refresh mr-2'></i>
            Обновить
          </button>
        </div>

        <!-- Orders Table -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Заказ</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap font-medium">{{ order.orderNumber }}</td>
                  <td class="px-6 py-4">
                    <div>
                      <p class="font-medium">{{ order.customerName || order.guest_name }}</p>
                      <p class="text-sm text-gray-500">{{ order.customerPhone || order.guest_phone }}</p>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ formatMoney(order.finalAmount) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <select v-model="order.status" @change="updateOrderStatus(order)"
                            class="text-sm border rounded-lg px-2 py-1">
                      <option value="pending">Ожидает</option>
                      <option value="confirmed">Подтвержден</option>
                      <option value="preparing">Готовится</option>
                      <option value="ready">Готов</option>
                      <option value="delivering">Доставляется</option>
                      <option value="delivered">Доставлен</option>
                      <option value="cancelled">Отменен</option>
                    </select>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(order.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <router-link :to="`/admin/orders/${order.id}`"
                                 class="text-primary-600 hover:text-primary-700">
                      <i class='fa fa-detail text-xl'></i>
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="!orders.length" class="text-center py-8 text-gray-500">Заказов нет</p>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="flex justify-center gap-2 mt-6">
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
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import api from '@/api';
import { useSoundNotification } from '@/composables/useSoundNotification';

const orders = ref<any[]>([]);
const statusFilter = ref('');
const currentPage = ref(1);
const pagination = ref({ page: 1, limit: 20, total: 0, pages: 1 });
const loading = ref(false);
const showNotificationPrompt = ref(false);

// Звуковые уведомления
const { soundEnabled, isInitialized, initAudio, playSound, testSound, checkNewOrders, requestNotificationPermission } = useSoundNotification();

// Автообновление каждые 10 секунд
let refreshInterval: number | null = null;

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

watch([statusFilter, currentPage], () => loadOrders());

async function loadOrders() {
  loading.value = true;
  try {
    const params: any = { page: currentPage.value, limit: 20 };
    if (statusFilter.value) params.status = statusFilter.value;

    const response = await api.get('/orders', { params });
    const newOrders = response.data.orders || [];
    const oldOrders = [...orders.value];
    pagination.value = response.data.pagination || {};

    console.log('[OrdersView] Loading orders:', {
      oldCount: oldOrders.length,
      newCount: newOrders.length,
      oldIds: oldOrders.map(o => o.id),
      newIds: newOrders.map(o => o.id)
    });

    // Проверяем новые заказы (передаем массивы, а не длину)
    checkNewOrders(newOrders, oldOrders);

    orders.value = newOrders;
  } catch (error) {
    console.error('Error loading orders:', error);
  } finally {
    loading.value = false;
  }
}

async function updateOrderStatus(order: any) {
  try {
    await api.put(`/orders/${order.id}/status`, { status: order.status });
  } catch (error) {
    console.error('Error updating status:', error);
    loadOrders();
  }
}

function toggleSound() {
  soundEnabled.value = !soundEnabled.value;
  // Сохраняем предпочтение
  localStorage.setItem('orderSoundEnabled', String(soundEnabled.value));
}

function enableNotifications() {
  requestNotificationPermission();
  showNotificationPrompt.value = false;
}

function handleTestSound() {
  // Инициализируем аудио при клике (требуется для браузеров)
  initAudio();
  testSound();
}

function startAutoRefresh() {
  // Проверяем сохраненное предпочтение звука
  const savedSoundPreference = localStorage.getItem('orderSoundEnabled');
  if (savedSoundPreference !== null) {
    soundEnabled.value = savedSoundPreference === 'true';
  }

  // Запускаем автообновление
  refreshInterval = window.setInterval(() => {
    loadOrders();
  }, 10000);
}

function stopAutoRefresh() {
  if (refreshInterval !== null) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

onMounted(() => {
  loadOrders();
  startAutoRefresh();

  // Показываем подсказку если разрешения нет
  if ('Notification' in window && Notification.permission === 'default') {
    showNotificationPrompt.value = true;
  }
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>
