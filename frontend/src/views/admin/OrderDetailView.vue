<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center space-x-4">
          <button @click="$router.back()" class="flex items-center space-x-2 hover:text-gray-300">
            <i class='fa-solid fa-arrow-left'></i>
            <span>Назад</span>
          </button>
          <h1 class="text-xl font-bold">{{ order?.orderNumber || 'Заказ' }}</h1>
        </div>
      </div>
    </header>

    <main class="py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div v-if="loading" class="text-center py-12">
          <i class='fa-solid fa-spinner fa-spin text-4xl animate-spin'></i>
        </div>

        <div v-else-if="order" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Order Info -->
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-xl shadow-md p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold">Информация о заказе</h2>
                <OrderStatusBadge :status="order.status" />
              </div>

              <h3 class="font-bold mb-3">Товары</h3>
              <ul class="space-y-3 mb-6">
                <li v-for="item in orderItems" :key="item.id"
                    class="flex items-center justify-between py-2 border-b">
                  <div class="flex items-center gap-3">
                    <span class="font-medium">{{ item.quantity }} x</span>
                    <span>{{ item.name }}</span>
                  </div>
                  <span class="font-medium">{{ formatMoney(item.total) }}</span>
                </li>
              </ul>

              <div class="bg-gray-50 p-4 rounded-lg space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Товары</span>
                  <span class="font-medium">{{ formatMoney(getField(order, 'totalAmount', 'total_amount')) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Доставка</span>
                  <span class="font-medium">{{ formatMoney(getField(order, 'deliveryFee', 'delivery_fee')) }}</span>
                </div>
                <div v-if="getField(order, 'discountAmount', 'discount_amount') > 0" class="flex justify-between text-green-600">
                  <span>Скидка</span>
                  <span class="font-medium">-{{ formatMoney(getField(order, 'discountAmount', 'discount_amount')) }}</span>
                </div>
                <div class="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Итого</span>
                  <span class="text-primary-600">{{ formatMoney(getField(order, 'finalAmount', 'final_amount')) }}</span>
                </div>
              </div>
            </div>

            <!-- Status History -->
            <div class="bg-white rounded-xl shadow-md p-6">
              <h3 class="font-bold mb-4">История статусов</h3>
              <div class="space-y-3">
                <div v-for="status in statusHistory" :key="status.id"
                     class="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <i class='fa-regular fa-clock text-primary-600'></i>
                  </div>
                  <div>
                    <p class="font-medium">{{ statusName(status.status) }}</p>
                    <p class="text-sm text-gray-500">{{ formatDateTime(status.created_at) }}</p>
                    <p v-if="status.comment" class="text-sm text-gray-600 mt-1">{{ status.comment }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Customer & Actions -->
          <div class="space-y-6">
            <div class="bg-white rounded-xl shadow-md p-6">
              <h3 class="font-bold mb-4">Клиент</h3>
              <div class="space-y-3">
                <p class="flex items-center gap-2">
                  <i class='fa-solid fa-user text-gray-400'></i>
                  {{ getField(order, 'customerName', 'customer_name') || getField(order, 'guest_name', 'guestName') || '—' }}
                </p>
                <p class="flex items-center gap-2">
                  <i class='fa-solid fa-phone text-gray-400'></i>
                  <a :href="`tel:${getField(order, 'customerPhone', 'customer_phone') || getField(order, 'guest_phone', 'guestPhone')}`" class="text-primary-600">
                    {{ getField(order, 'customerPhone', 'customer_phone') || getField(order, 'guest_phone', 'guestPhone') || '—' }}
                  </a>
                </p>
                <p class="flex items-center gap-2">
                  <i class='fa-solid fa-envelope text-gray-400'></i>
                  <a :href="`mailto:${getField(order, 'customerEmail', 'customer_email') || getField(order, 'guest_email', 'guestEmail')}`" class="text-primary-600">
                    {{ getField(order, 'customerEmail', 'customer_email') || getField(order, 'guest_email', 'guestEmail') || '—' }}
                  </a>
                </p>
              </div>
            </div>

            <div v-if="order.delivery || getField(order, 'deliveryType', 'delivery_type_id')" class="bg-white rounded-xl shadow-md p-6">
              <h3 class="font-bold mb-4">Доставка</h3>
              <p class="text-gray-600 mb-2">{{ getField(order, 'delivery.deliveryTypeName', 'delivery.delivery_type_name') || 'Доставка' }}</p>
              <p class="text-gray-800">{{ getField(order, 'delivery.address', 'delivery.address') || getField(order, 'address', 'address') || 'Адрес не указан' }}</p>
              <p v-if="getField(order, 'delivery.deliveryInstructions', 'delivery.delivery_instructions')" class="text-sm text-gray-500 mt-2">
                {{ getField(order, 'delivery.deliveryInstructions', 'delivery.delivery_instructions') }}
              </p>
            </div>

            <div class="bg-white rounded-xl shadow-md p-6">
              <h3 class="font-bold mb-4">Действия</h3>
              <div class="space-y-3">
                <select v-model="newStatus" class="input-field">
                  <option value="pending">Ожидает</option>
                  <option value="confirmed">Подтвержден</option>
                  <option value="preparing">Готовится</option>
                  <option value="ready">Готов</option>
                  <option value="delivering">Доставляется</option>
                  <option value="delivered">Доставлен</option>
                  <option value="cancelled">Отменен</option>
                </select>
                <button @click="updateStatus" class="btn-primary w-full">
                  Обновить статус
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="bg-white rounded-xl shadow-md p-12 text-center">
          <i class='fa fa-error-circle text-6xl text-red-500 mb-4'></i>
          <h2 class="text-xl font-bold text-gray-900 mb-2">Заказ не найден</h2>
          <p class="text-gray-600 mb-6">Проверьте номер заказа</p>
          <button @click="$router.push('/admin')" class="btn-primary">
            К заказам
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/api';
import OrderStatusBadge from '@/components/OrderStatusBadge.vue';

const route = useRoute();
const order = ref<any>(null);
const orderItems = ref<any[]>([]);
const statusHistory = ref<any[]>([]);
const loading = ref(true);
const newStatus = ref('');

// Универсальная функция для получения поля (поддерживает camelCase и snake_case)
const getField = (obj: any, camelPath: string, snakePath: string): any => {
  if (!obj) return null;
  
  // Пробуем camelCase
  let result = obj;
  for (const key of camelPath.split('.')) {
    if (result && result[key] !== undefined) {
      result = result[key];
    } else {
      result = null;
      break;
    }
  }
  if (result !== null && result !== undefined) return result;
  
  // Пробуем snake_case
  result = obj;
  for (const key of snakePath.split('.')) {
    if (result && result[key] !== undefined) {
      result = result[key];
    } else {
      result = null;
      break;
    }
  }
  return result;
};

const formatMoney = (value: any): string => {
  if (value === null || value === undefined) return '0.00 ₽';
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return num.toFixed(2) + ' ₽';
};

const formatDateTime = (dateString: any) => {
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

const statusName = (status: string) => {
  const names: Record<string, string> = {
    pending: 'Ожидает', confirmed: 'Подтвержден', preparing: 'Готовится',
    ready: 'Готов', delivering: 'Доставляется', delivered: 'Доставлен', cancelled: 'Отменен'
  };
  return names[status] || status;
};

const updateStatus = async () => {
  try {
    await api.put(`/orders/${order.value.id}/status`, { status: newStatus.value });
    loadOrder();
  } catch (error) {
    console.error('Error updating status:', error);
  }
};

async function loadOrder() {
  try {
    const response = await api.get(`/orders/${route.params.id}`);
    console.log('Order data:', response.data);
    order.value = response.data;
    orderItems.value = response.data.items || [];
    statusHistory.value = response.data.statusHistory || [];
    newStatus.value = response.data.status;
    
    console.log('Sums:', {
      totalAmount: getField(response.data, 'totalAmount', 'total_amount'),
      deliveryFee: getField(response.data, 'deliveryFee', 'delivery_fee'),
      finalAmount: getField(response.data, 'finalAmount', 'final_amount')
    });
  } catch (error) {
    console.error('Error loading order:', error);
    order.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(() => loadOrder());
</script>
