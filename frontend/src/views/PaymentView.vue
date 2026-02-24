<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-4 py-8">
      <!-- Заголовок -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Оплата заказа</h1>
        <p class="text-gray-600">Заказ № {{ orderNumber }}</p>
      </div>

      <!-- Карточка заказа -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 class="text-xl font-bold mb-4">Детали заказа</h2>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">Сумма заказа:</span>
            <span class="font-bold">{{ formatMoney(orderAmount) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Статус:</span>
            <span :class="statusBadgeClass" class="px-3 py-1 rounded-full text-sm font-medium">
              {{ statusText }}
            </span>
          </div>
          <div class="border-t pt-3">
            <div class="flex justify-between text-lg">
              <span class="font-bold">К оплате:</span>
              <span class="font-bold text-primary-600">{{ formatMoney(orderAmount) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Статус оплаты -->
      <div v-if="paymentStatus === 'succeeded'" class="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center">
        <i class='fa-solid fa-circle-check text-green-500 text-5xl mb-4'></i>
        <h2 class="text-xl font-bold text-green-800 mb-2">Оплата прошла успешно!</h2>
        <p class="text-green-700">Ваш заказ оплачен. Мы уже начали его готовить.</p>
      </div>

      <div v-else-if="paymentStatus === 'canceled'" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 text-center">
        <i class='fa-solid fa-circle-xmark text-red-500 text-5xl mb-4'></i>
        <h2 class="text-xl font-bold text-red-800 mb-2">Оплата отменена</h2>
        <p class="text-red-700 mb-4">Платеж не был завершен. Вы можете попробовать снова.</p>
        <button @click="initiatePayment" class="btn-primary">
          <i class='fa-solid fa-credit-card mr-2'></i>Оплатить снова
        </button>
      </div>

      <div v-else-if="paymentStatus === 'pending'" class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6 text-center">
        <i class='fa-solid fa-clock text-yellow-500 text-5xl mb-4 animate-pulse'></i>
        <h2 class="text-xl font-bold text-yellow-800 mb-2">Ожидаем оплату</h2>
        <p class="text-yellow-700 mb-4">Платеж в процессе обработки...</p>
      </div>

      <!-- Кнопка оплаты -->
      <div v-if="!paymentStatus || paymentStatus === 'pending'" class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-xl font-bold mb-4">Способы оплаты</h2>
        
        <div class="space-y-3">
          <button 
            @click="initiatePayment"
            class="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-3"
          >
            <i class='fa-solid fa-credit-card text-2xl'></i>
            <div class="text-left">
              <div class="text-sm">Оплатить банковской картой</div>
              <div class="text-xs opacity-75">Visa, Mastercard, МИР</div>
            </div>
          </button>

          <button 
            @click="initiatePayment('sbp')"
            class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-3"
          >
            <i class='fa-solid fa-qrcode text-2xl'></i>
            <div class="text-left">
              <div class="text-sm">Оплатить через СБП</div>
              <div class="text-xs opacity-75">Система быстрых платежей</div>
            </div>
          </button>
        </div>

        <div class="mt-6 text-center text-sm text-gray-500">
          <i class='fa-solid fa-shield-halved mr-2'></i>
          Безопасная оплата через ЮKassa
        </div>
      </div>

      <!-- Кнопка возврата -->
      <div class="mt-6 text-center">
        <router-link to="/profile/orders" class="text-primary-600 hover:text-primary-700 font-medium">
          <i class='fa-solid fa-arrow-left mr-2'></i>Вернуться к заказам
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/api';

const route = useRoute();
const orderId = ref<number>(0);
const orderNumber = ref<string>('');
const orderAmount = ref<number>(0);
const paymentStatus = ref<string>('');
const paymentType = ref<string>('');
const paymentUrl = ref<string>('');
const loading = ref(true);
const processing = ref(false);

const statusText = computed(() => {
  const statusMap: Record<string, string> = {
    'pending': 'Ожидает оплаты',
    'succeeded': 'Оплачен',
    'canceled': 'Отменен',
    'refunded': 'Возвращен'
  };
  return statusMap[paymentStatus.value] || paymentStatus.value;
});

const statusBadgeClass = computed(() => {
  const classMap: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'succeeded': 'bg-green-100 text-green-800',
    'canceled': 'bg-red-100 text-red-800',
    'refunded': 'bg-blue-100 text-blue-800'
  };
  return classMap[paymentStatus.value] || 'bg-gray-100 text-gray-800';
});

const formatMoney = (amount: number) => {
  return amount.toFixed(2) + ' ₽';
};

const loadOrderInfo = async () => {
  try {
    const id = route.query.orderId as string;
    if (!id) {
      throw new Error('Order ID not found');
    }
    
    orderId.value = parseInt(id);
    
    const response = await api.get(`/orders/${id}`);
    const order = response.data;
    
    orderNumber.value = order.orderNumber;
    orderAmount.value = parseFloat(order.finalAmount);
    paymentStatus.value = order.payment_status || 'pending';
    paymentType.value = order.payment_type || 'cash';
  } catch (error) {
    console.error('Error loading order:', error);
  } finally {
    loading.value = false;
  }
};

const initiatePayment = async () => {
  try {
    processing.value = true;
    
    const response = await api.post('/payment/create', {
      orderId: orderId.value,
      amount: orderAmount.value,
      description: `Оплата заказа ${orderNumber.value}`
    });
    
    const { paymentUrl, status, message } = response.data;
    
    if (status === 'ext_auth_required' && paymentUrl) {
      // Требуется переход на сайт ЮMoney для оплаты
      window.open(paymentUrl, '_blank');
      alert('Перейдите по ссылке для оплаты. Окно откроется в новой вкладке.');
    } else if (status === 'done') {
      // Платёж выполнен сразу
      paymentStatus.value = 'succeeded';
      alert('Оплата прошла успешно!');
      loadOrderInfo();
    } else {
      alert(message || 'Платёж создан');
    }
  } catch (error: any) {
    console.error('Payment error:', error);
    alert(error.response?.data?.error || 'Ошибка создания платежа');
  } finally {
    processing.value = false;
  }
};

// Проверка статуса каждые 5 секунд
let checkInterval: number | null = null;
const startStatusCheck = () => {
  checkInterval = window.setInterval(async () => {
    try {
      const response = await api.get(`/payment/order/${orderId.value}/status`);
      const newStatus = response.data.paymentStatus;
      
      if (newStatus !== paymentStatus.value) {
        paymentStatus.value = newStatus;
        if (newStatus === 'succeeded') {
          alert('Оплата прошла успешно!');
          if (checkInterval) clearInterval(checkInterval);
        }
      }
    } catch (error) {
      console.error('Status check error:', error);
    }
  }, 5000);
};

onMounted(() => {
  loadOrderInfo().then(() => {
    if (paymentType.value === 'online' && paymentStatus.value === 'pending') {
      startStatusCheck();
    }
  });
});

onUnmounted(() => {
  if (checkInterval) clearInterval(checkInterval);
});
</script>
