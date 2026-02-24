<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <router-link to="/admin" class="flex items-center space-x-2 hover:text-gray-300">
            <i class='fa-solid fa-arrow-left'></i>
            <span>Админ-панель</span>
          </router-link>
          <h1 class="text-xl font-bold">Управление отзывами</h1>
          <div></div>
        </div>
      </div>
    </header>

    <main class="py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-md p-4 mb-6 flex gap-4">
          <select v-model="approvedFilter" class="input-field w-auto">
            <option value="">Все отзывы</option>
            <option value="true">Одобренные</option>
            <option value="false">На модерации</option>
          </select>

          <button @click="loadReviews" class="btn-primary">
            <i class='fa fa-refresh mr-2'></i>
            Обновить
          </button>
        </div>

        <!-- Reviews List -->
        <div v-if="loading" class="text-center py-12">
          <i class='fa-solid fa-spinner fa-spin text-4xl animate-spin'></i>
        </div>

        <div v-else-if="reviews.length" class="space-y-4">
          <div v-for="review in reviews" :key="review.id"
               class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <i class='fa-solid fa-user text-primary-600'></i>
                </div>
                <div>
                  <p class="font-medium">{{ review.first_name }} {{ review.last_name }}</p>
                  <p class="text-sm text-gray-500">{{ formatDate(review.created_at) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex text-yellow-400">
                  <i class='fa-solid fa-star' v-for="i in 5" :key="i"
                     :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"></i>
                </div>
                <span :class="review.is_approved ? 'badge-success' : 'badge-warning'" class="badge">
                  {{ review.is_approved ? 'Одобрен' : 'На модерации' }}
                </span>
              </div>
            </div>

            <div class="mb-4">
              <router-link :to="`/product/${review.product_slug}`"
                           class="text-primary-600 hover:underline font-medium">
                {{ review.product_name }}
              </router-link>
            </div>

            <h4 v-if="review.title" class="font-bold mb-2">{{ review.title }}</h4>
            <p class="text-gray-600 mb-4">{{ review.comment }}</p>

            <div class="flex gap-3">
              <button v-if="!review.is_approved" @click="approveReview(review.id, true)"
                      class="btn-primary text-sm py-2">
                <i class='fa-solid fa-check mr-1'></i>
                Одобрить
              </button>
              <button v-else @click="approveReview(review.id, false)"
                      class="btn-secondary text-sm py-2">
                <i class='fa fa-undo mr-1'></i>
                Снять одобрение
              </button>
              <button @click="deleteReview(review.id)"
                      class="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm">
                <i class='fa-solid fa-trash mr-1'></i>
                Удалить
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 bg-white rounded-xl shadow-md">
          <p class="text-gray-500">Отзывов нет</p>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="flex justify-center gap-2 mt-6">
          <button @click="currentPage--" :disabled="currentPage === 1"
                  class="px-4 py-2 rounded-lg border disabled:opacity-50">
            <i class='fa-solid fa-chevron-left'></i>
          </button>
          <span class="px-4 py-2">Стр. {{ currentPage }} из {{ pagination.pages }}</span>
          <button @click="currentPage++" :disabled="currentPage === pagination.pages"
                  class="px-4 py-2 rounded-lg border disabled:opacity-50">
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

const reviews = ref<any[]>([]);
const approvedFilter = ref('');
const currentPage = ref(1);
const pagination = ref({ page: 1, limit: 20, total: 0, pages: 1 });
const loading = ref(false);

const formatDate = (dateString: any) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

watch([approvedFilter, currentPage], () => loadReviews());

async function loadReviews() {
  loading.value = true;
  try {
    const params: any = { page: currentPage.value, limit: 20 };
    if (approvedFilter.value !== '') params.approved = approvedFilter.value;

    const response = await api.get('/reviews', { params });
    reviews.value = response.data.reviews || [];
    pagination.value = response.data.pagination || {};
  } catch (error) {
    console.error('Error loading reviews:', error);
  } finally {
    loading.value = false;
  }
}

async function approveReview(id: number, approved: boolean) {
  try {
    await api.put(`/reviews/${id}/approve`, { approved });
    loadReviews();
  } catch (error) {
    console.error('Error approving review:', error);
  }
}

async function deleteReview(id: number) {
  if (!confirm('Удалить этот отзыв?')) return;

  try {
    await api.delete(`/reviews/${id}`);
    loadReviews();
  } catch (error) {
    console.error('Error deleting review:', error);
  }
}

onMounted(() => loadReviews());
</script>
