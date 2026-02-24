<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <router-link to="/admin" class="flex items-center space-x-2 hover:text-gray-300">
            <i class='fa-solid fa-arrow-left'></i>
            <span>Админ-панель</span>
          </router-link>
          <button @click="showNewCategory = true" class="btn-primary">
            <i class='fa-solid fa-plus mr-2'></i>
            Добавить категорию
          </button>
        </div>
      </div>
    </header>

    <main class="py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div v-if="loading" class="text-center py-12">
          <i class='fa-solid fa-spinner fa-spin text-4xl animate-spin'></i>
        </div>

        <div v-else-if="categories.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="category in categories" :key="category.id"
               class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <i :class="`fa ${category.icon || 'fa-box'} text-2xl text-primary-600`"></i>
                </div>
                <div>
                  <h3 class="font-bold text-lg">{{ category.name }}</h3>
                  <p class="text-sm text-gray-500">{{ category.product_count || 0 }} товаров</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button @click="editCategory(category)" class="p-2 hover:bg-gray-100 rounded-lg">
                  <i class='fa-solid fa-pen text-gray-600'></i>
                </button>
                <button @click="deleteCategory(category.id)" class="p-2 hover:bg-red-100 rounded-lg">
                  <i class='fa-solid fa-trash text-red-600'></i>
                </button>
              </div>
            </div>
            <p class="text-gray-600 text-sm mb-3">{{ category.description || '—' }}</p>
            <span :class="category.is_active !== false ? 'badge-success' : 'badge bg-gray-200'" class="badge">
              {{ category.is_active !== false ? 'Активна' : 'Неактивна' }}
            </span>
          </div>
        </div>

        <div v-else class="text-center py-12 bg-white rounded-xl shadow-md">
          <p class="text-gray-500">Категорий нет</p>
        </div>
      </div>
    </main>

    <!-- Category Modal -->
    <div v-if="showNewCategory || editingCategory"
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4">
          {{ editingCategory ? 'Редактирование' : 'Новая категория' }}
        </h3>

        <form @submit.prevent="saveCategory" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Название *</label>
            <input v-model="categoryForm.name" type="text" required class="input-field">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
            <input v-model="categoryForm.slug" type="text" required class="input-field">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Описание</label>
            <textarea v-model="categoryForm.description" rows="3" class="input-field"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Иконка</label>
            <input v-model="categoryForm.icon" type="text" class="input-field"
                   placeholder="fa-cheese, fa-pizza и т.д.">
            <p class="text-xs text-gray-500 mt-1">Boxicons: https://boxicons.com/</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Порядок</label>
            <input v-model.number="categoryForm.sortOrder" type="number" class="input-field">
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" v-model="categoryForm.isActive" id="isActive">
            <label for="isActive" class="text-sm font-medium text-gray-700">Активна</label>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="submit" class="btn-primary flex-1">Сохранить</button>
            <button type="button" @click="closeModal" class="btn-secondary flex-1">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/api';

const categories = ref<any[]>([]);
const showNewCategory = ref(false);
const editingCategory = ref<any>(null);
const loading = ref(false);

const categoryForm = ref({
  name: '',
  slug: '',
  description: '',
  icon: 'fa-box',
  sortOrder: 0,
  isActive: true
});

async function loadCategories() {
  loading.value = true;
  try {
    const response = await api.get('/categories');
    categories.value = response.data || [];
  } catch (error) {
    console.error('Error loading categories:', error);
  } finally {
    loading.value = false;
  }
}

function editCategory(category: any) {
  editingCategory.value = category;
  categoryForm.value = {
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    icon: category.icon || 'fa-box',
    sortOrder: category.sort_order || 0,
    isActive: category.is_active !== false
  };
  showNewCategory.value = true;
}

function closeModal() {
  showNewCategory.value = false;
  editingCategory.value = null;
  resetForm();
}

function resetForm() {
  categoryForm.value = {
    name: '',
    slug: '',
    description: '',
    icon: 'fa-box',
    sortOrder: 0,
    isActive: true
  };
}

async function saveCategory() {
  try {
    if (editingCategory.value) {
      await api.put(`/categories/${editingCategory.value.id}`, categoryForm.value);
    } else {
      await api.post('/categories', categoryForm.value);
    }
    closeModal();
    loadCategories();
  } catch (error) {
    console.error('Error saving category:', error);
  }
}

async function deleteCategory(id: number) {
  if (!confirm('Удалить эту категорию?')) return;

  try {
    await api.delete(`/categories/${id}`);
    loadCategories();
  } catch (error) {
    console.error('Error deleting category:', error);
  }
}

onMounted(() => loadCategories());
</script>
