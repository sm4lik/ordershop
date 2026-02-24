<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex items-center space-x-2">
          <i class='fas fa-restaurant text-4xl text-primary-600'></i>
          <span class="text-2xl font-bold text-gray-900">OrderShop</span>
        </router-link>
      </div>

      <div class="bg-white rounded-xl shadow-md p-8">
        <h1 class="text-2xl font-bold text-center mb-6">Вход</h1>

        <form @submit.prevent="handleLogin">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input v-model="email" type="email" required 
                     class="input-field" placeholder="you@example.com">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <input v-model="password" type="password" required 
                     class="input-field" placeholder="••••••••">
            </div>
          </div>

          <div v-if="error" class="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {{ error }}
          </div>

          <button type="submit" :disabled="loading" 
                  class="btn-primary w-full mt-6 disabled:opacity-50">
            <i v-if="loading" class='fa-solid fa-spinner fa-spin animate-spin mr-2'></i>
            Войти
          </button>
        </form>

        <p class="text-center mt-6 text-gray-600">
          Нет аккаунта?
          <router-link to="/register" class="text-primary-600 hover:text-primary-700 font-medium">
            Зарегистрироваться
          </router-link>
        </p>

        <!-- Demo credentials -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
          <p class="font-medium text-gray-700 mb-2">Тестовые аккаунты:</p>
          <div class="space-y-1 text-gray-600">
            <p><span class="font-mono">admin@ordershop.com</span> / admin123</p>
            <p><span class="font-mono">customer@test.com</span> / admin123</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  error.value = '';
  loading.value = true;

  try {
    await authStore.login(email.value, password.value);
    
    const redirect = route.query.redirect as string;
    router.push(redirect || '/');
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Ошибка входа';
  } finally {
    loading.value = false;
  }
};
</script>
