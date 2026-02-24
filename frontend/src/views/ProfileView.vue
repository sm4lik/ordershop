<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Личный кабинет</h1>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Sidebar -->
        <aside class="md:col-span-1">
          <nav class="bg-white rounded-xl shadow-md overflow-hidden">
            <router-link to="/profile" 
                         class="block px-6 py-4 border-b hover:bg-gray-50"
                         :class="{'bg-primary-50 text-primary-700': $route.name === 'profile'}">
              <i class='fa-solid fa-user mr-2'></i>
              Профиль
            </router-link>
            <router-link to="/profile/orders" 
                         class="block px-6 py-4 border-b hover:bg-gray-50"
                         :class="{'bg-primary-50 text-primary-700': $route.name === 'profile-orders'}">
              <i class='fa-solid fa-box mr-2'></i>
              Мои заказы
            </router-link>
            <a v-if="isModerator" href="/admin" 
               class="block px-6 py-4 border-b hover:bg-gray-50">
              <i class='fa-solid fa-gear mr-2'></i>
              Админ-панель
            </a>
          </nav>
        </aside>

        <!-- Content -->
        <div class="md:col-span-3">
          <div class="bg-white rounded-xl shadow-md p-6">
            <h2 class="text-xl font-bold mb-6">Информация о профиле</h2>

            <form @submit.prevent="saveProfile" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Имя
                  </label>
                  <input v-model="profile.firstName" type="text" class="input-field">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Фамилия
                  </label>
                  <input v-model="profile.lastName" type="text" class="input-field">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input v-model="profile.email" type="email" class="input-field" disabled>
                <p class="text-xs text-gray-500 mt-1">Email нельзя изменить</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Телефон
                </label>
                <input v-model="profile.phone" type="tel" class="input-field" placeholder="+7 (___) ___-__-__">
              </div>

              <div class="flex items-center gap-2 pt-4">
                <button type="submit" :disabled="saving" 
                        class="btn-primary disabled:opacity-50">
                  <i v-if="saving" class='fa-solid fa-spinner fa-spin animate-spin mr-2'></i>
                  Сохранить
                </button>
                <span v-if="saved" class="text-green-600 text-sm">
                  <i class='fa-solid fa-check mr-1'></i>
                  Изменения сохранены
                </span>
              </div>
            </form>

            <div class="border-t mt-8 pt-8">
              <h3 class="font-bold mb-4">Статистика</h3>
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <p class="text-3xl font-bold text-blue-700">{{ stats.totalOrders }}</p>
                  <p class="text-sm text-blue-600 mt-1">Заказов</p>
                </div>
                <div class="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <p class="text-3xl font-bold text-green-700">{{ formatMoney(stats.totalSpent) }}</p>
                  <p class="text-sm text-green-600 mt-1">Потрачено</p>
                </div>
                <div class="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                  <p class="text-3xl font-bold text-yellow-700">{{ stats.totalReviews }}</p>
                  <p class="text-sm text-yellow-600 mt-1">Отзывов</p>
                </div>
                <div class="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <p class="text-lg font-bold text-purple-700">{{ getRoleName(user?.role) }}</p>
                  <p class="text-sm text-purple-600 mt-1">Роль</p>
                </div>
              </div>
              
              <!-- Детальная статистика по статусам -->
              <div class="border-t pt-6">
                <h4 class="font-semibold text-sm text-gray-600 mb-3">Детализация</h4>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div v-if="stats.pendingAmount > 0" class="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p class="text-sm font-bold text-yellow-700">{{ formatMoney(stats.pendingAmount) }}</p>
                    <p class="text-xs text-yellow-600">В ожидании</p>
                  </div>
                  <div v-if="stats.confirmedAmount > 0" class="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p class="text-sm font-bold text-blue-700">{{ formatMoney(stats.confirmedAmount) }}</p>
                    <p class="text-xs text-blue-600">Подтверждено</p>
                  </div>
                  <div v-if="stats.preparingAmount > 0" class="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p class="text-sm font-bold text-purple-700">{{ formatMoney(stats.preparingAmount) }}</p>
                    <p class="text-xs text-purple-600">Готовится</p>
                  </div>
                  <div v-if="stats.readyAmount > 0" class="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p class="text-sm font-bold text-indigo-700">{{ formatMoney(stats.readyAmount) }}</p>
                    <p class="text-xs text-indigo-600">Готов</p>
                  </div>
                  <div v-if="stats.deliveredAmount > 0" class="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <p class="text-sm font-bold text-green-700">{{ formatMoney(stats.deliveredAmount) }}</p>
                    <p class="text-xs text-green-600">Получено</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/api';

const authStore = useAuthStore();

const user = computed(() => authStore.user);
const isModerator = computed(() => authStore.isModerator);

const profile = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
});

const saving = ref(false);
const saved = ref(false);
const stats = ref({
  totalOrders: 0,
  totalSpent: 0,
  pendingAmount: 0,
  confirmedAmount: 0,
  preparingAmount: 0,
  readyAmount: 0,
  deliveredAmount: 0,
  cancelledAmount: 0,
  totalReviews: 0
});

const formatMoney = (value: number): string => {
  return value.toFixed(2) + ' ₽';
};

const getRoleName = (role?: string): string => {
  if (!role) return 'Гость';
  const roles: { [key: string]: string } = {
    customer: 'Клиент',
    admin: 'Администратор',
    moderator: 'Менеджер',
    bartender: 'Бариста'
  };
  return roles[role] || role;
};

const saveProfile = async () => {
  saving.value = true;
  try {
    await api.put('/auth/profile', {
      firstName: profile.value.firstName,
      lastName: profile.value.lastName,
      phone: profile.value.phone
    });

    await authStore.fetchProfile();
    saved.value = true;
    setTimeout(() => saved.value = false, 3000);
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('Ошибка при сохранении профиля');
  } finally {
    saving.value = false;
  }
};

const loadStats = async () => {
  try {
    const response = await api.get('/orders/my/stats');
    stats.value = response.data;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
};

onMounted(async () => {
  if (authStore.user) {
    profile.value = {
      firstName: authStore.user.firstName,
      lastName: authStore.user.lastName,
      email: authStore.user.email,
      phone: authStore.user.phone || ''
    };
  }

  await loadStats();
});
</script>
