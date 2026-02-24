<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="loading" class="text-center py-12">
        <i class='fa-solid fa-spinner fa-spin text-4xl text-gray-400 animate-spin'></i>
      </div>

      <div v-else-if="order" class="space-y-6">
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-md p-6 text-center">
          <div class="flex items-center justify-center gap-2 mb-4">
            <div class="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
              <i :class="[statusIcon, statusColor, 'text-3xl']"></i>
            </div>
            <div v-if="refreshing" class="flex items-center text-green-600 text-sm">
              <i class='fa-solid fa-spinner fa-spin animate-spin mr-2'></i>
              Обновление...
            </div>
          </div>
          <h1 class="text-2xl font-bold mb-2">Заказ {{ order.orderNumber }}</h1>
          <OrderStatusBadge :status="order.status" />
          <p class="text-gray-500 mt-4">
            {{ formatDate(order.createdAt) }}
          </p>
        </div>

        <!-- Order Details -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold mb-4">Детали заказа</h2>

          <ul class="space-y-4">
            <li v-for="item in orderItems" :key="item.id"
                class="flex items-center gap-4 pb-4 border-b last:border-0">
              <img :src="item.image || '/placeholder-product.jpg'"
                   :alt="item.name"
                   class="w-16 h-16 object-cover rounded-lg">
              <div class="flex-1">
                <h3 class="font-medium">{{ item.name }}</h3>
                <p class="text-sm text-gray-500">{{ item.quantity }} x {{ formatPrice(item.price) }}</p>
              </div>
              <span class="font-bold">{{ formatPrice(item.total) }}</span>
            </li>
          </ul>

          <div class="border-t mt-4 pt-4 space-y-2">
            <div class="flex justify-between text-gray-600">
              <span>Товары</span>
              <span>{{ formatPrice(getField(order, 'totalAmount', 'total_amount')) }}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Доставка</span>
              <span>{{ formatPrice(getField(order, 'deliveryFee', 'delivery_fee')) }}</span>
            </div>
            <div v-if="getField(order, 'discountAmount', 'discount_amount') > 0" class="flex justify-between text-green-600">
              <span>Скидка</span>
              <span>-{{ formatPrice(getField(order, 'discountAmount', 'discount_amount')) }}</span>
            </div>
            <div class="border-t pt-2 flex justify-between text-lg font-bold">
              <span>Итого</span>
              <span class="text-primary-600">{{ formatPrice(getField(order, 'finalAmount', 'final_amount')) }}</span>
            </div>
          </div>
        </div>

        <!-- Delivery Info -->
        <div v-if="order.hasDelivery || order.delivery" class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <i class='fa fa-car text-primary-600'></i>
            Доставка
          </h2>
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="badge badge-info">{{ order.deliveryType || 'Курьером' }}</span>
              <span class="text-gray-600">{{ formatPrice(getField(order, 'deliveryFee', 'delivery_fee')) }}</span>
            </div>
            <p v-if="getField(order, 'deliveryAddress', 'delivery.address')" class="flex items-start gap-2">
              <i class='fa-solid fa-location-dot text-primary-600 mt-1'></i>
              <span>{{ getField(order, 'deliveryAddress', 'delivery.address') }}</span>
            </p>
            <div v-if="order.deliveryCity || order.deliveryStreet" class="text-gray-600 ml-7">
              <span v-if="order.deliveryCity">{{ order.deliveryCity }}, </span>
              <span v-if="order.deliveryStreet">{{ order.deliveryStreet }}</span>
              <span v-if="order.deliveryBuilding">, д. {{ order.deliveryBuilding }}</span>
              <span v-if="order.deliveryApartment">, кв. {{ order.deliveryApartment }}</span>
            </div>
            <p v-if="getField(order, 'deliveryInstructions', 'delivery.delivery_instructions')" class="flex items-start gap-2 ml-7">
              <i class='fa fa-message-rounded text-primary-600 mt-1'></i>
              <span>{{ getField(order, 'deliveryInstructions', 'delivery.delivery_instructions') }}</span>
            </p>
          </div>
        </div>

        <!-- Status Timeline -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold mb-6">Статус заказа</h2>

          <div class="relative">
            <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            <div v-for="(status, index) in statusTimeline" :key="status.key"
                 class="relative flex items-start gap-4 pb-6 last:pb-0"
                 :class="index > 0 ? 'mt-4' : ''">
              <div class="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                   :class="isStatusCompleted(order.status, status.key) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'">
                <i :class="isStatusCompleted(order.status, status.key) ? 'fa-solid fa-check' : status.icon"></i>
              </div>
              <div>
                <p class="font-medium" :class="isStatusCompleted(order.status, status.key) ? 'text-gray-900' : 'text-gray-400'">
                  {{ status.name }}
                </p>
                <p v-if="status.description" class="text-sm text-gray-500">
                  {{ status.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-4">
          <router-link to="/menu" class="btn-secondary flex-1 justify-center">
            <i class='fa-solid fa-utensils mr-2'></i>
            Сделать новый заказ
          </router-link>
          <button @click="printOrder" class="btn-outline flex-1 justify-center">
            <i class='fa fa-printer mr-2'></i>
            Распечатать
          </button>
        </div>
      </div>

      <div v-else class="bg-white rounded-xl shadow-md p-12 text-center">
        <i class='fa fa-error-circle text-6xl text-red-500 mb-4'></i>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Заказ не найден</h2>
        <p class="text-gray-600 mb-6">Проверьте номер заказа и попробуйте снова</p>
        <router-link to="/" class="btn-primary">
          На главную
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/api';
import OrderStatusBadge from '@/components/OrderStatusBadge.vue';

const route = useRoute();
const order = ref<any>(null);
const orderItems = ref<any[]>([]);
const loading = ref(true);
const refreshing = ref(false);
let refreshInterval: ReturnType<typeof setInterval> | null = null;

const statusTimeline = [
  { key: 'pending', name: 'Ожидает подтверждения', description: 'Заказ создан и ожидает обработки', icon: 'fa-regular fa-clock' },
  { key: 'confirmed', name: 'Подтвержден', description: 'Заказ подтвержден оператором', icon: 'fa-solid fa-check-circle' },
  { key: 'preparing', name: 'Готовится', description: 'Ваш заказ готовится', icon: 'fa fa-coffee' },
  { key: 'ready', name: 'Готов к выдаче', description: 'Заказ готов к получению', icon: 'fa-solid fa-box' },
  { key: 'delivering', name: 'Доставляется', description: 'Курьер в пути', icon: 'fa fa-car' },
  { key: 'delivered', name: 'Доставлен', description: 'Заказ получен клиентом', icon: 'fa-solid fa-check-double' }
];

const statusIcon = computed(() => {
  if (!order.value) return 'fa-solid fa-box';
  const status = statusTimeline.find(s => s.key === order.value?.status);
  return status?.icon || 'fa-solid fa-box';
});

const statusColor = computed(() => {
  if (!order.value) return 'text-gray-400';
  if (order.value.status === 'delivered') return 'text-green-500';
  if (order.value.status === 'cancelled') return 'text-red-500';
  return 'text-primary-600';
});

const isStatusCompleted = (currentStatus: string, statusKey: string) => {
  const statusOrder = statusTimeline.map(s => s.key);
  const currentIndex = statusOrder.indexOf(currentStatus);
  const keyIndex = statusOrder.indexOf(statusKey);
  return currentIndex >= keyIndex && currentStatus !== 'cancelled';
};

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

const formatPrice = (value: any): string => {
  if (value === undefined || value === null) return '0.00 ₽';
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return num.toFixed(2) + ' ₽';
};

const formatDate = (dateString: any) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const printOrder = () => {
  window.print();
};

// Авто-обновление заказа
const refreshOrder = async () => {
  const orderNumber = route.params.number;
  if (!orderNumber) return;
  
  refreshing.value = true;
  try {
    const response = await api.get(`/orders/number/${orderNumber}`);
    const newStatus = response.data.status;
    const oldStatus = order.value?.status;
    
    // Обновляем только если статус изменился
    if (newStatus !== oldStatus) {
      order.value = response.data;
      orderItems.value = response.data.items || [];
    }
  } catch (error) {
    console.error('Error refreshing order:', error);
  } finally {
    refreshing.value = false;
  }
};

onMounted(async () => {
  const orderNumber = route.params.number;
  if (!orderNumber) {
    loading.value = false;
    return;
  }
  
  try {
    console.log('Loading order:', orderNumber);
    const response = await api.get(`/orders/number/${orderNumber}`);
    console.log('Order response:', response.data);
    order.value = response.data;
    orderItems.value = response.data.items || [];
    
    // Авто-обновление каждые 10 секунд
    refreshInterval = setInterval(refreshOrder, 10000);
  } catch (error) {
    console.error('Error loading order:', error);
    order.value = null;
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  .max-w-3xl, .max-w-3xl * {
    visibility: visible;
  }
  .max-w-3xl {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>
