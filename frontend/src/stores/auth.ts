import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'moderator' | 'bartender' | 'admin';
  avatar?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isModerator = computed(() => 
    user.value?.role === 'moderator' || user.value?.role === 'admin'
  );
  const isBartender = computed(() => 
    user.value?.role === 'bartender' || user.value?.role === 'moderator' || user.value?.role === 'admin'
  );

  async function login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = response.data;
    
    token.value = newToken;
    user.value = userData;
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return response.data;
  }

  async function register(email: string, password: string, firstName: string, lastName: string, phone?: string) {
    const response = await api.post('/auth/register', { 
      email, 
      password, 
      firstName, 
      lastName,
      phone 
    });
    const { token: newToken, user: userData } = response.data;
    
    token.value = newToken;
    user.value = userData;
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return response.data;
  }

  async function fetchProfile() {
    if (!token.value) return;
    
    try {
      const response = await api.get('/auth/profile');
      user.value = response.data;
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      logout();
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Восстановление состояния при загрузке
  function initAuth() {
    const savedUser = localStorage.getItem('user');
    if (token.value && savedUser) {
      try {
        user.value = JSON.parse(savedUser);
      } catch (e) {
        logout();
      }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isModerator,
    isBartender,
    login,
    register,
    fetchProfile,
    logout,
    initAuth
  };
});
