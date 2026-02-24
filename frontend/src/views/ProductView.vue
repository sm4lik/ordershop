<template>
  <div v-if="loading" class="min-h-screen flex items-center justify-center">
    <i class='fa-solid fa-spinner fa-spin text-4xl text-gray-400 animate-spin'></i>
  </div>
  
  <div v-else-if="product" class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <router-link to="/" class="hover:text-primary-600">Главная</router-link>
        <i class='fa-solid fa-chevron-right'></i>
        <router-link to="/menu" class="hover:text-primary-600">Меню</router-link>
        <i class='fa-solid fa-chevron-right'></i>
        <router-link :to="`/menu?category=${categorySlug}`" class="hover:text-primary-600">
          {{ categoryName }}
        </router-link>
        <i class='fa-solid fa-chevron-right'></i>
        <span class="text-gray-900">{{ product.name }}</span>
      </nav>

      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <!-- Image -->
          <div class="aspect-square rounded-xl overflow-hidden bg-gray-100">
            <img 
              :src="product.image || '/placeholder-product.jpg'" 
              :alt="product.name"
              class="w-full h-full object-cover"
            >
          </div>

          <!-- Info -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span v-if="product.isPopular" class="badge badge-warning">
                <i class='fa-solid fa-star mr-1'></i>Популярное
              </span>
              <span v-if="product.isNew" class="badge badge-info">
                <i class='fa fa-badge mr-1'></i>Новинка
              </span>
            </div>

            <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ product.name }}</h1>

            <div class="flex items-center gap-4 mb-6">
              <div class="flex items-center text-yellow-400">
                <i class='fa-solid fa-star' v-for="i in 5" :key="i"></i>
                <span class="text-gray-700 ml-2 font-medium">{{ formatRating(product.rating) }}</span>
              </div>
              <span class="text-gray-500">({{ product.review_count || product.reviewCount || 0 }} отзывов)</span>
            </div>

            <p class="text-gray-600 mb-6">{{ product.description }}</p>

            <div class="flex items-baseline gap-3 mb-6">
              <span class="text-4xl font-bold text-primary-600">{{ formatPrice(product.price) }}</span>
              <span v-if="product.oldPrice" class="text-xl text-gray-400 line-through">
                {{ formatPrice(product.oldPrice) }}
              </span>
            </div>

            <!-- Add to cart -->
            <div class="flex items-center gap-4 mb-6">
              <div class="flex items-center border border-gray-300 rounded-lg">
                <button 
                  @click="decrementQuantity"
                  class="px-4 py-3 hover:bg-gray-100 rounded-l-lg"
                >
                  <i class='fa-solid fa-minus'></i>
                </button>
                <span class="px-6 py-3 font-medium">{{ quantity }}</span>
                <button 
                  @click="incrementQuantity"
                  class="px-4 py-3 hover:bg-gray-100 rounded-r-lg"
                >
                  <i class='fa-solid fa-plus'></i>
                </button>
              </div>
              <button @click="addToCart" class="btn-primary flex-1">
                <i class='fa-solid fa-cart-shopping mr-2'></i>
                В корзину
              </button>
            </div>

            <!-- Additional info -->
            <div class="border-t pt-6 space-y-3">
              <div class="flex items-center text-gray-600">
                <i class='fa-solid fa-box mr-3 text-xl'></i>
                <span>Вес: {{ product.weight || 0 }} г</span>
              </div>
              <div v-if="product.volume" class="flex items-center text-gray-600">
                <i class='fa fa-water mr-3 text-xl'></i>
                <span>Объем: {{ product.volume }} мл</span>
              </div>
              <div v-if="product.alcoholPercentage" class="flex items-center text-gray-600">
                <i class='fa fa-wine mr-3 text-xl'></i>
                <span>Алкоголь: {{ product.alcoholPercentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="mt-8 bg-white rounded-xl shadow-md p-8">
        <h2 class="text-2xl font-bold mb-6">Отзывы</h2>
        
        <div v-if="reviews.length" class="space-y-6">
          <div v-for="review in reviews" :key="review.id" class="border-b pb-6 last:border-0">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <i class='fa-solid fa-user text-primary-600'></i>
                </div>
                <div>
                  <p class="font-medium">{{ review.firstName }} {{ review.lastName }}</p>
                  <div class="flex text-yellow-400 text-sm">
                    <i class='fa-solid fa-star' v-for="i in 5" :key="i" 
                       :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"></i>
                  </div>
                </div>
              </div>
              <span class="text-sm text-gray-500">{{ formatDate(review.createdAt) }}</span>
            </div>
            <h4 v-if="review.title" class="font-medium mb-1">{{ review.title }}</h4>
            <p class="text-gray-600">{{ review.comment }}</p>
          </div>
        </div>
        <p v-else class="text-gray-500 text-center py-8">Отзывов пока нет</p>

        <!-- Write review button -->
        <div class="mt-6 text-center">
          <button @click="showReviewForm = true" class="btn-outline">
            <i class='fa fa-message-rounded mr-2'></i>
            Написать отзыв
          </button>
        </div>
      </div>
    </div>

    <!-- Review Form Modal -->
    <div v-if="showReviewForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4">Написать отзыв</h3>
        
        <form @submit.prevent="submitReview">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Оценка</label>
            <div class="flex gap-2">
              <button 
                v-for="i in 5" 
                :key="i"
                type="button"
                @click="reviewRating = i"
                class="text-3xl"
                :class="i <= reviewRating ? 'text-yellow-400' : 'text-gray-300'"
              >
                <i :class="i <= reviewRating ? 'fa-solid fa-star' : 'fa-solid fa-star'"></i>
              </button>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Заголовок</label>
            <input v-model="reviewTitle" type="text" class="input-field" placeholder="Кратко о впечатлении">
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Комментарий</label>
            <textarea v-model="reviewComment" rows="4" class="input-field" placeholder="Ваш отзыв"></textarea>
          </div>
          
          <div class="flex gap-3">
            <button type="button" @click="showReviewForm = false" class="btn-secondary flex-1">
              Отмена
            </button>
            <button type="submit" class="btn-primary flex-1">
              Отправить
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import api from '@/api';
import type { Product, Review } from '@/types';

const route = useRoute();
const cartStore = useCartStore();
const authStore = useAuthStore();

const product = ref<Product | null>(null);
const reviews = ref<Review[]>([]);
const loading = ref(true);

const quantity = ref(1);
const showReviewForm = ref(false);
const reviewRating = ref(5);
const reviewTitle = ref('');
const reviewComment = ref('');

// Computed свойства для категории (поддержка snake_case и camelCase)
const categorySlug = computed(() => product.value?.category_slug || product.value?.categorySlug || '');
const categoryName = computed(() => product.value?.category_name || product.value?.categoryName || '');

// Безопасное форматирование цены
const formatPrice = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '0.00 ₽';
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return num.toFixed(2) + ' ₽';
};

// Безопасное форматирование рейтинга
const formatRating = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '0.0';
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  return num.toFixed(1);
};

const incrementQuantity = () => quantity.value++;
const decrementQuantity = () => { if (quantity.value > 1) quantity.value--; };

const addToCart = () => {
  if (product.value) {
    const price = typeof product.value.price === 'string' ? parseFloat(product.value.price) : product.value.price;
    for (let i = 0; i < quantity.value; i++) {
      cartStore.addItem({
        id: product.value.id,
        name: product.value.name,
        price: price,
        image: product.value.image
      });
    }
    quantity.value = 1;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Если дата некорректна, возвращаем как есть
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const submitReview = async () => {
  if (!authStore.isAuthenticated) {
    alert('Пожалуйста, войдите чтобы оставить отзыв');
    return;
  }
  
  try {
    await api.post('/reviews', {
      productId: product.value?.id,
      rating: reviewRating.value,
      title: reviewTitle.value,
      comment: reviewComment.value
    });
    
    showReviewForm.value = false;
    reviewTitle.value = '';
    reviewComment.value = '';
    reviewRating.value = 5;
    
    // Reload reviews
    loadReviews();
  } catch (error) {
    console.error('Error submitting review:', error);
  }
};

async function loadReviews() {
  if (!product.value) return;
  try {
    const response = await api.get(`/reviews/product/${product.value.id}`);
    reviews.value = response.data.reviews;
  } catch (error) {
    console.error('Error loading reviews:', error);
  }
}

onMounted(async () => {
  try {
    const response = await api.get(`/products/slug/${route.params.slug}`);
    product.value = response.data;
    await loadReviews();
  } catch (error) {
    console.error('Error loading product:', error);
  } finally {
    loading.value = false;
  }
});
</script>
