<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Корзина</h1>

      <div v-if="cartItems.length" class="space-y-6">
        <!-- Cart Items -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
          <ul class="divide-y">
            <li v-for="item in cartItems" :key="item.productId" 
                class="p-6 flex items-center gap-4">
              <img :src="item.image || '/placeholder-product.jpg'" 
                   :alt="item.name"
                   class="w-20 h-20 object-cover rounded-lg">
              
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900">{{ item.name }}</h3>
                <p class="text-primary-600 font-bold">{{ item.price.toFixed(2) }} ₽</p>
              </div>

              <div class="flex items-center border border-gray-300 rounded-lg">
                <button 
                  @click="updateQuantity(item.productId, item.quantity - 1)"
                  class="px-3 py-2 hover:bg-gray-100"
                >
                  <i class='fa-solid fa-minus'></i>
                </button>
                <span class="px-4 font-medium">{{ item.quantity }}</span>
                <button 
                  @click="updateQuantity(item.productId, item.quantity + 1)"
                  class="px-3 py-2 hover:bg-gray-100"
                >
                  <i class='fa-solid fa-plus'></i>
                </button>
              </div>

              <button 
                @click="removeItem(item.productId)"
                class="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <i class='fa-solid fa-trash text-xl'></i>
              </button>
            </li>
          </ul>
        </div>

        <!-- Order Summary -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold mb-4">Итого</h2>
          
          <div class="space-y-3 mb-6">
            <div class="flex justify-between text-gray-600">
              <span>Товары ({{ totalItems }} шт.)</span>
              <span>{{ totalPrice.toFixed(2) }} ₽</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Доставка</span>
              <span>рассчитывается при оформлении</span>
            </div>
            <div class="border-t pt-3 flex justify-between text-lg font-bold">
              <span>К оплате</span>
              <span class="text-primary-600">{{ totalPrice.toFixed(2) }} ₽</span>
            </div>
          </div>

          <router-link to="/checkout" class="btn-primary w-full justify-center">
            <i class='fa-solid fa-check mr-2'></i>
            Оформить заказ
          </router-link>
        </div>

        <!-- Continue Shopping -->
        <div class="text-center">
          <router-link to="/menu" class="text-primary-600 hover:text-primary-700 font-medium">
            <i class='fa-solid fa-arrow-left mr-2'></i>
            Продолжить покупки
          </router-link>
        </div>
      </div>

      <!-- Empty Cart -->
      <div v-else class="bg-white rounded-xl shadow-md p-12 text-center">
        <i class='fa-solid fa-cart-shopping text-6xl text-gray-300 mb-4'></i>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Корзина пуста</h2>
        <p class="text-gray-600 mb-6">Добавьте товары чтобы сделать заказ</p>
        <router-link to="/menu" class="btn-primary">
          <i class='fa-solid fa-utensils mr-2'></i>
          Перейти в меню
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCartStore } from '@/stores/cart';

const cartStore = useCartStore();

const cartItems = computed(() => cartStore.items);
const totalItems = computed(() => cartStore.totalItems);
const totalPrice = computed(() => cartStore.totalPrice);

const updateQuantity = (productId: number, quantity: number) => {
  cartStore.updateQuantity(productId, quantity);
};

const removeItem = (productId: number) => {
  cartStore.removeItem(productId);
};
</script>
