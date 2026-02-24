<template>
  <div>
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-r from-primary-600 to-accent-600 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            Вкусная еда с доставкой
          </h1>
          <p class="text-xl md:text-2xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Заказывайте любимые блюда в несколько кликов. Быстрая доставка до двери!
          </p>
          <router-link to="/menu" class="btn-primary bg-white text-primary-600 hover:bg-primary-50 text-lg px-8 py-4">
            Смотреть меню
          </router-link>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center mb-12">Категории</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <router-link 
            v-for="category in categories" 
            :key="category.id"
            :to="`/menu?category=${category.slug}`"
            class="flex flex-col items-center p-6 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors group"
          >
            <i :class="`fa-solid ${category.icon} text-4xl text-primary-600 group-hover:scale-110 transition-transform`"></i>
            <span class="mt-3 text-sm font-medium text-gray-700 text-center">{{ category.name }}</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Popular Products -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-3xl font-bold">Популярные блюда</h2>
          <router-link to="/menu?sort=popular" class="text-primary-600 hover:text-primary-700 font-medium flex items-center">
            Все товары
            <i class='fa-solid fa-arrow-right text-xl ml-1'></i>
          </router-link>
        </div>
        
        <div v-if="popularProducts.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard v-for="product in popularProducts" :key="product.id" :product="product" />
        </div>
        <div v-else class="text-center py-12">
          <i class='fa-solid fa-spinner fa-spin text-4xl text-gray-400'></i>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-16 bg-primary-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div class="p-6">
            <i class='fa fa-clock text-5xl mb-4'></i>
            <h3 class="text-xl font-bold mb-2">Быстрая доставка</h3>
            <p class="text-primary-100">Доставим заказ в течение 60 минут</p>
          </div>
          <div class="p-6">
            <i class='fa fa-shield-halved text-5xl mb-4'></i>
            <h3 class="text-xl font-bold mb-2">Гарантия качества</h3>
            <p class="text-primary-100">Только свежие продукты</p>
          </div>
          <div class="p-6">
            <i class='fa fa-credit-card text-5xl mb-4'></i>
            <h3 class="text-xl font-bold mb-2">Удобная оплата</h3>
            <p class="text-primary-100">Оплачивайте картой или наличными</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/api';
import ProductCard from '@/components/ProductCard.vue';
import type { Product } from '@/types';

const categories = ref<any[]>([]);
const popularProducts = ref<Product[]>([]);

const formatPrice = (value: string | number | undefined | null) => {
  if (value === undefined || value === null) return '0.00 ₽';
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return num.toFixed(2) + ' ₽';
};

onMounted(async () => {
  try {
    const [categoriesRes, popularRes] = await Promise.all([
      api.get('/categories'),
      api.get('/products/popular?limit=8')
    ]);

    categories.value = categoriesRes.data;
    popularProducts.value = popularRes.data;
  } catch (error) {
    console.error('Error loading home data:', error);
  }
});
</script>
