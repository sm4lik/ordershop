<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Оформление заказа</h1>

      <div v-if="!acceptsOrders" class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
        <div class="flex items-center gap-3">
          <i class='fa-solid fa-circle-exclamation text-3xl text-yellow-600'></i>
          <div>
            <h2 class="font-bold text-yellow-800">Прием заказов временно приостановлен</h2>
            <p class="text-yellow-700">Мы не принимаем заказы в данное время. Попробуйте позже.</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8" :class="{'opacity-50 pointer-events-none': !acceptsOrders}">
        <!-- Main Form -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Contact Info -->
          <div class="bg-white rounded-xl shadow-md p-6">
            <h2 class="text-xl font-bold mb-4">Контактная информация</h2>
            
            <div class="space-y-4">
              <div v-if="!isAuthenticated">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Ваше имя *
                </label>
                <input v-model="form.guestName" type="text" class="input-field" required>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Телефон *
                </label>
                <input v-model="form.guestPhone" type="tel" class="input-field" 
                       placeholder="+7 (___) ___-__-__" required>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input v-model="form.guestEmail" type="email" class="input-field">
              </div>
            </div>
          </div>

          <!-- Delivery Type -->
          <div class="bg-white rounded-xl shadow-md p-6">
            <h2 class="text-xl font-bold mb-4">Способ получения</h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="relative border-2 rounded-xl p-4 cursor-pointer transition-colors"
                     :class="form.deliveryType === 'pickup' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'">
                <input type="radio" v-model="form.deliveryType" value="pickup" class="sr-only">
                <i class='fa-solid fa-store text-3xl text-primary-600 mb-2'></i>
                <p class="font-medium">Самовывоз</p>
                <p class="text-sm text-gray-500">Бесплатно</p>
              </label>

              <label class="relative border-2 rounded-xl p-4 cursor-pointer transition-colors"
                     :class="form.deliveryType === 'courier' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'">
                <input type="radio" v-model="form.deliveryType" value="courier" class="sr-only">
                <i class='fa-solid fa-car text-3xl text-primary-600 mb-2'></i>
                <p class="font-medium">Курьером</p>
                <p v-if="totalPrice >= settings.freeDeliveryFrom" class="text-sm text-green-600 font-medium">
                  <i class='fa-solid fa-gift mr-1'></i>
                  Бесплатно
                </p>
                <p v-else class="text-sm text-gray-500">
                  {{ settings.deliveryFee }} ₽, бесплатно от {{ settings.freeDeliveryFrom }} ₽
                </p>
              </label>
            </div>
          </div>

          <!-- Delivery Address -->
          <div v-if="form.deliveryType === 'courier'" 
               class="bg-white rounded-xl shadow-md p-6">
            <h2 class="text-xl font-bold mb-4">Адрес доставки</h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Полный адрес *
                </label>
                <input v-model="deliveryAddress.fullAddress" type="text" 
                       class="input-field" placeholder="Город, улица, дом, квартира" required>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Подъезд
                  </label>
                  <input v-model="deliveryAddress.entrance" type="text" class="input-field">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Этаж
                  </label>
                  <input v-model="deliveryAddress.floor" type="text" class="input-field">
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Комментарий для курьера
                </label>
                <textarea v-model="form.notes" rows="2" class="input-field" 
                          placeholder="Домофон, код, ориентир..."></textarea>
              </div>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="bg-white rounded-xl shadow-md p-6">
            <h2 class="text-xl font-bold mb-4">Способ оплаты</h2>
            
            <div class="space-y-3">
              <label v-if="settings.paymentCash" class="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors"
                     :class="form.paymentMethod === 'cash' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'">
                <input type="radio" v-model="form.paymentMethod" value="cash" class="sr-only">
                <i class='fa-solid fa-money-bill text-2xl text-primary-600 mr-3'></i>
                <div>
                  <p class="font-medium">Наличными</p>
                  <p class="text-sm text-gray-500">При получении</p>
                </div>
              </label>

              <label v-if="settings.paymentCard" class="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors"
                     :class="form.paymentMethod === 'card' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'">
                <input type="radio" v-model="form.paymentMethod" value="card" class="sr-only">
                <i class='fa-regular fa-credit-card text-2xl text-primary-600 mr-3'></i>
                <div>
                  <p class="font-medium">Картой</p>
                  <p class="text-sm text-gray-500">При получении</p>
                </div>
              </label>

              <label v-if="settings.paymentOnline" class="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors"
                     :class="form.paymentMethod === 'online' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'">
                <input type="radio" v-model="form.paymentMethod" value="online" class="sr-only">
                <i class='fa-solid fa-wallet text-2xl text-primary-600 mr-3'></i>
                <div>
                  <p class="font-medium">Онлайн</p>
                  <p class="text-sm text-gray-500">Банковской картой</p>
                </div>
              </label>
              
              <p v-if="!settings.paymentCash && !settings.paymentCard && !settings.paymentOnline" 
                 class="text-gray-500 text-center py-4">
                Способы оплаты недоступны
              </p>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h2 class="text-xl font-bold mb-4">Ваш заказ</h2>
            
            <ul class="space-y-3 mb-6 max-h-64 overflow-auto">
              <li v-for="item in cartItems" :key="item.productId" 
                  class="flex justify-between text-sm">
                <span class="text-gray-600">{{ item.quantity }} x {{ item.name }}</span>
                <span class="font-medium">{{ (item.price * item.quantity).toFixed(2) }} ₽</span>
              </li>
            </ul>
            
            <div class="border-t pt-4 space-y-2">
              <div class="flex justify-between text-gray-600">
                <span>Товары</span>
                <span>{{ totalPrice.toFixed(2) }} ₽</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Доставка</span>
                <span :class="deliveryFee === 0 ? 'text-green-600 font-medium' : ''">
                  <span v-if="deliveryFee === 0 && form.deliveryType === 'courier'">
                    <i class='fa-solid fa-gift mr-1'></i>Бесплатно
                  </span>
                  <span v-else>{{ deliveryFee.toFixed(2) }} ₽</span>
                </span>
              </div>
              <div v-if="discountAmount > 0" class="flex justify-between text-green-600">
                <span>Скидка</span>
                <span>-{{ discountAmount.toFixed(2) }} ₽</span>
              </div>
              <div class="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Итого</span>
                <span class="text-primary-600">{{ finalAmount.toFixed(2) }} ₽</span>
              </div>
              <p v-if="deliveryFee === 0 && form.deliveryType === 'courier'" class="text-xs text-green-600 text-center">
                <i class='fa-solid fa-circle-check mr-1'></i>
                Ваш заказ превышает {{ settings.freeDeliveryFrom }} ₽ — доставка бесплатно!
              </p>
            </div>
            
            <button @click="submitOrder" 
                    :disabled="!canSubmit || submitting || !acceptsOrders"
                    class="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
              <i v-if="submitting" class='fa-solid fa-spinner fa-spin mr-2'></i>
              <i v-else class='fa-solid fa-check mr-2'></i>
              {{ submitting ? 'Обработка...' : 'Подтвердить заказ' }}
            </button>
            
            <p v-if="!acceptsOrders" class="text-sm text-yellow-600 text-center mt-2">
              Прием заказов приостановлен
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import api from '@/api';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const cartItems = computed(() => cartStore.items);
const totalPrice = computed(() => cartStore.totalPrice);

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

const form = ref({
  guestName: authStore.user?.firstName ? `${authStore.user.firstName} ${authStore.user.lastName}` : '',
  guestPhone: authStore.user?.phone || '',
  guestEmail: authStore.user?.email || '',
  deliveryType: 'pickup',
  paymentMethod: 'cash',
  notes: ''
});

const deliveryAddress = ref({
  fullAddress: '',
  city: '',
  street: '',
  building: '',
  apartment: '',
  floor: '',
  entrance: '',
  intercom: ''
});

const deliveryFee = ref(0);
const discountAmount = ref(0);
const submitting = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);
const canSubmit = computed(() => {
  if (!acceptsOrders.value) return false;
  if (!form.value.guestPhone || !form.value.guestName) return false;
  if (form.value.deliveryType === 'courier' && !deliveryAddress.value.fullAddress) return false;
  if (cartItems.value.length === 0) return false;
  return true;
});

const finalAmount = computed(() => totalPrice.value + deliveryFee.value - discountAmount.value);

// Расчет стоимости доставки
const calculateDeliveryFee = () => {
  if (form.value.deliveryType === 'courier') {
    // Если сумма заказа больше или равна порогу бесплатной доставки
    if (totalPrice.value >= settings.value.freeDeliveryFrom) {
      deliveryFee.value = 0;
    } else {
      deliveryFee.value = settings.value.deliveryFee;
    }
  } else {
    deliveryFee.value = 0;
  }
};

watch(() => form.value.deliveryType, calculateDeliveryFee);
watch(totalPrice, calculateDeliveryFee);

// Проверка времени работы (используем локальное время)
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
    
    // Пересчитываем доставку с новыми настройками
    calculateDeliveryFee();
    
    // Проверяем рабочее время
    checkWorkingHours();
  } catch (error) {
    console.error('Error loading settings:', error);
  }
};

const submitOrder = async () => {
  if (!canSubmit.value || submitting.value) return;
  
  submitting.value = true;
  
  try {
    const orderData: any = {
      items: cartItems.value.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      guestName: form.value.guestName,
      guestPhone: form.value.guestPhone,
      guestEmail: form.value.guestEmail || undefined,
      paymentMethod: form.value.paymentMethod,
      paymentType: form.value.paymentMethod, // cash, card, online
      notes: form.value.notes,
      deliveryType: form.value.deliveryType === 'courier' ? 2 : 1
    };

    if (form.value.deliveryType === 'courier') {
      orderData.deliveryAddress = {
        fullAddress: deliveryAddress.value.fullAddress,
        city: deliveryAddress.value.city,
        street: deliveryAddress.value.street,
        building: deliveryAddress.value.building,
        apartment: deliveryAddress.value.apartment,
        floor: deliveryAddress.value.floor,
        entrance: deliveryAddress.value.entrance,
        intercom: deliveryAddress.value.intercom,
        deliveryInstructions: form.value.notes
      };
    }

    console.log('Creating order:', orderData);
    const response = await api.post('/orders', orderData);
    console.log('Order created:', response.data);

    cartStore.clearCart();

    // Если онлайн-оплата, перенаправляем на страницу оплаты
    if (form.value.paymentMethod === 'online') {
      router.push({
        name: 'payment-result',
        query: { orderId: response.data.order.id }
      });
    } else {
      // Иначе показываем страницу отслеживания
      router.push({
        name: 'order-tracking',
        params: { number: response.data.order.orderNumber }
      });
    }
  } catch (error: any) {
    console.error('Order error:', error.response?.data);
    alert(error.response?.data?.error || 'Ошибка при создании заказа');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadSettings();
  
  // Проверяем рабочее время каждую минуту
  setInterval(checkWorkingHours, 60000);
});
</script>
