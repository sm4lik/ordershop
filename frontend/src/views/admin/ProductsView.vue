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
          <div class="flex items-center space-x-4">
            <router-link to="/admin/products/new" class="btn-primary">
              <i class='fa-solid fa-plus mr-2'></i>
              Добавить товар
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <main class="py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-wrap gap-4 items-end">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <select v-model="categoryFilter" class="input-field w-full">
              <option value="">Все категории</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="popularFilter" class="w-4 h-4 rounded text-blue-600">
              <span class="text-sm font-medium text-gray-700">Популярные</span>
            </label>
          </div>

          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="newFilter" class="w-4 h-4 rounded text-blue-600">
              <span class="text-sm font-medium text-gray-700">Новинки</span>
            </label>
          </div>

          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="showInactive" class="w-4 h-4 rounded text-blue-600">
              <span class="text-sm font-medium text-gray-700">Неактивные</span>
            </label>
          </div>

          <button @click="loadProducts" class="btn-primary">
            <i class='fa-solid fa-rotate mr-2'></i>
            Обновить
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12 bg-white rounded-xl shadow-md">
          <i class='fa-solid fa-spinner fa-spin text-4xl text-blue-600'></i>
          <p class="mt-4 text-gray-600">Загрузка товаров...</p>
        </div>

        <!-- Products Grid -->
        <div v-else-if="products.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="product in products" :key="product.id"
               class="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-shadow">
            <!-- Image -->
            <div class="aspect-square overflow-hidden bg-gray-100 relative">
              <img 
                :src="product.image || '/placeholder.jpg'"
                :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform"
              >
              
              <!-- Status Badges -->
              <div class="absolute top-2 left-2 flex flex-col gap-1">
                <span v-if="product.is_popular" class="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded">
                  <i class='fa-solid fa-star mr-1'></i>Популярное
                </span>
                <span v-if="product.is_new" class="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded">
                  <i class='fa-solid fa-bolt mr-1'></i>Новинка
                </span>
              </div>
              
              <!-- Active/Inactive Badge -->
              <div class="absolute top-2 right-2">
                <span 
                  :class="product.is_active ? 'bg-green-500' : 'bg-gray-500'"
                  class="px-2 py-1 text-white text-xs font-medium rounded"
                >
                  {{ product.is_active ? 'Активен' : 'Неактивен' }}
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-4">
              <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">{{ product.name }}</h3>
              
              <!-- Price -->
              <div class="flex items-center gap-2 mb-3">
                <span class="text-primary-600 font-bold text-lg">{{ formatPrice(product.price) }}</span>
                <span v-if="product.old_price" class="text-gray-400 line-through text-sm">
                  {{ formatPrice(product.old_price) }}
                </span>
                <span v-if="product.old_price" class="text-red-500 text-xs font-medium">
                  -{{ calculateDiscount(product.price, product.old_price) }}%
                </span>
              </div>

              <!-- Info -->
              <div class="text-sm text-gray-600 mb-3 space-y-1">
                <div class="flex justify-between">
                  <span>Категория:</span>
                  <span class="font-medium">{{ product.category_name || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Артикул:</span>
                  <span class="font-medium">{{ product.sku || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Остаток:</span>
                  <span :class="product.stock_quantity <= 10 ? 'text-red-600' : 'text-green-600'" class="font-medium">
                    {{ product.stock_quantity || 0 }} шт.
                  </span>
                </div>
                <div v-if="product.weight" class="flex justify-between">
                  <span>Вес:</span>
                  <span class="font-medium">{{ product.weight }} г</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2">
                <router-link 
                  :to="`/admin/products/${product.id}/edit`"
                  class="flex-1 btn-secondary text-sm py-2 justify-center"
                >
                  <i class='fa-solid fa-pen mr-1'></i>
                  Ред.
                </router-link>
                <button 
                  @click="deleteProduct(product.id)"
                  class="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  title="Удалить"
                >
                  <i class='fa-solid fa-trash'></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12 bg-white rounded-xl shadow-md">
          <i class='fa-solid fa-box-open text-6xl text-gray-300 mb-4'></i>
          <p class="text-gray-500 text-lg">Товары не найдены</p>
          <router-link to="/admin/products/new" class="btn-primary mt-4 inline-flex">
            <i class='fa-solid fa-plus mr-2'></i>
            Добавить первый товар
          </router-link>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="flex justify-center gap-2 mt-6">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class='fa-solid fa-chevron-left'></i>
          </button>
          
          <span class="px-4 py-2 bg-white rounded-lg border">
            Стр. {{ currentPage }} из {{ pagination.pages }}
          </span>
          
          <button 
            @click="currentPage++" 
            :disabled="currentPage === pagination.pages"
            class="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class='fa-solid fa-chevron-right'></i>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import api from '@/api';

const products = ref<any[]>([]);
const categories = ref<any[]>([]);
const categoryFilter = ref('');
const popularFilter = ref(false);
const newFilter = ref(false);
const showInactive = ref(false);
const currentPage = ref(1);
const pagination = ref({ page: 1, limit: 12, total: 0, pages: 1 });
const loading = ref(false);

const formatPrice = (value: any): string => {
  if (value === undefined || value === null) return '0.00 ₽';
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return num.toFixed(2) + ' ₽';
};

const calculateDiscount = (price: number, oldPrice: number): number => {
  if (!price || !oldPrice || price >= oldPrice) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

watch([categoryFilter, popularFilter, newFilter, showInactive, currentPage], () => {
  currentPage.value = 1;
  loadProducts();
});

async function loadProducts() {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      limit: 12,
      show_inactive: showInactive.value ? 'true' : 'false'
    };
    
    if (categoryFilter.value) params.category = categoryFilter.value;
    if (popularFilter.value) params.popular = 'true';
    if (newFilter.value) params.new = 'true';

    const [productsRes, categoriesRes] = await Promise.all([
      api.get('/products', { params }),
      api.get('/categories')
    ]);

    products.value = productsRes.data.products || [];
    pagination.value = productsRes.data.pagination || {};
    categories.value = categoriesRes.data || [];
  } catch (error) {
    console.error('Error loading products:', error);
    alert('Ошибка загрузки товаров');
  } finally {
    loading.value = false;
  }
}

async function deleteProduct(id: number) {
  if (!confirm('Вы уверены, что хотите удалить этот товар? Товар будет помечен как неактивный.')) return;

  try {
    await api.delete(`/products/${id}`);
    loadProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Ошибка при удалении товара');
  }
}

onMounted(() => {
  loadProducts();
});
</script>
