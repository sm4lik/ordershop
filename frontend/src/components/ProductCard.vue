<template>
  <div class="card group">
    <router-link :to="`/product/${product.slug}`" class="block">
      <div class="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          :src="product.image || '/placeholder-product.jpg'" 
          :alt="product.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        >
        
        <!-- Badges -->
        <div class="absolute top-2 left-2 flex flex-col gap-1">
          <span v-if="product.isPopular" class="badge badge-warning">
            <i class='fa-solid fa-star mr-1'></i>Популярное
          </span>
          <span v-if="product.isNew" class="badge badge-info">
            <i class='fa-solid fa-sparkles mr-1'></i>Новинка
          </span>
        </div>
        
        <!-- Discount badge -->
        <span v-if="product.oldPrice" class="absolute top-2 right-2 badge bg-red-500 text-white">
          -{{ Math.round((1 - getPrice(product.price) / getPrice(product.oldPrice)) * 100) }}%
        </span>
      </div>
      
      <div class="p-4">
        <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {{ product.name }}
        </h3>
        
        <div class="flex items-center gap-2 mb-3" v-if="product.rating && (product.rating > 0 || product.review_count > 0 || product.reviewCount > 0)">
          <div class="flex items-center text-yellow-400">
            <i class='fa-solid fa-star text-sm'></i>
            <span class="text-sm font-medium ml-1">{{ Number(product.rating || 0).toFixed(1) }}</span>
          </div>
          <span class="text-xs text-gray-500">({{ product.review_count || product.reviewCount || 0 }})</span>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl font-bold text-primary-600">{{ formatPrice(product.price) }}</span>
            <span v-if="product.oldPrice" class="text-sm text-gray-400 line-through">
              {{ formatPrice(product.oldPrice) }}
            </span>
          </div>
          
          <button 
            @click.prevent="addToCart"
            class="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            title="Добавить в корзину"
          >
            <i class='fa-solid fa-plus text-xl'></i>
          </button>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart';
import type { Product } from '@/types';

const cartStore = useCartStore();

const props = defineProps<{
  product: Product;
}>();

// Конвертация цены из строки/числа в число
const getPrice = (value: string | number | undefined | null): number => {
  if (value === undefined || value === null) return 0;
  return typeof value === 'string' ? parseFloat(value) : Number(value);
};

const formatPrice = (value: string | number | undefined | null): string => {
  const price = getPrice(value);
  return price.toFixed(2) + ' ₽';
};

const addToCart = () => {
  cartStore.addItem({
    id: props.product.id,
    name: props.product.name,
    price: getPrice(props.product.price),
    image: props.product.image
  });
};
</script>
