<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Наше меню</h1>
        <p class="text-gray-600">Выберите любимые блюда из нашего разнообразного меню</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar - Categories -->
        <aside class="lg:w-64 flex-shrink-0">
          <div class="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h3 class="font-bold text-lg mb-4">Категории</h3>
            <nav class="space-y-2">
              <button
                @click="selectedCategory = null"
                :class="`w-full text-left px-3 py-2 rounded-lg transition-colors ${!selectedCategory ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`"
              >
                Все меню
              </button>
              <button
                v-for="category in categories"
                :key="category.id"
                @click="selectedCategory = category.slug"
                :class="`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${selectedCategory === category.slug ? 'bg-primary-100 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`"
              >
                <span class="flex items-center">
                  <i :class="`fa-solid ${category.icon} mr-3 w-6 text-center`"></i>
                  {{ category.name }}
                </span>
                <span class="text-xs text-gray-500">{{ category.product_count }}</span>
              </button>
            </nav>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="flex-1">
          <!-- Filters & Sort -->
          <div class="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <!-- Search -->
            <div class="relative w-full sm:w-96">
              <i class='fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl'></i>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Поиск блюд..."
                class="input-field pl-10"
              >
            </div>

            <!-- Sort -->
            <select v-model="sortBy" class="input-field w-full sm:w-auto">
              <option value="">По умолчанию</option>
              <option value="price-asc">Сначала дешевле</option>
              <option value="price-desc">Сначала дороже</option>
              <option value="rating">По рейтингу</option>
              <option value="popular">Популярные</option>
              <option value="new">Новинки</option>
            </select>
          </div>

          <!-- Products Grid -->
          <div v-if="loading" class="text-center py-12">
            <i class='fa-solid fa-spinner fa-spin text-4xl text-gray-400 animate-spin'></i>
          </div>
          <div v-else-if="products.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductCard v-for="product in products" :key="product.id" :product="product" />
          </div>
          <div v-else class="text-center py-12 bg-white rounded-xl shadow-md">
            <i class='fa-solid fa-magnifying-glass text-6xl text-gray-300 mb-4'></i>
            <p class="text-gray-500">Ничего не найдено</p>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.pages > 1" class="mt-8 flex justify-center gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <i class='fa-solid fa-chevron-left'></i>
            </button>
            <span class="px-4 py-2">
              {{ currentPage }} из {{ pagination.pages }}
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === pagination.pages"
              class="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <i class='fa-solid fa-chevron-right'></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';
import ProductCard from '@/components/ProductCard.vue';
import type { Product, Category } from '@/types';

const route = useRoute();
const router = useRouter();

const categories = ref<Category[]>([]);
const products = ref<Product[]>([]);
const loading = ref(true);

const selectedCategory = ref<string | null>(null);
const searchQuery = ref('');
const sortBy = ref('');
const currentPage = ref(1);

const pagination = ref({ page: 1, limit: 12, total: 0, pages: 1 });

const searchTimeout = ref<NodeJS.Timeout | null>(null);

watch([selectedCategory, sortBy, currentPage], () => {
  loadProducts();
});

watch(searchQuery, (newVal) => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1;
    loadProducts();
  }, 300);
});

async function loadProducts() {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      limit: 12
    };
    
    if (selectedCategory.value) params.category = selectedCategory.value;
    if (searchQuery.value) params.search = searchQuery.value;
    if (sortBy.value) params.sort = sortBy.value;

    const response = await api.get('/products', { params });
    products.value = response.data.products;
    pagination.value = response.data.pagination;
  } catch (error) {
    console.error('Error loading products:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  // Load categories
  try {
    const response = await api.get('/categories');
    categories.value = response.data;
    
    // Check for category in URL
    const categorySlug = route.query.category as string;
    if (categorySlug) {
      selectedCategory.value = categorySlug;
    }
    
    const sort = route.query.sort as string;
    if (sort) {
      sortBy.value = sort;
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
  
  loadProducts();
});
</script>
