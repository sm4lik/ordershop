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
          <button @click="showNewUser = true" class="btn-primary">
            <i class='fa-solid fa-user-plus mr-2'></i>
            Добавить пользователя
          </button>
        </div>
      </div>
    </header>

    <main class="py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Filters -->
        <div class="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-wrap gap-4">
          <select v-model="roleFilter" class="input-field w-auto">
            <option value="">Все роли</option>
            <option value="customer">Клиент</option>
            <option value="moderator">Модератор</option>
            <option value="bartender">Бармен</option>
            <option value="admin">Админ</option>
          </select>

          <input v-model="searchQuery" type="text" placeholder="Поиск..." class="input-field flex-1 min-w-[200px]">

          <button @click="loadUsers" class="btn-primary">
            <i class='fa fa-refresh mr-2'></i>
            Обновить
          </button>
        </div>

        <!-- Users Table -->
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пользователь</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Роль</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Телефон</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата регистрации</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <i class='fa-solid fa-user text-primary-600'></i>
                      </div>
                      <div>
                        <p class="font-medium">{{ user.first_name }} {{ user.last_name }}</p>
                        <p class="text-sm text-gray-500">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <select v-model="user.role" @change="updateUser(user)"
                            class="text-sm border rounded-lg px-2 py-1">
                      <option value="customer">Клиент</option>
                      <option value="moderator">Модератор</option>
                      <option value="bartender">Бармен</option>
                      <option value="admin">Админ</option>
                    </select>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ user.phone || '—' }}</td>
                  <td class="px-6 py-4">
                    <span :class="user.is_active ? 'badge-success' : 'badge bg-gray-300'" class="badge">
                      {{ user.is_active ? 'Активен' : 'Деактивирован' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(user.created_at) }}</td>
                  <td class="px-6 py-4">
                    <div class="flex gap-2">
                      <button @click="toggleUserStatus(user)"
                              class="p-2 hover:bg-gray-100 rounded-lg"
                              :title="user.is_active ? 'Деактивировать' : 'Активировать'">
                        <i :class="user.is_active ? 'fa-solid fa-user-minus text-red-600' : 'fa-solid fa-user-plus text-green-600'"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="!users.length" class="text-center py-8 text-gray-500">Пользователей нет</p>
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

    <!-- New User Modal -->
    <div v-if="showNewUser" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold mb-4">Новый пользователь</h3>

        <form @submit.prevent="createUser" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Имя *</label>
              <input v-model="userForm.firstName" type="text" required class="input-field">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Фамилия *</label>
              <input v-model="userForm.lastName" type="text" required class="input-field">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input v-model="userForm.email" type="email" required class="input-field">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
            <input v-model="userForm.phone" type="tel" class="input-field">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Пароль *</label>
            <input v-model="userForm.password" type="password" required class="input-field" minlength="6">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Роль *</label>
            <select v-model="userForm.role" required class="input-field">
              <option value="customer">Клиент</option>
              <option value="moderator">Модератор</option>
              <option value="bartender">Бармен</option>
              <option value="admin">Админ</option>
            </select>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="submit" :disabled="saving" class="btn-primary flex-1">
              Создать
            </button>
            <button type="button" @click="showNewUser = false" class="btn-secondary flex-1">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import api from '@/api';

const users = ref<any[]>([]);
const roleFilter = ref('');
const searchQuery = ref('');
const currentPage = ref(1);
const pagination = ref({ page: 1, limit: 20, total: 0, pages: 1 });
const showNewUser = ref(false);
const saving = ref(false);

const userForm = ref({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  role: 'customer'
});

const formatDate = (dateString: any) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

watch([roleFilter, searchQuery, currentPage], () => loadUsers());

async function loadUsers() {
  try {
    const params: any = { page: currentPage.value, limit: 20 };
    if (roleFilter.value) params.role = roleFilter.value;
    if (searchQuery.value) params.search = searchQuery.value;

    const response = await api.get('/users', { params });
    users.value = response.data.users || [];
    pagination.value = response.data.pagination || {};
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

async function updateUser(user: any) {
  try {
    await api.put(`/users/${user.id}`, {
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      isActive: user.is_active
    });
  } catch (error) {
    console.error('Error updating user:', error);
    loadUsers();
  }
}

async function toggleUserStatus(user: any) {
  if (!confirm(`${user.is_active ? 'Деактивировать' : 'Активировать'} пользователя?`)) return;

  try {
    await api.put(`/users/${user.id}`, {
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      isActive: !user.is_active
    });
    loadUsers();
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

async function createUser() {
  saving.value = true;
  try {
    await api.post('/users', {
      email: userForm.value.email,
      password: userForm.value.password,
      firstName: userForm.value.firstName,
      lastName: userForm.value.lastName,
      phone: userForm.value.phone,
      role: userForm.value.role
    });
    showNewUser.value = false;
    resetForm();
    loadUsers();
  } catch (error: any) {
    alert(error.response?.data?.error || 'Ошибка при создании пользователя');
  } finally {
    saving.value = false;
  }
}

function resetForm() {
  userForm.value = { email: '', password: '', firstName: '', lastName: '', phone: '', role: 'customer' };
}

onMounted(() => loadUsers());
</script>
