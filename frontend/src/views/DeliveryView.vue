<template>
  <div class="min-h-screen bg-gray-50 py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-xl shadow-md p-8">
        <h1 class="text-3xl font-bold mb-6">Доставка</h1>
        
        <div v-if="!acceptsOrders" class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <div class="flex items-center gap-3">
            <i class='fa fa-error-circle text-3xl text-yellow-600'></i>
            <div>
              <h2 class="font-bold text-yellow-800">Прием заказов временно приостановлен</h2>
              <p class="text-yellow-700">Мы не принимаем заказы в данное время. Попробуйте позже.</p>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="p-6 bg-primary-50 rounded-xl">
            <i class='fa fa-store text-4xl text-primary-600 mb-4'></i>
            <h2 class="text-xl font-bold mb-2">Самовывоз</h2>
            <p class="text-gray-600 mb-2">Бесплатно</p>
            <p class="text-gray-600">Готовность: 30-40 минут</p>
            <p class="text-sm text-gray-500 mt-4">
              Заберите заказ самостоятельно из нашего ресторана по адресу: Москва, ул. Примерная, 1
            </p>
          </div>
          
          <div class="p-6 bg-accent-50 rounded-xl">
            <i class='fa fa-car text-4xl text-accent-600 mb-4'></i>
            <h2 class="text-xl font-bold mb-2">Курьером</h2>
            <p class="text-gray-600 mb-2">{{ settings.deliveryFee }} ₽, бесплатно от {{ settings.freeDeliveryFrom }} ₽</p>
            <p class="text-gray-600">Время доставки: 45-60 минут</p>
            <p class="text-sm text-gray-500 mt-4">
              Доставим заказ прямо до двери в удобное для вас время
            </p>
          </div>
        </div>
        
        <div class="border-t pt-8">
          <h2 class="text-xl font-bold mb-4">Режим работы</h2>
          <div class="flex items-center gap-4 mb-4">
            <i class='fa fa-clock text-3xl text-primary-600'></i>
            <div>
              <p class="text-lg font-medium">{{ settings.openTime }} - {{ settings.closeTime }}</p>
              <p class="text-gray-500">Время местное (Владивосток UTC+10)</p>
            </div>
          </div>
        </div>
        
        <div class="border-t pt-8 mt-8">
          <h2 class="text-xl font-bold mb-4">Способы оплаты</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div v-if="settings.paymentCash" class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <i class='fa fa-money-bill text-3xl text-green-600'></i>
              <span class="font-medium">Наличными</span>
            </div>
            <div v-if="settings.paymentCard" class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <i class='fa fa-credit-card text-3xl text-blue-600'></i>
              <span class="font-medium">Картой</span>
            </div>
            <div v-if="settings.paymentOnline" class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <i class='fa fa-wallet text-3xl text-purple-600'></i>
              <span class="font-medium">Онлайн</span>
            </div>
          </div>
        </div>
        
        <div class="border-t pt-8 mt-8">
          <h2 class="text-xl font-bold mb-4">Зоны доставки</h2>
          <div class="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
            <p class="text-gray-500">Карта зон доставки</p>
          </div>
        </div>
        
        <div class="mt-8 text-center">
          <router-link to="/menu" class="btn-primary">
            <i class='fa-solid fa-utensils mr-2'></i>
            Перейти в меню
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/api';

const settings = ref({
  deliveryFee: 299,
  freeDeliveryFrom: 1500,
  paymentCash: true,
  paymentCard: true,
  paymentOnline: false,
  acceptOrders: true,
  openTime: '10:00',
  closeTime: '23:00'
});

const acceptsOrders = ref(true);

const checkWorkingHours = () => {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  const [openHours, openMinutes] = settings.value.openTime.split(':').map(Number);
  const [closeHours, closeMinutes] = settings.value.closeTime.split(':').map(Number);

  const openTimeInMinutes = openHours * 60 + openMinutes;
  const closeTimeInMinutes = closeHours * 60 + closeMinutes;

  // Проверка на прием заказов
  const isWithinWorkingHours = currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes <= closeTimeInMinutes;

  console.log('Working hours check:', {
    currentTime: `${currentHours}:${currentMinutes}`,
    openTime: settings.value.openTime,
    closeTime: settings.value.closeTime,
    isWithinWorkingHours,
    acceptOrders: settings.value.acceptOrders,
    finalAcceptsOrders: settings.value.acceptOrders && isWithinWorkingHours
  });

  acceptsOrders.value = settings.value.acceptOrders && isWithinWorkingHours;
};

const loadSettings = async () => {
  try {
    const response = await api.get('/settings');
    const s = response.data;
    settings.value = {
      deliveryFee: s.delivery_fee || 299,
      freeDeliveryFrom: s.free_delivery_from || 1500,
      paymentCash: s.payment_cash !== false,
      paymentCard: s.payment_card !== false,
      paymentOnline: s.payment_online || false,
      acceptOrders: s.accept_orders !== false,
      openTime: s.open_time || '10:00',
      closeTime: s.close_time || '23:00'
    };
    
    checkWorkingHours();
  } catch (error) {
    console.error('Error loading settings:', error);
  }
};

onMounted(() => {
  loadSettings();
  
  // Проверяем рабочее время каждую минуту
  setInterval(checkWorkingHours, 60000);
});
</script>
