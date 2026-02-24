<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center space-x-2">
            <i class='fa-solid fa-utensils text-3xl text-primary-600'></i>
            <span class="text-xl font-bold text-gray-900">OrderShop</span>
          </router-link>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center space-x-8">
            <router-link to="/menu" class="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Меню
            </router-link>
            <router-link to="/about" class="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              О нас
            </router-link>
            <router-link to="/delivery" class="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Доставка
            </router-link>
            <router-link to="/contacts" class="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Контакты
            </router-link>
          </div>

          <!-- Right side -->
          <div class="flex items-center space-x-4">
            <!-- Cart -->
            <router-link to="/cart" class="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
              <i class='fa-solid fa-cart-shopping text-2xl'></i>
              <span v-if="cartTotalItems > 0" 
                    class="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {{ cartTotalItems }}
              </span>
            </router-link>

            <!-- Auth -->
            <template v-if="isAuthenticated">
              <router-link to="/profile" class="flex items-center space-x-2 p-2 text-gray-700 hover:text-primary-600 transition-colors">
                <i class='fa-solid fa-user text-2xl'></i>
                <span class="hidden sm:inline font-medium">{{ user?.firstName }}</span>
              </router-link>
              <button @click="handleLogout" class="p-2 text-gray-700 hover:text-primary-600 transition-colors">
                <i class='fa-solid fa-right-from-bracket text-2xl'></i>
              </button>
            </template>
            <template v-else>
              <router-link to="/login" class="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Вход
              </router-link>
              <router-link to="/register" class="btn-primary">
                Регистрация
              </router-link>
            </template>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="flex-grow">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center space-x-2 mb-4">
              <i class='fa-solid fa-utensils text-3xl text-primary-500'></i>
              <span class="text-xl font-bold">OrderShop</span>
            </div>
            <p class="text-gray-400 text-sm">
              {{ settings.contactDescription || 'Вкусная еда с доставкой до двери. Быстро, качественно, надежно.' }}
            </p>
          </div>

          <div>
            <h4 class="font-semibold mb-4">Меню</h4>
            <ul class="space-y-2 text-gray-400 text-sm">
              <li><router-link to="/menu?category=burgers" class="hover:text-white transition-colors">Бургеры</router-link></li>
              <li><router-link to="/menu?category=pizza" class="hover:text-white transition-colors">Пицца</router-link></li>
              <li><router-link to="/menu?category=sushi" class="hover:text-white transition-colors">Суши и роллы</router-link></li>
              <li><router-link to="/menu?category=drinks" class="hover:text-white transition-colors">Напитки</router-link></li>
            </ul>
          </div>

          <div>
            <h4 class="font-semibold mb-4">Информация</h4>
            <ul class="space-y-2 text-gray-400 text-sm">
              <li><router-link to="/about" class="hover:text-white transition-colors">О нас</router-link></li>
              <li><router-link to="/delivery" class="hover:text-white transition-colors">Доставка</router-link></li>
              <li><router-link to="/contacts" class="hover:text-white transition-colors">Контакты</router-link></li>
            </ul>
          </div>

          <div>
            <h4 class="font-semibold mb-4">Контакты</h4>
            <ul class="space-y-2 text-gray-400 text-sm">
              <li v-if="settings.contactPhone" class="flex items-center space-x-2">
                <i class='fa-solid fa-phone'></i>
                <a :href="`tel:${settings.contactPhone}`" class="hover:text-white transition-colors">
                  {{ settings.contactPhone }}
                </a>
              </li>
              <li v-if="settings.contactEmail" class="flex items-center space-x-2">
                <i class='fa-solid fa-envelope'></i>
                <a :href="`mailto:${settings.contactEmail}`" class="hover:text-white transition-colors">
                  {{ settings.contactEmail }}
                </a>
              </li>
              <li v-if="settings.contactAddress" class="flex items-center space-x-2">
                <i class='fa-solid fa-location-dot'></i>
                <span>{{ settings.contactCity }}, {{ settings.contactAddress }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {{ new Date().getFullYear() }} OrderShop. Все права защищены.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import api from '@/api';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const settings = ref({
  contactPhone: '+7 (999) 000-00-00',
  contactEmail: 'info@ordershop.ru',
  contactCity: 'Москва',
  contactAddress: 'Москва, ул. Примерная, 1',
  contactDescription: 'Вкусная еда с доставкой до двери'
});

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);
const cartTotalItems = computed(() => cartStore.totalItems);

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};

const loadSettings = async () => {
  try {
    const response = await api.get('/settings');
    const s = response.data;
    settings.value = {
      contactPhone: s.contact_phone || '+7 (999) 000-00-00',
      contactEmail: s.contact_email || 'info@ordershop.ru',
      contactCity: s.contact_city || 'Москва',
      contactAddress: s.contact_address || 'Москва, ул. Примерная, 1',
      contactDescription: s.contact_description || 'Вкусная еда с доставкой до двери'
    };
  } catch (error) {
    console.error('Error loading settings:', error);
  }
};

onMounted(() => {
  loadSettings();
});
</script>
