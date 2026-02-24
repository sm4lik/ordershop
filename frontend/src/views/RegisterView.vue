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
        <h1 class="text-2xl font-bold text-center mb-6">Регистрация</h1>

        <form @submit.prevent="handleRegister">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Имя *
                </label>
                <input v-model="firstName" type="text" required class="input-field">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Фамилия *
                </label>
                <input v-model="lastName" type="text" required class="input-field">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input v-model="email" type="email" required class="input-field">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Телефон
              </label>
              <input v-model="phone" type="tel" class="input-field" placeholder="+7 (___) ___-__-__">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Пароль *
              </label>
              <input v-model="password" type="password" required class="input-field" minlength="6">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Подтверждение пароля *
              </label>
              <input v-model="passwordConfirm" type="password" required class="input-field" minlength="6">
            </div>
          </div>

          <div v-if="error" class="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {{ error }}
          </div>

          <button type="submit" :disabled="loading" 
                  class="btn-primary w-full mt-6 disabled:opacity-50">
            <i v-if="loading" class='fa-solid fa-spinner fa-spin animate-spin mr-2'></i>
            Зарегистрироваться
          </button>
        </form>

        <p class="text-center mt-6 text-gray-600">
          Уже есть аккаунт?
          <router-link to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
            Войти
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const phone = ref('');
const password = ref('');
const passwordConfirm = ref('');
const error = ref('');
const loading = ref(false);

const handleRegister = async () => {
  error.value = '';

  if (password.value !== passwordConfirm.value) {
    error.value = 'Пароли не совпадают';
    return;
  }

  if (password.value.length < 6) {
    error.value = 'Пароль должен быть не менее 6 символов';
    return;
  }

  loading.value = true;

  try {
    await authStore.register(email.value, password.value, firstName.value, lastName.value, phone.value);
    router.push('/');
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Ошибка регистрации';
  } finally {
    loading.value = false;
  }
};
</script>
